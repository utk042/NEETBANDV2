import React, { useState, useEffect } from 'react';
import { IconChevronLeft, IconTag, IconCreditCard } from '@tabler/icons-react';
import { createPaymentOrder, verifyPayment } from '../services/api';

export default function Checkout({ user, setCurrentPage, onCheckoutSuccess }) {
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Require login
  useEffect(() => {
    if (!user || !user.isLoggedIn) {
      setCurrentPage('login');
    }
  }, [user, setCurrentPage]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const scriptId = 'razorpay-checkout-js';
      if (document.getElementById(scriptId)) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const order = await createPaymentOrder('premium_scholar', promoCode);
      if (order.id.startsWith('order_mock_')) {
        const verificationData = {
          razorpay_order_id: order.id,
          razorpay_payment_id: 'pay_mock_' + Date.now(),
          razorpay_signature: 'mock_signature',
          plan: 'premium_scholar'
        };
        const verifyRes = await verifyPayment(verificationData);
        if (onCheckoutSuccess) {
          onCheckoutSuccess({ ...user, ...verifyRes.user, isLoggedIn: true });
        }
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load');

      const options = {
        key: order.key_id, 
        amount: order.amount,
        currency: order.currency,
        name: 'NeetBand',
        description: 'Premium Scholar Subscription',
        order_id: order.id,
        handler: async function (response) {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: 'premium_scholar'
            };
            const verifyRes = await verifyPayment(verificationData);
            if (onCheckoutSuccess) {
              onCheckoutSuccess({ ...user, ...verifyRes.user, isLoggedIn: true });
            }
          } catch (err) {
            setError('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#ecc246' }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      setError('Could not initialize checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-surface py-6 md:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header / Back */}
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="w-10 h-10 bg-surface-container text-on-surface rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors border border-outline-variant/30 shadow-sm"
          >
            <IconChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-on-surface">Checkout</h1>
        </div>

        {error && (
          <div className="bg-error/10 text-error px-4 py-3 rounded-xl mb-6">
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
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
            <button className="px-6 py-3 bg-surface border border-outline-variant/30 rounded-xl font-bold hover:bg-surface-variant transition-colors whitespace-nowrap">
              Apply
            </button>
          </div>
        </div>



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
                Pay with Razorpay
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full lg:w-[45%] max-w-2xl bg-surface-container rounded-3xl p-6 lg:p-10 shadow-sm border border-outline-variant/30 lg:mt-0">
        <h2 className="text-xl lg:text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-6">Order Summary</h2>
        
        <div className="flex flex-col gap-5 text-base mb-8">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Plan:</span>
            <span className="font-semibold text-on-surface text-right">Premium Scholar (Monthly)</span>
          </div>
          <div className="flex justify-between items-center border-t border-outline-variant/30 pt-5 mt-2">
            <span className="text-on-surface-variant">Subtotal:</span>
            <span className="font-semibold text-on-surface text-right">₹299</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-xl font-bold text-on-surface border-t border-outline-variant/30 pt-6">
          <span>Total Amount:</span>
          <span>₹299</span>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
