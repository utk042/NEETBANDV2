import React, { useState } from 'react';
import { IconSearch, IconChevronRight, IconAward } from '@tabler/icons-react';

export default function SongLibrary({
  tracks = [],
  currentTrack,
  isPlaying,
  onTrackSelect,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = ['ALL', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS'];

  // Filter tracks
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.chapter && track.chapter.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (track.subject && track.subject.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesTab = activeTab === 'ALL' || track.subject?.toUpperCase() === activeTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-transparent text-on-surface pt-24 pb-32 transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70 dark:text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search chapters, doctors, or subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container border border-outline/10 rounded-xl py-4 pl-12 pr-6 text-base text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-10">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Section Title */}
        <h2 className="text-[10px] font-mono font-bold tracking-[0.2em] text-on-surface-variant/80 uppercase mb-6">
          Curriculum Playlists
        </h2>

        {/* Grid of Tracks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTracks.map(track => {
            const isActive = currentTrack?.id === track.id;
            
            return (
              <div 
                key={track.id}
                onClick={() => onTrackSelect && onTrackSelect(track)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                  isActive 
                    ? 'bg-surface-container border-primary/50 shadow-sm' 
                    : 'bg-surface border-outline/10 hover:bg-surface-container-low hover:border-outline/20'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-black/10 border border-outline/10">
                    <img 
                      src={track.cover || track.image} 
                      alt={track.title} 
                      className="w-full h-full object-cover" 
                    />
                    {isActive && isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-4 h-4 flex items-end justify-center gap-[2px]">
                          <div className="w-1 bg-white h-full animate-[bounce_0.6s_ease-in-out_infinite]" />
                          <div className="w-1 bg-white h-2/3 animate-[bounce_0.8s_ease-in-out_infinite]" />
                          <div className="w-1 bg-white h-4/5 animate-[bounce_0.5s_ease-in-out_infinite]" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Track Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base font-bold truncate ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                        {track.title}
                      </h3>
                      {track.premium && (
                        <IconAward size={14} className="text-[#f5d042] shrink-0" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant/80 truncate mt-1">
                      {track.grade || 'Class 11'} • {track.chapter} • {track.duration}
                    </p>
                  </div>
                </div>

                {/* Right Arrow */}
                <div className="shrink-0 text-on-surface-variant/60 ml-4">
                  <IconChevronRight size={20} />
                </div>
              </div>
            );
          })}
          
          {filteredTracks.length === 0 && (
            <div className="col-span-1 md:col-span-2 py-12 text-center text-on-surface-variant/60 text-sm">
              No playlists found matching your search.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
