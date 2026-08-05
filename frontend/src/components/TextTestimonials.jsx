import React, { useState, useEffect } from 'react';
import { IconQuote, IconStarFilled, IconUserCheck, IconSchool } from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TextTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`${API_URL}/api/testimonials/active?type=text`);
      const data = await response.json();
      if (data.success && data.testimonials) {
        setTestimonials(data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching text testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 md:py-28 px-gutter bg-surface-container-lowest relative overflow-hidden flex justify-center">
        <div className="animate-pulse h-12 w-12 bg-surface-variant rounded-full"></div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't render section if no testimonials
  }

  return (
    <section className="py-20 md:py-28 px-gutter bg-surface-container-lowest relative overflow-hidden">
      {/* Background embellishments */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-outline/10 to-transparent" />
      <div className="absolute top-[-10%] right-[-5%] w-[40%] aspect-square rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] aspect-square rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

      <div className="max-w-container-max mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-headline-lg font-bold text-on-surface mb-6">
            Loved by Thousands
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg font-body-md max-w-2xl mx-auto opacity-80">
            See what students and educators are saying about their experience with NEET BAND.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial._id} 
              className="bg-surface-container/50 border border-outline/10 backdrop-blur-sm p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 flex flex-col h-full group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <IconStarFilled key={i} size={16} />
                  ))}
                </div>
                <IconQuote className="text-primary/20 group-hover:text-primary/40 transition-colors duration-300" size={32} />
              </div>
              
              <p className="text-on-surface text-base md:text-lg font-body-md leading-relaxed mb-8 flex-grow opacity-90">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-outline/10">
                <div className="relative">
                  <img 
                    src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`} 
                    alt={testimonial.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`;
                    }}
                    className="w-12 h-12 rounded-full object-cover border-2 border-outline/20 bg-surface-container"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface-container-lowest ${
                    testimonial.category === 'teacher' ? 'bg-purple-500' : 'bg-emerald-500'
                  }`}>
                    {testimonial.category === 'teacher' ? (
                      <IconSchool size={10} className="text-white" />
                    ) : (
                      <IconUserCheck size={10} className="text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-on-surface font-bold text-sm">{testimonial.name}</h4>
                  <p className="text-on-surface-variant text-xs opacity-80">{testimonial.role} {testimonial.location ? `• ${testimonial.location}` : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
