import React, { useState, useEffect } from 'react';
import { IconArrowRight, IconCalendarEvent, IconClock, IconArrowLeft, IconHeart, IconMessageCircle, IconUser } from '@tabler/icons-react';
import api from '../services/api';

export default function Blog({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/blogs');
      setBlogs(res.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogDetail = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/blogs/${id}`);
      setSelectedBlog(res.data);
    } catch (error) {
      console.error('Error fetching blog details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user?.isLoggedIn) return alert('Please login to like');
    try {
      const res = await api.post(`/blogs/${selectedBlog._id}/like`);
      setSelectedBlog({ ...selectedBlog, likes: res.data.likes });
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user?.isLoggedIn) return alert('Please login to comment');
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/blogs/${selectedBlog._id}/comments`, { content: commentText });
      setSelectedBlog({ ...selectedBlog, comments: res.data });
      setCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (selectedBlog) {
    const isLiked = user?.isLoggedIn && selectedBlog.likes.includes(user._id);

    return (
      <section className="py-32 px-gutter bg-transparent relative min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => setSelectedBlog(null)} 
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8 transition-colors"
          >
            <IconArrowLeft size={20} /> Back to blogs
          </button>

          {selectedBlog.coverImage && (
            <img 
              src={selectedBlog.coverImage} 
              alt={selectedBlog.title}
              className="w-full h-64 md:h-96 object-cover rounded-3xl mb-8 border border-white/10"
            />
          )}

          <div className="flex items-center gap-4 mb-4 text-on-surface-variant/70 text-sm">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <IconUser size={16} /> {selectedBlog.author?.name || 'Unknown'}
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendarEvent size={16} /> {new Date(selectedBlog.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
            {selectedBlog.title}
          </h1>

          <div className="prose prose-invert prose-lg max-w-none mb-12 tiptap-editor-content">
            <div dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
          </div>

          {/* Tags */}
          {selectedBlog.tags && selectedBlog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {selectedBlog.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400 border border-white/10">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-white/10 pt-8 mt-12 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  isLiked ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <IconHeart size={20} className={isLiked ? 'fill-current' : ''} />
                {selectedBlog.likes.length} Likes
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <IconMessageCircle /> Comments ({selectedBlog.comments.length})
            </h3>

            {user?.isLoggedIn ? (
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#c5ff4a] focus:ring-1 focus:ring-[#c5ff4a] outline-none transition-all resize-none h-24 mb-3"
                  required
                />
                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-2 bg-[#c5ff4a] text-black font-semibold rounded-xl hover:bg-[#b0eb38] transition-colors">
                    Post Comment
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 text-center mb-8">
                <p className="text-gray-400 text-sm">Please log in to join the discussion.</p>
              </div>
            )}

            <div className="space-y-6">
              {selectedBlog.comments.map(comment => (
                <div key={comment._id} className="flex gap-4">
                  <div className="w-10 h-10 bg-[#c5ff4a]/20 text-[#c5ff4a] flex items-center justify-center rounded-full font-bold flex-shrink-0">
                    {comment.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white">{comment.user?.name || 'Unknown User'}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 px-gutter bg-transparent relative min-h-screen transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(var(--color-outline),0.1)] to-transparent"></div>
      
      <div className="max-w-container-max mx-auto">
        <div className="mb-16">
          <h2 className="font-headline-lg font-bold text-headline-lg-mobile md:text-4xl text-on-surface mb-3 text-balance">Study Insights</h2>
          <p className="font-body-md font-normal text-lg text-on-surface-variant opacity-80">
            Expert advice, scientifically backed study methods, and wellness tips.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-white/10 border-t-[#c5ff4a] rounded-full animate-spin"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No articles found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((article, index) => {
              const isFeatured = index === 0;
              return (
                <article 
                  key={article._id} 
                  className={`bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] shadow-[var(--shadow-floating-card)] overflow-hidden hover:border-primary/30 transition-all duration-300 group flex flex-col cursor-pointer ${
                    isFeatured 
                      ? 'md:col-span-2 lg:col-span-3 lg:flex-row' 
                      : 'col-span-1'
                  }`}
                  onClick={() => fetchBlogDetail(article._id)}
                >
                  <div className={`overflow-hidden relative border-[var(--border-floating-card)] bg-black/20 ${
                    isFeatured 
                      ? 'w-full lg:w-1/2 h-64 lg:h-auto border-b lg:border-b-0 lg:border-r' 
                      : 'w-full h-48 border-b'
                  }`}>
                    {article.coverImage ? (
                      <img 
                        src={article.coverImage} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                    )}
                    {article.tags?.[0] && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-surface/80 backdrop-blur-md text-on-surface text-[10px] font-bold uppercase tracking-wider border border-[var(--border-floating-card)]">
                          {article.tags[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-6 md:p-8 flex-1 flex flex-col justify-center ${isFeatured ? 'lg:p-12' : ''}`}>
                    <div className="flex items-center gap-4 mb-3 text-on-surface-variant/70 text-xs font-body-md">
                      <span className="flex items-center gap-1.5"><IconCalendarEvent size={14} /> {new Date(article.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><IconUser size={14} /> {article.author?.name || 'Unknown'}</span>
                    </div>
                    
                    <h3 className={`font-headline-md font-bold text-on-surface mb-3 group-hover:text-primary transition-colors leading-snug ${
                      isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'
                    }`}>
                      {article.title}
                    </h3>
                    
                    <p className="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed line-clamp-3">
                      {article.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                    </p>
                    
                    <div className="mt-auto">
                      <span className="inline-flex items-center gap-2 font-label-md text-sm font-bold text-primary group-hover:gap-3 transition-all">
                        Read Article <IconArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
