import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconArrowRight, IconCalendarEvent, IconClock, IconArrowLeft, IconHeart, IconMessageCircle, IconUser, IconShare } from '@tabler/icons-react';
import api from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Blog({ user }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 9;

  useEffect(() => {
    if (!selectedBlog) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, selectedBlog]);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const getPaginationRange = (current, total) => {
    const range = [];
    const delta = 1;
    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== '...') {
        range.push('...');
      }
    }
    return range;
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    if (slug) {
      fetchBlogDetail(slug);
    } else {
      setSelectedBlog(null);
    }
  }, [slug]);

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

  const fetchBlogDetail = async (idOrSlug) => {
    try {
      setLoading(true);
      const res = await api.get(`/blogs/${idOrSlug}`);
      setSelectedBlog(res.data);
    } catch (error) {
      console.error('Error fetching blog details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToBlogs = () => {
    navigate('/blog');
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedBlog.title,
          text: selectedBlog.shortDescription,
          url: window.location.href
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  if (selectedBlog) {
    const isLiked = user?.isLoggedIn && selectedBlog.likes.includes(user._id);

    return (
      <section className="py-32 px-gutter bg-transparent relative min-h-screen">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={handleBackToBlogs} 
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-8 transition-colors"
          >
            <IconArrowLeft size={20} /> Back to blogs
          </button>

          {selectedBlog.coverImage && (
            <img 
              src={selectedBlog.coverImage} 
              alt={selectedBlog.title}
              className="w-full h-64 md:h-96 object-cover rounded-3xl mb-8 border border-[var(--border-floating-card)]"
            />
          )}

          <div className="flex items-center gap-4 mb-4 text-on-surface-variant/70 text-sm">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full border border-[var(--border-floating-card)]">
              {selectedBlog.author?.profilePicture ? (
                <img 
                  src={selectedBlog.author.profilePicture.startsWith('http') ? selectedBlog.author.profilePicture : `${API_URL}${selectedBlog.author.profilePicture}`} 
                  alt="Author" 
                  className="w-5 h-5 rounded-full object-cover shrink-0" 
                />
              ) : (
                <IconUser size={16} />
              )}
              {selectedBlog.author?.name || 'Unknown'}
            </span>
            <span className="flex items-center gap-1.5">
              <IconCalendarEvent size={16} /> {new Date(selectedBlog.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-on-surface mb-8 leading-tight">
            {selectedBlog.title}
          </h1>

          <div className="prose dark:prose-invert prose-lg max-w-[72ch] mx-auto mb-12 text-on-surface-variant/90 tiptap-editor-content">
            <div dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
          </div>

          {/* Tags */}
          {selectedBlog.tags && selectedBlog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {selectedBlog.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-surface-container-low rounded-full text-sm text-on-surface-variant/80 border border-[var(--border-floating-card)]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="border-t border-[var(--border-floating-card)] pt-8 mt-12 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors border ${
                  isLiked 
                    ? 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/20 dark:border-red-500/30' 
                    : 'bg-surface-container-low text-on-surface-variant border-[var(--border-floating-card)] hover:bg-surface-container-high'
                }`}
              >
                <IconHeart size={20} className={isLiked ? 'fill-current' : ''} />
                {selectedBlog.likes.length} Likes
              </button>

              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors border bg-surface-container-low text-on-surface-variant border-[var(--border-floating-card)] hover:bg-surface-container-high"
              >
                <IconShare size={20} />
                Share
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12 bg-surface-container-lowest border border-[var(--border-floating-card)] rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <IconMessageCircle /> Comments ({selectedBlog.comments.length})
            </h3>

            {user?.isLoggedIn ? (
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-surface-container border border-[var(--border-floating-card)] rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-24 mb-3"
                  required
                />
                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-2 bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed text-on-primary font-semibold rounded-xl transition-colors">
                    Post Comment
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-surface-container-low border border-[var(--border-floating-card)] rounded-xl p-4 text-center mb-8">
                <p className="text-on-surface-variant/80 text-sm">Please log in to join the discussion.</p>
              </div>
            )}

            <div className="space-y-6">
              {selectedBlog.comments.map(comment => (
                <div key={comment._id} className="flex gap-4">
                  <div className="w-10 h-10 overflow-hidden rounded-full flex-shrink-0 bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {comment.user?.profilePicture ? (
                      <img 
                        src={comment.user.profilePicture.startsWith('http') ? comment.user.profilePicture : `${API_URL}${comment.user.profilePicture}`} 
                        alt="Commenter" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span>{comment.user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-on-surface">{comment.user?.name || 'Unknown User'}</span>
                      <span className="text-xs text-on-surface-variant/60">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{comment.content}</p>
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
            <div className="w-12 h-12 border-4 border-[var(--border-floating-card)] border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No articles found yet.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBlogs.map((article) => (
                <article 
                  key={article._id} 
                  tabIndex={0}
                  role="link"
                  aria-label={`Read article: ${article.title}`}
                  className="col-span-1 bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] shadow-[var(--shadow-floating-card)] overflow-hidden hover:border-primary/30 transition-all duration-300 group flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  onClick={() => navigate(`/blog/${article.slug || article._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/blog/${article.slug || article._id}`);
                    }
                  }}
                >
                  <div className="w-full aspect-[16/10] relative overflow-hidden border-b border-[var(--border-floating-card)] bg-black/20">
                    {article.coverImage ? (
                      <img 
                        src={article.coverImage} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700" 
                        loading="lazy"
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
                  
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-3 text-on-surface-variant/70 text-xs font-body-md">
                        <span className="flex items-center gap-1.5"><IconCalendarEvent size={14} /> {new Date(article.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><IconUser size={14} /> {article.author?.name || 'Unknown'}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="font-body-md text-sm text-on-surface-variant mb-6 leading-relaxed line-clamp-3">
                        {article.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <span className="inline-flex items-center gap-2 font-label-md text-sm font-bold text-primary group-hover:gap-3 transition-all">
                        Read Article <IconArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-16 font-body-md">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-[var(--border-floating-card)] bg-surface-container-low text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:hover:bg-surface-container-low transition-all"
                >
                  Prev
                </button>
                
                {getPaginationRange(currentPage, totalPages).map((page, idx) => (
                  page === '...' ? (
                    <span key={`ell-${idx}`} className="px-3 py-2 text-on-surface-variant opacity-60">
                      ...
                    </span>
                  ) : (
                    <button
                      key={`page-${page}`}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all border ${
                        currentPage === page
                          ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20'
                          : 'border-[var(--border-floating-card)] bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-[var(--border-floating-card)] bg-surface-container-low text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:hover:bg-surface-container-low transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
