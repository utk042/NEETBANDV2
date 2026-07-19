import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';

export default function AdSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { alert } = useDialog();

  const [audioRollPositions, setAudioRollPositions] = useState([20, 50, 90]);
  const [audioRollUrl, setAudioRollUrl] = useState('');
  const [popupPositions, setPopupPositions] = useState([20, 50, 90]);
  const [popupHtml, setPopupHtml] = useState('');

  // Upload progress state
  const [uploadingAudio, setUploadingAudio] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/api/ad-config');
      const data = res.data;
      if (data) {
        setAudioRollPositions(data.audioRollPositions || [20, 50, 90]);
        setAudioRollUrl(data.audioRollUrl || '');
        setPopupPositions(data.popupPositions || [20, 50, 90]);
        setPopupHtml(data.popupHtml || '');
      }
    } catch (err) {
      console.error('Error fetching ad config', err);
      alert('Error', 'Failed to load ad configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/ad-config', {
        audioRollPositions,
        audioRollUrl,
        popupPositions,
        popupHtml,
      });
      alert('Success', 'Ad configuration saved successfully.');
    } catch (err) {
      console.error('Error saving ad config', err);
      alert('Error', 'Failed to save ad configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAudio(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'ads');

    try {
      // Direct axios call might be needed if API instance doesn't handle multipart easily,
      // but assuming standard api setup works:
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAudioRollUrl(res.data.url);
      alert('Success', 'Audio file uploaded successfully.');
    } catch (err) {
      console.error('Upload failed', err);
      alert('Error', 'Failed to upload audio file.');
    } finally {
      setUploadingAudio(false);
    }
  };

  const handlePositionChange = (type, index, value) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return;
    
    if (type === 'audio') {
      const newPos = [...audioRollPositions];
      newPos[index] = num;
      setAudioRollPositions(newPos);
    } else {
      const newPos = [...popupPositions];
      newPos[index] = num;
      setPopupPositions(newPos);
    }
  };

  const addPosition = (type) => {
    if (type === 'audio') {
      setAudioRollPositions([...audioRollPositions, 50]);
    } else {
      setPopupPositions([...popupPositions, 50]);
    }
  };

  const removePosition = (type, index) => {
    if (type === 'audio') {
      setAudioRollPositions(audioRollPositions.filter((_, i) => i !== index));
    } else {
      setPopupPositions(popupPositions.filter((_, i) => i !== index));
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-300">Loading Ad Settings...</div>;
  }

  return (
    <div className="p-6 text-slate-100 max-w-4xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Global Advertisement Triggers</h1>
      <p className="text-slate-400">Configure audio and popup advertisements for all songs. These will be shown to guest users and non-premium members.</p>

      {/* AUDIO ROLL SECTION */}
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-semibold text-white">Audio Roll Ads</h2>
        <p className="text-slate-400 text-sm">The song will pause at these percentages, play the uploaded audio ad, and then resume.</p>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">Upload Audio Ad (MP3/WAV)</label>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleAudioUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/90 file:cursor-pointer text-slate-300 cursor-pointer"
            />
            {uploadingAudio && <span className="text-primary animate-pulse text-sm">Uploading...</span>}
          </div>
          {audioRollUrl && (
            <div className="mt-2 text-sm text-green-400 break-all bg-green-400/10 p-3 rounded-lg border border-green-400/20">
              <strong>Current Ad:</strong> {audioRollUrl}
              <audio 
                controls 
                src={audioRollUrl.startsWith('http') ? audioRollUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${audioRollUrl}`} 
                className="mt-2 h-8 w-full max-w-md" 
              />
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <label className="block text-sm font-medium text-slate-300">Trigger Positions (% of song)</label>
          <div className="flex flex-wrap gap-3">
            {audioRollPositions.map((pos, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700">
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={pos} 
                  onChange={(e) => handlePositionChange('audio', i, e.target.value)}
                  className="w-16 bg-transparent border-none text-white focus:ring-0 p-0 text-center text-lg"
                />
                <span className="text-slate-400">%</span>
                <button aria-label="Remove audio position" onClick={() => removePosition('audio', i)} className="text-red-400 hover:text-red-300 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Remove">
                  ✕
                </button>
              </div>
            ))}
            <button 
              onClick={() => addPosition('audio')} 
              className="flex items-center justify-center w-12 h-[50px] bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition-colors"
              title="Add Position"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* POPUP SECTION */}
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-2xl font-semibold text-white">Popup HTML Ads</h2>
        <p className="text-slate-400 text-sm">The popup will appear at these percentages. It will not pause the music.</p>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">Popup Content (HTML / Text)</label>
          <textarea 
            value={popupHtml}
            onChange={(e) => setPopupHtml(e.target.value)}
            rows={6}
            placeholder="<div class='text-center'><h2>Special Offer!</h2><button>Click Here</button></div>"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
          />
          {popupHtml && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Live Preview</label>
              <div className="bg-white/5 border border-slate-700 rounded-xl p-4 relative flex items-center justify-center min-h-[100px] overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: popupHtml }} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-700/50">
          <label className="block text-sm font-medium text-slate-300">Trigger Positions (% of song)</label>
          <div className="flex flex-wrap gap-3">
            {popupPositions.map((pos, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-700">
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={pos} 
                  onChange={(e) => handlePositionChange('popup', i, e.target.value)}
                  className="w-16 bg-transparent border-none text-white focus:ring-0 p-0 text-center text-lg"
                />
                <span className="text-slate-400">%</span>
                <button aria-label="Remove popup position" onClick={() => removePosition('popup', i)} className="text-red-400 hover:text-red-300 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center" title="Remove">
                  ✕
                </button>
              </div>
            ))}
            <button 
              onClick={() => addPosition('popup')} 
              className="flex items-center justify-center w-12 h-[50px] bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-300 transition-colors"
              title="Add Position"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-black font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {saving ? 'Saving...' : 'Save All Configurations'}
        </button>
      </div>
    </div>
  );
}
