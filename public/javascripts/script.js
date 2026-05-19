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