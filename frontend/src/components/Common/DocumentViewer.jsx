import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';
import * as mammoth from 'mammoth';

// Robust local worker resolution for Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function DocumentViewer({ fileUrl, fileType, title, onError }) {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(null);
  
  const [docHtml, setDocHtml] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState(null);

  // Measure container for responsive PDF sizing
  const containerRef = React.useCallback((node) => {
    if (node !== null) {
      setContainerWidth(node.getBoundingClientRect().width);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (fileType === 'doc' && fileUrl && !getGdriveEmbedUrl(fileUrl)) {
      setDocLoading(true);
      fetch(fileUrl)
        .then(res => res.arrayBuffer())
        .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
        .then(result => {
          if (isMounted) {
            setDocHtml(result.value);
            setDocLoading(false);
          }
        })
        .catch(err => {
          console.error("DOCX Load Error", err);
          if (isMounted) {
            setDocError(err);
            setDocLoading(false);
            if (onError) onError(true);
          }
        });
    }
    return () => { isMounted = false; };
  }, [fileUrl, fileType, onError]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF Load Error:", error);
    setError(error);
    setLoading(false);
    if (onError) onError(true);
  };

  if (!fileUrl) return null;

  // Helper to get Google Drive embed URL
  const getGdriveEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    if (url.includes('drive.google.com/file/d/') || url.includes('docs.google.com/')) {
      try {
        const u = new URL(url);
        if (u.pathname.includes('/view')) {
          u.pathname = u.pathname.replace(/\/view.*$/, '/preview');
        } else if (u.pathname.includes('/edit')) {
          u.pathname = u.pathname.replace(/\/edit.*$/, '/preview');
        } else if (!u.pathname.endsWith('/preview')) {
          u.pathname = u.pathname.replace(/\/$/, '') + '/preview';
        }
        u.search = '';
        return u.toString();
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  // 1. ALWAYS check for Google Drive links first, regardless of fileType,
  // because Drive URLs do not serve raw bytes for PDF/DOC preview easily via CORS.
  const gdriveEmbedUrl = getGdriveEmbedUrl(fileUrl);
  if (gdriveEmbedUrl) {
    return (
      <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-outline/10 h-[600px] md:h-[80vh]">
        <iframe
          src={gdriveEmbedUrl}
          title={title || "Google Drive Document"}
          className="w-full h-full border-0"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  // 2. Handle standard PDFs
  if (fileType === 'pdf') {
    return (
      <div 
        ref={containerRef}
        className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-outline/10 select-none flex flex-col items-center pdf-container relative"
        style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex flex-col items-center justify-center py-20 text-center w-full">
              <IconLoader2 className="animate-spin text-primary mb-3" size={32} />
              <p className="text-sm text-on-surface-variant">Loading notes...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center py-20 text-center w-full">
              <IconAlertCircle className="text-error mb-3" size={32} />
              <p className="text-sm text-on-surface-variant">
                Failed to load notes. Please <Link to="/contact" state={{ subject: 'Report Bug / Issue' }} className="text-primary font-bold hover:underline">contact admin</Link> or try again later.
              </p>
            </div>
          }
          className="w-full flex flex-col items-center"
        >
          {numPages && Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={containerWidth ? Math.min(containerWidth, 900) : undefined}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mb-0 border-b border-outline/5 max-w-full"
            />
          ))}
        </Document>
      </div>
    );
  }

  // 3. Handle standard DOC/DOCX files
  if (fileType === 'doc') {
    return (
      <div className="w-full">
        {docLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center w-full h-full">
            <IconLoader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-sm text-on-surface-variant">Loading notes...</p>
          </div>
        ) : docError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center w-full h-full">
            <IconAlertCircle className="text-error mb-3" size={32} />
            <p className="text-sm text-on-surface-variant">
              Failed to load notes. Please <Link to="/contact" state={{ subject: 'Report Bug / Issue' }} className="text-primary font-bold hover:underline">contact admin</Link> or try again later.
            </p>
          </div>
        ) : (
          <div 
            className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-on-surface"
            dangerouslySetInnerHTML={{ __html: docHtml }}
          />
        )}
      </div>
    );
  }

  // 3.5 Handle Images
  const isImage = fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' || fileType === 'gif' || fileType === 'webp' || fileType === 'image';
  if (isImage) {
    return (
      <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-outline/10 p-4 flex justify-center h-auto min-h-[300px]">
        <img 
          src={fileUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${fileUrl}` : fileUrl} 
          alt={title || 'Attached Image'} 
          className="max-w-full rounded-lg max-h-[70vh] object-contain" 
        />
      </div>
    );
  }

  // 4. Fallback for unknown link types
  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-sm border border-outline/10 p-10 flex flex-col items-center justify-center text-center min-h-[300px]">
      <IconAlertCircle className="text-primary mb-4" size={40} />
      <h3 className="text-lg font-bold text-on-surface mb-2">External Link Attached</h3>
      <p className="text-sm text-on-surface-variant max-w-md mb-6">This document is hosted externally or cannot be previewed natively.</p>
      <a 
        href={fileUrl.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${fileUrl}` : fileUrl} 
        target="_blank" 
        rel="noreferrer" 
        className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:brightness-105 active:scale-95 transition-all"
      >
        Open Document
      </a>
    </div>
  );
}
