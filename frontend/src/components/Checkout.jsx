import React, { useState, useEffect } from 'react';
import { IconChevronLeft, IconTag, IconCreditCard } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { createPaymentOrder, verifyPayment, verifyPromo, redeemFreeCoupon } from '../services/api';
import { loadRazorpayScript } from '../utils/razorpayUtils';
import { getRazorpayLogo } from '../utils/logoBase64';
import { printReceipt, formatPlanTitle, isInstitutePlan } from '../utils/receiptGenerator';
import { IconCheck, IconDownload, IconMail, IconPhone, IconBuilding, IconArrowRight } from '@tabler/icons-react';

export default function Checkout({ user, navigate, onCheckoutSuccess, planProp }) {
  const [searchParams] = useSearchParams();
  const selectedPlan = planProp || searchParams.get('plan') || 'premium_scholar';
  const billingCycle = searchParams.get('billing') || 'yearly';
  
  const [promoCode, setPromoCode] = useState(() => {
    try {
      return localStorage.getItem(`neetband_promo_${selectedPlan}`) || '';
    } catch {
      return '';
    }
  });

  const [appliedPromo, setAppliedPromo] = useState(() => {
    try {
      const saved = localStorage.getItem(`neetband_applied_promo_${selectedPlan}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [promoMessage, setPromoMessage] = useState(() => {
    try {
      const saved = localStorage.getItem(`neetband_applied_promo_${selectedPlan}`);
      return saved ? { text: 'Discount code applied successfully!', type: 'success' } : { text: '', type: '' };
    } catch {
      return { text: '', type: '' };
    }
  });
  const [phone, setPhone] = useState(user?.phone || '');
  const [gstin, setGstin] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  const planMonthlyPrices = {
    premium: 299,
    inst_20: 5681,
    inst_50: 13455,
  };

  const planYearlyPrices = {
    premium: 2508,
    inst_20: 47652,
    inst_50: 112860,
  };

  const planNames = {
    premium: 'Premium Scholar Subscription',
    inst_20: '20-User Institute Batch Access',
    inst_50: '50-User Institute Batch Access',
  };

  const basePrice = billingCycle === 'yearly'
    ? (planYearlyPrices[selectedPlan] || 2508)
    : (planMonthlyPrices[selectedPlan] || 299);
  const planDisplayName = planNames[selectedPlan] || 'Premium Scholar Subscription';

  // Require login
  useEffect(() => {
    if (!user || !user.isLoggedIn) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const saveAppliedPromo = (promoObj, codeStr = '') => {
    setAppliedPromo(promoObj);
    try {
      if (promoObj) {
        localStorage.setItem(`neetband_applied_promo_${selectedPlan}`, JSON.stringify(promoObj));
        localStorage.setItem(`neetband_promo_${selectedPlan}`, codeStr || promoObj.code || '');
      } else {
        localStorage.removeItem(`neetband_applied_promo_${selectedPlan}`);
        localStorage.removeItem(`neetband_promo_${selectedPlan}`);
      }
    } catch (e) {
      // Ignore localStorage restrictions
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || isApplyingPromo) return;
    try {
      setIsApplyingPromo(true);
      setPromoMessage({ text: 'Verifying...', type: 'info' });
      const res = await verifyPromo(promoCode.trim(), selectedPlan);
      if (res.valid) {
        const promoObj = {
          code: res.code || promoCode.trim(),
          type: res.discountType,
          value: res.discountValue
        };
        saveAppliedPromo(promoObj, promoCode.trim());
        setPromoMessage({ text: 'Discount code applied successfully!', type: 'success' });
      } else {
        saveAppliedPromo(null);
        setPromoMessage({ text: res.message || 'Invalid or inactive promo code', type: 'error' });
      }
    } catch (err) {
      saveAppliedPromo(null);
      setPromoMessage({ text: 'Error verifying promo code', type: 'error' });
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const calculateTotal = () => {
    let total = basePrice;
    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        const totalPaise = Math.round((basePrice * 100) * (1 - appliedPromo.value / 100));
        total = totalPaise / 100;
      } else {
        total = Math.max(0, total - appliedPromo.value);
      }
    }
    return Number(total.toFixed(2));
  };

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      setError('');

      const finalDiscountCode = appliedPromo?.code || null;
      const shippingDetails = (phone.trim() || businessName.trim() || gstin.trim()) ? {
        ...(phone.trim() && { phone: phone.trim() }),
        ...(businessName.trim() && { businessName: businessName.trim() }),
        ...(gstin.trim() && { gstin: gstin.trim() })
      } : null;
      
      // Helper for completion
      const handleSuccessResult = (res) => {
        const orderData = res.order || {
          razorpayOrderId: res.orderId || `ORD-${Date.now()}`,
          razorpayPaymentId: res.paymentId || 'pay_completed',
          plan: selectedPlan,
          amount: calculateTotal() * 100,
          billingCycle,
          paidAt: new Date()
        };
        setCompletedOrder(orderData);
        if (onCheckoutSuccess) {
          onCheckoutSuccess({ ...user, ...res.user, isLoggedIn: true });
        }
      };

      // Free coupon redemption: skip Razorpay entirely
      if (calculateTotal() === 0 && finalDiscountCode) {
        const result = await redeemFreeCoupon(selectedPlan, finalDiscountCode, billingCycle, shippingDetails);
        handleSuccessResult(result);
        setIsLoading(false);
        return;
      }

      const order = await createPaymentOrder(selectedPlan, finalDiscountCode, shippingDetails, billingCycle);

      // Free redemption response from backend (fallback)
      if (order.freeRedemption) {
        const result = await redeemFreeCoupon(selectedPlan, finalDiscountCode, billingCycle, shippingDetails);
        handleSuccessResult(result);
        setIsLoading(false);
        return;
      }

      // Dev/staging mode: mock payment flow when using test Razorpay keys
      if (order.id && order.id.startsWith('order_mock_')) {
        const verificationData = {
          razorpay_order_id: order.id,
          razorpay_payment_id: 'pay_mock_' + Date.now(),
          razorpay_signature: 'mock_signature',
          plan: selectedPlan,
          discountCode: finalDiscountCode,
          billingCycle
        };
        const verifyRes = await verifyPayment(verificationData);
        handleSuccessResult(verifyRes);
        setIsLoading(false);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load');

      const options = {
        key: order.key_id, 
        amount: order.amount,
        currency: order.currency,
        name: 'NEET Band',
        description: `${planDisplayName} Purchase`,
        image: getRazorpayLogo(),
        order_id: order.id,
        handler: async function (response) {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan,
              discountCode: finalDiscountCode,
              billingCycle
            };
            const verifyRes = await verifyPayment(verificationData);
            handleSuccessResult(verifyRes);
          } catch (err) {
            const apiMessage = err.response?.data?.message || err.message;
            setError(apiMessage ? `Verification error: ${apiMessage}` : 'Payment verification failed. Please contact support.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          }
        },
        theme: { color: '#ecc246' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error?.description || 'Transaction declined'}`);
        setIsLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Could not initialize checkout. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/pricing');
    }
  };

  if (completedOrder) {
    const isInst = isInstitutePlan(completedOrder?.plan || selectedPlan);
    const planTitle = formatPlanTitle(completedOrder?.plan || selectedPlan);

    return (
      <div className="min-h-screen bg-surface py-10 px-4">
        <div className="max-w-3xl mx-auto bg-surface-container rounded-3xl p-6 md:p-10 shadow-lg border border-outline-variant/30 text-on-surface">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <IconCheck size={36} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-2">Payment Successful!</h1>
            <p className="text-on-surface-variant text-sm md:text-base max-w-md mx-auto">
              Your subscription is now active. A copy of your payment receipt has been emailed to <strong className="text-on-surface">{user?.email}</strong>.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="bg-surface-container-high/60 rounded-2xl p-6 border border-outline-variant/30 mb-8 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">Plan Name</span>
              <span className="font-bold text-primary">{planTitle}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">Order ID</span>
              <span className="font-semibold text-xs md:text-sm text-on-surface font-mono">{completedOrder.razorpayOrderId || completedOrder._id}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">Billing Cycle</span>
              <span className="font-semibold text-on-surface uppercase text-xs px-2.5 py-1 rounded-md bg-surface border border-outline-variant/30">{completedOrder.billingCycle || billingCycle}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-bold text-on-surface">Amount Paid</span>
              <span className="text-2xl font-extrabold text-emerald-500">₹{(completedOrder.amount ? completedOrder.amount / 100 : calculateTotal()).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Institute Onboarding Notice Box */}
          {isInst && (
            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-5 rounded-xl mb-8">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-base mb-2">
                <IconBuilding size={22} /> Institute Batch Onboarding Notice
              </div>
              <p className="text-on-surface text-sm leading-relaxed mb-4">
                Thank you for enrolling your institute batch with NeetBand! <strong>Our team will contact you shortly</strong> to configure your institute portal credentials, set up student accounts, and complete batch onboarding.
              </p>
              <div className="bg-surface/80 rounded-lg p-3 text-xs text-on-surface space-y-1.5 border border-outline-variant/20">
                <div className="font-bold text-on-surface-variant uppercase tracking-wider mb-1">Need Immediate Assistance? Contact Us:</div>
                <div className="flex items-center gap-2"><IconMail size={14} className="text-primary" /> Email: <a href="mailto:support@neetband.com" className="text-primary font-bold hover:underline">support@neetband.com</a></div>
                <div className="flex items-center gap-2"><IconPhone size={14} className="text-primary" /> Phone: <span className="font-bold">+91 98765 43210</span></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => printReceipt(completedOrder, user)}
              className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-surface-container-high border border-outline-variant/40 text-on-surface hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <IconDownload size={20} /> Download Receipt (PDF / Print)
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-primary text-on-primary hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-md"
            >
              Go to Dashboard <IconArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-6 md:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header / Back */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="w-10 h-10 bg-surface-container text-on-surface rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors border border-outline-variant/30 shadow-sm"
              title="Go back"
            >
              <IconChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-on-surface">Checkout</h1>
          </div>
        </div>

        {error && (
          <div className="bg-error/10 text-error px-4 py-3 rounded-xl mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 w-full">
          {/* Left Column: Payment Details */}
          <div className="w-full lg:w-[55%] max-w-2xl bg-surface-container rounded-3xl p-6 lg:p-10 shadow-sm border border-outline-variant/30">
            <h2 className="text-xl lg:text-2xl font-bold text-on-surface mb-2">Complete Your Payment</h2>
            <p className="text-on-surface-variant text-sm mb-6">Pay securely. All transactions are encrypted.</p>

            {/* Voucher Code */}
            <div className="mb-6">
              <label className="flex items-center gap-2 font-bold text-sm text-on-surface mb-2">
                <IconTag size={16} /> Have a Voucher Code?
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Enter voucher code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  disabled={isApplyingPromo || isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary transition-colors disabled:opacity-60"
                />
                <button 
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo || isLoading}
                  className="px-6 py-3 bg-surface border border-outline-variant/30 rounded-xl font-bold hover:bg-surface-variant transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isApplyingPromo ? 'Verifying...' : 'Apply'}
                </button>
              </div>
              {promoMessage.text && (
                <p className={`text-sm mt-2 font-medium ${promoMessage.type === 'error' ? 'text-error' : promoMessage.type === 'success' ? 'text-green-500' : 'text-on-surface-variant'}`}>
                  {promoMessage.text}
                </p>
              )}
            </div>

            {/* Institute Tax / B2B Details */}
            {isInstitutePlan(selectedPlan) && (
              <div className="mb-6 p-4 bg-background/50 rounded-2xl border border-outline-variant/30">
                <label className="flex items-center gap-2 font-bold text-sm text-on-surface mb-3">
                  <IconBuilding size={16} className="text-primary" /> Institutional B2B Invoice Details (Optional)
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      Institution / Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="Institution / Business Name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="GSTIN (e.g. 07AAAAA0000A1Z5)"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-sm font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <div className="mt-4">
              <button 
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary py-4 rounded-xl font-bold text-base transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-[1px] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <IconCreditCard size={20} />
                    {calculateTotal() === 0 ? 'Activate Free Premium' : `Pay ₹${calculateTotal()} via Razorpay`}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[45%] max-w-2xl bg-surface-container rounded-3xl p-6 lg:p-10 shadow-sm border border-outline-variant/30 lg:mt-0">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-6 mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-on-surface">Order Summary</h2>
              <button 
                onClick={() => navigate('/pricing')}
                className="text-xs font-bold text-primary hover:underline"
              >
                Change Plan
              </button>
            </div>
            
            <div className="flex flex-col gap-5 text-base mb-8">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Plan:</span>
                <span className="font-semibold text-on-surface text-right">{planDisplayName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Billing:</span>
                <span className="font-semibold text-on-surface text-right">{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
              </div>
              <div className="flex justify-between items-center border-t border-outline-variant/30 pt-5 mt-2">
                <span className="text-on-surface-variant">Subtotal:</span>
                <span className="font-semibold text-on-surface text-right">₹{basePrice}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between items-center text-green-500">
                  <span>Discount ({appliedPromo.code}):</span>
                  <span className="font-semibold text-right">
                    -₹{basePrice - calculateTotal()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-xl font-bold text-on-surface border-t border-outline-variant/30 pt-6">
              <span>Total Amount:</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
