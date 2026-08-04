import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Check, Image as ImageIcon, Loader2, RefreshCw, FolderOpen, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_URL}${cleanPath}`;
};

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  title = "Select from Media Library"
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isLms = typeof window !== 'undefined' && window.location.pathname.startsWith('/lms');
      const token = isLms
        ? (localStorage.getItem('lms_token') || localStorage.getItem('user_token'))
        : (localStorage.getItem('user_token') || localStorage.getItem('lms_token'));

      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await apiFetch(`${API_URL}/upload/files?fileType=image`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch media files (${res.status})`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        setFiles(data.files);
      } else {
        throw new Error(data.error || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching media files:', err);
      setError(err.message || 'Failed to load media files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setSearchTerm('');
      setSelectedCategory('all');
      fetchFiles();
    }
  }, [isOpen, fetchFiles]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(files.map((f) => f.category).filter(Boolean)));
    return ['all', ...cats];
  }, [files]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (file.category && file.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchesSearch =
        !searchTerm.trim() ||
        (file.filename && file.filename.toLowerCase().includes(searchTerm.trim().toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [files, selectedCategory, searchTerm]);

  if (!isOpen) return null;

  const handleConfirmSelect = () => {
    if (!selectedFile) return;
    const finalUrl = resolveMediaUrl(selectedFile.url);
    if (onSelect) {
      onSelect(finalUrl, selectedFile);
    }
    if (onClose) {
      onClose();
    }
  };

  const formatCategoryLabel = (cat) => {
    if (cat === 'all') return 'All';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-[calc(100vw-1rem)] sm:max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/30 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search images by filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const count =
                  cat === 'all'
                    ? files.length
                    : files.filter((f) => f.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{formatCategoryLabel(cat)}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-700/60 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm font-medium">Loading media library...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
              <div className="p-3 rounded-full bg-rose-500/10 text-rose-400">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-rose-300">{error}</p>
              <button
                type="button"
                onClick={fetchFiles}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
              <div className="p-4 rounded-full bg-slate-800/80 text-slate-500">
                <FolderOpen className="w-10 h-10" />
              </div>
              <p className="text-base font-semibold text-slate-300">No media files found</p>
              <p className="text-xs text-slate-500 max-w-xs text-center">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search query or category filter.'
                  : 'No uploaded images available in the media library.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile?.url === file.url;
                const fullUrl = resolveMediaUrl(file.url);
                return (
                  <div
                    key={file.url}
                    onClick={() => setSelectedFile(file)}
                    onDoubleClick={handleConfirmSelect}
                    className={`group relative flex flex-col rounded-xl overflow-hidden border bg-slate-800/40 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                    }`}
                  >
                    {/* Thumbnail Image Container */}
                    <div className="relative aspect-square w-full overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img
                        src={fullUrl}
                        alt={file.filename}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div className="hidden absolute inset-0 flex-col items-center justify-center text-slate-600 bg-slate-900">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-[10px]">Preview unavailable</span>
                      </div>

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-indigo-600 text-white shadow-lg animate-in zoom-in-50 duration-150">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Card Label */}
                    <div className="p-2 bg-slate-900/90 border-t border-slate-800/60">
                      <p className="text-xs font-medium text-slate-200 truncate" title={file.filename}>
                        {file.filename}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span>{formatFileSize(file.size)}</span>
                        {file.category && (
                          <span className="capitalize px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {file.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {selectedFile ? (
              <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-xs inline-block align-bottom">
                Selected: {selectedFile.filename}
              </span>
            ) : (
              <span>Select an image to insert</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSelect}
              disabled={!selectedFile}
              className={`px-5 py-2 text-xs font-semibold rounded-xl transition-all shadow-md ${
                selectedFile
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
              }`}
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
