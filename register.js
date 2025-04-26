document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!name || !email || !password) {
            alert('Please fill all fields.');
            return;
        }

        const userData = {
            name,
            email,
            password,
            paidAt: Date.now()  // Salva a data da assinatura
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('loggedIn', 'true');

        window.location.href = './dashboard.html';
    });
});
