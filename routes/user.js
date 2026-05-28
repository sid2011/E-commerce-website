var express = require('express');
var router = express.Router();
const productHelper=require('../helpers/product-helpers');
const userHelper=require('../helpers/user-helper');
const collections = require('../config/collections');
const { ObjectId } = require('mongodb');
const db = require('../config/connection')

/* GET home page. */
const verify = (req, res, next) => {
  if (req.session && req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/', verify, async (req, res) => {

    let cartCount = await userHelper.getCartCount(req.session.user._id)

    productHelper.getAllProducts().then((products) => {

        res.render('index', {
            products,
            user: req.session.user,
            cartCount
        })

    })

})

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
 res.render('user-auth/login-page')
  }
})

router.post('/login',(req,res)=>{
  userHelper.doLogIn(req.body).then((response)=>{
     if(response.status){
    req.session.loggedIn=true
     req.session.user=response.user
       res.redirect('/')
     }else{
      res.render('user-auth/login-page',{ loginErr: true })
    }
  })

})
router.get('/signup',(req,res)=>{
  res.render('user-auth/signup-page')
})

router.post('/signup',(req,res)=>{
  userHelper.doSignUp(req.body).then((response)=>{
     res.redirect('/login')
  })
})
router.get('/logout',(req,res)=>{
  req.session.loggedIn = false
  req.session.user=null
  req.session.destroy((err)=>{
    if(err){
      console.log(err)
    }else{
res.redirect('/login')
    }
  })
  
})
router.get('/cart',verify,async(req,res)=>{
  let products = await userHelper.getCartProduct(req.session.user._id)
  let totalValue=await userHelper.getTotalAmount(req.session.user._id)
   let cartEmpty = products.length === 0
    res.render('user/cart',{products,user:req.session.user,cartEmpty,totalValue})
})
router.get('/add-to-cart/:id', verify, async (req, res) => {
  try {
    //console.log('API call')

    await userHelper.addToCart(req.params.id, req.session.user._id)

    res.json({ status: true })
  } catch (err) {
    console.log(err)
    res.json({ status: false })
  }
})
router.post('/change-product-quantity', (req, res) => {
    userHelper.changeQuantity(
        req.body.cart,
        req.body.product,
        req.body.count
    ).then(() => {
        res.json({ status: true })
    })
})
router.post('/cart/delete-product/:id/:userId',async(req,res)=>{
let proId=req.params.id
let userId=req.params.userId
await userHelper.deleteCartProducts(proId,userId).then(()=>{
  res.redirect('/cart')
})
})
router.get('/place-order',verify,async(req,res)=>{
  let total=await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total, user: req.session.user})
})
router.post('/place-order', async (req, res) => {
  try {
    let productList = await userHelper.getCartProductList(req.body.userId);
console.log("BODY:", req.body)
console.log("USER ID:", req.body.userId)
    let totalAmount = await userHelper.getTotalAmount(req.body.userId);

    let orderId = await userHelper.placeOrder(
      req.body.userId,
      req.body,
      productList,
      totalAmount
    );
// console.log("BODY:", req.body)
// console.log("USER ID:", req.body.userId)
// console.log("TOTAL AMOUNT:", totalAmount)
    if (req.body.paymentMethod === "COD") {
      res.json({ cod_success: true });
      await userHelper.deleteAllCartProducts(req.session.user._id)
    } else {
      let response = await userHelper.generateRazorpay(
        orderId,
        totalAmount
      );

      res.json(response);
    }

  } catch (err) {
    console.log(err);
    res.status(500).json({ status: false, err: err.message });
  }
});
router.get('/all-orders',verify,async(req,res)=>{
let orderlist=await userHelper.getOrderList(req.session.user._id)
  res.render('user/all-orders',{orderlist})
})
router.get('/order-success',(req,res)=>{
res.render('user/order-success')
})
router.post('/verify-payment', async (req, res) => {
  console.log("VERIFY BODY:", req.body);

  try {

    const isValid = userHelper.verifyPayment(req.body);

    if (!isValid) {
      return res.json({ status: false });
    }

    const userId = req.body.order.userId; // 👈 BEST FIX

    await db.get().collection(collections.ORDER_COLLECTION).updateOne(
      { razorpay_order_id: req.body.razorpay_order_id },
      { $set: { status: "placed" } }
    );

    await userHelper.deleteAllCartProducts(userId);

    res.json({ status: true });

  } catch (err) {
    console.log(err);
    res.json({ status: false });
  }
});
module.exports = router;