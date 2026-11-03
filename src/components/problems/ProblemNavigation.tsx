'use client';

import React from 'react';
import Link from 'next/link';

interface ProblemNavigationProps {
  roundNumber: 1 | 2 | 3;
  prevProblemId: string | null;
  nextProblemId: string | null;
  currentProblemIndex?: number;
  totalProblems?: number;
  onNavigate?: (id: string) => void;
}

export default function ProblemNavigation({
  roundNumber,
  prevProblemId,
  nextProblemId,
  currentProblemIndex = 1,
  totalProblems = 3,
  onNavigate,
}: ProblemNavigationProps) {
  // Only hidden for Round 2 (Relay mode)
  if (roundNumber === 2) return null;

  const dashboardHref = roundNumber === 3 ? '/round-3' : '/round-1/path';
  const dashboardLabel = roundNumber === 3 ? 'All Problems (Round 3 Dashboard)' : 'All Problems (Path Dashboard)';

  return (
    <div className="flex flex-col gap-2 px-3 sm:px-4 py-3 border-t-2 border-ink bg-sand select-none font-mono">
      <div className="flex items-center justify-between gap-2">
        {/* Previous Button */}
        {prevProblemId && onNavigate ? (
          <button
            onClick={() => onNavigate(prevProblemId)}
            type="button"
            className="hd-btn hd-btn-sm hd-btn-square !min-h-10 !px-3"
          >
            ← <span className="hidden sm:inline">Previous</span><span className="sm:hidden">Prev</span>
          </button>
        ) : (
          <button
            disabled
            type="button"
            className="hd-btn hd-btn-sm hd-btn-square !min-h-10 !px-3"
          >
            ← <span className="hidden sm:inline">Previous</span><span className="sm:hidden">Prev</span>
          </button>
        )}

        {/* Counter */}
        <span className="hd-label text-charcoal text-center tabular-nums">
          Problem {currentProblemIndex} of {totalProblems}
        </span>

        {/* Next Button */}
        {nextProblemId && onNavigate ? (
          <button
            onClick={() => onNavigate(nextProblemId)}
            type="button"
            className="hd-btn hd-btn-sm hd-btn-square !min-h-10 !px-3"
          >
            Next<span className="hidden sm:inline">&nbsp;Problem</span> →
          </button>
        ) : (
          <button
            disabled
            type="button"
            className="hd-btn hd-btn-sm hd-btn-square !min-h-10 !px-3"
          >
            Next<span className="hidden sm:inline">&nbsp;Problem</span> →
          </button>
        )}
      </div>

      {/* Back link */}
      <div className="flex justify-center mt-1">
        <Link
          href={dashboardHref}
          className="hd-label text-ink underline underline-offset-2 decoration-brand decoration-2 hover:bg-brand-soft px-1.5 py-1 rounded transition-colors"
        >
          {dashboardLabel}
        </Link>
      </div>
    </div>
  );
}
