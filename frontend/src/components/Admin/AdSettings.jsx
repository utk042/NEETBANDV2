import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { IconHelpCircle, IconX, IconInfoCircle, IconMusic, IconAlertCircle } from '@tabler/icons-react';

export default function AdSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { alert } = useDialog();

  const [audioRollPositions, setAudioRollPositions] = useState([20, 50, 90]);
  const [audioRollUrl, setAudioRollUrl] = useState('');
  const [audioRollsEnabled, setAudioRollsEnabled] = useState(true);
  const [popupPositions, setPopupPositions] = useState([10, 40, 75]);
  const [popupHtml, setPopupHtml] = useState('');
  const [popupsEnabled, setPopupsEnabled] = useState(true);
  const [guestAdUrl, setGuestAdUrl] = useState('');
  const [adBannerText, setAdBannerText] = useState('Study without interruptions. Upgrade to Premium for an ad-free experience.');
  const [adTextColor, setAdTextColor] = useState('#d97706');
  const [configVersion, setConfigVersion] = useState(null);

  // Upload progress state
  const [uploadingAudio, setUploadingAudio] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const res = await api.get('/api/ad-config');
        if (!isMounted) return;
        const data = res.data;
        if (data) {
          setConfigVersion(data.__v !== undefined ? data.__v : null);
          setAudioRollPositions(data.audioRollPositions || [20, 50, 90]);
          setAudioRollUrl(data.audioRollUrl || '');
          setAudioRollsEnabled(data.audioRollsEnabled !== undefined ? data.audioRollsEnabled : true);
          setPopupPositions(data.popupPositions || [10, 40, 75]);
          setPopupHtml(data.popupHtml || '');
          setPopupsEnabled(data.popupsEnabled !== undefined ? data.popupsEnabled : true);
          if (data.guestAdUrl !== undefined) {
            setGuestAdUrl(data.guestAdUrl);
          }
          if (data.adBannerText !== undefined) {
            setAdBannerText(data.adBannerText);
          }
          if (data.adTextColor !== undefined) {
            setAdTextColor(data.adTextColor);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching ad config', err);
        alert('Error', 'Failed to load ad configuration.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    const isInvalid = (p) => p !== '' && (isNaN(parseInt(p, 10)) || p < 0 || p > 100);
    if (audioRollPositions.some(isInvalid) || popupPositions.some(isInvalid)) {
      alert('Validation Error', 'All positions must be valid numbers between 0 and 100. Please correct or delete invalid fields before saving.');
      return;
    }
    
    setSaving(true);
    try {
      const res = await api.put('/api/ad-config', {
        version: configVersion,
        audioRollPositions: Array.from(new Set(audioRollPositions.filter(p => p !== '').map(p => parseInt(p, 10)))).sort((a,b)=>a-b),
        audioRollUrl,
        audioRollsEnabled,
        popupPositions: Array.from(new Set(popupPositions.filter(p => p !== '').map(p => parseInt(p, 10)))).sort((a,b)=>a-b),
        popupHtml,
        popupsEnabled,
        guestAdUrl,
        adBannerText,
        adTextColor,
      });
      if (res.data && res.data.__v !== undefined) {
        setConfigVersion(res.data.__v);
      }
      alert('Success', 'Ad configuration saved successfully.');
    } catch (err) {
      console.error('Error saving ad config', err);
      if (err.response?.status === 409) {
        alert('Conflict', err.response.data.error || 'Ad configuration was updated by another user. Please refresh and try again.');
      } else {
        alert('Error', 'Failed to save ad configuration.');
      }
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
      if (!res?.data?.url) throw new Error("Invalid response format: Missing URL");
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
    // Preserve the raw input so the user can see what they type. Validation happens on save.
    const val = value;
    
    if (type === 'audio') {
      const newPos = [...audioRollPositions];
      newPos[index] = val;
      setAudioRollPositions(newPos);
    } else {
      const newPos = [...popupPositions];
      newPos[index] = val;
      setPopupPositions(newPos);
    }
  };

  const addPosition = (type) => {
    const list = type === 'audio' ? audioRollPositions : popupPositions;
    if (list.length >= 101) {
      alert('Limit Reached', 'You cannot add more than 101 positions (0-100).');
      return;
    }
    let nextPos = 50;
    while (list.includes(nextPos) && nextPos <= 100) nextPos += 10;
    if (nextPos > 100) {
      nextPos = 0;
      while (list.includes(nextPos) && nextPos <= 100) nextPos += 1;
    }
    
    if (type === 'audio') {
      setAudioRollPositions([...audioRollPositions, nextPos]);
    } else {
      setPopupPositions([...popupPositions, nextPos]);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Global Advertisement Triggers</h1>
          <p className="text-on-surface-variant text-sm mt-1">Configure audio and popup advertisements for all songs. Shown to guest users and free members.</p>
        </div>
        <button
          onClick={() => setShowHelpModal(true)}
          className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 shrink-0"
          title="How Ad Settings Work"
        >
          <IconHelpCircle size={20} className="shrink-0" />
          <span>How It Works</span>
        </button>
      </div>

      {/* AD NOTICE BANNER & STYLING SECTION */}
      <div className="bg-surface border border-outline-variant/30 p-4 md:p-6 rounded-2xl shadow-xl space-y-4 md:space-y-6">
        <h2 className="text-2xl font-semibold text-on-surface">Ad Notice Banner & Styling</h2>
        <p className="text-on-surface-variant text-sm">Customize the text message and text color/darkness displayed in audio players when an advertisement plays.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Ad Notice Message</label>
            <textarea 
              value={adBannerText}
              onChange={(e) => setAdBannerText(e.target.value)}
              rows={2}
              placeholder="Study without interruptions. Upgrade to Premium for an ad-free experience."
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary text-sm font-medium"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-on-surface mb-2">Message Text Color (Hex / CSS Color)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={adTextColor && adTextColor.startsWith('#') ? adTextColor : '#d97706'}
                  onChange={(e) => setAdTextColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-outline-variant/30 bg-transparent p-0"
                />
                <input 
                  type="text" 
                  value={adTextColor}
                  onChange={(e) => setAdTextColor(e.target.value)}
                  placeholder="#d97706 (leave blank for high-contrast auto amber)"
                  className="flex-1 bg-surface-container border border-outline-variant/30 rounded-xl p-2.5 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Banner Live Preview</label>
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 flex items-center justify-center">
              <span 
                className="text-xs font-bold uppercase tracking-wide text-center"
                style={{ color: adTextColor || '#d97706' }}
              >
                {adBannerText || 'Study without interruptions. Upgrade to Premium for an ad-free experience.'}
              </span>
            </div>
          </div>
        </div>
      </div>

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
                  className={`w-16 bg-transparent border-none focus:ring-0 p-0 text-center text-lg font-bold ${
                    (pos === '' || isNaN(parseInt(pos, 10)) || pos < 0 || pos > 100) 
                      ? 'text-red-500 border-b-2 border-red-500' 
                      : 'text-on-surface'
                  }`}
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
                  className={`w-16 bg-transparent border-none focus:ring-0 p-0 text-center text-lg font-bold ${
                    (pos === '' || isNaN(parseInt(pos, 10)) || pos < 0 || pos > 100) 
                      ? 'text-red-500 border-b-2 border-red-500' 
                      : 'text-on-surface'
                  }`}
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
          disabled={saving || uploadingAudio}
          className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {saving ? 'Saving...' : 'Save All Configurations'}
        </button>
      </div>

      {/* HELP & DOCUMENTATION MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface relative border border-outline-variant/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-outline-variant/30 bg-surface-container/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <IconHelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">How Ad Settings Work</h3>
                  <p className="text-xs text-on-surface-variant">Complete guide to central vs song-level ad triggers.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface hover:bg-surface-variant transition-colors"
                title="Close"
              >
                <IconX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed text-on-surface">
              {/* Section 1: Ad Hierarchy */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <IconInfoCircle size={18} />
                  <h4>1. Central vs Song-Level Ad Triggers</h4>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/30 p-4 rounded-xl space-y-2 text-xs text-on-surface-variant">
                  <p><strong className="text-on-surface">Central (Global) Level:</strong> Setting Audio Roll Ads to <strong>Disabled</strong> here acts as the <strong>Master Kill Switch</strong> — shutting off audio ads site-wide across all songs.</p>
                  <p><strong className="text-on-surface">Song Level:</strong> When Global is Enabled, you can edit individual songs in <em>Manage Songs</em> to toggle audio ads for specific tracks, or upload custom audio watermark URLs and custom percentage positions.</p>
                </div>
              </div>

              {/* Section 2: Audio Roll Ads */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <IconMusic size={18} />
                  <h4>2. Audio Roll Ads (Mid-Roll)</h4>
                </div>
                <p className="text-on-surface-variant text-xs">
                  Audio roll ads pause the main study song at specified percentage milestones (e.g. 20%, 50%, 90%), play the uploaded MP3 ad, and automatically resume main music playback when finished.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-2">
                  <IconAlertCircle size={16} className="shrink-0" />
                  <span>Note: Audio Roll ads only trigger during active playback and filter out 0% start triggers to ensure smooth song playback.</span>
                </div>
              </div>

              {/* Section 3: Popup HTML Ads */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <span className="font-mono text-xs bg-primary/20 px-1.5 py-0.5 rounded">&lt;/&gt;</span>
                  <h4>3. Popup HTML Ads</h4>
                </div>
                <p className="text-on-surface-variant text-xs">
                  Popups display visual HTML content/banners at specified percentages (e.g. 10%, 40%, 75%). Popups appear cleanly on screen <strong>without pausing the music</strong>.
                </p>
              </div>

              {/* Section 4: Guest User Restriction */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <IconInfoCircle size={18} />
                  <h4>4. Guest User Restriction &amp; Ad</h4>
                </div>
                <p className="text-on-surface-variant text-xs">
                  Guest users (not logged in) are permitted to sample the first song of any chapter up to <strong>20% of its duration</strong>. At 20%, the song pauses, the <strong>Guest Audio Ad</strong> plays, and a prompt invites the guest to log in or upgrade.
                </p>
              </div>

              {/* Section 5: Notice Banner Text & Color */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-base">
                  <IconInfoCircle size={18} />
                  <h4>5. Ad Notice Banner Message &amp; Styling</h4>
                </div>
                <p className="text-on-surface-variant text-xs">
                  The Ad Notice Message (e.g., <em>&quot;Study without interruptions. Upgrade to Premium for an ad-free experience.&quot;</em>) and custom hex text color appear animated across desktop and mobile audio players whenever an ad is playing.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-outline-variant/30 bg-surface-container/40 flex justify-end shrink-0">
              <button
                onClick={() => setShowHelpModal(false)}
                className="bg-primary text-on-primary font-bold px-6 py-2 rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all shadow-md"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
