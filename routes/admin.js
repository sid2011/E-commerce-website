var express = require('express');
var router = express.Router();
const path=require('path')

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
console.log(req.files.image)
res.send("Recieved data.")

})


module.exports = router;
