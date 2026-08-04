export const formatPlanTitle = (plan) => {
  if (!plan) return 'Premium Scholar Subscription';
  const lower = plan.toLowerCase();
  if (lower === 'inst_20') return '20-User Institute Batch Access';
  if (lower === 'inst_50') return '50-User Institute Batch Access';
  if (lower === 'scale_plan') return 'Scale Plan (Institute Batch)';
  if (lower === 'book_order') return 'NeetBand Physical Book Order';
  if (lower === 'premium' || lower === 'premium_scholar') return 'Premium Scholar Plan';
  return plan.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const isInstitutePlan = (plan) => {
  if (!plan) return false;
  const lower = plan.toLowerCase();
  return lower.startsWith('inst_') || lower === 'scale_plan' || lower.includes('institute') || lower.includes('batch');
};

export const generateReceiptHTML = (order, user) => {
  const planTitle = formatPlanTitle(order?.plan);
  const orderId = order?.razorpayOrderId || order?._id || `ORD-${Date.now()}`;
  const paymentId = order?.razorpayPaymentId || 'Completed (Online)';
  const amountPaid = order?.amount ? (order.amount / 100).toLocaleString('en-IN') : '0';
  const billingCycle = (order?.billingCycle || 'yearly').toUpperCase();
  const dateStr = order?.paidAt ? new Date(order.paidAt).toLocaleDateString('en-IN', { dateStyle: 'full' }) : new Date().toLocaleDateString('en-IN', { dateStyle: 'full' });
  const expiryStr = user?.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A';
  const isInst = isInstitutePlan(order?.plan);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>NeetBand Receipt - ${orderId}</title>
      <style>
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .receipt-container { box-shadow: none !important; border: 1px solid #ddd !important; }
        }
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; margin: 0; padding: 40px 20px; }
        .receipt-container { max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .receipt-header { display: flex; justify-content: space-between; align-items: flex-start; border-b: 2px solid #f1f5f9; pb: 25px; margin-bottom: 25px; }
        .brand-logo { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
        .brand-logo span { color: #d97706; }
        .receipt-title { font-size: 14px; text-transform: uppercase; tracking: 1.5px; font-weight: 800; color: #64748b; margin-top: 4px; }
        .receipt-badge { background: #dcfce7; color: #15803d; px: 14px; py: 6px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase; display: inline-block; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .info-group label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 4px; }
        .info-group p { margin: 0; font-size: 14px; font-weight: 700; color: #1e293b; }
        .item-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .item-table th { background: #f8fafc; text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .item-table td { padding: 16px; font-size: 14px; font-weight: 600; border-bottom: 1px solid #f1f5f9; }
        .total-box { background: #f8fafc; border-radius: 14px; padding: 20px; text-align: right; margin-bottom: 30px; }
        .total-label { font-size: 14px; color: #64748b; font-weight: 700; }
        .total-amount { font-size: 28px; font-weight: 900; color: #16a34a; margin-top: 4px; }
        
        .inst-box { background: #fffbe6; border: 1px solid #ffe58f; border-left: 5px solid #faad14; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
        .inst-box h3 { margin: 0 0 8px 0; font-size: 16px; color: #d48806; font-weight: 800; display: flex; align-items: center; gap: 8px; }
        .inst-box p { margin: 0 0 12px 0; font-size: 13px; color: #595959; line-height: 1.6; }
        .inst-contacts { font-size: 13px; font-weight: 700; color: #262626; border-top: 1px dashed #ffe58f; pt: 10px; margin-top: 10px; }
        
        .footer-note { text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #f1f5f9; pt: 20px; }
        .btn-print { background: #0f172a; color: #ffffff; border: none; padding: 12px 24px; font-size: 14px; font-weight: 700; border-radius: 10px; cursor: pointer; margin-bottom: 20px; display: inline-flex; align-items: center; gap: 8px; transition: opacity 0.2s; }
        .btn-print:hover { opacity: 0.9; }
        .actions-bar { text-align: center; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="actions-bar no-print">
        <button class="btn-print" onclick="window.print()">
          🖨️ Print / Download PDF Receipt
        </button>
      </div>

      <div class="receipt-container">
        <div class="receipt-header">
          <div>
            <div class="brand-logo">NEET<span>BAND</span></div>
            <div class="receipt-title">Payment Receipt</div>
          </div>
          <div style="text-align: right;">
            <span class="receipt-badge">✓ Paid & Fulfilled</span>
            <div style="font-size: 12px; color: #64748b; font-weight: 700; margin-top: 6px;">Date: ${dateStr}</div>
          </div>
        </div>

        <div class="grid-2">
          <div class="info-group">
            <label>Billed To</label>
            <p>${user?.name || 'Valued Student'}</p>
            <p style="font-weight: 500; color: #64748b; font-size: 13px;">${user?.email || ''}</p>
          </div>
          <div class="info-group">
            <label>Order Details</label>
            <p>Order ID: ${orderId}</p>
            <p style="font-weight: 500; color: #64748b; font-size: 12px;">Payment ID: ${paymentId}</p>
          </div>
        </div>

        <table class="item-table">
          <thead>
            <tr>
              <th>Description / Item</th>
              <th>Billing Cycle</th>
              <th>Status</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong style="color: #0f172a;">${planTitle}</strong>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Expires on: ${expiryStr}</div>
              </td>
              <td>${billingCycle}</td>
              <td><span style="color: #16a34a; font-weight: 700;">Active</span></td>
              <td style="text-align: right;">₹${amountPaid}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-label">Total Amount Paid</div>
          <div class="total-amount">₹${amountPaid} INR</div>
        </div>

        ${isInst ? `
          <div class="inst-box">
            <h3>🏫 Institute Batch Onboarding Notice</h3>
            <p>Thank you for enrolling your institute batch with NeetBand! <strong>Our team will contact you shortly</strong> to configure your institute portal credentials and help onboard your students.</p>
            <div class="inst-contacts">
              <strong>Need Immediate Assistance? Contact Us:</strong><br/>
              📧 Email: support@neetband.com &nbsp;|&nbsp; 📞 Phone: +91 98765 43210 &nbsp;|&nbsp; 🌐 Web: neetband.com/contact
            </div>
          </div>
        ` : ''}

        <div class="footer-note">
          <p style="margin: 0 0 4px 0; font-weight: 700;">NeetBand EdTech Private Limited</p>
          <p style="margin: 0;">This is a computer-generated official receipt. Support: support@neetband.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const printReceipt = (order, user) => {
  const html = generateReceiptHTML(order, user);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
  }
};
