import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';

export default React.memo(function MathMarkdownContent({ content, className = '' }) {
  const containerRef = React.useRef(null);

  const processedContent = React.useMemo(() => {
    if (!content) return '';
    let text = String(content);

    // Remove standalone leading bullet lines if they are empty
    text = text.replace(/^[ \t]*[•▪◦⚫][ \t]*$/gm, '');

    // Convert remaining unicode bullets at start of text lines to markdown bullets
    let formatted = text.replace(/^[ \t]*[•▪◦⚫][ \t]*/gm, '- ');

    return formatted;
  }, [content]);

  return (
    <div ref={containerRef} className={`prose max-w-none text-on-surface text-base leading-relaxed space-y-2 markdown-body ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]} 
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-black text-on-surface mt-4 mb-2 border-b border-outline/10 pb-1" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold text-on-surface mt-3 mb-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-bold text-on-surface mt-2 mb-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-extrabold text-on-surface" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
          code: ({node, inline, ...props}) => <code className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-xs text-amber-400" {...props} />,
          pre: ({node, ...props}) => <pre className="p-3 rounded-xl bg-surface-container overflow-x-auto text-xs my-2 border border-outline/10" {...props} />,
          ul: ({node, ...props}) => <ul className="space-y-1 my-1.5 list-none text-left inline-block" {...props} />,
          ol: ({node, ...props}) => <ol className="space-y-1 my-1.5 list-decimal ml-4 text-left inline-block" {...props} />,
          li: ({node, ...props}) => <li className="ml-2 list-disc pl-1 mb-0.5 text-on-surface font-medium text-base sm:text-lg" {...props} />,
          p: ({node, ...props}) => <p className="mb-1.5 last:mb-0 leading-relaxed font-semibold text-on-surface text-base sm:text-lg" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="pl-3 mb-2 border-l-2 border-primary/40 text-on-surface/90 text-sm leading-relaxed" {...props} />
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});

