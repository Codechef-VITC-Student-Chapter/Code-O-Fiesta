import React from 'react';
import Link from 'next/link';
import FinalScore from './FinalScore';
import PixelCluster from '@/components/brand/PixelCluster';
import Sticker from '@/components/brand/Sticker';

interface RoundBreakdown {
  roundNumber: number;
  roundName: string;
  status: string;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  completedAt: string | null;
  achievements: string[];
}

interface CompletionScreenProps {
  teamName: string;
  members: string[];
  grandTotalScore: number;
  rank: number;
  roundBreakdowns: RoundBreakdown[];
}

export default function CompletionScreen({
  teamName,
  members,
  grandTotalScore,
  rank,
  roundBreakdowns,
}: CompletionScreenProps) {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4 text-ink">
      {/* Poster header */}
      <div className="relative hd-card overflow-hidden px-5 py-10 sm:px-10 sm:py-14">
        <div className="absolute inset-0 hd-dots opacity-50 pointer-events-none" aria-hidden="true" />
        <PixelCluster className="absolute right-4 top-4 sm:right-8 sm:top-6 hd-float" cell={12} />
        <PixelCluster
          className="absolute left-4 bottom-4 hidden sm:block"
          variant="block"
          color="var(--lilac)"
          accent="var(--brand)"
          cell={9}
        />

        <div className="relative z-10 flex flex-col items-start gap-5">
          <span className="hd-kicker text-ink">Event complete</span>
          <h1 className="hd-display text-[clamp(3rem,1.6rem+6vw,6.5rem)]">
            That&apos;s a wrap,
            <br />
            <span className="hd-highlight">Hackday</span>
          </h1>

          {/* Team profile summary */}
          <Sticker tone="lilac" rotate={-2} className="mt-2 max-w-full">
            <p className="font-mono text-xs uppercase tracking-[0.08em] leading-relaxed">
              <span className="text-charcoal">Team: </span>
              <strong className="font-bold text-ink">{teamName}</strong>
              <span className="mx-2 text-charcoal" aria-hidden="true">/</span>
              <span className="text-charcoal">Members: </span>
              <strong className="font-bold text-ink">{members.join(', ')}</strong>
            </p>
          </Sticker>
        </div>
      </div>

      {/* Embedded Final Score Section */}
      <FinalScore
        grandTotalScore={grandTotalScore}
        rank={rank}
        roundBreakdowns={roundBreakdowns}
      />


    </div>
  );
}
