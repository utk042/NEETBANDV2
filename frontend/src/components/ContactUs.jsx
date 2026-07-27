import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { IconSend, IconMessageCircle, IconMail, IconPhone } from '@tabler/icons-react';
import { createContactMessage } from '../services/api';
import CustomSelect from './ui/CustomSelect';

export default function ContactUs() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: location.state?.subject || '',
    message: ''
  });

  useEffect(() => {
    if (location.state?.subject) {
      setFormData(prev => ({ ...prev, subject: location.state.subject }));
    }
  }, [location.state]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await createContactMessage(formData);
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      setSubmitStatus('error');
    }
  };

  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-outline),0.1)] to-transparent"></div>
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-5xl text-on-surface mb-4">Get in Touch</h2>
          <p className="font-body-md text-lg text-on-surface-variant max-w-2xl mx-auto">
            Have questions about our syllabus tracks, pricing, or partnerships? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Contact Info */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-8 shadow-[var(--shadow-floating-card)]">
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-6">Contact Information</h3>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <IconMail size={20} />
                  </div>
                  <div>
                    <h4 className="font-label-md font-bold text-sm text-on-surface-variant mb-1">Email Support</h4>
                    <a href="mailto:support@neetband.com" className="font-body-md text-on-surface hover:text-primary transition-colors">support@neetband.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <IconPhone size={20} />
                  </div>
                  <div>
                    <h4 className="font-label-md font-bold text-sm text-on-surface-variant mb-1">Call Us</h4>
                    <a href="tel:+918047193393" className="font-body-md text-on-surface hover:text-primary transition-colors">+91 80 4719 3393</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                    <IconMessageCircle size={20} />
                  </div>
                  <div>
                    <h4 className="font-label-md font-bold text-sm text-on-surface-variant mb-1">WhatsApp Chat</h4>
                    <span className="font-body-md text-on-surface">Available 9 AM - 6 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-3xl border border-primary/20 p-8">
              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">Need Immediate Help?</h3>
              <p className="font-body-md text-sm text-on-surface-variant mb-4">
                Have questions about subscriptions, audio tracks, or payments? Chat with us directly on WhatsApp or drop us an email.
              </p>
              <a 
                href="https://wa.me/918047193393" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-label-md text-sm font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                Chat on WhatsApp &rarr;
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8">
            <div className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] p-8 md:p-10 shadow-[var(--shadow-floating-card)] relative overflow-hidden">
              
              {submitStatus === 'success' && (
                <div className="absolute inset-0 bg-surface/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <IconSend size={32} />
                  </div>
                  <h3 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">Message Sent!</h3>
                  <p className="font-body-md text-on-surface-variant mb-6">We'll get back to you as soon as possible.</p>
                  <button 
                    onClick={() => setSubmitStatus(null)}
                    className="px-6 py-2 border border-[var(--border-floating-card)] rounded-xl hover:bg-surface-container font-label-md transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-label-md text-sm font-semibold text-on-surface-variant">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="px-4 py-3 rounded-xl bg-surface-container border border-[var(--border-floating-card)] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-label-md text-sm font-semibold text-on-surface-variant">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. rahul@example.com"
                      className="px-4 py-3 rounded-xl bg-surface-container border border-[var(--border-floating-card)] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="font-label-md text-sm font-semibold text-on-surface-variant">Subject / Category</label>
                  <CustomSelect 
                    id="subject" 
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Select a topic..."
                    options={[
                      "Report Bug / Issue",
                      "Report Notes / Content Issue",
                      "General Inquiry",
                      "Technical Support",
                      "Billing Question",
                      "Institute / College Partnership"
                    ]}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="font-label-md text-sm font-semibold text-on-surface-variant">Message</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    className="px-4 py-3 rounded-xl bg-surface-container border border-[var(--border-floating-card)] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-body-md resize-y"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-2 px-8 py-4 bg-primary text-on-primary rounded-xl font-label-md font-bold flex items-center justify-center gap-2 hover:bg-primary-fixed hover:text-on-primary-fixed active:scale-[0.98] transition-all shadow-sm disabled:opacity-70 disabled:cursor-wait group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <IconSend size={20} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
