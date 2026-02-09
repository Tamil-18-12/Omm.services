const nodemailer = require("nodemailer");

const sendBookingEmail = async (toEmail, bookingDetails) => {
  try {
    console.log("Initializing Nodemailer with IPv4 and explicit SMTP settings...");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      family: 4, // Force IPv4 to fix DNS timeouts
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Om Services" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Booking Confirmation - ${bookingDetails.serviceName || bookingDetails.serviceType}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .header { background: #1a1a1a; padding: 30px 20px; text-align: center; }
                .logo-text { color: #FFD700; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
                .subtitle { color: #cccccc; margin: 5px 0 0; font-size: 14px; letter-spacing: 1px; }
                .content { padding: 40px 30px; }
                .details-card { background: #f9f9f9; border-left: 4px solid #FFD700; padding: 25px; border-radius: 4px; margin-bottom: 30px; }
                .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                .detail-label { color: #777; font-weight: 500; }
                .detail-value { color: #333; font-weight: bold; }
                .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; }
                .contact-box { background: #fff8e1; border: 1px dashed #FFD700; padding: 20px; text-align: center; border-radius: 8px; margin-top: 30px; }
                .contact-number { font-size: 24px; color: #1a1a1a; font-weight: bold; text-decoration: none; display: block; margin-top: 5px;}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="logo-text">OM SERVICE</h1>
                    <p class="subtitle">Premium Quality Service</p>
                </div>
                <div class="content">
                    <h2>Booking Confirmed ✅</h2>
                    <p>Thank you for choosing <strong>Om Services</strong>, <strong>${bookingDetails.name}</strong>.</p>
                    <p>You have booked our <strong>Premium Quality</strong> service. Our team will ensure everything is perfect for your special day.</p>
                    
                    <div class="details-card">
                        <h3>Booking Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Service Type:</span>
                            <span class="detail-value">${bookingDetails.serviceType}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Package:</span>
                            <span class="detail-value">${bookingDetails.serviceName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${bookingDetails.date}</span>
                        </div>
                        ${bookingDetails.guests ? `
                        <div class="detail-row">
                            <span class="detail-label">Guests:</span>
                            <span class="detail-value">${bookingDetails.guests}</span>
                        </div>` : ''}
                        ${bookingDetails.pickupLocation ? `
                        <div class="detail-row">
                            <span class="detail-label">Pickup:</span>
                            <span class="detail-value">${bookingDetails.pickupLocation}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Drop:</span>
                            <span class="detail-value">${bookingDetails.dropDestination}</span>
                        </div>` : ''}

                        ${bookingDetails.eventType ? `
                        <div class="detail-row">
                            <span class="detail-label">Event Type:</span>
                            <span class="detail-value">${bookingDetails.eventType}</span>
                        </div>` : ''}

                        ${bookingDetails.mealType ? `
                        <div class="detail-row">
                            <span class="detail-label">Meal Type:</span>
                            <span class="detail-value">${bookingDetails.mealType}</span>
                        </div>` : ''}

                        ${bookingDetails.functionTime ? `
                        <div class="detail-row">
                            <span class="detail-label">Time:</span>
                            <span class="detail-value">${bookingDetails.functionTime}</span>
                        </div>` : ''}

                        ${bookingDetails.notes ? `
                        <div class="detail-row">
                            <span class="detail-label">Notes:</span>
                            <span class="detail-value">${bookingDetails.notes}</span>
                        </div>` : ''}
                        
                        ${bookingDetails.phone ? `
                        <div class="detail-row">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value">${bookingDetails.phone}</span>
                        </div>` : ''}
                    </div>

                    <div class="contact-box">
                        <p style="margin: 0; color: #555;">Any doubts? Call us directly at:</p>
                        <a href="tel:9042195722" class="contact-number">9042195722</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Om Services Team</p>
                </div>
            </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Booking email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error);
    // Don't throw error to avoid crashing the booking process
    return null;
  }
};

module.exports = sendBookingEmail;
