import React, { useState, useRef, useEffect } from 'react';
import { 
  IconPlayerPlayFilled, 
  IconPlayerPauseFilled, 
  IconVolume, 
  IconVolumeOff, 
  IconSchool, 
  IconUserCheck, 
  IconStarFilled, 
  IconChevronLeft, 
  IconChevronRight,
  IconQuote,
  IconX,
  IconMaximize,
  IconCheck,
  IconSparkles
} from '@tabler/icons-react';
import heroVideo from '../assets/vid1.mp4';
import memberAarofil from '../assets/member_aarofil.png';
import memberSarah from '../assets/member_sarah.png';
import memberVikram from '../assets/member_vikram.png';

// Mock video review data for teachers and students
const VIDEO_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Dr. Rajeshwari Verma',
    role: 'Senior Biology Faculty & HOD',
    experience: '14+ Yrs Teaching Experience',
    category: 'teachers',
    location: 'Kota, Rajasthan',
    rating: 5,
    quote: 'NEET BAND transformed my classroom experience! Students remember complex metabolic pathways and NCERT terminology effortlessly in minutes through these mnemonic songs.',
    badge: 'Senior Faculty',
    avatar: memberAarofil,
    // Using sample video feed
    videoUrl: heroVideo,
    posterUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    tags: ['Genetics', 'Plant Physiology', 'Classroom Retain']
  },
  {
    id: 'rev-2',
    name: 'Ananya Sharma',
    role: 'NEET 2025 Aspirant',
    score: 'NEET AIR 42 (705/720)',
    category: 'students',
    location: 'Jaipur, Rajasthan',
    rating: 5,
    quote: 'I listened to the Genetics chapter songs daily during my commute and walks. It felt like magic because I could recall every single line of NCERT instantly during the exam!',
    badge: 'NEET AIR 42',
    avatar: memberSarah,
    videoUrl: heroVideo,
    posterUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    tags: ['NEET 2025', 'Active Recall', 'Top Ranker']
  },
  {
    id: 'rev-3',
    name: 'Prof. K. P. Singh',
    role: 'Inorganic Chemistry HOD',
    experience: '12+ Yrs Mentorship',
    category: 'teachers',
    location: 'Delhi NCR',
    rating: 5,
    quote: 'Inorganic reactions used to be a major struggle point. The Periodic Anthem songs reduced exception error rates by over 60% in our weekly mock test series.',
    badge: 'Chemistry Expert',
    avatar: memberVikram,
    videoUrl: heroVideo,
    posterUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    tags: ['Inorganic Chem', 'Mock Test Booster']
  },
  {
    id: 'rev-4',
    name: 'Rahul Deshmukh',
    role: 'Medical Student & Top Ranker',
    score: 'NEET AIR 118 (692/720)',
    category: 'students',
    location: 'Pune, Maharashtra',
    rating: 5,
    quote: 'When you get exhausted reading thick textbooks, these audio songs keep your prep active without any screen fatigue. Game changer for last month revisions!',
    badge: 'AIR 118',
    avatar: memberAarofil,
    videoUrl: heroVideo,
    posterUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    tags: ['Zero Eye Strain', 'Revision Booster']
  },
  {
    id: 'rev-5',
    name: 'Dr. Sunita Kulkarni',
    role: 'Physics Educator & Author',
    experience: '15+ Yrs Academician',
    category: 'teachers',
    location: 'Bengaluru, Karnataka',
    rating: 5,
    quote: 'Auditory memory leverages the brain’s natural rhythm centers. My students listen to NEET BAND formulas between self-study sessions and score far higher.',
    badge: 'Physics Mentor',
    avatar: memberSarah,
    videoUrl: heroVideo,
    posterUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80',
    tags: ['Formula Memory', 'Auditory Learning']
  },
  {
    id: 'rev-6',
    name: 'Priya Nair',
    role: 'Class 12 Board Topper & NEET Aspirant',
    score: 'Class 12 - 98.6%',
    category: 'students',
    location: 'Kochi, Kerala',
    rating: 5,
    quote: 'Organic reaction mechanisms used to mix up in my mind. The lyric sync player coupled with musical rhythms made organic chemistry stick forever!',
    badge: '98.6% Topper',
    avatar: memberSarah,
    videoUrl: heroVideo,
    posterUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    tags: ['Organic Chem', 'Lyric Sync']
  }
];

export default function VideoReviewsGallery() {
  const [activeTab, setActiveTab] = useState('all');
  const [playingId, setPlayingId] = useState(null);
  const [mutedStates, setMutedStates] = useState({});
  const [selectedReviewModal, setSelectedReviewModal] = useState(null);

  const videoRefs = useRef({});
  const scrollContainerRef = useRef(null);

  const filteredReviews = VIDEO_REVIEWS.filter(item => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  const handleTogglePlay = (id, e) => {
    if (e) e.stopPropagation();

    // Pause all other videos
    Object.keys(videoRefs.current).forEach(key => {
      if (key !== id && videoRefs.current[key]) {
        videoRefs.current[key].pause();
      }
    });

    const currentVideo = videoRefs.current[id];
    if (!currentVideo) return;

    if (playingId === id) {
      currentVideo.pause();
      setPlayingId(null);
    } else {
      currentVideo.play().then(() => {
        setPlayingId(id);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  const handleToggleMute = (id, e) => {
    if (e) e.stopPropagation();
    const currentVideo = videoRefs.current[id];
    const isCurrentlyMuted = mutedStates[id] !== false; // default muted

    if (currentVideo) {
      currentVideo.muted = !isCurrentlyMuted;
    }
    setMutedStates(prev => ({
      ...prev,
      [id]: !isCurrentlyMuted
    }));
  };

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 340;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Close modal with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedReviewModal(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section className="py-24 md:py-32 px-gutter bg-surface-container-lowest/40 relative overflow-hidden transition-colors duration-300">
      {/* Decorative top divider line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-outline/15 to-transparent"></div>

      <div className="max-w-container-max mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label-sm text-xs font-semibold uppercase tracking-wider mb-4 border border-primary/20">
            <IconSparkles size={16} /> Verified Video Testimonials
          </div>
          
          <h2 className="text-3xl md:text-5xl font-headline-lg font-bold text-on-surface mb-4 text-balance">
            Hear From Our Teachers & Students
          </h2>
          
          <p className="text-on-surface-variant text-base md:text-lg font-body-md max-w-2xl mx-auto opacity-80">
            Watch real video reviews from top medical rankers and senior educators who rely on NEET BAND songs for rapid recall and exam mastery.
          </p>
        </div>

        {/* Video Reel Cards Carousel Container */}
        <div className="relative group/carousel">
          
          {/* Scroll Left Button */}
          <button
            onClick={() => handleScroll('left')}
            aria-label="Previous Reviews"
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-container-high/90 text-on-surface border border-outline/20 shadow-xl items-center justify-center hover:bg-primary hover:text-on-primary transition-all duration-200 backdrop-blur-md"
          >
            <IconChevronLeft size={24} />
          </button>

          {/* Scroll Right Button */}
          <button
            onClick={() => handleScroll('right')}
            aria-label="Next Reviews"
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-surface-container-high/90 text-on-surface border border-outline/20 shadow-xl items-center justify-center hover:bg-primary hover:text-on-primary transition-all duration-200 backdrop-blur-md"
          >
            <IconChevronRight size={24} />
          </button>

          {/* Cards Flex Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredReviews.map((review) => {
              const isPlaying = playingId === review.id;
              const isMuted = mutedStates[review.id] !== false; // muted by default

              return (
                <div
                  key={review.id}
                  className="flex-none w-[280px] sm:w-[320px] md:w-[340px] snap-start"
                >
                  {/* Vertical Reel Card Frame */}
                  <div className="relative aspect-[9/16] rounded-3xl overflow-hidden border border-outline/20 bg-slate-950 shadow-xl group transition-all duration-300 hover:shadow-2xl hover:border-primary/50 flex flex-col justify-between">
                    
                    {/* Background Video Element */}
                    <div className="absolute inset-0 z-0 bg-slate-900">
                      <video
                        ref={el => videoRefs.current[review.id] = el}
                        src={review.videoUrl}
                        poster={review.posterUrl}
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onEnded={() => setPlayingId(null)}
                      />
                      {/* Dark Gradient Overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60 pointer-events-none" />
                    </div>

                    {/* Top Overlay Bar */}
                    <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                      {/* Category Badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
                        review.category === 'teachers'
                          ? 'bg-purple-900/80 text-purple-200 border border-purple-400/30'
                          : 'bg-emerald-900/80 text-emerald-200 border border-emerald-400/30'
                      }`}>
                        {review.category === 'teachers' ? (
                          <IconSchool size={14} className="text-purple-300" />
                        ) : (
                          <IconUserCheck size={14} className="text-emerald-300" />
                        )}
                        {review.category === 'teachers' ? 'Teacher' : 'Student'}
                      </span>

                      {/* Top Right Controls: Mute Toggle & Expand */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleMute(review.id, e)}
                          title={isMuted ? "Unmute sound" : "Mute sound"}
                          className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200"
                        >
                          {isMuted ? <IconVolumeOff size={18} /> : <IconVolume size={18} className="text-emerald-400" />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReviewModal(review);
                          }}
                          title="Expand Reel"
                          className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-200"
                        >
                          <IconMaximize size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Center Action: Big Play/Pause Button */}
                    <div className="relative z-10 flex-1 flex items-center justify-center p-4">
                      <button
                        onClick={(e) => handleTogglePlay(review.id, e)}
                        aria-label={isPlaying ? "Pause review video" : "Play review video"}
                        className={`w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 flex items-center justify-center text-white transition-all duration-300 shadow-2xl ${
                          isPlaying 
                            ? 'scale-90 bg-primary/80 border-primary text-on-primary' 
                            : 'hover:scale-110 hover:bg-primary hover:border-primary hover:text-on-primary'
                        }`}
                      >
                        {isPlaying ? (
                          <IconPlayerPauseFilled size={28} />
                        ) : (
                          <IconPlayerPlayFilled size={28} className="ml-1" />
                        )}
                      </button>
                    </div>

                    {/* Bottom Card Content Info */}
                    <div className="relative z-10 p-5 pt-2 text-white">
                      
                      {/* Badge / Achievement Pill */}
                      <div className="mb-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-300 text-xs font-semibold border border-white/10">
                          {review.badge}
                        </span>
                      </div>

                      {/* Quote Snippet */}
                      <div className="relative mb-4">
                        <IconQuote size={20} className="absolute -top-2 -left-1 text-primary/40 rotate-180" />
                        <p className="text-xs sm:text-sm text-slate-200 font-body-sm line-clamp-3 pl-4 italic">
                          "{review.quote}"
                        </p>
                      </div>

                      {/* Reviewer Details */}
                      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                        <img
                          src={review.avatar}
                          alt={review.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-primary/50 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-white truncate">
                            {review.name}
                          </h3>
                          <p className="text-xs text-slate-300 truncate">
                            {review.role}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 text-amber-400">
                            {[...Array(review.rating)].map((_, i) => (
                              <IconStarFilled key={i} size={12} />
                            ))}
                            <span className="text-[10px] text-slate-400 ml-1">({review.location})</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Full Reel Video Modal */}
      {selectedReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  selectedReviewModal.category === 'teachers' ? 'bg-purple-900/80 text-purple-200' : 'bg-emerald-900/80 text-emerald-200'
                }`}>
                  {selectedReviewModal.category === 'teachers' ? 'Teacher Review' : 'Student Review'}
                </span>
                <span className="text-sm text-slate-300 font-semibold truncate">
                  {selectedReviewModal.name}
                </span>
              </div>

              <button
                onClick={() => setSelectedReviewModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Modal Reel Video Display */}
            <div className="relative aspect-[9/16] bg-black max-h-[500px] flex items-center justify-center">
              <video
                src={selectedReviewModal.videoUrl}
                poster={selectedReviewModal.posterUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Details Footer */}
            <div className="p-5 bg-slate-950 overflow-y-auto space-y-3 border-t border-white/10 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold">{selectedReviewModal.name}</h4>
                  <p className="text-xs text-slate-400">{selectedReviewModal.role} • {selectedReviewModal.location}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <IconStarFilled size={14} />
                  <span className="text-xs font-bold text-white">5.0</span>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/10">
                "{selectedReviewModal.quote}"
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {selectedReviewModal.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
