'use client';

import React from 'react';

export interface LoadingStateProps {
  message?: string;
  subtext?: string;
  mode?: 'compact' | 'full-page' | 'inline';
  className?: string;
}

const PIXEL_COLORS = ['bg-brand', 'bg-ink', 'bg-lilac', 'bg-ink', 'bg-brand', 'bg-lilac', 'bg-lilac', 'bg-brand', 'bg-ink'];

/** Playful 3x3 grid of pixel blocks that pulse in a diagonal wave. */
function PixelLoader() {
  return (
    <div className="grid grid-cols-3 gap-1 p-2 bg-paper border-2 border-ink rounded-[var(--radius-sm)] shadow-hd" aria-hidden="true">
      {PIXEL_COLORS.map((color, i) => (
        <span
          key={i}
          className={`block w-3.5 h-3.5 ${color} hd-pulse-dot`}
          style={{ animationDelay: `${((i % 3) + Math.floor(i / 3)) * 140}ms` }}
        />
      ))}
    </div>
  );
}

export default function LoadingState({
  message = "Loading competition data...",
  subtext,
  mode = "compact",
  className = '',
}: LoadingStateProps) {
  if (mode === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 text-xs font-mono text-charcoal ${className}`}>
        <span className="inline-flex items-end gap-0.5 h-3.5" aria-hidden="true">
          <span className="block w-1.5 h-full bg-brand animate-wave-1 origin-bottom" />
          <span className="block w-1.5 h-full bg-ink animate-wave-2 origin-bottom" />
          <span className="block w-1.5 h-full bg-lilac animate-wave-3 origin-bottom" />
        </span>
        <span>{message}</span>
      </div>
    );
  }

  const containerClasses = mode === 'full-page'
    ? 'min-h-[60vh] flex flex-col items-center justify-center p-8 text-center'
    : 'p-6 hd-card-flat flex flex-col items-center justify-center text-center my-4';

  return (
    <div className={`${containerClasses} ${className}`} role="status" aria-live="polite">
      <div className="mb-4">
        <PixelLoader />
      </div>
      <p className="text-sm font-bold font-mono text-ink">
        {message}
        <span className="hd-blink" aria-hidden="true">_</span>
      </p>
      {subtext && <p className="text-xs text-muted mt-1.5">{subtext}</p>}
    </div>
  );
}
