document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio do formulário

        // Simula o pagamento
        alert('Você será redirecionado para a página de pagamento.');

        // Redireciona (depois vamos trocar pelo real)
        window.location.href = "src/pages/payment.html";
    });
});
