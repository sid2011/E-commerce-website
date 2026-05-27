var express = require('express');
var router = express.Router();
const path=require('path')
const productHelper=require('../helpers/product-helpers');
const adminHelper=require('../helpers/admin-helper')
const { log } = require('console');

const verify = (req, res, next) => {
  if (req.session && req.session.admin) {
    next()
  } else {
    res.redirect('/admin/login')
  }

}
/* GET users listing. */
router.get('/',verify, function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
  res.render('admin/view-products',{admin:true,products})
  })

});
router.get('/add-product',verify, (req, res) => {
    res.render('admin/add-product',{admin:true});
});
router.post('/add-product',verify,(req,res)=>{

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
//console.log(req.files.image)
})
router.get('/delete-product/:id',verify,(req,res)=>{
  let proId=req.params.id
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
})
router.get('/edit-product/:id', verify,async(req, res) => {
  let product=await productHelper.getProductDetails(req.params.id)
  res.render('admin/edit-product',{admin:true,product});
});
router.post('/edit-product/:id',verify,(req,res)=>{
productHelper.updateProduct(req.params.id,req.body).then(()=>{
 res.redirect('/admin')
  if(req.files.image){
    let image=req.files.image
     image.mv('./public/product-images/' + req.params.id + '.jpg')
  }
})
})
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
 res.render('admin-auth/admin-login',{admin:true})
  }
})

router.post('/login',(req,res)=>{
  adminHelper.doLogIn(req.body).then((response)=>{
     if(response.status){
    req.session.loggedIn=true
     req.session.admin=response.admin
       res.redirect('/admin')
     }else{
      res.render('admin-auth/admin-login',{ loginErr: true,admin:true })
    }
  })

})
router.get('/all-orders', verify, async(req, res) => {
 let orderDetails=await adminHelper.getUserOrderDetails()
  let userDetails=await adminHelper.getUserName(orderDetails.user)
  res.render('admin/view-orders',{admin:true,orderDetails,userDetails});
  console.log("this is userdetails",userDetails)
});
module.exports = router;
