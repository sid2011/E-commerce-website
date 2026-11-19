var express = require('express');
var router = express.Router();
const path = require('path');
const productHelper = require('../helpers/product-helpers');
const adminHelper = require('../helpers/admin-helper');
const jwtHelper = require('../helpers/jwt-helper');

// JWT Admin Verification Middleware
const verify = (req, res, next) => {
  if (req.admin) {
    next();
  } else if (req.session && req.session.admin) {
    req.admin = req.session.admin;
    next();
  } else {
    res.redirect('/admin/login');
  }
};

/* GET admin dashboard & product listing */
router.get('/', verify, async function (req, res, next) {
  try {
    const products = await productHelper.getAllProducts();
    const stats = await adminHelper.getDashboardStats();
    res.render('admin/view-products', {
      admin: true,
      products,
      stats,
      adminUser: req.admin
    });
  } catch (err) {
    console.error("Admin products error:", err);
    res.render('admin/view-products', { admin: true, products: [], stats: {} });
  }
});

router.get('/add-product', verify, (req, res) => {
  res.render('admin/add-product', { admin: true, adminUser: req.admin });
});

router.post('/add-product', verify, (req, res) => {
  try {
    productHelper.addProducts(req.body, (result) => {
      if (req.files && req.files.image) {
        let image = req.files.image;
        image.mv('./public/product-images/' + result + '.jpg', (err) => {
          if (err) {
            console.error("Image upload error:", err);
          }
          res.redirect('/admin');
        });
      } else {
        res.redirect('/admin');
      }
    });
  } catch (err) {
    console.error("Add product error:", err);
    res.redirect('/admin');
  }
});

router.get('/delete-product/:id', verify, (req, res) => {
  let proId = req.params.id;
  productHelper.deleteProduct(proId).then(() => {
    res.redirect('/admin');
  }).catch((err) => {
    console.error("Delete product error:", err);
    res.redirect('/admin');
  });
});

router.get('/edit-product/:id', verify, async (req, res) => {
  try {
    let product = await productHelper.getProductDetails(req.params.id);
    res.render('admin/edit-product', { admin: true, product, adminUser: req.admin });
  } catch (err) {
    console.error("Edit product get error:", err);
    res.redirect('/admin');
  }
});

router.post('/edit-product/:id', verify, (req, res) => {
  try {
    productHelper.updateProduct(req.params.id, req.body).then(() => {
      if (req.files && req.files.image) {
        let image = req.files.image;
        image.mv('./public/product-images/' + req.params.id + '.jpg', (err) => {
          if (err) console.error("Update image error:", err);
          res.redirect('/admin');
        });
      } else {
        res.redirect('/admin');
      }
    }).catch((err) => {
      console.error("Update product error:", err);
      res.redirect('/admin');
    });
  } catch (err) {
    console.error("Update product post error:", err);
    res.redirect('/admin');
  }
});

router.get('/login', (req, res) => {
  if (req.admin) {
    res.redirect('/admin');
  } else {
    res.render('admin-auth/admin-login', { admin: false });
  }
});

router.post('/login', (req, res) => {
  adminHelper.doLogIn(req.body).then((response) => {
    if (response.status) {
      // Generate Admin JWT Token
      const token = jwtHelper.generateToken({
        _id: response.admin._id.toString(),
        email: response.admin.email,
        role: 'admin'
      });

      res.cookie('adminToken', token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax'
      });

      if (req.session) {
        req.session.loggedIn = true;
        req.session.admin = response.admin;
      }

      res.redirect('/admin');
    } else {
      res.render('admin-auth/admin-login', { loginErr: true, admin: false });
    }
  }).catch((err) => {
    console.error("Admin login error:", err);
    res.render('admin-auth/admin-login', { loginErr: true, admin: false });
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('adminToken');
  if (req.session) {
    req.session.admin = null;
  }
  res.redirect('/admin/login');
});

router.get('/all-orders', verify, async (req, res) => {
  try {
    let orderDetails = await adminHelper.getUserOrderDetails();
    res.render('admin/view-orders', {
      admin: true,
      orderlist: orderDetails,
      totalOrders: orderDetails.length,
      adminUser: req.admin
    });
  } catch (err) {
    console.error("Admin all-orders error:", err);
    res.render('admin/view-orders', { admin: true, orderlist: [], totalOrders: 0 });
  }
});

module.exports = router;
