'use strict';

const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs/promises');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
};

exports.handler = async (event) => {
    // Handle CORS preflight (Lambda Function URL passes OPTIONS through)
    if (event.requestContext?.http?.method === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }

    if (event.requestContext?.http?.method !== 'POST') {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ success: false, message: 'Method not allowed' }) };
    }

    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, message: 'Invalid JSON' }),
        };
    }

    const { name, email, phone, eventType, date, message } = body;

    if (!email) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, message: 'Email is required' }),
        };
    }

    try {
        // Admin notification
        const mailOptionsAdmin = {
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            replyTo: email,
            subject: `New Enquiry from ${name} - ${eventType}`,
            text: `New Booking Enquiry!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nEvent Type: ${eventType}\nDate: ${date || 'Not specified'}\n\nMessage:\n${message || 'No additional message.'}`,
            html: `
                <h2>New Booking Enquiry!</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Event Type:</strong> ${eventType}</p>
                <p><strong>Date:</strong> ${date || 'Not specified'}</p>
                <br/>
                <p><strong>Message:</strong></p>
                <p>${message || 'No additional message.'}</p>
            `,
        };

        // Auto-responder to client
        const templatePath = path.join(__dirname, 'email-templates', 'autoResponder.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');
        htmlTemplate = htmlTemplate.replace(/{{name}}/g, name);
        htmlTemplate = htmlTemplate.replace(/{{eventType}}/g, eventType);

        const mailOptionsUser = {
            from: `"Happy Shisha" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `We've received your ${eventType} enquiry! - Happy Shisha`,
            html: htmlTemplate,
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, 'logo.png'),
                cid: 'happyshishalogo',
            }],
        };

        const [adminInfo, userInfo] = await Promise.all([
            transporter.sendMail(mailOptionsAdmin),
            transporter.sendMail(mailOptionsUser),
        ]);

        console.log('Admin notified:', adminInfo.messageId);
        console.log('Auto-responder sent:', userInfo.messageId);

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, message: 'Email sent successfully' }),
        };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, message: 'Failed to send email' }),
        };
    }
};
