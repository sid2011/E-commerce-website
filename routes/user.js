var express = require('express');
var router = express.Router();
const productHelper=require('../helpers/product-helpers');
const userHelper=require('../helpers/user-helper')

/* GET home page. */

router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
  res.render('index', {products});
  });
});

router.get('/login',(req,res)=>{
  res.render('user-auth/login-page')
})
router.post('/signin',(req,res)=>{

})




router.get('/signup',(req,res)=>{
  res.render('user-auth/signup-page')
})

router.post('/signup',(req,res)=>{
  userHelper.doSignUp(req.body).then((response)=>{
    console.log(response)
    res.redirect('/login')
  })
})

module.exports = router;
