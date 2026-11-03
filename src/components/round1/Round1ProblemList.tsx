'use client';

import React from 'react';
import Link from 'next/link';

export type ProblemStatus = 'locked' | 'available' | 'attempted' | 'solved';

export interface Round1Problem {
  id: string;
  title: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  maxScore: number;
  status: ProblemStatus;
  solvedAt?: string;
  // Backend-authoritative testcase-based score earned so far for this
  // problem (best submission), and the testcase count behind it.
  earnedScore?: number;
  testsPassed?: number;
  totalTests?: number;
}

interface Round1ProblemListProps {
  problems: Round1Problem[];
  topic: string;
  pathLabel?: string;
  loading?: boolean;
  error?: string | null;
}

const statusConfig: Record<
  ProblemStatus,
  { label: string; badge: string; card: string; index: string }
> = {
  locked: {
    label: 'Locked',
    badge: 'hd-badge-muted',
    card: 'bg-sand',
    index: 'bg-paper text-muted',
  },
  available: {
    label: 'Available',
    badge: 'hd-badge-lilac',
    card: 'bg-paper',
    index: 'bg-lilac text-ink',
  },
  attempted: {
    label: 'Attempted',
    badge: 'hd-badge-warn',
    card: 'bg-paper',
    index: 'bg-warn-soft text-ink',
  },
  solved: {
    label: 'Solved',
    badge: 'hd-badge-ok',
    card: 'bg-ok-soft',
    index: 'bg-ink text-cream',
  },
};

function StatusBadge({ status }: { status: ProblemStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`hd-badge ${cfg.badge}`}>
      {status === 'solved' && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {cfg.label}
    </span>
  );
}

export default function Round1ProblemList({
  problems,
  topic,
  pathLabel,
  loading = false,
  error = null,
}: Round1ProblemListProps) {
  const solvedCount = problems.filter((p) => p.status === 'solved').length;
  const total = problems.length;

  if (loading) {
    return (
      <div className="hd-card-flat p-6 text-sm text-charcoal flex flex-col gap-3">
        <span>Loading your assigned problems...</span>
        <div className="hd-skeleton h-16 rounded-[14px]" />
        <div className="hd-skeleton h-16 rounded-[14px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="hd-alert hd-alert-bad p-6 text-sm text-ink">
        {error}
      </div>
    );
  }

  if (!problems.length) {
    return (
      <div className="hd-card-flat p-6 text-sm text-charcoal">
        No Round 1 problems have been assigned to your team yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header strip */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="min-w-0">
          {pathLabel && (
            <div className="mb-2">
              <span className="hd-badge hd-badge-brand">{pathLabel}</span>
            </div>
          )}
          <h2 className="hd-h2 text-ink break-words">{topic}</h2>
          <p className="hd-label text-muted mt-2">
            Solve all {total} problems · Any order allowed
          </p>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-3 hd-card-flat px-4 py-2.5 self-start sm:self-auto">
          <div className="text-right">
            <div className="hd-label text-muted">Progress</div>
            <div className="font-mono text-sm font-bold text-ink">
              {solvedCount} / {total}
            </div>
          </div>
          <div className="w-24 h-3 rounded-full border-2 border-ink bg-sand overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-500"
              style={{ width: `${total > 0 ? (solvedCount / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Problem cards */}
      <div className="grid gap-3">
        {problems.map((problem, idx) => {
          const isClickable = problem.status !== 'locked';
          const cfg = statusConfig[problem.status];

          const cardContent = (
            <div
              className={`
                relative flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-[14px] border-2 border-ink p-4
                transition-[transform,box-shadow] duration-200
                ${cfg.card}
                ${isClickable ? 'shadow-hd-sm group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-hd cursor-pointer' : 'opacity-60'}
              `}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Index */}
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-ink font-mono text-sm font-bold ${cfg.index}`}>
                  {String(idx + 1).padStart(2, '0')}
                </div>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 min-w-0">
                    <h3 className="text-base font-bold text-ink truncate">
                      {problem.title}
                    </h3>
                    {problem.difficulty && (
                      <span className="hd-badge shrink-0">{problem.difficulty}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted">
                    <span className={problem.earnedScore ? 'text-ink font-bold' : ''}>
                      {problem.earnedScore ?? 0} / {problem.maxScore} pts
                    </span>
                    {!!problem.totalTests && (
                      <span>
                        {problem.testsPassed ?? 0} / {problem.totalTests} test cases passed
                      </span>
                    )}
                    {problem.solvedAt && (
                      <span className="text-[#0f5b31]">Solved {problem.solvedAt}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status + arrow */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pl-[3.75rem] sm:pl-0">
                <StatusBadge status={problem.status} />
                {isClickable && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-paper transition-colors group-hover:bg-brand">
                    <svg
                      className="w-4 h-4 text-ink"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          );

          if (!isClickable) {
            return <div key={problem.id}>{cardContent}</div>;
          }

          return (
            <Link
              key={problem.id}
              href={`/round-1/problem/${problem.id}`}
              className="group block rounded-[14px]"
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
