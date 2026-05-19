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
        let count = $('#cartCount').html()
        count = parseInt(count) + 1
        $('#cartCount').html(count)
      }
    })
    .catch(err => {
      console.log(err)
    })
}