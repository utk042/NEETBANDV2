import logoUrl from '../assets/logo.png';

export const formatPlanTitle = (plan) => {
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

export const generateReceiptHTML = (order, user) => {
  const planTitle = formatPlanTitle(order?.plan);
  const orderId = order?.razorpayOrderId || order?._id || `ORD-${Date.now()}`;
  const paymentId = order?.razorpayPaymentId || 'N/A';
  const amountPaid = order?.amount ? (order.amount / 100).toLocaleString('en-IN') : '0';
  const billingCycle = (order?.billingCycle || 'yearly').toUpperCase();
  const dateStr = order?.paidAt ? new Date(order.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const expiryStr = user?.membershipExpiry ? new Date(user.membershipExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  const isInst = isInstitutePlan(order?.plan);
  
  // Ensure the logo path is absolute so it works in iframes and print windows
  const absoluteLogoUrl = typeof window !== 'undefined' ? new URL(logoUrl, window.location.origin).href : logoUrl;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${orderId}</title>
      <style>
        /* Modern Premium SaaS Typography & Reset */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @media print {
          @page { margin: 0; }
          body { background: #fff !important; padding: 40px !important; }
          .receipt-container { box-shadow: none !important; border: none !important; padding: 0 !important; max-width: 100% !important; }
          .no-print { display: none !important; }
        }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          background-color: #f9fafb; 
          color: #111827; 
          margin: 0; 
          padding: 40px 20px; 
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
        }
        
        .receipt-container { 
          max-width: 720px; 
          margin: 0 auto; 
          background: #ffffff; 
          padding: 50px 60px; 
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
          border-radius: 16px;
          border: 1px solid #f3f4f6;
          position: relative;
        }
        
        .print-icon-btn {
          position: absolute;
          top: 30px;
          right: 30px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .print-icon-btn:hover {
          background: #f3f4f6;
          color: #111827;
          border-color: #d1d5db;
        }
        
        /* Header */
        .receipt-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 40px; 
        }
        
        .brand-logo img { 
          max-height: 48px; 
          display: block; 
        }
        
        .header-right {
          text-align: right;
          padding-right: 20px; /* Make room for absolute print btn if needed */
        }
        
        .doc-title { 
          font-size: 28px; 
          font-weight: 700; 
          color: #111827;
          letter-spacing: -0.02em;
        }
        
        .doc-date {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
          font-weight: 500;
        }
        
        /* Meta Info Grid */
        .meta-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 48px;
          border-top: 1px solid #f3f4f6;
          border-bottom: 1px solid #f3f4f6;
          padding: 24px 0;
        }
        
        .info-group h4 {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9ca3af;
          margin: 0 0 8px 0;
        }
        
        .info-group p { 
          margin: 0 0 4px 0; 
          font-size: 14px; 
          color: #374151;
        }
        
        .info-group p strong {
          color: #111827;
          font-weight: 600;
        }

        .payment-status {
          display: inline-flex;
          align-items: center;
          background-color: #ecfdf5;
          color: #059669;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          margin-top: 6px;
        }
        
        /* Table */
        .item-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 24px; 
        }
        
        .item-table th { 
          text-align: left; 
          padding: 12px 16px; 
          font-size: 12px; 
          font-weight: 600; 
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          border-bottom: 1px solid #e5e7eb; 
        }
        
        .item-table td { 
          padding: 20px 16px; 
          font-size: 14px; 
          color: #374151;
          vertical-align: top;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .item-table td strong {
          color: #111827;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .item-desc-sub {
          font-size: 13px;
          color: #6b7280;
        }
        
        .text-right { text-align: right !important; }
        
        /* Totals */
        .totals-container {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 48px;
        }
        
        .totals-table {
          width: 320px;
          border-collapse: collapse;
        }
        
        .totals-table td {
          padding: 12px 16px;
          font-size: 14px;
          color: #4b5563;
        }
        
        .total-row td {
          font-weight: 700;
          font-size: 18px;
          color: #111827;
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
        }
        
        /* Institute Note */
        .inst-box { 
          background-color: #f8fafc;
          border-radius: 12px;
          padding: 24px; 
          margin-bottom: 40px;
        }
        
        .inst-box h3 { 
          margin: 0 0 8px 0; 
          font-size: 14px; 
          font-weight: 600; 
          color: #0f172a;
        }
        
        .inst-box p { 
          margin: 0 0 12px 0; 
          font-size: 13px;
          color: #475569;
          line-height: 1.6;
        }
        
        .inst-contact {
          font-size: 13px;
          color: #334155;
          font-weight: 500;
        }
        
        /* Footer */
        .footer-note { 
          text-align: center; 
          font-size: 12px; 
          color: #9ca3af;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <button class="print-icon-btn no-print" onclick="window.print()" title="Print Invoice">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
        </button>

        <div class="receipt-header">
          <div class="brand-logo">
            <img src="${absoluteLogoUrl}" alt="NeetBand Logo" />
          </div>
          <div class="header-right">
            <div class="doc-title">Invoice</div>
            <div class="doc-date">${dateStr}</div>
          </div>
        </div>

        <div class="meta-section">
          <div class="info-group">
            <h4>Billed To</h4>
            <p><strong>${user?.name || 'Student'}</strong></p>
            <p>${user?.email || 'N/A'}</p>
          </div>
          <div class="info-group text-right">
            <h4>Invoice Details</h4>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Payment Ref:</strong> ${paymentId}</p>
            <div class="payment-status">Paid</div>
          </div>
        </div>

        <table class="item-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Cycle</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${planTitle}</strong>
                <div class="item-desc-sub">Next renewal / expiry: ${expiryStr}</div>
              </td>
              <td>${billingCycle}</td>
              <td class="text-right">₹${amountPaid}</td>
            </tr>
          </tbody>
        </table>

        <div class="totals-container">
          <table class="totals-table">
            <tr>
              <td>Subtotal</td>
              <td class="text-right">₹${amountPaid}</td>
            </tr>
            <tr class="total-row">
              <td>Total Paid</td>
              <td class="text-right">₹${amountPaid}</td>
            </tr>
          </table>
        </div>

        ${isInst ? `
          <div class="inst-box">
            <h3>Institute Batch Onboarding</h3>
            <p>Thank you for enrolling your institute batch with NeetBand. Our technical team will contact you shortly to configure your portal credentials and finalize student onboarding.</p>
            <div class="inst-contact">Support: support@neetband.com</div>
          </div>
        ` : ''}

        <div class="footer-note">
          <p style="margin: 0 0 4px 0; color: #6b7280;"><strong>NeetBand EdTech Private Limited</strong></p>
          <p style="margin: 0;">This is a computer-generated invoice and does not require a signature.</p>
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
    setTimeout(() => {
      win.print();
    }, 250);
  }
};
