import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Set up Nodemailer transporter using provided credentials
const transporter = nodemailer.createTransport({
    host: 'www74.cpt1.host-h.net',
    port: 465, // Using port 465 for true SSL (SMTPS)
    secure: true,
    auth: {
        user: 'jaylene@happyevents.co.za', // Authentication email
        pass: '1m5p07N34W3j30'
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error("Transporter verify error: ", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, phone, eventType, date, message } = req.body;

    // Validate email
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        // --- 1. Notification to Admin ---
        const mailOptionsAdmin = {
            from: 'jaylene@happyevents.co.za', // Must be sent FROM the authenticated email
            to: 'jaylene@happyevents.co.za',   // Recipient email
            replyTo: email, // Allow reply directly to client
            subject: `New Enquiry from ${name} - ${eventType}`,
            text: `
        New Booking Enquiry!
        
        Name: ${name}
        Email: ${email}
        Phone: ${phone}
        Event Type: ${eventType}
        Date: ${date || 'Not specified'}
        
        Message:
        ${message || 'No additional message.'}
      `,
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
      `
        };

        // --- 2. Auto-responder to Client ---
        const templatePath = path.join(__dirname, 'email-templates', 'autoResponder.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');
        htmlTemplate = htmlTemplate.replace(/{{name}}/g, name);
        htmlTemplate = htmlTemplate.replace(/{{eventType}}/g, eventType);

        const mailOptionsUser = {
            from: '"Happy Shisha" <jaylene@happyevents.co.za>',
            to: email,
            subject: `We've received your ${eventType} enquiry! - Happy Shisha`,
            html: htmlTemplate,
            attachments: [{
                filename: 'logo.png',
                path: path.join(__dirname, 'public', 'logo.png'),
                cid: 'happyshishalogo'
            }]
        };

        // Send both emails simultaneously
        const [adminInfo, userInfo] = await Promise.all([
            transporter.sendMail(mailOptionsAdmin),
            transporter.sendMail(mailOptionsUser)
        ]);

        console.log('Admin notified: %s', adminInfo.messageId);
        console.log('Auto-responder sent: %s', userInfo.messageId);

        res.status(200).json({ success: true, message: 'Email sent successfully' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
});
