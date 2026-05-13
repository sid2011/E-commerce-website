var express = require('express');
var router = express.Router();
const productHelper=require('../helpers/product-helpers');
/* GET home page. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
  res.render('index', {admin:true,products});
  }
)});

module.exports = router;
