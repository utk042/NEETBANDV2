import React, { useState } from 'react';
import { 
  IconPlayerPlayFilled, 
  IconVolume, 
  IconSettings, 
  IconMaximize, 
  IconShare, 
  IconClock 
} from '@tabler/icons-react';
import logoImg from '../assets/logo.png';

export default function WhatIsNeetBand({ videoId = "dQw4w9WgXcQ" }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // You can customize videoId or pass a YouTube URL / ID prop
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`;

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Eyebrow / Tag */}
        <div className="text-center mb-3">
          <span className="inline-block text-blue-600 dark:text-blue-400 font-semibold tracking-wide text-sm sm:text-base">
            — What is NEET BAND ?
          </span>
        </div>

        {/* Main Heading */}
        <h2 className="text-center font-headline-lg font-bold text-2xl sm:text-3xl md:text-4xl text-on-surface mb-3 tracking-tight">
          Struggling with traditional study methods?
        </h2>

        {/* Subtitle */}
        <p className="text-center font-body-md text-on-surface-variant opacity-85 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          NEET BAND revision songs offer a scientifically proven alternative that transforms how you absorb complex concepts.
        </p>

        {/* YouTube Video Box Container */}
        <div 
          className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-neutral-900 border border-black/10 dark:border-white/10 group cursor-pointer"
          onClick={() => !isPlaying && setIsPlaying(true)}
        >
          {isPlaying ? (
            <iframe
              className="w-full h-full border-0"
              src={embedUrl}
              title="What is NEET BAND?"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <>
              {/* Thumbnail Image */}
              <img
                src="/neet_band_video_thumbnail.jpg"
                alt="What is NEET BAND - Educational Video"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  // Fallback image if thumbnail load fails
                  e.currentTarget.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80";
                }}
              />

              {/* Dark Overlay for Video Controls readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 opacity-90 transition-opacity group-hover:opacity-75" />

              {/* Top Bar Player UI */}
              <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-center justify-between z-10 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/30 bg-black/40 flex items-center justify-center p-0.5">
                    <img src={logoImg} alt="NEET BAND" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base leading-tight text-white drop-shadow-md">
                      NEET BAND
                    </h3>
                    <p className="text-[11px] text-white/70 font-medium">NEET BAND</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-white/80">
                  <button className="p-1.5 rounded-full hover:bg-white/20 transition-colors" aria-label="Volume">
                    <IconVolume className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button className="px-1.5 py-0.5 rounded border border-white/80 hover:bg-white/20 transition-colors text-xs font-bold tracking-tighter" aria-label="Captions">
                    CC
                  </button>
                  <button className="p-1.5 rounded-full hover:bg-white/20 transition-colors" aria-label="Settings">
                    <IconSettings className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-black/60 hover:bg-red-600/90 backdrop-blur-md flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 shadow-2xl border border-white/20">
                  <IconPlayerPlayFilled className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" />
                </div>
              </div>

              {/* Bottom Bar Player UI */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 text-white">
                {/* Progress bar line */}
                <div className="w-full h-1 bg-white/30 rounded-full mb-3 overflow-hidden relative">
                  <div className="h-full bg-red-600 w-1/12 rounded-full" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-white/90">
                    <span className="bg-black/40 px-2 py-0.5 rounded text-white/90">0:06 / 1:15</span>
                    <button className="p-1.5 rounded-full hover:bg-white/20 transition-colors hidden sm:block">
                      <IconShare className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-full hover:bg-white/20 transition-colors hidden sm:block">
                      <IconClock className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                      <IconMaximize className="w-5 h-5" />
                    </button>

                    {/* YouTube Logo Badge */}
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded text-white font-bold text-xs">
                      <div className="w-4 h-3 bg-red-600 rounded-sm flex items-center justify-center">
                        <div className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-white ml-0.5" />
                      </div>
                      <span className="tracking-tighter">YouTube</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Text below video box matching Image 2 */}
        <div className="mt-8 space-y-2 text-center text-on-surface-variant text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto opacity-90">
          <p>
            Our NEET revision songs leverage the powerful connection between music and memory,
          </p>
          <p>
            Helping your brain create stronger neural pathways for long-term retention.
          </p>
          <p>
            Rhythmic patterns activate multiple brain regions simultaneously, making difficult formulas and biological processes stick effortlessly.
          </p>
        </div>

      </div>
    </section>
  );
}
