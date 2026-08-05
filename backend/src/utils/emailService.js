import nodemailer from 'nodemailer';

// Helper to create a nodemailer transporter
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to JSON/Console log transport in development or missing SMTP
  return nodemailer.createTransport({
    jsonTransport: true
  });
};

export const formatPlanName = (plan) => {
  if (!plan) return 'Premium Scholar Subscription';
  const lower = plan.toLowerCase();
  if (lower === 'inst_20') return '20-User Institute Batch Access';
  if (lower === 'inst_50') return '50-User Institute Batch Access';
  if (lower === 'book_order') return 'NeetBand Physical Book Order';
  if (lower === 'premium' || lower === 'premium_scholar') return 'Premium Scholar Plan';
  return plan.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const isInstitutePlan = (plan) => {
  if (!plan) return false;
  const lower = plan.toLowerCase();
  return lower.startsWith('inst_') || lower.includes('institute') || lower.includes('batch');
};

export const sendOrderReceiptEmail = async ({ user, order, claim }) => {
  try {
    const transporter = await createTransporter();

    const planTitle = formatPlanName(order.plan);
    const amountFormatted = `₹${(order.amount / 100).toLocaleString('en-IN')}`;
    const paidDateStr = order.paidAt ? new Date(order.paidAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' });
    const expiryDateStr = user.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A';
    const isInst = isInstitutePlan(order.plan);

    const instituteHtmlSection = isInst ? `
      <div style="background-color: #fff8e1; border-left: 4px solid #ffa000; padding: 18px; margin: 25px 0; border-radius: 8px; font-family: Arial, sans-serif;">
        <h3 style="margin-top: 0; color: #b78103; font-size: 18px; display: flex; align-items: center; gap: 8px;">
          🏫 Institute Onboarding Notice
        </h3>
        <p style="color: #333; line-height: 1.6; margin: 8px 0 12px 0;">
          Thank you for choosing NeetBand for your institution! <strong>Our dedicated institute team will contact you shortly</strong> to configure your batch portal, set up student access accounts, and assist with batch onboarding.
        </p>
        <div style="border-top: 1px solid #ffe082; pt-12px; margin-top: 12px; font-size: 14px; color: #555;">
          <strong>Contact Us Details:</strong><br/>
          📧 Email: <a href="mailto:support@neetband.com" style="color: #d97706;">support@neetband.com</a><br/>
          📞 Phone: <strong>+91 98765 43210</strong><br/>
          🌐 Help & Support: <a href="https://neetband.com/contact" style="color: #d97706;">neetband.com/contact</a>
        </div>
      </div>
    ` : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { background: #0f172a; color: #ffffff; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; color: #ecc246; font-weight: 800; }
          .header p { margin: 5px 0 0 0; color: #94a3b8; font-size: 14px; }
          .body { padding: 30px; }
          .receipt-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background-color: #f8fafc; margin-bottom: 25px; }
          .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; }
          .receipt-row:last-child { border-bottom: none; }
          .label { color: #64748b; font-weight: 600; font-size: 14px; }
          .value { color: #0f172a; font-weight: 700; font-size: 14px; text-align: right; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NEETBAND</h1>
            <p>Payment Receipt & Order Confirmation</p>
          </div>
          <div class="body">
            <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Thank you for your order, ${user.name || 'Student'}!</h2>
            <p style="color: #475569; line-height: 1.5;">Your payment has been successfully processed. Below are your official transaction and subscription details:</p>
            
            <div class="receipt-box">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Order ID</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 14px; text-align: right;">${order.razorpayOrderId || order._id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Payment ID</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 14px; text-align: right;">${order.razorpayPaymentId || 'Completed'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Purchased Plan</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 14px; text-align: right;">${planTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Billing Cycle</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 14px; text-align: right;">${(order.billingCycle || 'yearly').toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Payment Date</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 14px; text-align: right;">${paidDateStr}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px;">Plan Expiry Date</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 14px; text-align: right;">${expiryDateStr}</td>
                </tr>
                <tr style="border-top: 2px solid #cbd5e1;">
                  <td style="padding: 12px 0 0 0; color: #0f172a; font-weight: 800; font-size: 16px;">Total Amount Paid</td>
                  <td style="padding: 12px 0 0 0; color: #16a34a; font-weight: 800; font-size: 18px; text-align: right;">${amountFormatted}</td>
                </tr>
              </table>
            </div>

            ${instituteHtmlSection}

            <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
              You can log in to your NeetBand account anytime to download your receipt, manage your subscription, and access all study tracks.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 5px 0;">NeetBand EdTech Pvt Ltd • Auditory Learning for Medical Aspirants</p>
            <p style="margin: 0;">Support: support@neetband.com | Phone: +91 98765 43210</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || '"NeetBand Support" <support@neetband.com>',
      to: user.email,
      subject: isInst 
        ? `[Institute Order Confirmation] Payment Receipt for ${planTitle} - NeetBand`
        : `Payment Receipt & Order Confirmation - ${planTitle} (NeetBand)`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Receipt email dispatched for order ${order.razorpayOrderId} to ${user.email}`);
    return info;
  } catch (error) {
    console.error('[EmailService] Failed to send receipt email:', error);
    // Non-blocking catch to ensure payment completion is never interrupted
    return null;
  }
};
