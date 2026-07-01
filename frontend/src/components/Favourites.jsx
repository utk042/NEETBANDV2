import React from 'react';
import { IconVolume, IconPlayerPlayFilled, IconPlayerPauseFilled, IconHeart, IconDots, IconShare } from '@tabler/icons-react';

export default function Favourites({ tracks, favoritedTrackIds, onToggleFavorite, currentTrack, isPlaying, onTrackSelect }) {
  const favoriteTracks = tracks.filter(t => favoritedTrackIds?.includes(t.id));

  return (
    <section className="py-32 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300 min-h-screen">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-outline),0.1)] to-transparent"></div>
      
      <div className="max-w-container-max mx-auto">
        <div className="mb-16">
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-3 text-balance">Your Favourites</h2>
          <p className="font-body-md font-normal text-lg text-on-surface-variant opacity-80">
            {favoriteTracks.length > 0 ? "Quick access to your most important study tracks." : "You haven't added any tracks to your favourites yet."}
          </p>
        </div>

        {favoriteTracks.length > 0 && (
          <div className="bg-surface-container-lowest rounded-3xl border border-primary/20 shadow-[var(--shadow-floating-card)] relative z-10 overflow-hidden flex flex-col">
            <div className="hidden md:flex px-6 py-3 text-on-surface-variant font-label-sm text-xs uppercase tracking-widest opacity-60 font-semibold border-b border-[var(--border-nav-layout)]">
              <div className="w-12"></div>
              <div className="flex-1">Title</div>
              <div className="w-24 lg:w-48 text-left">Class</div>
              <div className="w-28 lg:w-32 text-right"></div>
            </div>

            <div className="w-full flex flex-col z-10">
              {favoriteTracks.map((track, idx) => {
                const isCurrent = currentTrack && currentTrack.id === track.id;
                const displayIndex = idx + 1 < 10 ? `0${idx + 1}` : idx + 1;
                
                return (
                  <div 
                    key={track.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onTrackSelect(track)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onTrackSelect(track);
                      }
                    }}
                    className={`relative flex items-center px-4 md:px-6 py-4 transition-all duration-300 group cursor-pointer border-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                      isCurrent 
                        ? 'bg-primary/12 dark:bg-primary/18 border-primary/45 shadow-[0_2px_12px_rgba(201,162,39,0.08)]' 
                        : 'bg-transparent border-[var(--border-nav-layout)]/65 hover:bg-surface-container-low/50'
                    } ${track.premium ? 'opacity-85 hover:opacity-100' : ''}`}
                  >
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden relative border border-[var(--border-floating-card)] flex-shrink-0 bg-surface-container block">
                        <img className="object-cover w-full h-full" alt={track.title} src={track.cover} width={40} height={40}/>
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {isCurrent && isPlaying ? (
                            <IconPlayerPauseFilled size={20} className="text-white" aria-hidden="true" />
                          ) : (
                            <IconPlayerPlayFilled size={20} className="text-white translate-x-[1px]" aria-hidden="true" />
                          )}
                        </div>
                        {isCurrent && isPlaying && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <IconVolume size={20} className="text-primary animate-pulse" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1 flex flex-col">
                        <div className="font-headline-md text-[15px] md:text-base group-hover:text-primary transition-colors font-bold flex items-center gap-2 truncate">
                          <span className={`font-normal transition-colors duration-300 flex items-center flex-shrink-0 w-6 md:w-auto ${isCurrent ? 'text-primary' : 'text-on-surface-variant/80'}`}>
                            {isCurrent ? (
                               isPlaying ? (
                                  <IconVolume size={18} className="text-primary animate-pulse flex-shrink-0" aria-hidden="true" />
                                ) : (
                                  <IconPlayerPlayFilled size={18} className="text-primary flex-shrink-0 translate-x-[1px]" aria-hidden="true" />
                                )
                            ) : (
                              displayIndex
                            )}
                          </span>
                          <span className={`truncate ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>{track.title}</span>
                          {track.premium && (
                            <span className="px-1.5 py-[1px] rounded-lg text-[8px] bg-primary/10 text-primary border border-primary/20 tracking-wider flex-shrink-0 font-normal hidden sm:inline-block">
                              PREMIUM
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-on-surface-variant/70 md:hidden mt-0.5 truncate pl-8">{track.chapter}</span>
                      </div>
                    </div>

                    <div className="hidden md:block w-24 lg:w-48 text-left font-body-md text-sm text-on-surface-variant font-medium truncate pr-4">
                      Class 12
                    </div>
                    
                    <div className="w-auto md:w-28 lg:w-32 flex justify-end items-center gap-1 md:gap-3 text-on-surface-variant/60 flex-shrink-0">
                      <button className="hover:text-primary transition-colors p-1 md:p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl hidden sm:block flex items-center justify-center" aria-label="More options"><IconDots size={20} className="block" /></button>
                      <button className="hover:text-primary transition-colors p-1 md:p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl hidden sm:block flex items-center justify-center" aria-label="Share track"><IconShare size={20} className="block" /></button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(track.id); }}
                        className="hover:text-primary transition-colors p-1 md:p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl flex items-center justify-center text-primary" 
                        aria-label="Remove from favorites"
                      >
                        <IconHeart size={20} className="block fill-current" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
