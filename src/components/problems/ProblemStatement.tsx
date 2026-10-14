'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import { IDEMode, CodeConstraint } from '@/types/problem';

interface ProblemStatementProps {
  statement: string;
  mode?: IDEMode;
  activeConstraints?: CodeConstraint[];
}

export default function ProblemStatement({ statement, mode, activeConstraints }: ProblemStatementProps) {
  return (
    <div className="flex flex-col gap-6 text-[15px] sm:text-base text-charcoal select-text leading-[1.65] font-sans pb-8">
      {/* Markdown Content */}
      <div className="max-w-[72ch] [&_strong]:font-bold [&_strong]:text-ink [&_em]:italic [&_a]:text-ink [&_a]:underline [&_a]:decoration-brand [&_a]:decoration-2 [&_a]:underline-offset-2 [&_blockquote]:border-l-4 [&_blockquote]:border-brand [&_blockquote]:bg-sand [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:rounded-r-[var(--radius-sm)] [&_hr]:my-6 [&_hr]:border-[var(--border-subtle)] [&_table]:w-full [&_table]:my-4 [&_table]:text-sm [&_table]:border-2 [&_table]:border-ink [&_table]:border-collapse [&_th]:bg-ink [&_th]:text-cream [&_th]:font-mono [&_th]:text-[11px] [&_th]:uppercase [&_th]:tracking-wider [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border-t [&_td]:border-[var(--border-subtle)] [&_td]:px-3 [&_td]:py-2 [&_img]:max-w-full [&_img]:h-auto [&_img]:border-2 [&_img]:border-ink [&_img]:rounded-[var(--radius-sm)] [&_.katex-html]:hidden [&_.katex]:text-[1.05em] [&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:text-center">
        <ReactMarkdown
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
          components={{
            pre: ({ node, ...props }) => (
              <pre className="my-4 p-4 bg-cream border-2 border-ink rounded-[var(--radius-sm)] overflow-x-auto font-code text-[13px] leading-relaxed text-ink [&_code]:!bg-transparent [&_code]:!border-0 [&_code]:!p-0 [&_code]:!text-[inherit] [&_.hljs-keyword]:text-[#b8321f] [&_.hljs-built_in]:text-[#5b3fb8] [&_.hljs-type]:text-[#5b3fb8] [&_.hljs-string]:text-[#0f5b31] [&_.hljs-number]:text-[#8a5a00] [&_.hljs-comment]:text-muted [&_.hljs-comment]:italic [&_.hljs-title]:font-bold" {...props} />
            ),
            code: ({ node, ...props }) => (
              <code className="px-1.5 py-0.5 bg-sand text-ink border border-[var(--border-subtle)] rounded font-code text-[0.86em] break-words" {...props} />
            ),
            h1: ({ node, ...props }) => <h3 className="hd-h3 !text-xl text-ink mt-6 mb-3 first:mt-0" {...props} />,
            h2: ({ node, ...props }) => <h4 className="font-display tracking-[-0.02em] text-lg text-ink mt-6 mb-2 first:mt-0" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc marker:text-brand pl-5 mb-4 flex flex-col gap-1.5" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal marker:text-ink marker:font-mono marker:text-sm pl-6 mb-4 flex flex-col gap-1.5" {...props} />,
            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
          }}
        >
          {statement}
        </ReactMarkdown>
      </div>


    </div>
  );
}
