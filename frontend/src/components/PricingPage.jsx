import React, { useState, useEffect } from 'react';
import Pricing from './Pricing';
import { createPaymentOrder, verifyPayment, verifyPromo } from '../services/api';

export default function PricingPage({ user, onCheckoutSuccess, setCurrentPage }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handlePurchase = async () => {
    if (!user || !user.isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage('checkout');
  };

  return (
    <div className="pt-24 pb-32 min-h-[100dvh] flex flex-col items-center">
      {error && (
        <div className="bg-error/10 text-error px-4 py-3 rounded-xl mb-4 text-center max-w-lg mt-8">
          {error}
        </div>
      )}
      <Pricing 
        onUpgrade={handlePurchase} 
        isLoading={isLoading} 
      />
    </div>
  );
}
