import React, { useState } from 'react';
import { IconBook, IconChevronLeft } from '@tabler/icons-react';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export default function BookCheckout() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = (e) => {
    e.preventDefault();
    if (!phone || !address) return;
    setIsLoading(true);
    // Simulate payment API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard'); // Or a success page
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface py-6 md:py-8 px-4">
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

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <form onSubmit={handlePurchase} className="bg-surface-container-low p-6 md:p-8 rounded-3xl border border-outline/10 space-y-6">
              <h3 className="text-xl font-bold text-on-surface mb-2 border-b border-outline/10 pb-4">Shipping Details</h3>
              
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

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">Complete Address</label>
                <textarea 
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-amber-500/50 min-h-[120px] resize-none"
                  placeholder="House No, Street, City, State, PIN"
                />
              </div>

              {/* Simulated Payment Notice */}
              <div className="p-4 bg-blue-500/10 text-blue-500 text-sm rounded-xl flex items-start gap-3">
                <IconBook size={20} className="shrink-0 mt-0.5" />
                <p>For this demonstration, clicking "Process Payment" will simulate a successful transaction and redirect to your dashboard.</p>
              </div>

              <div className="flex gap-4 pt-4 border-t border-outline/10">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1 py-3">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3">
                  {isLoading ? 'Processing...' : 'Process Payment'}
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
                <span className="text-sm font-bold">Premium Discount (50%)</span>
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
