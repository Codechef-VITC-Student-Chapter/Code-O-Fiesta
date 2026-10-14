'use client';

import React from 'react';
import PixelCluster from '@/components/brand/PixelCluster';
import Sticker from '@/components/brand/Sticker';

interface VictoryHeroProps {
  teamName: string;
}

export default function VictoryHero({ teamName }: VictoryHeroProps) {
  return (
    <div className="relative overflow-hidden hd-card bg-paper px-5 py-10 sm:px-10 sm:py-14 md:px-14 md:py-16 text-ink">
      {/* Decorative background */}
      <div className="absolute inset-0 hd-dots opacity-50 pointer-events-none" aria-hidden="true" />
      <PixelCluster className="absolute right-4 top-4 sm:right-10 sm:top-8 hd-float" cell={14} />
      <PixelCluster
        className="absolute left-4 bottom-4 hidden sm:block"
        variant="block"
        color="var(--lilac)"
        accent="var(--brand)"
        cell={10}
      />

      <div className="relative z-10 flex flex-col items-start gap-5 max-w-3xl">
        {/* Top Tagline */}
        <span className="hd-kicker text-ink">Hackday 2026</span>

        {/* Dynamic Team Heading */}
        <h1 className="hd-display text-[clamp(2.75rem,1.4rem+6vw,6.5rem)] break-words max-w-full">
          Congratulations,
          <br />
          <span className="hd-highlight">{teamName || 'CHAMPIONS'}</span>!
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-charcoal max-w-lg leading-relaxed">
          You have successfully completed all rounds of Hackday 2026.
        </p>
      </div>

      {/* Arena Conquered Badge */}
      <div className="relative z-10 mt-8 flex justify-end">
        <Sticker tone="lilac" rotate={-5} className="hd-pop hd-delay-2">
          <span className="flex items-center gap-2 font-mono text-sm uppercase tracking-[0.08em]">
            <span className="text-xl" aria-hidden="true">🏆</span>
            <span>Arena conquered</span>
          </span>
        </Sticker>
      </div>
    </div>
  );
}
