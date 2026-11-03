'use client';

import React, { useState } from 'react';
import ShapeCard, { ShapeType } from './ShapeCard';
import ShapeConfirmation from './ShapeConfirmation';
import PixelCluster from '@/components/brand/PixelCluster';

const PATHS: { id: number; shape: ShapeType }[] = [
  { id: 1, shape: 'triangle' },
  { id: 2, shape: 'circle' },
  { id: 3, shape: 'square' },
  { id: 4, shape: 'star' },
];

interface PathProps {
  onPathConfirmed?: (pathId: number) => void;
}

export default function Path({ onPathConfirmed }: PathProps) {
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    if (selectedPath !== null) {
      onPathConfirmed?.(selectedPath);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header section */}
      <div className="relative overflow-hidden hd-card p-6 sm:p-8 lg:p-10">
        <div className="absolute inset-0 hd-dots opacity-60 pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-10 items-start lg:items-center">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-6 flex-1 min-w-0">
            <span
              className="hd-display text-[clamp(4.5rem,3rem+6vw,8rem)] leading-[0.8] text-brand shrink-0"
              aria-hidden="true"
            >
              01
            </span>
            <div className="min-w-0 sm:pt-1">
              <span className="hd-kicker text-ink">Round 1</span>
              <h1 className="hd-h1 text-ink mt-3 mb-4">
                The <span className="hd-highlight">Path</span> of Fate
              </h1>
              <p className="text-sm sm:text-base text-charcoal max-w-xl leading-relaxed">
                Four mysterious paths lie ahead. Each path leads to a different domain.
                Choose wisely — once confirmed, your path is locked.
              </p>
            </div>
          </div>

          {/* Decorative sticker */}
          <div className="hidden lg:flex relative w-56 h-40 items-center justify-center shrink-0" aria-hidden="true">
            <PixelCluster className="absolute -top-2 right-0 hd-float" cell={12} />
            <div className="hd-card-lilac px-4 py-3 -rotate-6">
              <p className="font-mono text-xs uppercase tracking-[0.1em] leading-relaxed text-ink">
                4 paths
                <br />
                1 domain each
                <br />
                No take-backs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Choose your path */}
      <div className="flex items-center gap-3">
        <span className="h-[2px] flex-1 bg-ink" aria-hidden="true" />
        <span className="hd-label text-ink">CHOOSE YOUR PATH</span>
        <span className="h-[2px] flex-1 bg-ink" aria-hidden="true" />
      </div>

      {/* Shape cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {PATHS.map((path) => (
          <ShapeCard
            key={path.id}
            pathNumber={path.id}
            shape={path.shape}
            selected={selectedPath === path.id}
            onSelect={() => setSelectedPath(path.id)}
          />
        ))}
      </div>

      {/* Warning banner */}
      <div className="hd-alert hd-alert-info">
        <svg className="w-4 h-4 mt-0.5 shrink-0 text-ink" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-ink leading-relaxed">
          Once you confirm your path, the domain will be revealed and you cannot change it.
        </p>
      </div>

      {/* Confirm button */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          type="button"
          disabled={selectedPath === null}
          onClick={() => setShowConfirm(true)}
          className="hd-btn hd-btn-primary hd-btn-lg w-full sm:w-auto"
        >
          CONFIRM YOUR PATH →
        </button>
        <div className="flex items-center gap-1.5 hd-label text-muted text-center">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your choice will be final and locked
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && selectedPath !== null && (
        <ShapeConfirmation
          pathId={selectedPath}
          shape={PATHS.find((p) => p.id === selectedPath)!.shape}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
