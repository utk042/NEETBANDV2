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

  const handleNextImage = () => {
    setCurrentImageIdx((prev) => (prev === BOOK_IMAGES.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImage = () => {
    setCurrentImageIdx((prev) => (prev === 0 ? BOOK_IMAGES.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-32">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        
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

              <Button 
                onClick={() => navigate('/offers/book/checkout')} 
                size="lg" 
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white py-4 text-lg"
              >
                <IconShoppingCart className="mr-2" /> Buy Now at 50% Off
              </Button>
            </div>

          </div>

      </div>
    </div>
  );
}
