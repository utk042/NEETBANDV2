import React, { useState, useEffect } from 'react';
import { IconMusic } from '@tabler/icons-react';

const AD_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder Ad 1
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder Ad 2
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'  // Placeholder Ad 3
];

export default React.memo(function AudioAdPlayer({ item, user }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  useEffect(() => {
    setCurrentTrackIndex(0);
  }, [item._id]);

  const isFree = !user?.isPremium;
  const originalAudio = item.audioUrl || item.videoUrl;
  const tracks = isFree && originalAudio ? [...AD_URLS, originalAudio] : [originalAudio];
  
  const handleEnded = () => {
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    }
  };

  const isAd = isFree && currentTrackIndex < AD_URLS.length && originalAudio;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-container/20 border border-outline/10 rounded-2xl p-6">
      <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
        <IconMusic size={28} className="text-purple-400" />
      </div>
      <p className="text-sm font-semibold text-on-surface mb-2">
        {isAd ? `Playing Ad ${currentTrackIndex + 1} of ${AD_URLS.length}...` : item.title}
      </p>
      {tracks[currentTrackIndex] ? (
        <audio 
          controls 
          autoPlay={currentTrackIndex > 0} 
          src={tracks[currentTrackIndex]} 
          onEnded={handleEnded}
          className="w-full max-w-md mt-4" 
        />
      ) : (
        <p className="text-xs text-on-surface-variant/60">No audio URL provided for this song yet.</p>
      )}
    </div>
  );
});
