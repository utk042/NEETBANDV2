import React, { useState, useEffect } from 'react';
import { useDialog } from '../../contexts/DialogContext';
import { IconPlus, IconPencil, IconTrash, IconVideo, IconMessage2, IconCheck, IconX } from '@tabler/icons-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ManageTestimonials() {
  const { confirm, toast } = useDialog();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const defaultForm = {
    type: 'text',
    name: '',
    role: '',
    location: '',
    avatar: '',
    quote: '',
    rating: 5,
    category: 'teacher',
    videoUrl: '',
    posterUrl: '',
    badge: '',
    tags: '',
    isActive: true,
    order: 0
  };
  
  const [formData, setFormData] = useState(defaultForm);
  const [videoMethod, setVideoMethod] = useState('link'); // 'link' or 'upload'
  const [uploading, setUploading] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('user_token');
      const response = await fetch(`${API_URL}/api/testimonials`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      } else {
        toast.error('Failed to load testimonials');
      }
    } catch (err) {
      toast.error('Error fetching testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('lms_token') || localStorage.getItem('user_token');
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('type', 'others');

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });
      const data = await response.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, [field]: data.url }));
        toast.success(`${field} uploaded successfully!`);
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      toast.error('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('user_token');
      
      const payload = { ...formData };
      if (payload.type === 'video' && typeof payload.tags === 'string') {
        payload.tags = payload.tags.split(',').map(t => t.trim()).filter(Boolean);
      }

      const url = isEditing ? `${API_URL}/api/testimonials/${formData._id}` : `${API_URL}/api/testimonials`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Testimonial ${isEditing ? 'updated' : 'created'} successfully!`);
        setIsModalOpen(false);
        fetchTestimonials();
      } else {
        toast.error(data.message || 'Error saving testimonial');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ...item,
      tags: item.tags ? item.tags.join(', ') : ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!await confirm("Delete Testimonial", "Are you sure you want to delete this testimonial?")) return;
    
    try {
      const token = localStorage.getItem('lms_token') || localStorage.getItem('user_token');
      const response = await fetch(`${API_URL}/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Testimonial deleted");
        fetchTestimonials();
      } else {
        toast.error("Failed to delete testimonial");
      }
    } catch (err) {
      toast.error("Error deleting");
    }
  };

  const testVideoLink = (e) => {
    e.preventDefault();
    if (formData.videoUrl) {
      setVideoPreviewUrl(formData.videoUrl);
    } else {
      toast.error('Please enter a video URL first');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40";
  const labelClass = "text-sm font-bold text-on-surface-variant mb-1.5 ml-1 uppercase tracking-wide text-[11px]";

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-on-surface">Testimonials</h3>
            <p className="text-on-surface-variant text-sm mt-1">Manage text and video testimonials shown on the website.</p>
          </div>
          <button 
            onClick={() => {
              setFormData(defaultForm);
              setIsEditing(false);
              setIsModalOpen(true);
            }}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <IconPlus size={18} stroke={2.5} /> Add Testimonial
          </button>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-variant/30 border-b border-outline-variant/30">
                  <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider">Name</th>
                  <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider">Role</th>
                  <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-bold text-sm text-on-surface uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-on-surface-variant">Loading...</td>
                  </tr>
                ) : testimonials.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-on-surface-variant">No testimonials found.</td>
                  </tr>
                ) : (
                  testimonials.map(item => (
                    <tr key={item._id} className="border-b border-outline-variant/10 hover:bg-surface-variant/20 transition-colors">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          item.type === 'video' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                        }`}>
                          {item.type === 'video' ? <IconVideo size={14} /> : <IconMessage2 size={14} />}
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-on-surface">
                        <div className="flex items-center gap-3">
                          <img 
                            src={item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`} 
                            alt={item.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`;
                            }}
                            className="w-8 h-8 rounded-full object-cover bg-surface-container"
                          />
                          {item.name}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{item.role || '-'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          item.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-error/10 text-error'
                        }`}>
                          {item.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(item)} className="p-2 rounded-lg bg-surface-variant/50 text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
                            <IconPencil size={18} stroke={2} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 rounded-lg bg-surface-variant/50 text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors" title="Delete">
                            <IconTrash size={18} stroke={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-high flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-3xl rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-on-surface">{isEditing ? 'Edit' : 'Add'} Testimonial</h3>
                <p className="text-on-surface-variant text-xs mt-1">Fill out the details for the testimonial.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant/50 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                <IconX size={20} stroke={2.5} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="testimonial-form" onSubmit={handleSubmit}>
                
                {/* Type Selection */}
                <div className="mb-6 flex gap-4 bg-surface-container p-2 rounded-xl">
                  <button type="button" onClick={() => setFormData({...formData, type: 'text'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.type === 'text' ? 'bg-surface shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    Text Testimonial
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'video'})} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${formData.type === 'video' ? 'bg-surface shadow text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    Video Testimonial
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Name *</label>
                    <input type="text" required placeholder="e.g. Dr. Rajeshwari Verma" className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Role</label>
                    <input type="text" placeholder="e.g. Senior Biology Faculty" className={inputClass} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>Location</label>
                    <input type="text" placeholder="e.g. Kota, Rajasthan" className={inputClass} value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className={labelClass}>Category</label>
                    <select className={inputClass} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                      {formData.type === 'video' && <option value="teachers">Teachers (Video)</option>}
                      {formData.type === 'video' && <option value="students">Students (Video)</option>}
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className={labelClass}>Profile Picture (Optional)</label>
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="URL or upload..." className={inputClass} value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})} />
                      <label className="bg-surface-variant hover:bg-surface-variant/80 text-on-surface-variant px-3 py-3 rounded-xl cursor-pointer transition-colors text-sm font-bold">
                        Upload
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'avatar')} />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <label className={labelClass}>Quote</label>
                    <textarea placeholder="The testimonial text..." className={`${inputClass} min-h-[100px] resize-y`} value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})}></textarea>
                  </div>

                  {/* Video Specific Fields */}
                  {formData.type === 'video' && (
                    <>
                      <div className="flex flex-col md:col-span-2">
                        <label className={labelClass}>Video Input Method</label>
                        <div className="flex gap-4 mb-2">
                          <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                            <input type="radio" name="videoMethod" checked={videoMethod === 'link'} onChange={() => setVideoMethod('link')} />
                            Provide URL
                          </label>
                          <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                            <input type="radio" name="videoMethod" checked={videoMethod === 'upload'} onChange={() => setVideoMethod('upload')} />
                            Upload File
                          </label>
                        </div>

                        {videoMethod === 'link' ? (
                          <div className="flex gap-2">
                            <input type="text" required placeholder="https://example.com/video.mp4" className={inputClass} value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} />
                            <button type="button" onClick={testVideoLink} className="bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 px-4 rounded-xl font-bold text-sm whitespace-nowrap">
                              Test Link
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <label className="bg-surface-variant hover:bg-surface-variant/80 text-on-surface-variant px-4 py-8 rounded-xl cursor-pointer transition-colors flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40">
                              <span className="font-bold mb-1">{uploading ? 'Uploading...' : 'Click to Upload Video'}</span>
                              <span className="text-xs">MP4, WebM, or OGG</span>
                              <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'videoUrl')} />
                            </label>
                            {formData.videoUrl && <p className="text-xs text-emerald-500 flex items-center gap-1"><IconCheck size={14}/> Video Uploaded</p>}
                          </div>
                        )}

                        {videoPreviewUrl && (
                          <div className="mt-4 p-2 bg-black rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                            <video src={videoPreviewUrl} controls className="max-h-full max-w-full" onError={() => toast.error('Failed to load video from this URL. Make sure it points directly to a video file.')} />
                            <button onClick={() => setVideoPreviewUrl('')} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black">
                              <IconX size={16}/>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <label className={labelClass}>Badge / Achievement</label>
                        <input type="text" placeholder="e.g. Senior Faculty, NEET AIR 42" className={inputClass} value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} />
                      </div>

                      <div className="flex flex-col">
                        <label className={labelClass}>Tags (comma separated)</label>
                        <input type="text" placeholder="e.g. Genetics, Top Ranker" className={inputClass} value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
                      </div>

                      <div className="flex flex-col md:col-span-2">
                        <label className={labelClass}>Video Poster (Thumbnail) URL</label>
                        <div className="flex items-center gap-2">
                          <input type="text" placeholder="URL or upload image..." className={inputClass} value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} />
                          <label className="bg-surface-variant hover:bg-surface-variant/80 text-on-surface-variant px-3 py-3 rounded-xl cursor-pointer transition-colors text-sm font-bold">
                            Upload
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'posterUrl')} />
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="flex flex-col">
                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary/50" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                      <span className="text-sm font-bold text-on-surface">Active (visible on site)</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest/50 rounded-b-2xl flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button 
                form="testimonial-form"
                type="submit" 
                disabled={uploading}
                className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 shadow-md shadow-primary/20 whitespace-nowrap disabled:opacity-50"
              >
                <IconCheck size={18} stroke={2.5} /> Save Testimonial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
