function addToCart(proId) {
  fetch('/add-to-cart/' + proId)
    .then(res => res.json())
    .then(data => {
      if (data.login === false) {
        alert("Please login first")
        location.href = '/login'
        return
      }
      if (data.status) {
      let count = parseInt($('#cartCount').text())
        count = count + 1
        $('#cartCount').text(count)
      }
    })
    .catch(err => {
      console.log(err)
    })
}
function changeQuantity(cartId,proId,count){
  $.ajax({
   url:'/change-product-quantity',
   data:{
  cart:cartId,
  product:proId,
  count:count
   },
   method:'post',
   success:(response)=>{
    alert(response)
   }
  })
}