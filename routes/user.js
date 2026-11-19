var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/product-helpers');
const userHelper = require('../helpers/user-helper');
const collections = require('../config/collections');
const { ObjectId } = require('mongodb');
const db = require('../config/connection');
const jwtHelper = require('../helpers/jwt-helper');

// JWT Verification Middleware
const verify = (req, res, next) => {
  if (req.user) {
    next();
  } else if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    res.redirect('/login');
  }
};

/* GET home page - Publicly viewable with personalized data if logged in */
router.get('/', async (req, res) => {
  try {
    let cartCount = 0;
    if (req.user) {
      cartCount = await userHelper.getCartCount(req.user._id);
    }

    const products = await productHelper.getAllProducts();

    res.render('index', {
      products,
      user: req.user,
      cartCount
    });
  } catch (err) {
    console.error("Home page error:", err);
    res.render('index', { products: [], user: req.user, cartCount: 0 });
  }
});

router.get('/login', (req, res) => {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('user-auth/login-page');
  }
});

router.post('/login', async (req, res) => {
  try {
    const response = await userHelper.doLogIn(req.body);
    if (response.status) {
      // Generate JWT Token (Stateless authentication)
      const token = jwtHelper.generateToken({
        _id: response.user._id.toString(),
        name: response.user.name,
        email: response.user.email
      });

      // Set secure httpOnly cookie
      res.cookie('userToken', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax'
      });

      if (req.session) {
        req.session.loggedIn = true;
        req.session.user = response.user;
      }

      res.redirect('/');
    } else {
      res.render('user-auth/login-page', { loginErr: true });
    }
  } catch (err) {
    console.error("User login error:", err);
    res.render('user-auth/login-page', { loginErr: true });
  }
});

router.get('/signup', (req, res) => {
  if (req.user) {
    res.redirect('/');
  } else {
    res.render('user-auth/signup-page');
  }
});

router.post('/signup', async (req, res) => {
  try {
    await userHelper.doSignUp(req.body);
    res.redirect('/login');
  } catch (err) {
    console.error("Signup error:", err);
    res.redirect('/signup');
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('userToken');
  if (req.session) {
    req.session.loggedIn = false;
    req.session.user = null;
    req.session.destroy(() => {
      res.redirect('/login');
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/cart', verify, async (req, res) => {
  try {
    let products = await userHelper.getCartProduct(req.user._id);
    let totalValue = await userHelper.getTotalAmount(req.user._id);
    let cartEmpty = !products || products.length === 0;
    res.render('user/cart', { products, user: req.user, cartEmpty, totalValue });
  } catch (err) {
    console.error("Cart page error:", err);
    res.render('user/cart', { products: [], user: req.user, cartEmpty: true, totalValue: 0 });
  }
});

router.get('/add-to-cart/:id', async (req, res) => {
  if (!req.user) {
    return res.json({ status: false, login: false });
  }
  try {
    await userHelper.addToCart(req.params.id, req.user._id);
    res.json({ status: true });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.json({ status: false });
  }
});

router.post('/change-product-quantity', verify, async (req, res) => {
  try {
    await userHelper.changeQuantity(
      req.body.cart,
      req.body.product,
      req.body.count
    );
    res.json({ status: true });
  } catch (err) {
    console.error("Change quantity error:", err);
    res.json({ status: false });
  }
});

router.post('/cart/delete-product/:id/:userId', verify, async (req, res) => {
  try {
    let proId = req.params.id;
    let userId = req.user._id; // enforce current authenticated user
    await userHelper.deleteCartProducts(proId, userId);
    res.redirect('/cart');
  } catch (err) {
    console.error("Delete cart product error:", err);
    res.redirect('/cart');
  }
});

router.get('/place-order', verify, async (req, res) => {
  try {
    let total = await userHelper.getTotalAmount(req.user._id);
    res.render('user/place-order', { total, user: req.user });
  } catch (err) {
    console.error("Place order page error:", err);
    res.redirect('/cart');
  }
});

router.post('/place-order', verify, async (req, res) => {
  try {
    const userId = req.user._id;
    let productList = await userHelper.getCartProductList(userId);
    let totalAmount = await userHelper.getTotalAmount(userId);

    let orderId = await userHelper.placeOrder(
      userId,
      req.body,
      productList,
      totalAmount
    );

    if (req.body.paymentMethod === "COD") {
      await userHelper.deleteAllCartProducts(userId);
      res.json({ cod_success: true });
    } else {
      let response = await userHelper.generateRazorpay(orderId, totalAmount);
      res.json(response);
    }
  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({ status: false, err: err.message });
  }
});

router.get('/all-orders', verify, async (req, res) => {
  try {
    let orderlist = await userHelper.getOrderList(req.user._id);
    res.render('user/all-orders', { orderlist, user: req.user });
  } catch (err) {
    console.error("All orders error:", err);
    res.render('user/all-orders', { orderlist: [], user: req.user });
  }
});

router.get('/order-success', verify, (req, res) => {
  res.render('user/order-success', { user: req.user });
});

router.post('/verify-payment', verify, async (req, res) => {
  const userId = req.user._id;
  try {
    const isValid = userHelper.verifyPayment(req.body);
    if (!isValid) {
      return res.json({ status: false });
    }
    await db.get().collection(collections.ORDER_COLLECTION).updateOne(
      { razorpay_order_id: req.body.razorpay_order_id },
      { $set: { status: "placed" } }
    );
    await userHelper.deleteAllCartProducts(userId);
    res.json({ status: true });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.json({ status: false });
  }
});

module.exports = router;
