import React, { useState, useEffect } from 'react';
import { IconBook, IconChevronLeft, IconCreditCard } from '@tabler/icons-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { createPaymentOrder, verifyPayment } from '../../services/api';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { loadRazorpayScript } from '../../utils/razorpayUtils';

export default function BookCheckout() {
  const navigate = useNavigate();
  const { user, login } = useUserAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !address || !state || !pinCode) {
      setError('Please fill in all shipping details');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      const fullShippingAddress = `${address}, ${state} - ${pinCode}`;
      const shippingDetails = {
        fullName,
        email,
        phone,
        address: fullShippingAddress,
        state,
        pinCode,
        bookTitle: 'NeetBand Mastery Guide'
      };

      const order = await createPaymentOrder('book_order', null, shippingDetails);

      // Handle mock mode fallback when using dummy key
      if (order.id && order.id.startsWith('order_mock_')) {
        const verificationData = {
          razorpay_order_id: order.id,
          razorpay_payment_id: 'pay_mock_' + Date.now(),
          razorpay_signature: 'mock_signature',
          plan: 'book_order',
          address: fullShippingAddress,
          phone,
          bookTitle: 'NeetBand Mastery Guide'
        };
        const verifyRes = await verifyPayment(verificationData);
        if (verifyRes.user && login) {
          login({ ...user, ...verifyRes.user });
        }
        setSuccessMessage('Book order placed successfully!');
        setIsLoading(false);
        setTimeout(() => navigate('/dashboard'), 2000);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }

      const options = {
        key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'NeetBand',
        description: 'NeetBand Mastery Guide Book Order',
        order_id: order.id,
        handler: async function (response) {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: 'book_order',
              address: fullShippingAddress,
              phone,
              bookTitle: 'NeetBand Mastery Guide'
            };
            const verifyRes = await verifyPayment(verificationData);
            if (verifyRes.user && login) {
              login({ ...user, ...verifyRes.user });
            }
            setSuccessMessage('Payment successful! Your book order has been placed.');
            setTimeout(() => navigate('/dashboard'), 2000);
          } catch (err) {
            setError(err.message || 'Payment verification failed. Please contact support.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone
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

  return (
    <div className="min-h-screen bg-surface pt-32 pb-16 md:pb-32 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-surface-container text-on-surface rounded-full flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors border border-outline-variant/30 shadow-sm"
          >
            <IconChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-on-surface">Book Checkout</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error text-sm rounded-xl font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-xl font-medium">
            {successMessage}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <form onSubmit={handlePurchase} className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline/10 space-y-6">
              <h3 className="text-xl font-bold text-on-surface mb-2 border-b border-outline/10 pb-4">Shipping Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-amber-500/50"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-amber-500/50"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-amber-500/50"
                    placeholder="Enter 10-digit number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">Street Address</label>
                <textarea 
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-amber-500/50 min-h-[80px] resize-none"
                  placeholder="House No, Street, City"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">State</label>
                  <input 
                    type="text" 
                    required
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-amber-500/50"
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">PIN Code</label>
                  <input 
                    type="text" 
                    required
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value)}
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-amber-500/50"
                    placeholder="6-digit PIN"
                  />
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm rounded-xl flex items-start gap-3">
                <IconBook size={20} className="shrink-0 mt-0.5" />
                <p>Secure online payment powered by Razorpay. Your order will be processed immediately upon completion.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-outline/10">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="w-full sm:flex-1 py-3 whitespace-nowrap">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 whitespace-nowrap flex items-center justify-center gap-2">
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <IconCreditCard size={20} />
                      Pay ₹499 via Razorpay
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-[350px]">
            <div className="bg-surface-container border border-outline/10 rounded-3xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-on-surface mb-4 pb-4 border-b border-outline/10">Order Summary</h3>
              <div className="flex justify-between items-center mb-3">
                <span className="text-on-surface-variant text-sm">NeetBand Mastery Guide</span>
                <span className="text-on-surface font-bold text-sm">₹999</span>
              </div>
              <div className="flex justify-between items-center mb-4 text-amber-500">
                <span className="text-sm font-bold">Special Discount (50%)</span>
                <span className="font-bold text-sm">-₹500</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-outline/10">
                <span className="font-bold text-on-surface">Total to Pay</span>
                <span className="text-2xl font-extrabold text-on-surface">₹499</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
