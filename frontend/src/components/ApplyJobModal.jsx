import React, { useState } from 'react';
import { IconX, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { submitJobApplication } from '../services/api';

export default function ApplyJobModal({ position, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    coverLetter: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !position) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitJobApplication({
        jobId: position._id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        resumeUrl: formData.resumeUrl,
        coverLetter: formData.coverLetter,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({ fullName: '', email: '', phone: '', resumeUrl: '', coverLetter: '' });
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-surface text-on-surface border border-[var(--border-floating-card)] rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-[var(--shadow-floating-card)] relative transition-all duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-variant/50 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <IconX size={20} />
        </button>

        {/* Title */}
        <h2 className="font-headline-md font-bold text-xl md:text-2xl text-on-surface mb-6 pr-8 leading-snug">
          Apply for: <span className="text-primary font-bold">{position.title}</span>
        </h2>

        {success ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-primary/20 text-primary rounded-full flex items-center justify-center border border-primary/30">
              <IconCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-on-surface">Application Submitted!</h3>
            <p className="text-sm text-on-surface-variant max-w-md">
              Thank you for applying. Our hiring team will review your application and contact you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3.5 bg-error/10 border border-error/20 rounded-xl text-error text-sm flex items-center gap-2.5">
                <IconAlertCircle size={20} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {/* Email & Phone side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                  Phone Number <span className="text-error">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            {/* Resume / Portfolio Link */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                Resume / Portfolio Link <span className="text-error">*</span>
              </label>
              <input
                type="url"
                name="resumeUrl"
                required
                value={formData.resumeUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                Cover Letter (Optional)
              </label>
              <textarea
                name="coverLetter"
                rows={4}
                value={formData.coverLetter}
                onChange={handleChange}
                placeholder="Tell us why you are a great fit..."
                className="w-full bg-surface-container/60 border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-primary hover:opacity-90 text-on-primary font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-primary/20 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
