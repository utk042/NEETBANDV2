import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';

export default function AdSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { alert } = useDialog();

  const [audioRollPositions, setAudioRollPositions] = useState([20, 50, 90]);
  const [audioRollUrl, setAudioRollUrl] = useState('');
  const [audioRollsEnabled, setAudioRollsEnabled] = useState(true);
  const [popupPositions, setPopupPositions] = useState([10, 40, 75]);
  const [popupHtml, setPopupHtml] = useState('');
  const [popupsEnabled, setPopupsEnabled] = useState(true);
  const [guestAdUrl, setGuestAdUrl] = useState('C:\\Users\\UTKARSH\\Downloads\\Post Roll Ad.mp3.mpeg');

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
        setAudioRollsEnabled(data.audioRollsEnabled !== undefined ? data.audioRollsEnabled : true);
        setPopupPositions(data.popupPositions || [10, 40, 75]);
        setPopupHtml(data.popupHtml || '');
        setPopupsEnabled(data.popupsEnabled !== undefined ? data.popupsEnabled : true);
        if (data.guestAdUrl !== undefined) {
          setGuestAdUrl(data.guestAdUrl);
        }
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
        audioRollsEnabled,
        popupPositions,
        popupHtml,
        popupsEnabled,
        guestAdUrl,
      });
      alert('Success', 'Ad configuration saved successfully.');
    } catch (err) {
      console.error('Error saving ad config', err);
      alert('Error', 'Failed to save ad configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleAudioUpload = async (e, type = 'roll') => {
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
      if (type === 'guest') {
        setGuestAdUrl(res.data.url);
      } else {
        setAudioRollUrl(res.data.url);
      }
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
    return <div className="p-6 text-on-surface-variant">Loading Ad Settings...</div>;
  }

  return (
    <div className="text-on-surface max-w-4xl mx-auto space-y-8 md:space-y-10">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Global Advertisement Triggers</h1>
      <p className="text-on-surface-variant">Configure audio and popup advertisements for all songs. These will be shown to guest users and non-premium members.</p>

      {/* AUDIO ROLL SECTION */}
      <div className="bg-surface border border-outline-variant/30 p-4 md:p-6 rounded-2xl shadow-xl space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
          <div>
            <h2 className="text-2xl font-semibold text-on-surface">Audio Roll Ads</h2>
            <p className="text-on-surface-variant text-sm">The song will pause at these percentages, play the uploaded audio ad, and then resume.</p>
          </div>
          <label className="flex items-center cursor-pointer gap-3 bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/30 shrink-0 select-none">
            <span className={`text-sm font-semibold ${audioRollsEnabled ? 'text-primary' : 'text-on-surface-variant'}`}>
              {audioRollsEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <input 
              type="checkbox" 
              checked={audioRollsEnabled} 
              onChange={(e) => setAudioRollsEnabled(e.target.checked)} 
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
          </label>
        </div>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-on-surface">Upload Audio Ad (MP3/WAV)</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={(e) => handleAudioUpload(e, 'roll')}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary/90 file:cursor-pointer text-on-surface-variant cursor-pointer"
            />
            {uploadingAudio && <span className="text-primary animate-pulse text-sm">Uploading...</span>}
          </div>
          {audioRollUrl && (
            <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 break-all bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <strong>Current Ad:</strong> {audioRollUrl}
              <audio 
                controls 
                src={audioRollUrl.startsWith('http') ? audioRollUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${audioRollUrl}`} 
                className="mt-2 h-10 w-full max-w-full" 
              />
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-outline-variant/30">
          <label className="block text-sm font-medium text-on-surface">Trigger Positions (% of song)</label>
          <div className="flex flex-wrap gap-3">
            {audioRollPositions.map((pos, i) => (
              <div key={i} className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30">
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={pos} 
                  onChange={(e) => handlePositionChange('audio', i, e.target.value)}
                  className="w-16 bg-transparent border-none text-on-surface focus:ring-0 p-0 text-center text-lg font-bold"
                />
                <span className="text-on-surface-variant">%</span>
                <button aria-label="Remove audio position" onClick={() => removePosition('audio', i)} className="text-red-500 hover:text-red-400 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold" title="Remove">
                  ✕
                </button>
              </div>
            ))}
            <button 
              onClick={() => addPosition('audio')} 
              className="flex items-center justify-center w-12 h-[50px] bg-surface-container hover:bg-surface-variant border border-outline-variant/30 rounded-lg text-on-surface transition-colors font-bold text-xl"
              title="Add Position"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* POPUP SECTION */}
      <div className="bg-surface border border-outline-variant/30 p-4 md:p-6 rounded-2xl shadow-xl space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
          <div>
            <h2 className="text-2xl font-semibold text-on-surface">Popup HTML Ads</h2>
            <p className="text-on-surface-variant text-sm">The popup will appear at these percentages. It will not pause the music.</p>
          </div>
          <label className="flex items-center cursor-pointer gap-3 bg-surface-container px-4 py-2 rounded-xl border border-outline-variant/30 shrink-0 select-none">
            <span className={`text-sm font-semibold ${popupsEnabled ? 'text-primary' : 'text-on-surface-variant'}`}>
              {popupsEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <input 
              type="checkbox" 
              checked={popupsEnabled} 
              onChange={(e) => setPopupsEnabled(e.target.checked)} 
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary relative"></div>
          </label>
        </div>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-on-surface">Popup Content (HTML / Text)</label>
          <textarea 
            value={popupHtml}
            onChange={(e) => setPopupHtml(e.target.value)}
            rows={6}
            placeholder="<div class='text-center'><h2>Special Offer!</h2><button>Click Here</button></div>"
            className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-4 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
          />
          {popupHtml && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-on-surface mb-2">Live Preview</label>
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 relative flex items-center justify-center min-h-[100px] overflow-hidden text-on-surface">
                <div dangerouslySetInnerHTML={{ __html: popupHtml }} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-outline-variant/30">
          <label className="block text-sm font-medium text-on-surface">Trigger Positions (% of song)</label>
          <div className="flex flex-wrap gap-3">
            {popupPositions.map((pos, i) => (
              <div key={i} className="flex items-center gap-2 bg-surface-container px-3 py-2 rounded-lg border border-outline-variant/30">
                <input 
                  type="number" 
                  min="0" max="100" 
                  value={pos} 
                  onChange={(e) => handlePositionChange('popup', i, e.target.value)}
                  className="w-16 bg-transparent border-none text-on-surface focus:ring-0 p-0 text-center text-lg font-bold"
                />
                <span className="text-on-surface-variant">%</span>
                <button aria-label="Remove popup position" onClick={() => removePosition('popup', i)} className="text-red-500 hover:text-red-400 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center font-bold" title="Remove">
                  ✕
                </button>
              </div>
            ))}
            <button 
              onClick={() => addPosition('popup')} 
              className="flex items-center justify-center w-12 h-[50px] bg-surface-container hover:bg-surface-variant border border-outline-variant/30 rounded-lg text-on-surface transition-colors font-bold text-xl"
              title="Add Position"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* GUEST AD SECTION */}
      <div className="bg-surface border border-outline-variant/30 p-4 md:p-6 rounded-2xl shadow-xl space-y-4 md:space-y-6">
        <h2 className="text-2xl font-semibold text-on-surface">Guest User Ad</h2>
        <p className="text-on-surface-variant text-sm">For guest users, the song will pause at 20%, play this ad, and then show the login required popup.</p>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-on-surface">Upload Guest Audio Ad (MP3/WAV)</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={(e) => handleAudioUpload(e, 'guest')}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-primary/90 file:cursor-pointer text-on-surface-variant cursor-pointer"
            />
          </div>
          
          <label className="block text-sm font-medium text-on-surface mt-4">Manual URL / Path</label>
          <input 
            type="text" 
            value={guestAdUrl}
            onChange={(e) => setGuestAdUrl(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
          />

          {guestAdUrl && (
            <div className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 break-all bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <strong>Current Ad:</strong> {guestAdUrl}
              {guestAdUrl.startsWith('http') || guestAdUrl.startsWith('/') ? (
                <audio 
                  controls 
                  src={guestAdUrl.startsWith('http') ? guestAdUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${guestAdUrl}`} 
                  className="mt-2 h-10 w-full max-w-full" 
                />
              ) : (
                <p className="mt-2 text-amber-600 dark:text-amber-400 font-medium">Preview not available for local absolute paths.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {saving ? 'Saving...' : 'Save All Configurations'}
        </button>
      </div>
    </div>
  );
}
