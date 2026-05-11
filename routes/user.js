var express = require('express');
var router = express.Router();

/* GET home page. */
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
  res.render('index', { products,admin:true});
});

module.exports = router;
