'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import PixelCluster from '@/components/brand/PixelCluster';
import TopicReveal from '@/components/round1/TopicReveal';
import Round1ProblemList, { Round1Problem } from '@/components/round1/Round1ProblemList';
import { ShapeType } from '@/components/round1/ShapeCard';
import { problemsService } from '@/services/problems';
import { useTeamResults } from '@/hooks/useTeamResults';

const PATH_TOPICS: Record<number, { shape: ShapeType; topic: string; description: string }> = {
  1: {
    shape: 'triangle',
    topic: 'Basic Math & Numbers',
    description: 'Three problems focused on number theory and arithmetic. Solve them in any order.',
  },
  2: {
    shape: 'circle',
    topic: 'String Manipulation',
    description: 'Three problems focused on strings and character processing. Solve them in any order.',
  },
  3: {
    shape: 'square',
    topic: '1D Arrays & Logic',
    description: 'Three problems focused on arrays and basic algorithmic thinking. Solve them in any order.',
  },
  4: {
    shape: 'star',
    topic: 'Loops & Patterns',
    description: 'Three problems focused on loops and pattern printing. Solve them in any order.',
  },
};

// ── Right sidebar ────────────────────────────────────────────────────────────
function Round1Sidebar({
  topic,
  solvedCount,
  total,
  roundScore,
  maxRoundScore,
}: {
  topic: string;
  solvedCount: number;
  total: number;
  roundScore: number;
  maxRoundScore: number;
}) {
  const overview = [
    { label: 'Round Name', value: 'The Path of Fate' },
    { label: 'Duration', value: '60 Minutes' },
    { label: 'Problems', value: `${total} Problems` },
    { label: 'Solve Order', value: 'Any Order' },
    { label: 'Max Score', value: `${maxRoundScore} Points` },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Live score */}
      <div className="hd-card-brand p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="hd-label text-ink mb-1">Your Score</h3>
          <p className="text-xs text-ink/80">This round</p>
        </div>
        <div className="hd-display text-4xl text-ink leading-none">
          {roundScore} <span className="font-mono text-sm tracking-normal">PTS</span>
        </div>
      </div>

      {/* Selected domain */}
      <div className="hd-card p-5">
        <h3 className="hd-label text-muted mb-2">YOUR DOMAIN</h3>
        <p className="hd-h3 text-ink break-words">{topic}</p>
        <div className="mt-3">
          <span className="hd-badge hd-badge-ink">
            {solvedCount} of {total} solved
          </span>
        </div>
      </div>

      {/* Overview */}
      <div className="hd-card p-5">
        <h3 className="hd-label text-muted mb-4">ROUND 1 OVERVIEW</h3>
        <dl className="divide-y divide-[var(--border-subtle)] text-sm">
          {overview.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="text-charcoal">{item.label}</dt>
              <dd className="font-mono font-bold text-ink text-right">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Tips */}
      <div className="hd-card-flat bg-sand p-5">
        <h3 className="hd-label text-ink mb-3">TIPS</h3>
        <ol className="space-y-2.5 text-sm text-charcoal">
          {[
            'You can solve the problems in any order.',
            'Partial progress is saved automatically.',
            'Focus on correctness first, then speed.',
          ].map((tip, i) => (
            <li key={tip} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-paper font-mono text-[0.7rem] font-bold text-ink">
                {i + 1}
              </span>
              <span className="pt-0.5">{tip}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
function Round1PageContent() {
  const router = useRouter();
  const { getRoundScore } = useTeamResults();

  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [problems, setProblems] = useState<Round1Problem[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);
  const [problemError, setProblemError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cof-round1-path');
    if (stored) {
      const pathId = Number(stored);
      setSelectedPath(pathId);

      const alreadyRevealed = sessionStorage.getItem('cof-round1-revealed');
      if (!alreadyRevealed) {
        setShowReveal(true);
      }
    } else {
      router.replace('/round-1/path');
    }
  }, [router]);

  useEffect(() => {
    if (selectedPath === null) return;

    let active = true;

    async function loadAssignedProblems() {
      setIsLoadingProblems(true);
      setProblemError(null);

      try {
        const assignedProblems = await problemsService.fetchRoundProblems(1);

        if (!active) return;

        const normalizedProblems: Round1Problem[] = assignedProblems
          .map((problem): Round1Problem | null => {
            const id = problem.id ?? (problem as any)._id ?? '';
            if (!id) return null;

            const normalizedDifficulty: 'Easy' | 'Medium' | 'Hard' =
              problem.difficulty === 'medium'
                ? 'Medium'
                : problem.difficulty === 'hard'
                  ? 'Hard'
                  : 'Easy';

            const backendStatus = String(problem.status ?? 'PENDING').toUpperCase();
            const normalizedStatus: Round1Problem['status'] =
              backendStatus === 'SOLVED'
                ? 'solved'
                : backendStatus === 'IN_PROGRESS' || backendStatus === 'FAILED'
                  ? 'attempted'
                  : 'available';

            return {
              id,
              title: problem.title ?? 'Untitled Problem',
              difficulty: normalizedDifficulty,
              maxScore: typeof problem.points === 'number' ? problem.points : 50,
              status: normalizedStatus,
              earnedScore: typeof (problem as any).earnedScore === 'number' ? (problem as any).earnedScore : 0,
              testsPassed: typeof (problem as any).testsPassed === 'number' ? (problem as any).testsPassed : 0,
              totalTests: typeof (problem as any).totalTests === 'number' ? (problem as any).totalTests : 0,
            };
          })
          .filter((problem): problem is Round1Problem => !!problem);

        setProblems(normalizedProblems);
      } catch (error: any) {
        if (!active) return;
        setProblemError(error?.message || 'Unable to load assigned problems.');
        setProblems([]);
      } finally {
        if (active) {
          setIsLoadingProblems(false);
        }
      }
    }

    loadAssignedProblems();

    return () => {
      active = false;
    };
  }, [selectedPath]);

  const handleRevealContinue = () => {
    sessionStorage.setItem('cof-round1-revealed', '1');
    setShowReveal(false);
  };

  // Still loading path decision
  if (selectedPath === null) {
    return (
      <ParticipantLayout>
        <div className="flex items-center justify-center min-h-[40vh] hd-label text-muted">
          Loading your path…
        </div>
      </ParticipantLayout>
    );
  }

  const pathInfo = PATH_TOPICS[selectedPath];
  const solvedCount = problems.filter((p) => p.status === 'solved').length;
  const maxRoundScore = problems.reduce((sum, p) => sum + (p.maxScore || 0), 0);

  return (
    <>
      {showReveal && pathInfo && (
        <TopicReveal
          pathId={selectedPath}
          shape={pathInfo.shape}
          topic={pathInfo.topic}
          description={pathInfo.description}
          onContinue={handleRevealContinue}
        />
      )}

      <ParticipantLayout
        rightSidebar={
          <Round1Sidebar
            topic={pathInfo.topic}
            solvedCount={solvedCount}
            total={problems.length}
            roundScore={getRoundScore(1)}
            maxRoundScore={maxRoundScore}
          />
        }
      >
        <div className="hd-label text-muted">
          Dashboard <span className="mx-1.5" aria-hidden="true">›</span>
          <span className="text-ink">Round 1</span>
        </div>

        <div className="relative overflow-hidden hd-card p-5 sm:p-7">
          <div className="absolute inset-0 hd-dots opacity-50 pointer-events-none" aria-hidden="true" />
          <PixelCluster className="absolute right-4 top-4 hidden sm:block" cell={10} />
          <div className="relative flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-6">
            <span className="hd-display text-[clamp(4rem,3rem+4vw,6.5rem)] leading-[0.8] text-brand" aria-hidden="true">
              01
            </span>
            <div className="min-w-0">
              <span className="hd-kicker text-ink">ROUND 1</span>
              <h1 className="hd-h1 text-ink mt-2">
                The Path of Fate
              </h1>
            </div>
          </div>
        </div>

        <Round1ProblemList
          pathLabel={`PATH ${selectedPath.toString().padStart(2, '0')} · ${pathInfo.shape.toUpperCase()}`}
          topic={pathInfo.topic}
          problems={problems}
          loading={isLoadingProblems}
          error={problemError}
        />
      </ParticipantLayout>
    </>
  );
}

export default function Round1Page() {
  return <Round1PageContent />;
}