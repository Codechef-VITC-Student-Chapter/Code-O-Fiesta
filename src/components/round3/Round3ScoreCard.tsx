import React from 'react';
import { SubmissionResult } from '@/types/submission';

interface Round3ScoreCardProps {
  submitResult: SubmissionResult;
  submissionCount?: number;
}

export default function Round3ScoreCard({ submitResult }: Round3ScoreCardProps) {
  const violations = submitResult.constraintViolations || [];
  const isAccepted = submitResult.status === 'accepted';

  if (!isAccepted) return null;

  const ouroborosViolated = violations.some(v =>
    v.constraintId === 'ouroboros' ||
    v.constraintId === 'no-loops' ||
    v.constraintId === 'recursion-required'
  );
  const ouroborosPoints = ouroborosViolated ? 0 : 30;

  const shortViolated = violations.some(v =>
    v.constraintId === 'shortAndSweet' ||
    v.constraintId === 'max-lines' ||
    v.constraintId === 'line-count'
  );
  const shortPoints = shortViolated ? 0 : 20;

  // First Submit is a historical constraint frozen by the backend on the
  // team's literal first submission — read it from the authoritative
  // constraintViolations list, never recompute it from submissionCount here.
  const oneShotViolated = violations.some(v =>
    v.constraintId === 'oneShotWonder' ||
    v.constraintId === 'one-shot-wonder'
  );
  const oneShotPoints = oneShotViolated ? 0 : 40;

  // Total and base score are read from the backend's authoritative
  // pointsEarned (10 pts / test case) rather than a hardcoded flat value —
  // base points vary with how many test cases the problem has.
  const totalPoints = submitResult.pointsEarned ?? 0;
  const baseSolvePoints = Math.max(0, totalPoints - ouroborosPoints - shortPoints - oneShotPoints);
  const maxBasePoints = (submitResult.totalTests ?? 0) * 10;
  const maxTotalPoints = maxBasePoints + 30 + 20 + 40;

  return (
    <div className="hd-card p-5 max-w-md w-full text-ink">
      <h3 className="mb-4 border-b-2 border-ink pb-3 flex flex-wrap justify-between items-center gap-2">
        <span className="hd-h3">Crucible Scorecard</span>
        <span className="hd-badge hd-badge-brand text-[0.6875rem]">{totalPoints} / {maxTotalPoints} PTS</span>
      </h3>

      <div className="flex flex-col font-mono text-xs">
        <div className="flex justify-between items-center gap-3 py-2">
          <span className="text-charcoal">Base Problem Solve ({submitResult.testsPassed}/{submitResult.totalTests} tests x 10 pts):</span>
          <span className="text-[#0f5b31] font-bold shrink-0">+{baseSolvePoints} PTS</span>
        </div>

        <div className="flex justify-between items-center gap-3 py-2 border-t border-[var(--border-subtle)]">
          <span className="text-charcoal">Ouroboros (Recursion, No Loops):</span>
          {ouroborosPoints > 0 ? (
            <span className="text-[#0f5b31] font-bold shrink-0">+{ouroborosPoints} PTS</span>
          ) : (
            <span className="text-muted line-through shrink-0">+{30} PTS</span>
          )}
        </div>

        <div className="flex justify-between items-center gap-3 py-2 border-t border-[var(--border-subtle)]">
          <span className="text-charcoal">Short & Sweet (Length Limit):</span>
          {shortPoints > 0 ? (
            <span className="text-[#0f5b31] font-bold shrink-0">+{shortPoints} PTS</span>
          ) : (
            <span className="text-muted line-through shrink-0">+{20} PTS</span>
          )}
        </div>

        <div className="flex justify-between items-center gap-3 py-2 border-t border-[var(--border-subtle)]">
          <span className="text-charcoal">One Shot Wonder (First Try AC):</span>
          {oneShotPoints > 0 ? (
            <span className="text-[#0f5b31] font-bold shrink-0">+{oneShotPoints} PTS</span>
          ) : (
            <span className="text-muted line-through shrink-0">+{40} PTS</span>
          )}
        </div>
      </div>
    </div>
  );
}
