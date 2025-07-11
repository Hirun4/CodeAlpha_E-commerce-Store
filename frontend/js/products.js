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
}