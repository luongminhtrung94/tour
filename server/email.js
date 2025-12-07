const nodemailer = require('nodemailer');

// Create reusable transporter
function createTransporter() {
    const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    };

    return nodemailer.createTransport(config);
}

// Send email notification with retry
async function sendContactEmail(contactData, retryCount = 1) {
    const { name, email, phone, message } = contactData;
    
    const fromEmail = process.env.SMTP_USER;
    const toEmail = 'abc@gmail.com';

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

    let lastError = null;
    
    for (let attempt = 0; attempt <= retryCount; attempt++) {
        try {
            const transporter = createTransporter();
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            lastError = error;
            console.error(`Email sending attempt ${attempt + 1} failed:`, error.message);
            
            if (attempt < retryCount) {
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    // All attempts failed
    throw lastError;
}

module.exports = {
    sendContactEmail
};

