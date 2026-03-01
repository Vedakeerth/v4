/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Configure file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const jobId = Date.now();
        const dir = path.join(__dirname, '../print-queue', jobId.toString());
        fs.mkdirSync(dir, { recursive: true });
        req.jobDir = dir;
        req.jobId = jobId;
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// Email configuration
// IMPORTANT: Update these with your actual email credentials
// For Gmail, use an App Password (not your regular password)
// Generate at: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'projects@vaelinsa.com',
        pass: process.env.EMAIL_PASS || 'your-app-password-here'
    }
});

// Receive print jobs
app.post('/api/receive-print-job', upload.single('stl'), async (req, res) => {
    try {
        const { email, quote } = req.body;
        const quoteData = JSON.parse(quote);
        const jobId = req.jobId;

        console.log(`📥 New print job received: #${jobId}`);
        console.log(`   Customer: ${email}`);
        console.log(`   Material: ${quoteData.material}`);
        console.log(`   Cost: ₹${quoteData.cost}`);

        // Save quote data
        fs.writeFileSync(
            path.join(req.jobDir, 'quote.json'),
            JSON.stringify(quoteData, null, 2)
        );

        // Email to customer
        try {
            await transporter.sendMail({
                from: 'VAELINSA 3D Printing <projects@vaelinsa.com>',
                to: email,
                subject: `✅ Print Job #${jobId} Received - VAELINSA`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #06b6d4;">Your 3D Print Job Has Been Received!</h2>
                        <p>Job ID: <strong>#${jobId}</strong></p>
                        
                        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Print Details:</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0;"><strong>Material:</strong></td><td>${quoteData.material}</td></tr>
                                <tr><td style="padding: 8px 0;"><strong>Weight:</strong></td><td>${quoteData.weight}g</td></tr>
                                <tr><td style="padding: 8px 0;"><strong>Infill:</strong></td><td>${quoteData.infill}%</td></tr>
                                <tr><td style="padding: 8px 0;"><strong>Scale:</strong></td><td>${quoteData.scale}%</td></tr>
                                <tr><td style="padding: 8px 0;"><strong>Estimated Time:</strong></td><td>${quoteData.printTime} hours</td></tr>
                                ${quoteData.promo && quoteData.promo !== 'None' ? `<tr><td style="padding: 8px 0;"><strong>Promo Code:</strong></td><td>${quoteData.promo}</td></tr>` : ''}
                                <tr style="border-top: 2px solid #ccc;"><td style="padding: 8px 0;"><strong>Total Cost:</strong></td><td><strong style="font-size: 1.2em; color: #06b6d4;">₹${quoteData.cost}</strong></td></tr>
                            </table>
                        </div>
                        
                        <p>We'll start processing your order soon and notify you when it's ready for pickup/delivery!</p>
                        
                        <p style="color: #666; font-size: 0.9em;">Questions? Reply to this email or contact us at projects@vaelinsa.com</p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 0.8em; text-align: center;">VAELINSA - Premium 3D Printing Services</p>
                    </div>
                `
            });
            console.log(`   ✉️ Confirmation email sent to ${email}`);
        } catch (emailError) {
            console.error('   ⚠️ Failed to send customer email:', emailError.message);
        }

        // Email to yourself (order notification)
        try {
            await transporter.sendMail({
                from: 'VAELINSA Queue <projects@vaelinsa.com>',
                to: process.env.ORDER_EMAIL || 'orders@vaelinsa.com',
                subject: `🆕 New Print Job #${jobId}`,
                html: `
                    <h2>New Print Job Received</h2>
                    <p><strong>Job ID:</strong> #${jobId}</p>
                    <p><strong>Customer:</strong> ${email}</p>
                    <p><strong>Material:</strong> ${quoteData.material}</p>
                    <p><strong>Weight:</strong> ${quoteData.weight}g</p>
                    <p><strong>Infill:</strong> ${quoteData.infill}%</p>
                    <p><strong>Cost:</strong> ₹${quoteData.cost}</p>
                    <p><strong>File:</strong> ${req.file.originalname}</p>
                    <p><strong>File Location:</strong> print-queue/${jobId}/</p>
                    
                    <p>Access files at: <code>${req.jobDir}</code></p>
                `
            });
            console.log('   ✉️ Notification email sent to admin');
        } catch (emailError) {
            console.error('   ⚠️ Failed to send admin email:', emailError.message);
        }

        res.json({ success: true, jobId });
        console.log(`   ✅ Job #${jobId} processed successfully\n`);

    } catch (error) {
        console.error('❌ Error processing job:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get job status
app.get('/api/job/:id', (req, res) => {
    const jobDir = path.join(__dirname, '../print-queue', req.params.id);

    if (!fs.existsSync(jobDir)) {
        return res.status(404).json({ error: 'Job not found' });
    }

    try {
        const quote = JSON.parse(fs.readFileSync(path.join(jobDir, 'quote.json'), 'utf8'));
        res.json({
            jobId: req.params.id,
            quote,
            status: 'queued',
            created: fs.statSync(jobDir).birthtime
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List all jobs
app.get('/api/jobs', (req, res) => {
    const queueDir = path.join(__dirname, '../print-queue');

    if (!fs.existsSync(queueDir)) {
        return res.json({ jobs: [] });
    }

    try {
        const jobs = fs.readdirSync(queueDir)
            .filter(file => fs.statSync(path.join(queueDir, file)).isDirectory())
            .map(jobId => {
                const jobDir = path.join(queueDir, jobId);
                const quote = JSON.parse(fs.readFileSync(path.join(jobDir, 'quote.json'), 'utf8'));
                return {
                    jobId,
                    quote,
                    created: fs.statSync(jobDir).birthtime
                };
            })
            .sort((a, b) => b.created - a.created);

        res.json({ jobs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'VAELINSA Print Queue',
        version: '1.0.0'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   VAELINSA Print Queue Server Started     ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`📁 Print queue directory: ${path.join(__dirname, '../print-queue')}`);
    console.log(`\n📧 Email notifications: ${process.env.EMAIL_USER || 'NOT CONFIGURED'}`);
    console.log('\n💡 Endpoints:');
    console.log('   POST /api/receive-print-job - Receive new jobs');
    console.log('   GET  /api/job/:id - Get job details');
    console.log('   GET  /api/jobs - List all jobs');
    console.log('   GET  /api/health - Health check');
    console.log('\n⏳ Waiting for print jobs...\n');
});
