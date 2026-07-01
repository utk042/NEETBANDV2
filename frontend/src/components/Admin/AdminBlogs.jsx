import React, { useState, useEffect, useCallback } from 'react';
import { Search, Code, CheckCircle, ChevronDown, ChevronUp, Link as LinkIcon, Image as ImageIcon, Plus, Edit2, Trash2 } from "lucide-react";
import api, { uploadFile } from '../../services/api';
import BlogEditor from './BlogEditor';
import SlugInput from './SlugInput';

export default function AdminBlogs() {
  const [activeView, setActiveView] = useState('list'); // 'list', 'add', 'edit'
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [timeDuration, setTimeDuration] = useState("");
  const [imageText, setImageText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorQuote, setAuthorQuote] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(false); // Default to draft
  const [loading, setLoading] = useState(false);

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await api.get('/blogs/admin');
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (activeView === 'list') {
      fetchBlogs();
    }
  }, [activeView, fetchBlogs]);

  const resetForm = () => {
    setTitle("");
    setShortDescription("");
    setContent("");
    setTimeDuration("");
    setImageText("");
    setAuthorName("");
    setAuthorQuote("");
    setSlug("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setCoverImage("");
    setIsPublished(false);
    setEditingId(null);
  };

  const handleAddClick = () => {
    resetForm();
    setActiveView('add');
  };

  const handleEditClick = async (id) => {
    resetForm();
    setEditingId(id);
    setActiveView('edit');
    try {
      const res = await api.get(`/blogs/${id}`);
      const data = res.data;
      setTitle(data.title || "");
      setShortDescription(data.shortDescription || "");
      setContent(data.content || "");
      setTimeDuration(data.timeDuration || "");
      setImageText(data.imageText || "");
      setAuthorName(data.authorName || "");
      setAuthorQuote(data.authorQuote || "");
      setSlug(data.slug || "");
      setMetaTitle(data.metaTitle || "");
      setMetaDescription(data.metaDescription || "");
      setMetaKeywords(data.metaKeywords || "");
      setIsPublished(data.isPublished !== false);
      setCoverImage(data.coverImage || "");
    } catch (err) {
      console.error(err);
      alert("Failed to load blog data");
      setActiveView('list');
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete blog");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitter = e.nativeEvent.submitter;
    const publishing = submitter && submitter.name === 'publish' ? true : false;
    setLoading(true);

    try {
      const payload = {
        title, shortDescription, content, timeDuration,
        imageText, authorName, authorQuote, slug,
        metaTitle, metaDescription, metaKeywords,
        isPublished: publishing,
        coverImage
      };

      if (activeView === 'edit') {
        await api.put(`/blogs/${editingId}`, payload);
        alert("Blog Updated Successfully");
      } else {
        await api.post(`/blogs`, payload);
        alert("Blog Created Successfully");
      }
      
      resetForm();
      setActiveView('list');
    } catch (error) {
      console.error(error);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (activeView === 'list') {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-on-surface">Manage Blogs</h2>
          <button 
            onClick={handleAddClick}
            className="bg-primary text-on-primary px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
          >
            <Plus size={20} /> Add Blog
          </button>
        </div>

        <div className="overflow-x-auto bg-surface-container-lowest rounded-2xl border border-[var(--border-floating-card)] shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-floating-card)]">
                <th className="p-4 font-semibold text-on-surface-variant">Title</th>
                <th className="p-4 font-semibold text-on-surface-variant">Slug</th>
                <th className="p-4 font-semibold text-on-surface-variant">Author</th>
                <th className="p-4 font-semibold text-on-surface-variant">Status</th>
                <th className="p-4 font-semibold text-on-surface-variant">Views</th>
                <th className="p-4 font-semibold text-on-surface-variant">Images</th>
                <th className="p-4 font-semibold text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-on-surface-variant font-medium text-lg">No blogs yet. Create your first blog post.</td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="border-b border-[var(--border-floating-card)] hover:bg-surface-container/50">
                    <td className="p-4 font-medium">{blog.title}</td>
                    <td className="p-4"><code className="bg-surface-container px-2 py-1 rounded text-sm text-primary">{blog.slug || '-'}</code></td>
                    <td className="p-4 text-on-surface-variant">{blog.authorName || (blog.author && blog.author.name) || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${blog.isPublished === false ? 'bg-surface-container-high text-on-surface-variant' : 'bg-green-500/10 text-green-600'}`}>
                        {blog.isPublished === false ? 'Draft' : 'Published'}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-primary">{blog.views || 0}</td>
                    <td className="p-4 text-on-surface-variant">
                      <div className="flex gap-1 flex-wrap">
                        {blog.coverImage && (
                          <img
                            src={blog.coverImage}
                            alt=""
                            className="w-8 h-8 object-cover rounded border border-outline-variant/30"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(blog._id)}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors bg-surface-container rounded-lg hover:bg-primary/10"
                        title="Edit Blog"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteBlog(blog._id)}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors bg-surface-container rounded-lg hover:bg-error/10"
                        title="Delete Blog"
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
  }

  // Add/Edit Form View
  return (
    <div>
      <div className="page-header mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-on-surface">
            {activeView === 'edit' ? 'Edit Blog' : 'Add Blog'}
          </h1>
          <button className="text-primary hover:underline font-medium flex items-center gap-1 mt-1 text-sm whitespace-nowrap" onClick={() => setActiveView('list')}>
            ← Back to List
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="submit" 
            form="blog-form" 
            name="draft"
            className="px-6 py-2.5 bg-surface-container border border-outline-variant/50 text-on-surface font-semibold rounded-xl hover:bg-surface-container-high transition-colors shadow-sm" 
            disabled={loading}
          >
            {loading ? "Saving..." : "Save as Draft"}
          </button>
          <button 
            type="submit" 
            form="blog-form" 
            name="publish"
            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-fixed transition-colors shadow-lg shadow-primary/20" 
            disabled={loading}
          >
            {loading ? (activeView === 'edit' ? "Updating..." : "Publishing...") : (activeView === 'edit' ? "Publish Changes" : "Publish Live")}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Title</label>
            <input className="form-input w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="Blog title"
              value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Short Description</label>
            <textarea className="form-input w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors" placeholder="Brief description"
              value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>

          <div className="form-group">
            <div className="flex items-center justify-between mb-2">
              <label className="form-label-dark font-medium text-sm text-on-surface-variant">Thumbnail Image URL</label>
              <label className="text-xs font-bold text-primary cursor-pointer hover:underline flex items-center gap-1">
                <ImageIcon size={14} /> Upload Image
                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const res = await uploadFile(file, 'blogs/thumbnails');
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                    const fullUrl = `${backendUrl}${res.url}`;
                    setCoverImage(fullUrl);
                  } catch (err) {
                    alert("Failed to upload file: " + err.message);
                  }
                }} />
              </label>
            </div>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary transition-colors"
              placeholder="e.g. https://images.unsplash.com/photo-... or local asset path"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Content</label>
            <div className="border border-outline-variant/30 rounded-xl overflow-hidden bg-background">
              <BlogEditor 
                content={content} 
                setContent={setContent} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Reading Time</label>
              <input className="form-input w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface transition-colors focus:outline-none focus:border-primary" placeholder="e.g. 5 min"
                value={timeDuration} onChange={(e) => setTimeDuration(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Image Caption</label>
              <input className="form-input w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface transition-colors focus:outline-none focus:border-primary" placeholder="Caption for images"
                value={imageText} onChange={(e) => setImageText(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Author Name</label>
              <input className="form-input w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface transition-colors focus:outline-none focus:border-primary" placeholder="Author name"
                value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Author Quote</label>
              <input className="form-input w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface transition-colors focus:outline-none focus:border-primary" placeholder="Author quote"
                value={authorQuote} onChange={(e) => setAuthorQuote(e.target.value)} />
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-outline-variant/20">
            <label className="form-label-header flex items-center gap-2 mb-4 font-bold text-lg text-on-surface">
              <LinkIcon size={20} /> URL Slug
            </label>
            <SlugInput title={title} slug={slug} setSlug={setSlug} />
          </div>

          <div className="pt-8 mt-8 border-t border-outline-variant/20">
            <div className="form-label-header flex items-center gap-2 mb-6 font-bold text-lg text-on-surface">
              <Search size={20} /> SEO Settings
            </div>
            
            <div className="form-group mb-4">
              <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Meta Title</label>
              <input className="form-input w-full bg-background border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface transition-colors focus:outline-none focus:border-primary" placeholder="SEO Title"
                value={metaTitle} onChange={(e) => setMetaTitle(e.target.value || title)} />
            </div>

            <div className="form-group mb-4">
              <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Meta Description</label>
              <textarea className="form-input w-full bg-background border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface transition-colors focus:outline-none focus:border-primary" placeholder="SEO Description" style={{ minHeight: "80px" }}
                value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label-dark block mb-2 font-medium text-sm text-on-surface-variant">Meta Keywords (comma separated)</label>
              <input className="form-input w-full bg-background border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface transition-colors focus:outline-none focus:border-primary" placeholder="Keyword 1, Keyword 2"
                value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} />
            </div>
          </div>


        </form>
      </div>
    </div>
  );
}
