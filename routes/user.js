var express = require('express');
var router = express.Router();
const productHelper=require('../helpers/product-helpers');
/* GET home page. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
  res.render('index', {products});
  }
)});
router.get('/login',(req,res)=>{
  res.render('../views/login/login-page')
})
router.get('/signup',(req,res)=>{
  res.render('../views/login/signup-page')
})

module.exports = router;
