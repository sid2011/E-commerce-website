function showToast(message, isSuccess = true) {
  const toastEl = document.getElementById('cartToast');
  const toastMsg = document.getElementById('toastMessage');
  if (toastEl && toastMsg) {
    toastMsg.innerText = message;
    if (isSuccess) {
      toastEl.classList.remove('bg-danger');
      toastEl.classList.add('bg-success');
    } else {
      toastEl.classList.remove('bg-success');
      toastEl.classList.add('bg-danger');
    }
    const bsToast = new bootstrap.Toast(toastEl, { delay: 2800 });
    bsToast.show();
  } else {
    alert(message);
  }
}

function addToCart(proId) {
  const btn = document.getElementById('btn-' + proId);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';
  }

  fetch('/add-to-cart/' + proId)
    .then(res => res.json())
    .then(data => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-cart-plus"></i> Add';
      }

      if (data.login === false) {
        showToast("Please sign in to add items to your cart", false);
        setTimeout(() => {
          location.href = '/login';
        }, 1200);
        return;
      }

      if (data.status) {
        let countEl = $('#cartCount');
        let count = parseInt(countEl.text()) || 0;
        count = count + 1;
        countEl.text(count);

        // Small badge bounce animation
        countEl.css({ transform: 'scale(1.35)', transition: 'transform 0.2s ease' });
        setTimeout(() => countEl.css({ transform: 'scale(1)' }), 250);

        showToast("Item added to cart successfully!");
      } else {
        showToast("Could not add item to cart. Please try again.", false);
      }
    })
    .catch(err => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-cart-plus"></i> Add';
      }
      console.error(err);
      showToast("Network error. Please try again.", false);
    });
}

function changeQuantity(cartId, proId, count) {
  $.ajax({
    url: '/change-product-quantity',
    data: {
      cart: cartId,
      product: proId,
      count: count
    },
    method: 'post',
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
    error: (err) => {
      console.error(err);
    }
  });
}
