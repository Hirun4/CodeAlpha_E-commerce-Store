// Shop Now button
document.getElementById('shopNowBtn')?.addEventListener('click', function() {
    window.scrollTo({ top: document.querySelector('.products').offsetTop, behavior: 'smooth' });
});

// Search
document.getElementById('searchBtn')?.addEventListener('click', function() {
    const val = document.getElementById('searchInput').value;
    window.location.href = `index.html?search=${encodeURIComponent(val)}`;
});