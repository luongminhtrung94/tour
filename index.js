const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Load Tour Data from JSON
const toursData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'tours.json'), 'utf8'));
const faqsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'faqs.json'), 'utf8'));

// Create a map of all FAQs by ID for quick lookup
const faqMap = {};
['general', 'thailand', 'vietnam'].forEach(category => {
    faqsData[category].forEach(faq => {
        faqMap[faq.id] = faq;
    });
});

// Helper function to resolve FAQ IDs to full FAQ objects
function resolveFaqs(tour) {
    if (tour.faqIds && Array.isArray(tour.faqIds)) {
        tour.faq = tour.faqIds
            .map(id => faqMap[id])
            .filter(faq => faq !== undefined);
    }
    return tour;
}

// Process tours to include resolved FAQs
const thailandTours = toursData.thailand.map(tour => resolveFaqs({ ...tour }));
const vietnamTours = toursData.vietnam.map(tour => resolveFaqs({ ...tour }));

// Helper function to find tour by ID
function findTourById(tourId) {
    const allTours = [...thailandTours, ...vietnamTours];
    return allTours.find(tour => tour.id === tourId);
}

// Page Routes
app.get('/', (req, res) => {
    res.render('index', { thailandTours, vietnamTours });
});

app.get('/thailand', (req, res) => {
    res.render('thailand', { tours: thailandTours });
});

app.get('/vietnam', (req, res) => {
    res.render('vietnam', { tours: vietnamTours });
});

// Tour Detail Page
app.get('/tour/:id', (req, res) => {
    const tour = findTourById(req.params.id);
    if (!tour) {
        return res.status(404).render('index', { thailandTours, vietnamTours });
    }
    res.render('tour-detail', { tour });
});

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

// Create email transporter
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

// Send email
async function sendContactEmail(contactData) {
    const { name, email, phone, message } = contactData;
    
    const fromEmail = process.env.SMTP_USER;
    const toEmail = process.env.TO_EMAIL;

    const mailOptions = {
        from: `"TOPTHAI TRAVEL Website" <${fromEmail}>`,
        to: toEmail,
        subject: `New Contact Form Submission from ${name}`,
        text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message || 'No message provided'}

Submitted at: ${new Date().toLocaleString()}
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
        .field { margin-bottom: 20px; }
        .label { font-weight: bold; color: #2c3e50; }
        .value { margin-top: 5px; padding: 10px; background: white; border-radius: 3px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
            </div>
            <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            <div class="field">
                <div class="label">Phone:</div>
                <div class="value"><a href="tel:${phone}">${phone}</a></div>
            </div>
            <div class="field">
                <div class="label">Message:</div>
                <div class="value">${message || 'No message provided'}</div>
            </div>
            <div class="footer">
                Submitted at: ${new Date().toLocaleString()}
            </div>
        </div>
    </div>
</body>
</html>
        `
    };

    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
}

// Contact form handler
async function handleContact(req, res) {
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

        // Send email notification
        await sendContactEmail({
            name: sanitizedName,
            email: sanitizedEmail,
            phone: sanitizedPhone,
            message: sanitizedMessage
        });

        console.log(`Contact form submitted: Name: ${sanitizedName}, Email: ${sanitizedEmail}`);

        // Return success
        return res.status(200).json({ 
            ok: true, 
            message: 'Contact form submitted successfully'
        });

    } catch (error) {
        console.error('Error processing contact form:', error);
        return res.status(500).json({ 
            ok: false, 
            error: 'Failed to send message. Please try again later.' 
        });
    }
}

// API Routes
app.post('/api/contact', handleContact);

// Health check endpoint
app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all route - render index for any unmatched routes
app.get('*', (req, res) => {
    res.render('index', { thailandTours, vietnamTours });
});

// Start server only when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log('TOPTHAI TRAVEL COMPANY - Server Started');
        console.log('='.repeat(50));
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('='.repeat(50));
    });
}

// Export for Vercel
module.exports = app;
