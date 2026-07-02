import React, { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

const FAQ_ITEMS = [
  {
    question: "What is NeetBand and how does it help me study?",
    answer: "NeetBand converts complex academic concepts (CBSE Class 3-12 syllabus) into catchy, professionally produced study songs. Auditory learning leverages musical memory, boosting retention and reducing the eye strain associated with reading textbooks for hours."
  },
  {
    question: "Is the content aligned with the CBSE curriculum?",
    answer: "Yes, 100%. All our songs are meticulously written and reviewed by educational experts to align precisely with the CBSE Class 3–12 chapters in Biology, Chemistry, Physics, and Mathematics."
  },
  {
    question: "Can I download songs for offline listening?",
    answer: "Yes! Premium Scholar members can download songs directly on their devices for offline playback. This allows you to study without any internet connections, eliminating social media notifications and other distractions."
  },
  {
    question: "How do the MCQ quizzes help?",
    answer: "Every song in our library is paired with active recall multiple-choice questions. Testing yourself immediately after listening reinforces memory pathways and ensures you have truly understood the concept."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your Premium Scholar subscription at any time. There are no contracts, cancellation fees, or commitments—just cancel from your account billing settings in one click."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-32 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline/10 to-transparent"></div>
      

      
      <div className="max-w-3xl mx-auto relative z-10 px-4 md:px-0">
        <div className="text-center mb-16" data-gsap="heading">
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-5 text-balance">Frequently Asked Questions</h2>
          <p className="font-body-md font-normal text-xl text-on-surface-variant opacity-80">Got questions? We’ve got answers.</p>
        </div>
        
        <div className="space-y-4" data-gsap="faq-list">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div 
                key={idx} 
                data-gsap="faq-item"
                className="bg-surface rounded-2xl border border-outline/20 overflow-hidden transition-all duration-300"
              >
                <button
                  id={`faq-question-${idx}`}
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full px-6 py-5 flex justify-between items-center text-left gap-4 hover:bg-surface-container/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <span className="font-headline-md text-base md:text-lg text-on-surface font-semibold">
                    {item.question}
                  </span>
                  <IconChevronDown size={24} className={`text-primary transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                
                <div 
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0'
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-6 pt-2 font-body-md text-sm md:text-base text-on-surface-variant leading-relaxed border-t border-[var(--border-floating-card)]/50">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
