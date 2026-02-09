require('dotenv').config();
const sendBookingEmail = require('./utils/sendEmail');

async function runTest() {
    console.log('🔍 Testing Email Configuration...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ EMAIL_USER or EMAIL_PASS not found in .env file');
        console.log('Current ENV:', { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS ? '******' : 'MISSING' });
        return;
    }

    console.log(`📧 User: ${process.env.EMAIL_USER}`);

    const mockBooking = {
        name: 'Test Administrator',
        serviceType: 'Test Service',
        serviceName: 'Email Configuration Check',
        date: new Date().toLocaleDateString(),
        phone: '9042195722'
    };

    try {
        console.log('📨 Sending test email...');
        const result = await sendBookingEmail(process.env.EMAIL_USER, mockBooking);
        
        if (result && result.messageId) {
            console.log('✅ Email sent successfully!');
            console.log('🆔 Message ID:', result.messageId);
            console.log('👉 Check your inbox (' + process.env.EMAIL_USER + ')');
        } else {
            console.log('❌ Email sending failed. Check your console for details.');
        }
    } catch (error) {
        console.error('❌ Unexpected error during test:', error);
    }
}

runTest();
