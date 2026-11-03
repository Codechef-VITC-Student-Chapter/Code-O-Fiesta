import React from 'react';

export interface StickerProps {
  children: React.ReactNode;
  tone?: 'lilac' | 'brand' | 'paper' | 'ink';
  rotate?: number;
  className?: string;
}

const TONES: Record<NonNullable<StickerProps['tone']>, string> = {
  lilac: 'bg-lilac text-ink',
  brand: 'bg-brand text-ink',
  paper: 'bg-paper text-ink',
  ink: 'bg-ink text-cream',
};

/** A tilted label card with a hard drop shadow, like the poster's stickers. */
export default function Sticker({ children, tone = 'lilac', rotate = -4, className = '' }: StickerProps) {
  return (
    <div
      className={`inline-block border-2 border-ink rounded-xl px-4 py-3 shadow-hd ${TONES[tone]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  );
}
