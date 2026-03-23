"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export function MathText({ text }: { text: string }) {
  return (
    <div className="w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-5 mb-3 text-gray-900 dark:text-white" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-md font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-100" {...props} />,
          p: ({node, ...props}) => <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 mb-4 space-y-1 text-gray-700 dark:text-gray-300" {...props} />,
          li: ({node, ...props}) => <li className="pl-1" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-violet-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 py-2 pr-4 rounded-r" {...props} />,
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-4 w-full">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10 border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden" {...props} />
            </div>
          ),
          th: ({node, ...props}) => <th className="px-4 py-2 bg-gray-50 dark:bg-white/5 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10" {...props} />,
          td: ({node, ...props}) => <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-white/10" {...props} />,
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            
            // Standardize diagram rendering if AI returns SVG wrapped in ```svg
            if (!inline && lang === 'svg') {
               return (
                  <div 
                    className="overflow-x-auto p-6 my-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-inner flex justify-center items-center"
                    dangerouslySetInnerHTML={{ __html: String(children).replace(/\n$/, '') }} 
                  />
               )
            }

            return !inline ? (
              <div className="overflow-x-auto p-4 my-4 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl font-mono text-[0.85rem] leading-relaxed text-gray-800 dark:text-gray-200 shadow-inner">
                <pre><code className={className} {...props}>{children}</code></pre>
              </div>
            ) : (
              <code className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-violet-700 dark:text-violet-300 font-mono text-sm" {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

