'use client';

import React from 'react';
import { RoundStatus } from '@/constants/event';
import { useRoundStatus } from '@/hooks/useRoundStatus';
import { useTeamResults } from '@/hooks/useTeamResults';
import LoadingState from '@/components/common/LoadingState';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import PixelCluster from '@/components/brand/PixelCluster';

export interface RoundGateProps {
  roundNumber: number;
  roundName: string;
  children: React.ReactNode;
}

function LockIcon({ colorClass }: { colorClass: string }) {
  return (
    <div className={`p-4 rounded-[var(--radius)] border-2 border-ink shadow-hd ${colorClass}`}>
      <svg className="w-9 h-9" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    </div>
  );
}

// Full "Round Not Active" screen — shown for any round that isn't the one
// currently opened by the organizers (upcoming, paused, or superseded by a
// different active round). Round.status is the single backend source of
// truth this reads from; maxScore comes from the same status payload rather
// than being hardcoded on the page.
function RoundNotActiveScreen({
  roundNumber,
  roundName,
  status,
  maxScore,
}: {
  roundNumber: number;
  roundName: string;
  status: RoundStatus;
  maxScore: number;
}) {
  const isPaused = status === RoundStatus.PAUSED;

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 text-center py-16 sm:py-20 px-4 min-h-[60vh]">
      <PixelCluster className="absolute top-4 right-2 sm:right-10 hd-float hidden min-[420px]:block" cell={10} />
      <span className="hd-kicker text-ink">
        Round {roundNumber}
      </span>
      <h1 className="hd-display text-[clamp(2.25rem,1.2rem+4.5vw,4.5rem)] text-ink break-words max-w-3xl">{roundName}</h1>

      <LockIcon colorClass={isPaused ? 'bg-warn-soft text-[#6e4a00]' : 'bg-lilac text-ink'} />

      <div className="flex flex-col gap-2">
        <h2 className="hd-h3 text-ink">
          {isPaused ? 'Round paused' : 'Round not active'}
        </h2>
        <p className="text-sm text-charcoal max-w-md leading-relaxed">
          {isPaused
            ? 'The organizers have temporarily paused this round. Please wait for it to resume.'
            : 'This round is currently unavailable. Please wait for the organizers to activate this round.'}
        </p>
      </div>

      <div className="hd-card px-8 sm:px-10 py-6 flex flex-col items-center gap-2">
        <span className="hd-label text-muted">
          Round Points
        </span>
        <span className="hd-display text-5xl text-ink">
          {maxScore} <span className="font-mono text-base text-muted tracking-normal">PTS</span>
        </span>
      </div>
    </div>
  );
}

export default function RoundGate({ roundNumber, roundName, children }: RoundGateProps) {
  const { data, loading, error } = useRoundStatus(roundNumber);
  const { getRoundScore, loading: scoreLoading } = useTeamResults();

  if (loading) {
    return (
      <ParticipantLayout>
        <LoadingState message={`Checking Round ${roundNumber} status...`} mode="full-page" />
      </ParticipantLayout>
    );
  }

  // Fail open on a status-check error — a transient network hiccup shouldn't
  // lock participants out of a round that's actually live.
  if (error || !data) {
    return <>{children}</>;
  }

  if (data.status === RoundStatus.COMPLETED) {
    const score = getRoundScore(roundNumber);
    return (
      <ParticipantLayout>
        <div className="relative flex flex-col items-center justify-center gap-6 text-center py-16 px-4">
          <PixelCluster className="absolute top-2 right-2 sm:right-10 hd-float hidden min-[420px]:block" color="var(--lilac)" accent="var(--brand)" cell={10} />
          <div className="hd-kicker text-ink">
            Round {roundNumber} &middot; {roundName}
          </div>
          <h1 className="hd-display leading-[1.05] text-[clamp(2.25rem,1.2rem+4.5vw,4.5rem)] text-ink">Round <span className="hd-highlight">completed</span></h1>
          <div className="hd-card-lilac px-8 sm:px-12 py-8">
            <div className="hd-label text-ink mb-3">
              Points Earned
            </div>
            <div className="hd-display text-6xl text-ink">
              {scoreLoading ? '—' : score} <span className="font-mono text-lg tracking-normal">PTS</span>
            </div>
          </div>
          <p className="text-sm text-charcoal max-w-sm leading-relaxed">
            This round has ended and is no longer accepting submissions. Check the Results page for the full leaderboard.
          </p>
        </div>
      </ParticipantLayout>
    );
  }

  if (data.status !== RoundStatus.ACTIVE) {
    return (
      <ParticipantLayout>
        <RoundNotActiveScreen
          roundNumber={roundNumber}
          roundName={roundName}
          status={data.status}
          maxScore={data.maxScore}
        />
      </ParticipantLayout>
    );
  }

  return <>{children}</>;
}
