import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, BarChart2, Paperclip, MessageSquare, Heart, Eye } from 'lucide-react';
import BlogEditor from './BlogEditor';

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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/forums/posts');
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
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
      alert('Failed to save post. Note: Update route may not be implemented on backend.');
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
          <h2 className="text-xl font-bold text-on-surface">{currentPost ? 'Edit Post' : 'Advanced Post Creation'}</h2>
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
              <BlogEditor value={content} onChange={setContent} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
              <Paperclip size={16} />
              Attachments (Comma separated URLs)
            </label>
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
              {currentPost ? 'Update Post' : 'Create Advanced Post'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-on-surface">Manage Forums</h2>
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
              <th className="p-4 font-semibold text-on-surface-variant">Stats</th>
              <th className="p-4 font-semibold text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-on-surface-variant">No posts found. Create an advanced post!</td>
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
                  <td className="p-4 text-on-surface-variant text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1" title="Views"><Eye size={14} className="opacity-70" /> {post.views || 0}</span>
                      <span className="flex items-center gap-1" title="Likes"><Heart size={14} className="opacity-70" /> {post.likes?.length || 0}</span>
                      <span className="flex items-center gap-1" title="Comments"><MessageSquare size={14} className="opacity-70" /> {post.comments?.length || 0}</span>
                    </div>
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
    </div>
  );
};

export default AdminForums;
