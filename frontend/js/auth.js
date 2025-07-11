// Handle registration
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
        name: this.name.value,
        email: this.email.value,
        password: this.password.value,
        phone: this.phone.value,
        address: {
            street: '', city: '', zipCode: '', country: ''
        }
    };
    if (this.address) data.address.street = this.address.value;
    const res = await apiRequest('/auth/register', 'POST', data);
    if (res.token) {
        localStorage.setItem('token', res.token);
        window.location.href = 'index.html';
    } else {
        alert(res.message || res.errors?.[0]?.msg || 'Registration failed');
    }
});

// Handle login
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const data = {
        email: this.email.value,
        password: this.password.value
    };
    const res = await apiRequest('/auth/login', 'POST', data);
    if (res.token) {
        localStorage.setItem('token', res.token);
        window.location.href = 'index.html';
    } else {
        alert(res.message || 'Login failed');
    }
});

// Handle logout
document.getElementById('logoutBtn')?.addEventListener('click', function() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// Show user info if logged in
async function showUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await apiRequest('/auth/profile', 'GET', null, true);
    if (res && res.name) {
        document.getElementById('userInfo').style.display = '';
        document.getElementById('userName').textContent = res.name;
        document.getElementById('authButtons').style.display = 'none';
    }
}
showUserInfo();