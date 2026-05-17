var express = require('express');
var router = express.Router();
const productHelper=require('../helpers/product-helpers');
const userHelper=require('../helpers/user-helper')


/* GET home page. */
const verify=(req,res,next)=>{
  if(req.session.loggedIn){
next()
  }else{
    res.redirect('/login')
  }
}
router.get('/', function(req, res, next) {
  let user=req.session.user
  console.log(user)
  productHelper.getAllProducts().then((products)=>{
  res.render('index', {products,user});
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
    res.redirect('/login')
    req.session.loggedIn=true
    req.session.user=response.user
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/login')
})
router.get('/cart',verify,(req,res)=>{
    res.render('user/cart')
})

module.exports = router;
