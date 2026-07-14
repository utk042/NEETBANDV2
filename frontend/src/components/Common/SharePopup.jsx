import React from 'react';
import { IconBrandWhatsapp, IconX } from '@tabler/icons-react';

export default function SharePopup({ isOpen, onClose, shareUrl, title = 'Check this out!' }) {
  if (!isOpen) return null;

  const handleShare = () => {
    const text = encodeURIComponent(title);
    const url = encodeURIComponent(shareUrl || window.location.href);
    window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white text-black w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col items-center p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
          <IconX size={20} />
        </button>
        
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-500">
          <IconBrandWhatsapp size={32} />
        </div>
        
        <h3 className="text-xl font-bold text-center mb-2">Love this song?</h3>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Share it with your friends on WhatsApp to keep the music playing!
        </p>
        
        <button 
          onClick={handleShare}
          className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
        >
          <IconBrandWhatsapp size={22} /> Share to WhatsApp
        </button>
      </div>
    </div>
  );
}
