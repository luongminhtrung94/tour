// API Configuration
const API_URL = window.location.origin;

// Form Elements
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formMessage = document.getElementById('formMessage');

// Input Fields
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const messageInput = document.getElementById('message');

// Error Message Elements
const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const phoneError = document.getElementById('phone-error');

// Validation Functions
function validateName(name) {
    if (!name || name.trim().length === 0) {
        return 'Name is required';
    }
    if (name.trim().length < 2) {
        return 'Name must be at least 2 characters';
    }
    return '';
}

function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    return '';
}

function validatePhone(phone) {
    if (!phone || phone.trim().length === 0) {
        return 'Phone number is required';
    }
    // Remove spaces, dashes, parentheses, and plus signs for validation
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    if (!/^\d+$/.test(cleanPhone)) {
        return 'Phone number must contain only numbers';
    }
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        return 'Phone number must be between 8 and 15 digits';
    }
    return '';
}

// Real-time Validation
nameInput.addEventListener('blur', () => {
    const error = validateName(nameInput.value);
    nameError.textContent = error;
    if (error) {
        nameInput.classList.add('error');
    } else {
        nameInput.classList.remove('error');
    }
});

emailInput.addEventListener('blur', () => {
    const error = validateEmail(emailInput.value);
    emailError.textContent = error;
    if (error) {
        emailInput.classList.add('error');
    } else {
        emailInput.classList.remove('error');
    }
});

phoneInput.addEventListener('blur', () => {
    const error = validatePhone(phoneInput.value);
    phoneError.textContent = error;
    if (error) {
        phoneInput.classList.add('error');
    } else {
        phoneInput.classList.remove('error');
    }
});

// Clear error on input
nameInput.addEventListener('input', () => {
    if (nameInput.classList.contains('error')) {
        nameError.textContent = '';
        nameInput.classList.remove('error');
    }
});

emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) {
        emailError.textContent = '';
        emailInput.classList.remove('error');
    }
});

phoneInput.addEventListener('input', () => {
    if (phoneInput.classList.contains('error')) {
        phoneError.textContent = '';
        phoneInput.classList.remove('error');
    }
});

// Form Submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous messages
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    // Validate all fields
    const nameErr = validateName(nameInput.value);
    const emailErr = validateEmail(emailInput.value);
    const phoneErr = validatePhone(phoneInput.value);

    nameError.textContent = nameErr;
    emailError.textContent = emailErr;
    phoneError.textContent = phoneErr;

    if (nameErr) nameInput.classList.add('error');
    if (emailErr) emailInput.classList.add('error');
    if (phoneErr) phoneInput.classList.add('error');

    // Stop if there are validation errors
    if (nameErr || emailErr || phoneErr) {
        formMessage.textContent = 'Please fix the errors above';
        formMessage.className = 'form-message error';
        return;
    }

    // Prepare form data
    const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        message: messageInput.value.trim()
    };

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.ok) {
            // Success
            formMessage.textContent = 'Thank you! Your message has been sent successfully. We will contact you soon.';
            formMessage.className = 'form-message success';
            
            // Reset form
            contactForm.reset();
            
            // Clear any error states
            nameInput.classList.remove('error');
            emailInput.classList.remove('error');
            phoneInput.classList.remove('error');
            nameError.textContent = '';
            emailError.textContent = '';
            phoneError.textContent = '';

            // Scroll to message
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            // Error from server
            formMessage.textContent = data.error || 'Failed to send message. Please try again.';
            formMessage.className = 'form-message error';
        }
    } catch (error) {
        // Network or other error
        console.error('Form submission error:', error);
        formMessage.textContent = 'Network error. Please check your connection and try again.';
        formMessage.className = 'form-message error';
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

