import React, { useState, useEffect } from 'react';
import { getSongs, createSong, updateSong, deleteSong, uploadFile } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';
import { IconPlus, IconMusic, IconCrown, IconLink, IconEdit, IconTrash, IconUpload } from '@tabler/icons-react';

export default function ManageSongs() {
  const { toast, confirm } = useDialog();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '', class: '', subject: '', audioUrl: '', thumbnailUrl: '', lyricsUrl: '', duration: '', isPremium: true
  });
  const [editingSongId, setEditingSongId] = useState(null);

  const handleFileUpload = async (e, field, folderType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadFile(file, folderType);
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const fullUrl = `${backendUrl}${res.url}`;
      setFormData(prev => ({ ...prev, [field]: fullUrl }));
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error("Failed to upload file: " + err.message);
    }
  };

  useEffect(() => {
    if (formData.audioUrl) {
      const audio = new Audio(formData.audioUrl);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
          setFormData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
        }
      };
    }
  }, [formData.audioUrl]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);

  const handleOpenAddModal = () => {
    setFormData({ title: '', class: '', subject: '', audioUrl: '', thumbnailUrl: '', lyricsUrl: '', duration: '', isPremium: true });
    setEditingSongId(null);
    setIsAddSongModalOpen(true);
  };

  const handleEditClick = (song) => {
    setFormData({
      title: song.title || '',
      class: song.class || '',
      subject: song.subject || '',
      audioUrl: song.audioUrl || '',
      thumbnailUrl: song.thumbnailUrl || '',
      lyricsUrl: song.lyricsUrl || '',
      duration: song.duration || '',
      isPremium: song.isPremium !== false
    });
    setEditingSongId(song._id);
    setIsAddSongModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (!await confirm("Delete Song", "Are you sure you want to delete this song?")) return;
    try {
      await deleteSong(id);
      toast.success("Song deleted successfully");
      fetchSongs();
    } catch (err) {
      toast.error("Failed to delete song: " + err.message);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const data = await getSongs();
      setSongs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSongId) {
        await updateSong(editingSongId, formData);
        toast.success("Song updated successfully");
      } else {
        await createSong(formData);
        toast.success("Song added successfully");
      }
      setFormData({ title: '', class: '', subject: '', audioUrl: '', thumbnailUrl: '', lyricsUrl: '', duration: '', isPremium: true });
      setEditingSongId(null);
      setIsAddSongModalOpen(false);
      fetchSongs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40";
  const labelClass = "text-sm font-bold text-on-surface-variant mb-1.5 ml-1 uppercase tracking-wide text-[11px]";

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Existing Songs Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-on-surface">Manage Songs</h2>
          <button 
            onClick={handleOpenAddModal}
            className="bg-primary text-on-primary px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
          >
            <IconPlus size={20} /> Add Song
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">Loading songs...</div>
        ) : (
          <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-[var(--border-floating-card)] shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-floating-card)]">
                  <th className="p-4 font-semibold text-on-surface-variant">Title</th>
                  <th className="p-4 font-semibold text-on-surface-variant">Class</th>
                  <th className="p-4 font-semibold text-on-surface-variant">Subject</th>
                  <th className="p-4 font-semibold text-on-surface-variant">Type</th>
                  <th className="p-4 font-semibold text-on-surface-variant text-center">Plays</th>
                  <th className="p-4 font-semibold text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {songs.map(song => (
                  <tr key={song._id} className="border-b border-[var(--border-floating-card)] hover:bg-surface-container/50">
                    <td className="p-4 font-medium text-on-surface">{song.title}</td>
                    <td className="p-4 text-on-surface-variant">{song.class || '-'}</td>
                    <td className="p-4 text-on-surface-variant">{song.subject || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${song.isPremium ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                        {song.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-on-surface">{song.playCount || 0}</td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(song)}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container rounded-lg hover:bg-primary/10"
                        title="Edit Song"
                      >
                        <IconEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(song._id)}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors bg-surface-container rounded-lg hover:bg-error/10"
                        title="Delete Song"
                      >
                        <IconTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {songs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-on-surface-variant">No songs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add Song Modal */}
      {isAddSongModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-high flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-on-surface">{editingSongId ? 'Edit Song' : 'Add New Song'}</h3>
                <p className="text-on-surface-variant text-xs mt-1">{editingSongId ? 'Update details of the song.' : 'Upload a new track to the LMS library.'}</p>
              </div>
              <button 
                onClick={() => setIsAddSongModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="add-song-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="flex flex-col">
                    <label className={labelClass}>Song Title</label>
                    <input type="text" required placeholder="e.g. The Cell Cycle Rap" className={inputClass} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Class / Grade <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                    <input type="text" placeholder="e.g. Class 11" className={inputClass} value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Subject <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                    <input type="text" placeholder="e.g. Biology" className={inputClass} value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                  </div>

                  <div className="flex flex-col md:col-span-2 mt-2">
                    <div className="flex items-center gap-2 mb-4">
                      <IconLink size={18} className="text-on-surface-variant" />
                      <h4 className="font-bold text-on-surface">Media URLs</h4>
                      <div className="h-px bg-outline-variant/30 flex-1 ml-2"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                      <div className="flex flex-col">
                        <label className={labelClass}>Audio File URL</label>
                        <input type="url" required placeholder="https://..." className={inputClass} value={formData.audioUrl} onChange={e => setFormData({...formData, audioUrl: e.target.value})} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={`${labelClass} mb-0`}>Thumbnail Image URL <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                          <label className="text-xs font-bold text-primary cursor-pointer hover:underline flex items-center gap-1">
                            <IconUpload size={14} /> Upload Image
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'thumbnailUrl', 'songs/thumbnails')} />
                          </label>
                        </div>
                        <input type="url" placeholder="https://..." className={inputClass} value={formData.thumbnailUrl} onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={`${labelClass} mb-0`}>Lyrics (.ttml) URL <span className="opacity-60 lowercase font-normal">(optional)</span></label>
                          <label className="text-xs font-bold text-primary cursor-pointer hover:underline flex items-center gap-1">
                            <IconUpload size={14} /> Upload Lyrics
                            <input type="file" className="hidden" accept=".ttml,.txt,.lrc" onChange={e => handleFileUpload(e, 'lyricsUrl', 'songs/lyrics')} />
                          </label>
                        </div>
                        <input type="url" placeholder="https://..." className={inputClass} value={formData.lyricsUrl} onChange={e => setFormData({...formData, lyricsUrl: e.target.value})} />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelClass}>Duration (seconds) <span className="opacity-60 lowercase font-normal">(auto-fetched)</span></label>
                        <input type="number" placeholder="Auto-calculated..." className={inputClass} value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 mt-2">
                    <label className="flex items-center justify-between md:justify-start cursor-pointer group w-full md:w-auto md:inline-flex md:gap-6 p-4 rounded-xl border border-outline-variant/40 bg-surface-variant/20 hover:bg-surface-variant/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${formData.isPremium ? 'bg-amber-500/10 text-amber-500' : 'bg-outline-variant/20 text-on-surface-variant'}`}>
                          <IconCrown size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-on-surface text-[15px]">Premium Track</div>
                          <div className="text-xs text-on-surface-variant mt-0.5">Only available to subscribed users</div>
                        </div>
                      </div>
                      <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPremium ? 'bg-amber-500' : 'bg-outline-variant/50'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPremium ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                      <input type="checkbox" className="sr-only" checked={formData.isPremium} onChange={e => setFormData({...formData, isPremium: e.target.checked})} />
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setIsAddSongModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                form="add-song-form"
                type="submit" 
                className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 whitespace-nowrap"
              >
                {editingSongId ? <><IconEdit size={18} stroke={2.5} /> Update Song</> : <><IconPlus size={18} stroke={2.5} /> Add Song</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
