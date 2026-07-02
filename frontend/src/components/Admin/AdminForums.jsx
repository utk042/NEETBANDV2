import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, BarChart2, Paperclip, MessageSquare, Heart, Eye } from 'lucide-react';
import BlogEditor from './BlogEditor';
import { uploadFile } from '../../services/api';

const getErrorMessage = (error) => {
  if (!error) return "Unknown error occurred";
  let msg = error.message || String(error);
  try {
    const parsed = JSON.parse(error.message);
    if (parsed && parsed.message) {
      msg = parsed.message;
    }
  } catch (e) {
    // Not a JSON string
  }

  // Format Mongoose validation errors
  if (msg.includes("validation failed:")) {
    const parts = msg.split("validation failed:");
    const errorsPart = parts[1] || "";
    const errorList = errorsPart.split(",").map(s => s.trim()).filter(Boolean);
    const cleanErrors = errorList.map(err => {
      const fieldParts = err.split(":");
      const field = fieldParts[0] ? fieldParts[0].trim() : "";
      let detail = fieldParts[1] ? fieldParts[1].trim() : "";
      // Simplify "Path `field` is required."
      detail = detail.replace(/Path `\w+` is/, "is");
      detail = detail.replace(/Path '\w+' is/, "is");
      
      const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
      return `- ${capitalizedField}: ${detail}`;
    });
    return "Validation Error:\n" + cleanErrors.join("\n");
  }

  return msg;
};

const AdminForums = ({ api }) => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState('');
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [selectedCommentsPost, setSelectedCommentsPost] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      const uploadedUrls = [];
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileType = 'other';
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        } else if (file.type === 'application/pdf') {
          fileType = 'pdf';
        }
        
        const res = await uploadFile(file, fileType);
        const finalUrl = res.url.startsWith('http') ? res.url : `${backendUrl}${res.url}`;
        uploadedUrls.push(finalUrl);
      }
      
      const existing = attachments.trim();
      const newUrlsStr = uploadedUrls.join(', ');
      if (existing) {
        setAttachments(`${existing}, ${newUrlsStr}`);
      } else {
        setAttachments(newUrlsStr);
      }
    } catch (err) {
      console.error('File upload failed:', err);
      alert('Upload failed: ' + getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenCommentsModal = async (post) => {
    try {
      const res = await api.get(`/forums/posts/${post._id}`);
      setSelectedCommentsPost(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load comments: " + getErrorMessage(err));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await api.delete(`/forums/posts/${selectedCommentsPost._id}/comments/${commentId}`);
      const updatedPost = { ...selectedCommentsPost, comments: res.data };
      setSelectedCommentsPost(updatedPost);
      setPosts(posts.map(p => p._id === selectedCommentsPost._id ? updatedPost : p));
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment: " + getErrorMessage(err));
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/forums/posts');
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert('Error fetching posts: ' + getErrorMessage(error));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      title, 
      content, 
      attachments: attachments.split(',').map(s => s.trim()).filter(Boolean),
      isPoll,
      pollOptions: isPoll ? pollOptions.filter(o => o.trim()).map(text => ({ text })) : []
    };

    try {
      if (currentPost) {
        await api.put(`/forums/posts/${currentPost._id}`, payload);
      } else {
        await api.post('/forums/posts', payload);
      }
      setIsEditing(false);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post: ' + getErrorMessage(error));
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setTitle(post.title);
    setContent(post.content);
    setAttachments(post.attachments ? post.attachments.join(', ') : '');
    setIsPoll(post.isPoll || false);
    setPollOptions(post.pollOptions && post.pollOptions.length > 0 ? post.pollOptions.map(o => o.text) : ['', '']);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await api.delete(`/forums/posts/${id}`);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post: ' + getErrorMessage(error));
    }
  };

  const startNew = () => {
    setCurrentPost(null);
    setTitle('');
    setContent('');
    setAttachments('');
    setIsPoll(false);
    setPollOptions(['', '']);
    setIsEditing(true);
  };

  const addPollOption = () => setPollOptions([...pollOptions, '']);
  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  const removePollOption = (index) => {
    const newOptions = pollOptions.filter((_, i) => i !== index);
    setPollOptions(newOptions);
  };

  if (isEditing) {
    return (
      <div className="bg-surface border border-outline-variant rounded-2xl p-6 max-w-4xl mx-auto shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-on-surface">{currentPost ? 'Edit Post' : 'Create Post'}</h2>
          <button onClick={() => setIsEditing(false)} className="text-on-surface-variant hover:text-on-surface transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-on-surface-variant">Post Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-background border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="Enter engaging title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant">Post Content</label>
            <div className="border border-outline-variant rounded-xl overflow-hidden bg-background">
              <BlogEditor content={content} setContent={setContent} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
                <Paperclip size={16} />
                Attachments (Comma separated URLs)
              </label>
              <label className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1">
                {isUploading ? (
                  <span className="animate-pulse">Uploading...</span>
                ) : (
                  <>
                    <span>+ Upload Files</span>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleFileUpload} 
                      disabled={isUploading}
                    />
                  </>
                )}
              </label>
            </div>
            <input
              type="text"
              value={attachments}
              onChange={(e) => setAttachments(e.target.value)}
              className="w-full bg-background border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="https://link.to/file1.pdf, https://link.to/image.png"
            />
          </div>

          <div className="space-y-4 p-4 border border-outline-variant rounded-xl bg-surface-variant/20">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2">
                <BarChart2 size={16} className="text-primary" />
                Include a Poll
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isPoll} onChange={(e) => setIsPoll(e.target.checked)} />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            {isPoll && (
              <div className="space-y-3 pt-3 border-t border-outline-variant">
                <p className="text-[11px] font-semibold text-primary/85 italic mb-1.5 ml-1">
                  * Note: The "Post Title" field at the top of the form will serve as the question for this poll.
                </p>
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updatePollOption(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1 bg-background border border-outline-variant rounded-xl px-4 py-2 text-on-surface focus:border-primary outline-none transition-all"
                    />
                    {pollOptions.length > 2 && (
                      <button type="button" onClick={() => removePollOption(idx)} className="p-2 text-error hover:bg-error/10 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPollOption}
                  className="text-sm text-primary font-medium hover:underline flex items-center gap-1 whitespace-nowrap"
                >
                  <Plus size={14} /> Add Option
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-on-primary font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-primary/20"
            >
              {currentPost ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-on-surface">Manage Feed</h2>
        <button 
          onClick={startNew}
          className="bg-primary text-on-primary px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <Plus size={20} /> Create Post
        </button>
      </div>

      <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-[var(--border-floating-card)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-floating-card)]">
              <th className="p-4 font-semibold text-on-surface-variant">Title</th>
              <th className="p-4 font-semibold text-on-surface-variant">Author</th>
              <th className="p-4 font-semibold text-on-surface-variant">Type</th>
              <th className="p-4 font-semibold text-on-surface-variant text-center">Views</th>
              <th className="p-4 font-semibold text-on-surface-variant text-center">Likes</th>
              <th className="p-4 font-semibold text-on-surface-variant text-center">Comments</th>
              <th className="p-4 font-semibold text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-on-surface-variant">No posts found. Create a post!</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post._id} className="border-b border-[var(--border-floating-card)] hover:bg-surface-container/50">
                  <td className="p-4 font-medium text-on-surface">{post.title}</td>
                  <td className="p-4 text-on-surface-variant">{post.author?.name || 'Anonymous'}</td>
                  <td className="p-4">
                    {post.isPoll ? (
                      <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1"><BarChart2 size={10} /> Poll</span>
                    ) : (
                      <span className="bg-surface-container-high text-on-surface-variant text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center gap-1">Standard</span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-center text-primary">{post.views || 0}</td>
                  <td className="p-4 font-bold text-center text-red-500">{post.likes?.length || 0}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleOpenCommentsModal(post)}
                      className="font-bold text-blue-500 hover:text-blue-700 hover:underline bg-surface-container/40 px-3 py-1 rounded-lg transition-colors border border-outline-variant/10"
                      title="Manage Comments"
                    >
                      {post.comments?.length || 0}
                    </button>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container rounded-lg hover:bg-primary/10"
                      title="Edit Post"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="p-2 text-on-surface-variant hover:text-error transition-colors bg-surface-container rounded-lg hover:bg-error/10"
                      title="Delete Post"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Comments Moderation Modal */}
      {selectedCommentsPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-surface-container-lowest border border-outline-variant/30 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Manage Feed Comments</h3>
                <p className="text-xs text-on-surface-variant opacity-80 mt-1 truncate max-w-md">Post: {selectedCommentsPost.title}</p>
              </div>
              <button 
                onClick={() => setSelectedCommentsPost(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {selectedCommentsPost.comments?.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant opacity-60">
                  No comments on this post.
                </div>
              ) : (
                selectedCommentsPost.comments.map(comment => (
                  <div key={comment._id} className="flex justify-between items-start gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm text-on-surface truncate">
                          {comment.author?.name || "Anonymous"}
                        </span>
                        <span className="text-[10px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant font-bold border border-outline-variant/20 uppercase">
                          {comment.author?.role || "user"}
                        </span>
                        <span className="text-xs text-on-surface-variant/60">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface-variant break-words leading-relaxed">{comment.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="p-2 text-on-surface-variant hover:text-error transition-colors bg-surface-container rounded-lg hover:bg-error/10 flex-shrink-0"
                      title="Delete Comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 border-t border-outline-variant/20 bg-surface-container-low flex justify-end">
              <button 
                onClick={() => setSelectedCommentsPost(null)}
                className="px-6 py-2 bg-surface-container border border-outline-variant/50 text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminForums;
