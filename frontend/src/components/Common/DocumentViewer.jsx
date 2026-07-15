import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { IconLoader2, IconAlertCircle } from '@tabler/icons-react';
import * as mammoth from 'mammoth';

// Setup pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function DocumentViewer({ fileUrl, fileType, title }) {
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
    if (fileType === 'doc' && fileUrl) {
      setDocLoading(true);
      fetch(fileUrl)
        .then(res => res.arrayBuffer())
        .then(buffer => mammoth.convertToHtml({ arrayBuffer: buffer }))
        .then(result => {
          setDocHtml(result.value);
          setDocLoading(false);
        })
        .catch(err => {
          console.error("DOCX Load Error", err);
          setDocError(err);
          setDocLoading(false);
        });
    }
  }, [fileUrl, fileType]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF Load Error:", error);
    setError(error);
    setLoading(false);
  };

  if (!fileUrl) return null;

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
              <p className="text-sm text-on-surface-variant">Loading document...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center py-20 text-center w-full">
              <IconAlertCircle className="text-error mb-3" size={32} />
              <p className="text-sm text-on-surface-variant">Failed to load PDF. {error?.message}</p>
              <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary mt-4 hover:underline">
                Try opening directly
              </a>
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

  if (fileType === 'doc') {
    return (
      <div className="w-full">
        {docLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center w-full h-full">
            <IconLoader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-sm text-on-surface-variant">Loading document...</p>
          </div>
        ) : docError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center w-full h-full">
            <IconAlertCircle className="text-error mb-3" size={32} />
            <p className="text-sm text-on-surface-variant">Failed to load document.</p>
            <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-primary mt-4 hover:underline">
              Download File
            </a>
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

  // Fallback for unknown link types
  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-lg border border-outline/10 p-10 flex flex-col items-center justify-center text-center">
      <IconAlertCircle className="text-primary mb-4" size={40} />
      <h3 className="text-lg font-bold text-on-surface mb-2">External Link Attached</h3>
      <p className="text-sm text-on-surface-variant mb-6 max-w-md">This file type cannot be previewed natively. You can open it in a new tab.</p>
      <a href={fileUrl} target="_blank" rel="noreferrer" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
        Open Link in New Tab
      </a>
    </div>
  );
}
