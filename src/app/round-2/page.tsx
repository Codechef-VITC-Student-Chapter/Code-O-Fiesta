'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import RelayInstructions from '@/components/round2/RelayInstructions';
import PixelCluster from '@/components/brand/PixelCluster';
import { problemsService } from '@/services/problems';
import { useTeamResults } from '@/hooks/useTeamResults';

// ── Right sidebar ────────────────────────────────────────────────────────────
function Round2Sidebar({ roundScore }: { roundScore: number }) {
  const overview = [
    { label: 'Round Name', value: 'Blind Relay' },
    { label: 'Duration', value: '30 Minutes' },
    { label: 'Format', value: 'Team Relay' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Live score */}
      <div className="hd-card-lilac p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="hd-label text-ink mb-1">Your Score</h3>
          <p className="text-xs text-ink/75">This round</p>
        </div>
        <div className="hd-display text-4xl text-ink leading-none">
          {roundScore} <span className="font-mono text-sm tracking-normal">PTS</span>
        </div>
      </div>

      <div className="hd-card p-5">
        <h3 className="hd-label text-muted mb-4">ROUND 2 OVERVIEW</h3>
        <dl className="divide-y divide-[var(--border-subtle)] text-sm">
          {overview.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="text-charcoal">{item.label}</dt>
              <dd className="font-mono font-bold text-ink text-right">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function Round2PageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { getRoundScore } = useTeamResults();

  const handleEnterRound = async () => {
    try {
      setLoading(true);
      // Start the round
      await problemsService.startRound(2);
      
      // Fetch current state
      const stateRes = await problemsService.fetchRoundState(2);
      const qNum = stateRes.currentQuestionNumber || 1;
      
      // Fetch questions
      const qsRes = await problemsService.fetchRoundProblems(2);
      let problemId = 'prob-1'; // fallback
      
      const questions = (qsRes as any).questions;
      if (questions && Array.isArray(questions)) {
        const qIdx = qNum - 1;
        if (questions[qIdx] && questions[qIdx].problemId) {
          problemId = questions[qIdx].problemId;
        } else if (questions[0] && questions[0].problemId) {
          problemId = questions[0].problemId;
        }
      }
      
      router.push(`/round-2/problem/${problemId}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <ParticipantLayout rightSidebar={<Round2Sidebar roundScore={getRoundScore(2)} />}>
      <style>{`
        a[href="/round-2"] > span:last-child {
          background: var(--ok-soft) !important;
          border: 1.5px solid #0f5b31 !important;
          color: transparent !important;
          font-size: 0 !important;
        }
        a[href="/round-2"] > span:last-child::after {
          content: 'ACTIVE';
          color: #0f5b31;
          font-family: var(--font-mono);
          font-size: 9px;
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="hd-label text-muted">
          Dashboard <span className="mx-1.5" aria-hidden="true">›</span>
          <span className="text-ink">Round 2</span>
        </div>

        <section className="relative overflow-hidden hd-card-lilac px-5 py-7 sm:px-9 sm:py-10">
          <PixelCluster
            className="pointer-events-none absolute right-4 top-4 hidden sm:block"
            color="var(--ink)"
            accent="var(--paper)"
            variant="scatter"
            cell={12}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8">
            <span className="hd-display text-[clamp(4.5rem,3rem+6vw,8rem)] leading-[0.8] text-ink shrink-0" aria-hidden="true">
              02
            </span>
            <div className="min-w-0 max-w-2xl">
              <span className="hd-badge hd-badge-ink">
                <span className="hd-dot bg-lilac" aria-hidden="true" />
                ROUND 2
              </span>
              <h1 className="hd-h1 text-ink mt-3">
                Blind <span className="bg-paper px-[0.12em]">Relay</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-ink">
                Build a solution together in a fast-paced relay challenge. Open the workspace to view the assigned problem and use the existing coding environment.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="hd-badge">Shared workspace</span>
                <span className="hd-badge">Problem + editor</span>
              </div>

              <button
                onClick={handleEnterRound}
                disabled={loading}
                className="hd-btn hd-btn-dark hd-btn-lg mt-8 w-full sm:w-auto"
              >
                {loading ? 'STARTING...' : 'ENTER ROUND 2'}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>

        <div className="round2-instructions">
          <RelayInstructions />
        </div>
      </div>
    </ParticipantLayout>
  );
}

export default function Round2Page() {
  return <Round2PageContent />;
}

