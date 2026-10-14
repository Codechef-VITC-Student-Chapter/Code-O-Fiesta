'use client';

import React from 'react';
import Link from 'next/link';
import AuthGuard from '@/app/guards/AuthGuard';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import SummaryCard from '@/components/dashboard/SummaryCard';
import RulesAndRegulations from '@/components/dashboard/RulesAndRegulations';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import PixelCluster from '@/components/brand/PixelCluster';
import { useEventState } from '@/hooks/useEventState';
import { useTeamResults } from '@/hooks/useTeamResults';

const ROUND_ROUTES: Record<0 | 1 | 2 | 3, string> = {
  0: '/round-1',
  1: '/round-1',
  2: '/round-2',
  3: '/round-3',
};

function DashboardContent() {
  const eventState = useEventState();
  const { loading, error, refresh, currentRound, eventStatus } = eventState;
  const { results, totalScore } = useTeamResults();

  if (loading) {
    return (
      <ParticipantLayout>
        <LoadingState message="Connecting to event server..." mode="full-page" />
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <ErrorState variant="connection" title="Connection Interrupted" message={error} onRetry={refresh} />
      </ParticipantLayout>
    );
  }

  const enterHref = eventStatus === 'COMPLETED' ? '/results' : (ROUND_ROUTES[currentRound] || '/round-1');
  const stageLabel =
    eventStatus === 'COMPLETED' ? 'COMPLETED' : `ROUND 0${currentRound || 1}`;
  const teamName = results?.teamName || '—';

  return (
    <ParticipantLayout>
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Team info — name, current stage, total points */}
        <section className="relative overflow-hidden hd-card p-6 sm:p-10 hd-rise">
          <div className="absolute inset-0 hd-dots opacity-50 pointer-events-none" aria-hidden="true" />
          <PixelCluster className="absolute top-4 right-4 sm:top-6 sm:right-8 hd-float hidden min-[420px]:block" cell={10} />

          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-3 min-w-0 pr-0 min-[420px]:pr-16">
              <span className="hd-kicker text-ink">Your dashboard · Team</span>
              <h1 className="hd-display leading-[1.05] text-[clamp(2.25rem,1.2rem+5vw,4.75rem)] break-words">
                <span className="hd-highlight">{teamName}</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              <SummaryCard
                title="CURRENT STAGE"
                value={stageLabel}
                accentColor="purple"
                icon={
                  <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1v2.5M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1m2 1l2-1m-2 1v-2.5M18 18l-2-1m2 1l2-1m-2 1v-2.5"
                    />
                  </svg>
                }
              />

              <SummaryCard
                title="TOTAL POINTS"
                value={`${totalScore} PTS`}
                accentColor="purple"
                icon={
                  <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </section>

        {/* Rules & Regulations */}
        <RulesAndRegulations />

        {/* Enter Event action button */}
        <Link href={enterHref} className="group hd-btn hd-btn-primary hd-btn-lg hd-btn-block">
          <span>ENTER EVENT</span>
          <svg
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </ParticipantLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard requiredRole="PARTICIPANT">
      <DashboardContent />
    </AuthGuard>
  );
}
