import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderReceipt } from '../services/api';
import { generateReceiptHTML } from '../utils/receiptGenerator';
import { useUserAuth } from '../contexts/UserAuthContext';
import { IconArrowLeft, IconPrinter } from '@tabler/icons-react';

export default function ReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  
  useEffect(() => {
    if (!user) return; // Wait until authenticated
    
    const fetchReceipt = async () => {
      try {
        const data = await getOrderReceipt(id);
        setReceiptData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load receipt or order not found.');
        setLoading(false);
      }
    };
    
    fetchReceipt();
  }, [id, user]);
  
  if (loading) {
    return (
      <div className="min-h-[70vh] pt-32 pb-20 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
        <p className="mt-4 text-on-surface/70">Loading receipt...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[70vh] pt-32 pb-20 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-on-surface/70 mb-6">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform">
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  const htmlContent = generateReceiptHTML(receiptData.order, receiptData.user);
  
  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
      win.focus();
      // Added a slight delay for styles to load if any
      setTimeout(() => {
        win.print();
      }, 250);
    }
  };
  
  return (
    <div className="min-h-screen pt-32 pb-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-on-surface/70 hover:text-on-surface transition-colors font-semibold"
          >
            <IconArrowLeft size={20} /> Back
          </button>
          
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-full hover:scale-105 transition-transform"
          >
            <IconPrinter size={20} /> Print / Download
          </button>
        </div>
        
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-surface-light">
          <iframe 
            srcDoc={htmlContent} 
            className="w-full min-h-[800px] border-none bg-white"
            title="Receipt Preview"
          />
        </div>
      </div>
    </div>
  );
}
