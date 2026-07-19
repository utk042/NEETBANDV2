import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default React.memo(function MathMarkdownContent({ content }) {
  const containerRef = React.useRef(null);

  useEffect(() => {
    if (containerRef.current && window.renderMathInElement) {
      try {
        window.renderMathInElement(containerRef.current, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true },
          ],
          throwOnError: false,
        });
      } catch (err) {
        console.error("KaTeX auto-render failed:", err);
      }
    }
  }, [content]);

  const processedContent = React.useMemo(() => {
    if (!content) return '';
    // 1. Convert unicode bullets at start of lines to markdown bullets
    let formatted = content.replace(/^[ \t]*[•▪◦⚫][ \t]*/gm, '- ');
    
    // 2. Append two spaces to lines to preserve single newlines as line breaks
    return formatted
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.match(/^\d+\./)) {
          return line;
        }
        return line + '  ';
      })
      .join('\n');
  }, [content]);

  return (
    <div ref={containerRef} className="prose max-w-none text-on-surface-variant text-sm leading-relaxed space-y-4 markdown-body">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-black text-on-surface mt-6 mb-3 border-b border-outline/10 pb-1" {...props} />,
          h2: ({node, ...props}) => {
            const children = props.children;
            const isNote = Array.isArray(children) ? children[0]?.startsWith?.('Note') : (typeof children === 'string' && children.startsWith('Note'));
            if (isNote) {
               return <h2 className="text-lg font-black text-primary border-b border-outline/10 pb-1 mt-8 mb-3 flex items-center gap-2" {...props} />;
            }
            return <h2 className="text-lg font-bold text-on-surface mt-5 mb-2.5" {...props} />;
          },
          h3: ({node, ...props}) => <h3 className="text-base font-bold text-on-surface mt-4 mb-2" {...props} />,
          strong: ({node, ...props}) => <strong className="font-extrabold text-on-surface" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
          code: ({node, inline, ...props}) => <code className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-xs text-amber-400" {...props} />,
          pre: ({node, ...props}) => <pre className="p-4 rounded-xl bg-surface-container overflow-x-auto text-xs my-3 border border-outline/10" {...props} />,
          ul: ({node, ...props}) => <ul className="space-y-1 my-2 list-none" {...props} />,
          ol: ({node, ...props}) => <ol className="space-y-1 my-2 list-decimal ml-4" {...props} />,
          li: ({node, ...props}) => <li className="ml-4 list-disc pl-1 mb-1 text-on-surface-variant" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-sm" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="pl-4 mb-2 border-l-2 border-primary/40 text-on-surface-variant/90 text-sm leading-relaxed" {...props} />
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});
