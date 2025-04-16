function togglePassword() {
    const passwordInput = document.getElementById('securityPassword');
    const eyeIcon = document.querySelector('.eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.textContent = '👁️‍🗨️';
    } else {
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁️';
    }
} 