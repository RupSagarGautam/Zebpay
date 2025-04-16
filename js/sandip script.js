document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Generate random verification code
    function generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Start countdown timer
    function startCountdown(elementId, duration) {
        let timeLeft = duration;
        const countdownElement = document.getElementById(elementId);
        const timer = setInterval(() => {
            timeLeft--;
            countdownElement.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                document.getElementById(elementId.replace('Countdown', 'Timer')).style.display = 'none';
            }
        }, 1000);
    }

    // Store verification codes
    let verificationCodes = {};

    // Form validation and submission
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const resetForm = document.getElementById('resetForm');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePassword = document.querySelector('.toggle-password');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const sendResetCodeBtn = document.getElementById('sendResetCodeBtn');
    const verificationCodeInput = document.getElementById('verificationCode');
    const resetCodeInput = document.getElementById('resetCode');

    // Handle send code button in login form
    if (loginForm) {
        const emailInput = document.getElementById('email');

        sendCodeBtn.addEventListener('click', function() {
            const email = emailInput.value;
            
            if (!email) {
                showMessage('Please enter your email', 'error');
                return;
            }

            // Check if email exists in localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || userData.email !== email) {
                showMessage('Email not found. Please sign up first.', 'error');
                return;
            }

            // Generate verification code
            const code = generateVerificationCode();
            verificationCodes[email] = code;
            
            console.log('Login verification code for', email, ':', code);

            // Disable button and start countdown
            sendCodeBtn.disabled = true;
            showMessage('Verification code sent!', 'success');
            
            // Enable button after 60 seconds
            setTimeout(() => {
                sendCodeBtn.disabled = false;
            }, 60000);
        });

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const code = document.getElementById('verificationCode').value;

            // Get stored user data
            const userData = JSON.parse(localStorage.getItem('user'));
            
            if (!userData || userData.email !== email) {
                showMessage('Email not found. Please sign up first.', 'error');
                return;
            }

            if (userData.password !== password) {
                showMessage('Invalid password!', 'error');
                return;
            }

            // Verify code
            if (verificationCodes[email] !== code) {
                showMessage('Invalid verification code!', 'error');
                return;
            }

            showMessage('Login successful!', 'success');
            // Clear verification code after successful login
            delete verificationCodes[email];
            // Redirect to dashboard or home page
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        });
    }

    // Handle send code button in signup form
    if (signupForm) {
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        sendCodeBtn.addEventListener('click', function() {
            const email = emailInput.value;
            const phone = phoneInput.value;
            
            if (!email && !phone) {
                showMessage('Please enter email or phone number', 'error');
                return;
            }

            // Generate verification code
            const code = generateVerificationCode();
            
            // Store code based on email or phone
            if (email) {
                verificationCodes[email] = code;
                console.log('Verification code for email', email, ':', code);
            } else {
                verificationCodes[phone] = code;
                console.log('Verification code for phone', phone, ':', code);
            }

            // Disable button and start countdown
            sendCodeBtn.disabled = true;
            showMessage('Verification code sent!', 'success');
            
            // Enable button after 60 seconds
            setTimeout(() => {
                sendCodeBtn.disabled = false;
            }, 60000);
        });

        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const fullName = document.getElementById('fullName').value;
            const email = emailInput.value;
            const phone = phoneInput.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const verificationCode = verificationCodeInput.value;

            // Validate form
            if (!fullName || !email || !phone || !password || !confirmPassword || !verificationCode) {
                showMessage('Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }

            if (password.length < 8) {
                showMessage('Password must be at least 8 characters long', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }

            if (!isValidPhone(phone)) {
                showMessage('Please enter a valid phone number', 'error');
                return;
            }

            // Check if user already exists
            const existingUser = localStorage.getItem('user');
            if (existingUser) {
                const userData = JSON.parse(existingUser);
                if (userData.email === email) {
                    showMessage('Email already registered', 'error');
                    return;
                }
            }

            // Verify code
            if (verificationCodes[email] !== verificationCode) {
                showMessage('Invalid verification code!', 'error');
                return;
            }

            // Store user data
            localStorage.setItem('user', JSON.stringify({
                fullName,
                email,
                phone,
                password
            }));

            // Show success message
            showMessage('Account created successfully!', 'success');

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        });
    }

    // Handle reset form
    if (resetForm) {
        const emailInput = document.getElementById('email');

        sendResetCodeBtn.addEventListener('click', function() {
            const email = emailInput.value;
            
            if (!email) {
                showMessage('Please enter your email', 'error');
                return;
            }

            // Check if email exists in localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || userData.email !== email) {
                showMessage('Email not found. Please sign up first.', 'error');
                return;
            }

            // Generate reset code
            const code = generateVerificationCode();
            verificationCodes[email] = code;
            
            console.log('Reset code for', email, ':', code);

            // Disable button and start countdown
            sendResetCodeBtn.disabled = true;
            showMessage('Reset code sent!', 'success');
            
            // Enable button after 60 seconds
            setTimeout(() => {
                sendResetCodeBtn.disabled = false;
            }, 60000);
        });

        resetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = emailInput.value;
            const code = resetCodeInput.value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (!email || !code || !newPassword || !confirmNewPassword) {
                showMessage('Please fill in all fields', 'error');
                return;
            }

            if (newPassword !== confirmNewPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }

            if (newPassword.length < 8) {
                showMessage('Password must be at least 8 characters long', 'error');
                return;
            }

            // Verify code
            if (verificationCodes[email] !== code) {
                showMessage('Invalid reset code!', 'error');
                return;
            }

            // Update password in localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData && userData.email === email) {
                userData.password = newPassword;
                localStorage.setItem('user', JSON.stringify(userData));
                delete verificationCodes[email];
                showMessage('Password reset successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showMessage('Email not found!', 'error');
            }
        });
    }

    // Helper functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    }

    // Function to show messages
    function showMessage(message, type) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
}); 