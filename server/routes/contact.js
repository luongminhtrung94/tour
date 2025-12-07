const express = require('express');
const router = express.Router();
const { insertContact } = require('../db');
const { sendContactEmail } = require('../email');

// Input sanitization helper
function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
}

// Validation helpers
function validateName(name) {
    if (!name || name.trim().length === 0) {
        return 'Name is required';
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
        return 'Name must be between 2 and 100 characters';
    }
    return null;
}

function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format';
    }
    if (email.length > 255) {
        return 'Email is too long';
    }
    return null;
}

function validatePhone(phone) {
    if (!phone || phone.trim().length === 0) {
        return 'Phone number is required';
    }
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    if (!/^\d+$/.test(cleanPhone)) {
        return 'Phone number must contain only numbers';
    }
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        return 'Phone number must be between 8 and 15 digits';
    }
    return null;
}

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validate inputs
        const nameError = validateName(name);
        if (nameError) {
            return res.status(400).json({ ok: false, error: nameError });
        }

        const emailError = validateEmail(email);
        if (emailError) {
            return res.status(400).json({ ok: false, error: emailError });
        }

        const phoneError = validatePhone(phone);
        if (phoneError) {
            return res.status(400).json({ ok: false, error: phoneError });
        }

        // Sanitize inputs
        const sanitizedName = sanitizeInput(name);
        const sanitizedEmail = sanitizeInput(email);
        const sanitizedPhone = sanitizeInput(phone);
        const sanitizedMessage = message ? sanitizeInput(message) : '';

        // Save to database
        const result = await insertContact(
            sanitizedName,
            sanitizedEmail,
            sanitizedPhone,
            sanitizedMessage
        );

        console.log(`Contact saved to database: ID ${result.id}, Name: ${sanitizedName}`);

        // Send email notification (don't block response on email failure)
        sendContactEmail({
            name: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone,
            message: sanitizedMessage
        })
        .then(() => {
            console.log('Email notification sent successfully');
        })
        .catch((error) => {
            console.error('Failed to send email notification:', error.message);
            // Email failure is logged but doesn't fail the request
        });

        // Return success
        res.json({ 
            ok: true, 
            message: 'Contact form submitted successfully',
            id: result.id 
        });

    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({ 
            ok: false, 
            error: 'Internal server error. Please try again later.' 
        });
    }
});

module.exports = router;

