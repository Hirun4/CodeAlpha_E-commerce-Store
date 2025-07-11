// Load products for index.html
async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    const loading = document.getElementById('loading');
    if (!grid) return;
    loading.style.display = '';
    let url = '/products?';

    // Get search and filter values
    const search = document.getElementById('searchInput')?.value.trim();
    const category = document.getElementById('categoryFilter')?.value;
    const sort = document.getElementById('sortFilter')?.value;

    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (sort) url += `sort=${encodeURIComponent(sort)}&`;

    const res = await apiRequest(url);
    grid.innerHTML = '';
    res.products?.forEach(product => {
        grid.innerHTML += `
        <div class="product-card">
            <img src="http://localhost:3000/uploads/${product.image}" class="product-image" onclick="window.location='product-details.html?id=${product._id}'">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-description">${product.description.substring(0, 60)}...</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="addToCart('${product._id}')">Add to Cart</button>
                    <button class="view-details" onclick="window.location='product-details.html?id=${product._id}'">View Details</button>
                </div>
            </div>
        </div>`;
    });
    loading.style.display = 'none';
}
document.getElementById('searchBtn')?.addEventListener('click', loadProducts);
document.getElementById('searchInput')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') loadProducts();
});
document.getElementById('categoryFilter')?.addEventListener('change', loadProducts);
document.getElementById('sortFilter')?.addEventListener('change', loadProducts);
if (document.getElementById('productsGrid')) loadProducts();

// Load product details for product-details.html
async function loadProductDetails(id) {
    const container = document.getElementById('productDetails');
    const res = await apiRequest(`/products/${id}`);
    if (!res || !res.name) {
        container.innerHTML = '<p>Product not found.</p>';
        return;
    }
    container.innerHTML = `
        <div class="product-image-container">
            <img src="http://localhost:3000/uploads/${res.image}" class="product-main-image">
        </div>
        <div class="product-info-container">
            <div class="product-title">${res.name}</div>
            <div class="product-price-large">$${res.price.toFixed(2)}</div>
            <div class="product-description-full">${res.description}</div>
            <div class="product-meta">
                <div class="meta-item"><span class="meta-label">Category:</span> <span class="meta-value">${res.category}</span></div>
                <div class="meta-item"><span class="meta-label">Stock:</span> <span class="meta-value">${res.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></div>
                <div class="meta-item"><span class="meta-label">Rating:</span> <span class="meta-value">${res.rating?.toFixed(1) || '0'}</span></div>
            </div>
            <div class="product-actions-container">
                <button class="add-to-cart-large" onclick="addToCart('${res._id}')">Add to Cart</button>
            </div>
        </div>
    `;
    loadReviews(id);
}

// Load reviews and review form
async function loadReviews(productId) {
    const section = document.getElementById('reviewsSection');
    const res = await apiRequest(`/products/${productId}`);
    const user = localStorage.getItem('token') ? await apiRequest('/auth/profile', 'GET', null, true) : null;

    // Reviews list
    let reviewsHtml = `<div class="reviews-header">
        <div class="reviews-title">Reviews (${res.reviews.length})</div>
    </div>`;

    if (user) {
        // Check if user already reviewed
        const myReview = res.reviews.find(r => r.user && r.user._id === user._id);
        if (!myReview) {
            reviewsHtml += `
            <form class="review-form" id="addReviewForm">
                <h4>Add a Review</h4>
                <label>Rating:
                    <select name="rating" id="reviewRating" required>
                        <option value="">Select</option>
                        <option value="1">1 ★</option>
                        <option value="2">2 ★★</option>
                        <option value="3">3 ★★★</option>
                        <option value="4">4 ★★★★</option>
                        <option value="5">5 ★★★★★</option>
                    </select>
                </label>
                <br>
                <label>Comment (optional):<br>
                    <textarea name="comment" id="reviewComment" rows="2"></textarea>
                </label>
                <br>
                <button type="submit" class="btn btn-primary">Submit Review</button>
            </form>
            `;
        }
    }

    // List reviews
    if (res.reviews.length === 0) {
        reviewsHtml += `<div>No reviews yet.</div>`;
    } else {
        reviewsHtml += res.reviews.map(r => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-author">${r.user?.name || 'User'}</span>
                    <span class="review-date">${new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                <div class="review-comment">${r.comment ? r.comment : ''}</div>
                ${user && r.user && r.user._id === user._id ? `<button class="btn btn-danger btn-sm" onclick="deleteReview('${res._id}')">Delete</button>` : ''}
            </div>
        `).join('');
    }

    section.innerHTML = reviewsHtml;

    // Add review submit handler
    const addReviewForm = document.getElementById('addReviewForm');
    if (addReviewForm) {
        addReviewForm.onsubmit = async function(e) {
            e.preventDefault();
            const rating = document.getElementById('reviewRating').value;
            const comment = document.getElementById('reviewComment').value;
            const result = await apiRequest(`/products/${productId}/reviews`, 'POST', { rating: Number(rating), comment }, true);
            if (result.message === 'Review added successfully') {
                loadReviews(productId);
            } else {
                alert(result.message || 'Failed to add review');
            }
        };
    }
}

// Delete review
window.deleteReview = async function(productId) {
    if (!confirm('Delete your review?')) return;
    const result = await apiRequest(`/products/${productId}/reviews`, 'DELETE', null, true);
    if (result.message === 'Review deleted successfully') {
        loadReviews(productId);
    } else {
        alert(result.message || 'Failed to delete review');
    }
};