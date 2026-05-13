var express = require('express');
var router = express.Router();
const path=require('path')
const productHelper=require('../helpers/product-helpers');
const { log } = require('console');

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    console.log(products)
  res.render('admin/view-products',{admin:true,products})
  })

});
router.get('/add-product', (req, res) => {
    res.redirect('admin/add-product');
});
router.post('/add-product',(req,res)=>{
console.log(req.body)

productHelper.addProducts(req.body,(result)=>{
  let image=req.files.image
  image.mv('./public/product-images/' + result + '.jpg',(err,data)=>{
    if(err){
      res.send(err)
    }else{
      res.redirect('/admin/add-product')
    }
  })
})
console.log(req.files.image)
})
module.exports = router;
