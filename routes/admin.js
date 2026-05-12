var express = require('express');
var router = express.Router();
const path=require('path')
const productHelper=require('../helpers/product-helpers')



/* GET users listing. */
router.get('/', function(req, res, next) {
  let products = [
    {
      name: "Iphone 15 Pro-max",
      category: "Mobile",
      description: "This is a good phone",
      image: "https://shorturl.at/gESIR"
    },
    {
      name: "Vivo x300",
      category: "Mobile",
      description: "This is a good phone",
      image: "https://shorturl.at/wiFYI"
    },
    {
      name: "Samsung S26 Ultra",
      category: "Mobile",
      description: "This is a good phone",
      image: "https://shorturl.at/tyVy6"
    },
    {
      name: "Oneplus 5g",
      category: "Mobile",
      description: "This is a good phone",
      image: "https://image01-in.oneplus.net/media/202511/06/f96761005541e8715f92bda23561aa89.png?x-amz-process=image/format,webp/quality,Q_80"
    }
  ];
  res.render('admin/view-products',{admin:true,products})
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


module.exports = router;
