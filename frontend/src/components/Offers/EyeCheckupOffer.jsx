import React, { useState } from 'react';
import { IconEye, IconCheck, IconCalendarEvent } from '@tabler/icons-react';
import Button from '../ui/Button';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';

export default function EyeCheckupOffer() {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    preferredDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.location) return;

    setIsLoading(true);
    try {
      await api.post('/api/offers/eye-checkup', formData);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-32">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        
        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <IconCheck size={40} />
            </div>
            <h2 className="text-3xl font-extrabold text-on-surface mb-4">Request Submitted Successfully!</h2>
            <p className="text-on-surface-variant text-lg">Our partner clinic will contact you shortly to confirm your appointment. Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="bg-surface-container-low border border-outline/10 rounded-3xl p-8 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner border border-emerald-500/20">
                <IconEye size={32} strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-1 block">Premium Exclusive</span>
                <h1 className="text-3xl font-extrabold text-on-surface leading-tight">Free Eye Checkup</h1>
              </div>
            </div>

            <p className="text-on-surface-variant text-lg mb-10 leading-relaxed max-w-2xl">
              Studying for long hours can strain your eyes. As a premium member, you are entitled to one free comprehensive eye checkup at our partnered clinics across the country. Please provide your details below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Email</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-emerald-500/50"
                    placeholder="10-digit number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface">Preferred Date</label>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={formData.preferredDate}
                      onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-emerald-500/50"
                    />
                    <IconCalendarEvent className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface">City / Location</label>
                <textarea 
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-emerald-500/50 min-h-[80px] resize-none"
                  placeholder="Enter your full address or nearest major city"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')} className="flex-1 max-w-[200px]">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                  {isLoading ? 'Submitting...' : 'Request Checkup'}
                </Button>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
