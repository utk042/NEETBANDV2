import React, { useState } from 'react';
import { IconShoppingCart, IconCheck, IconChevronRight, IconChevronLeft, IconBook } from '@tabler/icons-react';
import Button from '../ui/Button';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const BOOK_IMAGES = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop'
];

export default function BookOfferPreview() {
  const navigate = useNavigate();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNextImage = () => {
    setCurrentImageIdx((prev) => (prev === BOOK_IMAGES.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setCurrentImageIdx((prev) => (prev === 0 ? BOOK_IMAGES.length - 1 : prev - 1));
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!address || !phone) return;
    
    setIsLoading(true);
    try {
      await api.post('/api/offers/book', { address, phone });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process purchase');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-32">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <IconCheck size={40} />
            </div>
            <h2 className="text-3xl font-extrabold text-on-surface mb-4">Purchase Successful!</h2>
            <p className="text-on-surface-variant text-lg">Your book has been ordered and will be dispatched soon. Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Carousel */}
            <div className="relative rounded-3xl overflow-hidden bg-surface-container-low border border-outline/10 aspect-square group">
              <img src={BOOK_IMAGES[currentImageIdx]} alt="Book preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              
              <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent z-10">
                {BOOK_IMAGES.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImageIdx ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>

              <button 
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 backdrop-blur-sm transition-all z-10"
              >
                <IconChevronLeft size={24} />
              </button>

              <button 
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 backdrop-blur-sm transition-all z-10"
              >
                <IconChevronRight size={24} />
              </button>
            </div>

            {/* Details & Checkout */}
            <div className="flex flex-col justify-center">
              <span className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">Premium Exclusive • 50% Off</span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4 leading-tight">NeetBand Mastery Guide</h1>
              <p className="text-xl text-on-surface-variant mb-8 leading-relaxed">
                Written by top educators, this comprehensive guide covers all essential topics, shortcuts, and practice questions to ace your exams.
              </p>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-4xl font-extrabold text-on-surface">₹499</span>
                <span className="text-xl text-on-surface-variant line-through mb-1">₹999</span>
              </div>

              {!isCheckingOut ? (
                <Button 
                  onClick={() => setIsCheckingOut(true)} 
                  size="lg" 
                  className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white py-4 text-lg"
                >
                  <IconShoppingCart className="mr-2" /> Buy Now at 50% Off
                </Button>
              ) : (
                <form onSubmit={handlePurchase} className="bg-surface-container-low p-6 rounded-2xl border border-outline/10 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="text-xl font-bold text-on-surface mb-2 border-b border-outline/10 pb-2">Shipping Details</h3>
                  
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
                      className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-amber-500/50 min-h-[100px] resize-none"
                      placeholder="House No, Street, City, State, PIN"
                    />
                  </div>

                  {/* Simulated Payment Notice */}
                  <div className="p-3 bg-blue-500/10 text-blue-500 text-xs rounded-lg flex items-start gap-2">
                    <IconBook size={16} className="shrink-0 mt-0.5" />
                    <p>For this demonstration, clicking "Process Payment" will simulate a successful transaction.</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setIsCheckingOut(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
                      {isLoading ? 'Processing...' : 'Process Payment'}
                    </Button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
