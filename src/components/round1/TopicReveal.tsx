'use client';

import React, { useEffect, useState } from 'react';
import { ShapeType } from './ShapeCard';

export interface TopicRevealProps {
  pathId: number;
  shape: ShapeType;
  topic: string;          // e.g. "Basic Math & Numbers"
  description?: string;
  onContinue: () => void;
}

const shapeMeta: Record<ShapeType, { label: string; tile: string }> = {
  triangle: { label: 'Triangle', tile: 'bg-brand' },
  circle:   { label: 'Circle',   tile: 'bg-lilac' },
  square:   { label: 'Square',   tile: 'bg-sand' },
  star:     { label: 'Star',     tile: 'bg-paper' },
};

export default function TopicReveal({
  pathId,
  shape,
  topic,
  description = 'Three problems await you in this domain. Solve them in any order.',
  onContinue,
}: TopicRevealProps) {
  const [phase, setPhase] = useState<'locked' | 'revealing' | 'revealed'>('locked');
  const meta = shapeMeta[shape];

  useEffect(() => {
    // Animation sequence
    const t1 = setTimeout(() => setPhase('revealing'), 600);
    const t2 = setTimeout(() => setPhase('revealed'), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto">
        <div className="relative hd-card shadow-hd-lg p-6 sm:p-8 text-center overflow-hidden">
          <div className="absolute inset-0 hd-dots opacity-50 pointer-events-none" aria-hidden="true" />

          <div className="relative">
            {/* Header */}
            <div className="mb-6 flex justify-center">
              <span className="hd-badge hd-badge-ink">
                Path {pathId.toString().padStart(2, '0')} · {meta.label}
              </span>
            </div>

            {/* Locked / Revealing state */}
            {phase !== 'revealed' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className={`
                  w-24 h-24 rounded-xl border-2 border-dashed border-ink bg-sand
                  flex items-center justify-center
                  transition-all duration-700
                  ${phase === 'revealing' ? 'scale-110 border-solid bg-brand rotate-12 shadow-hd' : ''}
                `}>
                  <svg className="w-10 h-10 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="hd-label text-charcoal hd-blink">
                  {phase === 'locked' ? 'Decrypting domain…' : 'Revealing topic…'}
                </p>
              </div>
            )}

            {/* Revealed state */}
            {phase === 'revealed' && (
              <div className="hd-pop">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-xl mb-5 border-2 border-ink shadow-hd -rotate-3 ${meta.tile}`}>
                  <span className="text-4xl font-bold text-ink leading-none">
                    {shape === 'triangle' ? '△' : shape === 'circle' ? '○' : shape === 'square' ? '□' : '☆'}
                  </span>
                </div>

                <div className="flex justify-center mb-3">
                  <span className="hd-kicker text-ink">Domain Unlocked</span>
                </div>
                <h2 className="hd-h1 text-ink mb-4 break-words">
                  {topic}
                </h2>
                <p className="text-sm text-charcoal max-w-sm mx-auto mb-8 leading-relaxed">
                  {description}
                </p>

                <button
                  type="button"
                  onClick={onContinue}
                  className="hd-btn hd-btn-primary hd-btn-lg w-full sm:w-auto"
                >
                  ENTER THE ARENA →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
