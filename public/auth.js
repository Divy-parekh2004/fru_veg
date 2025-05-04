// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the signup form
    const signupForm = document.querySelector('#signupModal form');
    const loginForm = document.querySelector('#loginModal form');
    
    // Add form submit event listener for signup
    if (signupForm) {
        signupForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Get form data
            const fullName = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const mobile = document.getElementById('signupMobile').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            
            // Form validation
            if (password !== confirmPassword) {
                showMessage('signup-message', 'Passwords do not match', 'error');
                return;
            }
            
            // Create request payload
            const userData = {
                fullName,
                email,
                mobile,
                password,
                confirmPassword
            };
            
            try {
                // Send POST request to signup endpoint
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Success message
                    showMessage('signup-message', data.message, 'success');
                    
                    // Clear form
                    signupForm.reset();
                    
                    // Automatically switch to login modal after 2 seconds
                    setTimeout(() => {
                        const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
                        signupModal.hide();
                        
                        // Show login modal
                        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                        loginModal.show();
                    }, 2000);
                } else {
                    // Error message
                    showMessage('signup-message', data.message, 'error');
                }
            } catch (error) {
                console.error('Error during signup:', error);
                showMessage('signup-message', 'An error occurred. Please try again.', 'error');
            }
        });
    }
    
    // Add form submit event listener for login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Get form data
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Create request payload
            const loginData = {
                email,
                password
            };
            
            try {
                // Send POST request to login endpoint
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Success message
                    showMessage('login-message', data.message, 'success');
                    
                    // Store user data in localStorage or sessionStorage
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Clear form
                    loginForm.reset();
                    
                    // Close modal and redirect to home page after 2 seconds
                    setTimeout(() => {
                        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                        loginModal.hide();
                        
                        // Redirect to home page or reload
                        window.location.reload();
                    }, 2000);
                } else {
                    // Error message
                    showMessage('login-message', data.message, 'error');
                }
            } catch (error) {
                console.error('Error during login:', error);
                showMessage('login-message', 'An error occurred. Please try again.', 'error');
            }
        });
    }
    
    // Helper function to show messages in the modal
    function showMessage(elementId, message, type) {
        // Check if message div exists, if not create it
        let messageDiv = document.getElementById(elementId);
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = elementId;
            
            // Find the form in the modal
            const modalForm = document.getElementById(elementId.split('-')[0] + 'Modal').querySelector('form');
            // Insert the message div before the form
            modalForm.parentNode.insertBefore(messageDiv, modalForm);
        }
        
        // Set message content and style
        messageDiv.textContent = message;
        messageDiv.className = 'alert mt-3 ' + (type === 'success' ? 'alert-success' : 'alert-danger');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'd-none';
        }, 5000);
    }
});