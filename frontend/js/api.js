const API_BASE = 'http://localhost:3000/api';

async function apiRequest(endpoint, method = 'GET', data = null, auth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && localStorage.getItem('token')) {
        headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
    }
    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);
    const res = await fetch(API_BASE + endpoint, options);
    return res.json();
}