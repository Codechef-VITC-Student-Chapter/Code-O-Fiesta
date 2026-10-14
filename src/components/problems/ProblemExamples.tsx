'use client';

import React, { useState } from 'react';
import { Example } from '@/types/problem';

interface ProblemExamplesProps {
  examples: Example[];
  onUseAsInput?: (input: string) => void;
}

export default function ProblemExamples({ examples, onUseAsInput }: ProblemExamplesProps) {
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-8 select-text">
      {examples.length === 0 ? (
        <div className="text-center font-mono text-xs text-muted py-6 select-none">
          No example test cases provided.
        </div>
      ) : (
        examples.map((ex, idx) => {
          const inputKey = `input_${idx}`;
          const outputKey = `output_${idx}`;
          const hasInput = !!ex.input;

          return (
            <div
              key={idx}
              className="hd-card !shadow-hd-sm overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center gap-2 bg-sand border-b-2 border-ink px-4 py-2 select-none">
                <span className="font-display text-base tracking-[-0.02em] text-ink">
                  Example {idx + 1}
                </span>
                {hasInput && onUseAsInput && (
                  <button
                    onClick={() => onUseAsInput(ex.input)}
                    type="button"
                    className="hd-btn hd-btn-lilac hd-btn-sm !min-h-8 !py-1 !px-3 !text-[10px]"
                  >
                    Use as Input
                  </button>
                )}
              </div>

              {/* Code blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {/* Input */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1 select-none">
                    <span className="hd-label text-muted">Input</span>
                    <button
                      onClick={() => handleCopy(ex.input, inputKey)}
                      type="button"
                      className="min-h-7 px-2 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-ink border border-transparent hover:border-ink hover:bg-paper cursor-pointer"
                    >
                      {copiedStates[inputKey] ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 bg-cream border-2 border-ink rounded-[var(--radius-sm)] font-code text-[13px] leading-relaxed text-ink overflow-auto max-h-[180px] whitespace-pre">
                    {ex.input}
                  </pre>
                </div>

                {/* Output */}
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-1 select-none">
                    <span className="hd-label text-muted">Output</span>
                    <button
                      onClick={() => handleCopy(ex.output, outputKey)}
                      type="button"
                      className="min-h-7 px-2 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-ink border border-transparent hover:border-ink hover:bg-paper cursor-pointer"
                    >
                      {copiedStates[outputKey] ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 bg-cream border-2 border-ink rounded-[var(--radius-sm)] font-code text-[13px] leading-relaxed text-ink overflow-auto max-h-[180px] whitespace-pre">
                    {ex.output}
                  </pre>
                </div>
              </div>

              {/* Explanation */}
              {ex.explanation && (
                <div className="px-4 pb-4">
                  <span className="hd-label text-muted block mb-1.5 select-none">
                    Explanation
                  </span>
                  <p className="text-[15px] font-sans text-charcoal bg-lilac-soft p-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] leading-[1.65]">
                    {ex.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
