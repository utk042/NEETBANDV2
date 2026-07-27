import React from 'react';
import { IconMusic } from '@tabler/icons-react';

export default React.memo(function AudioAdPlayer({ item }) {
  const originalAudio = item.audioUrl || item.videoUrl;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-container/20 border border-outline/10 rounded-2xl p-6">
      <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
        <IconMusic size={28} className="text-purple-400" />
      </div>
      <p className="text-sm font-semibold text-on-surface mb-2">
        {item.title}
      </p>
      {originalAudio ? (
        <audio 
          controls 
          src={originalAudio} 
          className="w-full max-w-md mt-4" 
        />
      ) : (
        <p className="text-xs text-on-surface-variant/60">No audio URL provided for this song yet.</p>
      )}
    </div>
  );
});
