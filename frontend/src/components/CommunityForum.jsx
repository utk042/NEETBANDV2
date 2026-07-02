import React, { useState, useEffect } from 'react';
import { IconMessageCircle, IconSend, IconUser, IconSearch, IconHeart, IconPaperclip, IconChartBar, IconPlus, IconX } from '@tabler/icons-react';
import api from '../services/api';
import BlogEditor from './Admin/BlogEditor';

export default function CommunityForum({ user }) {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  const [commentInputs, setCommentInputs] = useState({});
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [pendingComment, setPendingComment] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/forums/posts');
      setPosts(res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text?.trim()) return;
    if (!user?.isLoggedIn) return alert('Please login to comment');

    const rulesKey = `neetband_rules_accepted_${user.id || user._id || 'guest'}`;
    const hasAcceptedRules = localStorage.getItem(rulesKey) === 'true';

    if (!hasAcceptedRules) {
      setPendingComment({ postId, text });
      setIsRulesModalOpen(true);
      return;
    }

    await submitComment(postId, text);
  };

  const submitComment = async (postId, text) => {
    try {
      const res = await api.post(`/forums/posts/${postId}/comments`, { content: text });
      setPosts(posts.map(p => p._id === postId ? { ...p, comments: res.data } : p));
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const handleLike = async (postId) => {
    if (!user?.isLoggedIn) return alert('Please login to like');
    try {
      const res = await api.post(`/forums/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleVote = async (postId, optionIndex) => {
    if (!user?.isLoggedIn) return alert('Please login to vote');
    try {
      const res = await api.post(`/forums/posts/${postId}/vote`, { optionIndex });
      setPosts(posts.map(p => p._id === postId ? { ...p, poll: res.data.poll } : p));
    } catch (error) {
      console.error('Error voting:', error);
    }
  };



  const filteredPosts = posts
    .filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'most_comments') return b.comments.length - a.comments.length;
      return 0;
    });

  return (
    <section className="py-32 px-gutter bg-transparent relative overflow-hidden transition-colors duration-300 min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        


        {/* Main Feed */}
        <div className="flex-1">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="font-headline-lg font-bold text-4xl text-on-surface mb-3">Community Feed</h2>
              <p className="font-body-md text-lg text-on-surface-variant opacity-80">
                Join the discussion, ask doubts, participate in polls, and learn together.
              </p>
            </div>

          </div>

          {/* Toolbar: Search and Sort */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div className="w-full sm:w-1/2 relative">
              <IconSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container border border-[var(--border-floating-card)] rounded-xl pl-10 pr-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
            </div>
            <div className="w-full sm:w-auto flex items-center gap-2 shrink-0">
              <label className="font-label-md text-on-surface-variant text-sm font-bold">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container border border-[var(--border-floating-card)] rounded-xl px-4 py-3 font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none pr-10 cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most_comments">Most Comments</option>
              </select>
            </div>
          </div>

          {/* Posts Feed */}
          {loading ? (
             <div className="flex justify-center items-center py-20">
               <div className="w-12 h-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
             </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)]">
              <p>No discussions found.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {filteredPosts.map(post => {
                const isLiked = user?.isLoggedIn && post.likes?.includes(user._id);

                return (
                  <div key={post._id} className="bg-surface-container-lowest rounded-3xl border border-[var(--border-floating-card)] overflow-hidden shadow-sm hover:border-primary/30 transition-colors">
                    <div className="p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {post.author?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="font-label-md text-on-surface font-bold">{post.author?.name || 'Unknown'}</h4>
                          <span className="font-label-sm text-xs text-on-surface-variant opacity-70">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="font-headline-md text-2xl font-bold text-on-surface mb-3">{post.title}</h3>
                      <div className="font-body-md text-on-surface-variant mb-6 whitespace-pre-wrap tiptap-editor-content" dangerouslySetInnerHTML={{ __html: post.content }} />

                      {/* Attachments */}
                      {post.attachments && post.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-3 mb-6">
                          {post.attachments.map((att, i) => (
                            <a key={i} href={att} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-xl text-sm hover:text-primary transition-colors border border-[var(--border-floating-card)]">
                              <IconPaperclip size={16} /> Attachment {i + 1}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Poll */}
                      {post.poll && post.poll.options && post.poll.options.length > 0 && (
                        <div className="bg-surface-container rounded-2xl p-5 mb-6 border border-[var(--border-floating-card)]">
                          <h4 className="font-bold text-on-surface mb-4 flex items-center gap-2"><IconChartBar size={18} /> Poll</h4>
                          <div className="space-y-3">
                            {post.poll.options.map((opt, i) => {
                              const totalVotes = post.poll.options.reduce((acc, curr) => acc + curr.votes.length, 0);
                              const percent = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                              const userVotedForThis = user?.isLoggedIn && opt.votes.includes(user._id);
                              
                              return (
                                <button 
                                  key={i} 
                                  onClick={() => handleVote(post._id, i)}
                                  className={`w-full text-left relative overflow-hidden rounded-xl border p-3 transition-colors ${userVotedForThis ? 'border-primary bg-primary/5' : 'border-[var(--border-floating-card)] hover:border-primary/50'}`}
                                >
                                  <div className="absolute top-0 left-0 h-full bg-primary/10 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                  <div className="relative z-10 flex justify-between items-center text-sm font-medium">
                                    <span className="text-on-surface">{opt.text}</span>
                                    <span className="text-on-surface-variant">{percent}% ({opt.votes.length})</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-on-surface-variant font-label-md text-sm mb-6 pb-6 border-b border-[var(--border-nav-layout)]">
                        <button onClick={() => handleLike(post._id)} className={`flex items-center gap-2 hover:text-primary transition-colors ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}>
                          <IconHeart size={18} className={isLiked ? 'fill-current' : ''} />
                          {post.likes?.length || 0} Likes
                        </button>
                        <div className="flex items-center gap-2 text-primary">
                          <IconMessageCircle size={18} />
                          {post.comments?.length || 0} Comments
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="flex flex-col gap-5 mb-6">
                        {post.comments?.map(comment => (
                          <div key={comment._id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0 mt-1">
                              {comment.user?.name?.charAt(0) || <IconUser size={16} />}
                            </div>
                            <div className="bg-surface-container-low px-4 py-3 rounded-2xl rounded-tl-sm flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-label-md text-sm font-bold text-on-surface">{comment.user?.name || 'Unknown'}</span>
                                <span className="text-[10px] text-on-surface-variant opacity-60">{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="font-body-sm text-sm text-on-surface-variant leading-snug">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Comment */}
                      {user?.isLoggedIn ? (
                        <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                            {user.name?.charAt(0) || <IconUser size={16} />}
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentInputs[post._id] || ''}
                              onChange={(e) => handleCommentChange(post._id, e.target.value)}
                              className="w-full bg-surface-container border border-[var(--border-floating-card)] rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <button 
                              type="submit" 
                              disabled={!commentInputs[post._id]?.trim()}
                              className="bg-primary text-on-primary p-2.5 rounded-xl hover:bg-primary-fixed hover:text-on-primary-fixed disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <IconSend size={16} />
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="bg-surface-container rounded-xl p-4 text-center">
                          <p className="font-label-md text-xs font-bold text-primary">Log in to participate</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {isRulesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal-high flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/30 p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold tracking-tight text-on-surface mb-4">Community Feed Rules</h3>
            <p className="text-on-surface-variant text-sm mb-4">
              Before posting your first comment, please read and agree to our community rules:
            </p>
            <ul className="list-disc pl-5 text-on-surface-variant text-sm space-y-2 mb-6">
              <li>Be respectful, friendly, and constructive to all peers.</li>
              <li>No spam, links to unverified materials, or self-promotion.</li>
              <li>Keep discussions relevant to learning and education.</li>
              <li>Do not share personal contact details or copyrighted study material.</li>
            </ul>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsRulesModalOpen(false);
                  setPendingComment(null);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (pendingComment && user) {
                    const rulesKey = `neetband_rules_accepted_${user.id || user._id}`;
                    localStorage.setItem(rulesKey, 'true');
                    await submitComment(pendingComment.postId, pendingComment.text);
                  }
                  setIsRulesModalOpen(false);
                  setPendingComment(null);
                }}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-on-primary hover:bg-primary-fixed transition-colors"
              >
                I Agree & Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
