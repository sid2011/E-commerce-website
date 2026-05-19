var express = require('express');
var router = express.Router();
const productHelper=require('../helpers/product-helpers');
const userHelper=require('../helpers/user-helper')


/* GET home page. */
const verify = (req, res, next) => {

  if (req.session.loggedIn) {
    next()
  } else {
    res.json({ login: false })
  }

}
router.get('/',async function(req, res, next) {
  let user=req.session.user
  let cartCount=0
   if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  productHelper.getAllProducts().then((products)=>{
  res.render('index', {products,user,cartCount});
  });
});

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
    req.session.loggedIn=true
    req.session.user=response.user
    res.redirect('/login')
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/login')
})
router.get('/cart',verify,async(req,res)=>{
  let products = await userHelper.getCartProduct(req.session.user._id)
    res.render('user/cart',{products,user:req.session.user})
})
router.get('/add-to-cart/:id', verify, async (req, res) => {
  try {
    console.log('API call')

    await userHelper.addToCart(req.params.id, req.session.user._id)

    res.json({ status: true })
  } catch (err) {
    console.log(err)
    res.json({ status: false })
  }
})
module.exports = router;