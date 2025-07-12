// Add to cart
async function addToCart(productId) {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Please login to add to cart.');
        window.location.href = 'login.html';
        return;
    }
    const res = await apiRequest('/cart/add', 'POST', { productId, quantity: 1 }, true);
    if (res && res.items) {
        alert('Added to cart!');
        updateCartCount();
    } else {
        alert(res.message || 'Failed to add to cart');
    }
}

// Load cart for cart.html
async function loadCart() {
    const res = await apiRequest('/cart', 'GET', null, true);
    const cartItems = document.getElementById('cartItems');
    const subtotal = document.getElementById('subtotal');
    const total = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartSummary = document.getElementById('cartSummary'); // <-- get the summary box

    if (!cartItems) return;
    cartItems.innerHTML = '';
    let sum = 0;

    if (!res.items || res.items.length === 0) {
        cartItems.innerHTML = `
            <div style="text-align:center; padding:2rem;">
                <p style="font-size:1.2rem; color:#888;">No items added to your cart.</p>
                <button class="btn btn-primary" id="continueShoppingBtn">Continue Shopping</button>
            </div>
        `;
        if (subtotal) subtotal.textContent = '$0.00';
        if (total) total.textContent = '$10.00';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'none'; // <-- hide summary
        document.getElementById('continueShoppingBtn').onclick = function() {
            window.location.href = 'index.html#productsGrid';
        };
        return;
    } else {
        if (checkoutBtn) checkoutBtn.style.display = '';
        if (cartSummary) cartSummary.style.display = ''; // <-- show summary
    }

    res.items.forEach(item => {
        cartItems.innerHTML += `
        <div class="cart-item">
            <img src="http://localhost:3000/uploads/${item.product.image}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.product.name}</div>
                <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
                <div class="cart-item-qty">Qty: ${item.quantity}</div>
                <button onclick="removeFromCart('${item.product._id}')">Remove</button>
            </div>
        </div>`;
        sum += item.product.price * item.quantity;
    });
    if (subtotal) subtotal.textContent = `$${sum.toFixed(2)}`;
    if (total) total.textContent = `$${(sum + 10).toFixed(2)}`; // $10 shipping
}

// Remove from cart
async function removeFromCart(productId) {
    const res = await apiRequest(`/cart/remove/${productId}`, 'DELETE', null, true);
    if (res && res.items !== undefined) {
        loadCart();
        updateCartCount();
    }
}

// Update cart count in navbar
async function updateCartCount() {
    const res = await apiRequest('/cart', 'GET', null, true);
    const count = res.items?.reduce((a, b) => a + b.quantity, 0) || 0;
    document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
}
updateCartCount();

// Checkout button
document.getElementById('checkoutBtn')?.addEventListener('click', function() {
    window.location.href = 'checkout.html';
});

// For checkout.html: load order summary
async function loadOrderSummary() {
    const res = await apiRequest('/cart', 'GET', null, true);
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    if (!orderItems) return;
    orderItems.innerHTML = '';
    let sum = 0;
    res.items?.forEach(item => {
        orderItems.innerHTML += `
        <div>
            ${item.product.name} x ${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)}
        </div>`;
        sum += item.product.price * item.quantity;
    });
    if (orderTotal) orderTotal.textContent = (sum + 10).toFixed(2);
}

// Place order
document.getElementById('checkoutForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const shippingAddress = {
        street: this.street.value,
        city: this.city.value,
        zipCode: this.zipCode.value,
        country: this.country.value
    };
    const paymentMethod = this.paymentMethod.value;
    const res = await apiRequest('/orders', 'POST', { shippingAddress, paymentMethod }, true);
    if (res && res.order) {
        alert('Order placed successfully!');
        window.location.href = 'index.html';
    } else {
        alert(res.message || 'Order failed');
    }
});