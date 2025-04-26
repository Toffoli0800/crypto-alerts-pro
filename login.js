document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        const user = JSON.parse(localStorage.getItem('user'));

        if (!user || user.email !== email || user.password !== password) {
            alert('Invalid credentials.');
            return;
        }

        const paidAt = user.paidAt;
        const now = Date.now();
        const diff = now - paidAt;

        if (diff > 30 * 24 * 60 * 60 * 1000) {  // 30 dias
            alert('Subscription expired. Please renew your access.');
            localStorage.setItem('loggedIn', 'false');
            return;
        }

        localStorage.setItem('loggedIn', 'true');
        window.location.href = './dashboard.html';
    });
});
