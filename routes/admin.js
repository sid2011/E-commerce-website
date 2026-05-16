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
    res.render('admin/add-product');
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
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
})
router.get('/edit-product/:id', async(req, res) => {
  let product=await productHelper.getProductDetails(req.params.id)
  console.log(product)
  res.render('admin/edit-product',{product});
});
router.post('/edit-product/:id',(req,res)=>{
productHelper.updateProduct(req.params.id,req.params).then(()=>{
  res.redirect('/admin')
})
})
module.exports = router;
