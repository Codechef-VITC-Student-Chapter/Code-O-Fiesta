'use client';

import React from 'react';
import { SubmissionResult as TSubmissionResult } from '@/types/submission';
import SubmissionStatus from './SubmissionStatus';

interface SubmissionResultProps {
  submitResult: TSubmissionResult | null;
  isSubmitting: boolean;
  onViewFullVerdict?: () => void;
  mode?: string;
  submissionCount?: number;
}

export default function SubmissionResult({
  submitResult,
  isSubmitting,
  onViewFullVerdict,
  mode,
  submissionCount = 0,
}: SubmissionResultProps) {
  if (isSubmitting) {
    return (
      <div className="flex flex-col gap-2 p-4 rounded-[var(--radius-sm)] border-2 border-ink bg-lilac-soft">
        <SubmissionStatus status="submitting" />
        <p className="text-xs font-sans text-charcoal mt-1">
          Evaluating your code against all hidden test cases. Please wait...
        </p>
      </div>
    );
  }

  if (!submitResult) {
    return (
      <div className="flex items-center justify-center p-6 text-center text-muted font-mono text-xs">
        No active submission results. Write code and hit Submit!
      </div>
    );
  }

  const { status, testsPassed, totalTests, timeMs, memoryKb, pointsEarned } = submitResult;

  // Convert status to SubmissionStatus status type
  const inlineStatus = (() => {
    if (status === 'accepted') return 'accepted';
    if (status === 'wrong_answer') return 'wrong';
    if (status === 'compilation_error' || status === 'runtime_error' || status === 'time_limit_exceeded' || status === 'memory_limit_exceeded') return 'error';
    return 'idle';
  })();

  const isAccepted = status === 'accepted';

  return (
    <div className={`p-4 rounded-[var(--radius-sm)] border-2 border-ink flex flex-col gap-3 font-mono text-xs text-ink ${
      isAccepted
        ? 'bg-ok-soft'
        : 'bg-bad-soft'
    }`}>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <SubmissionStatus status={inlineStatus} />
        {onViewFullVerdict && (
          <button
            onClick={onViewFullVerdict}
            type="button"
            className="hd-btn hd-btn-sm hd-btn-dark"
          >
            View Full Verdict
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-charcoal mt-1">
        <div>
          Test Cases: <span className="text-ink font-bold tabular-nums">{testsPassed} / {totalTests} Passed</span>
        </div>
        {pointsEarned !== undefined && (
          <div>
            Points Earned: <span className="bg-brand text-ink font-bold px-1 tabular-nums">{pointsEarned}</span>
          </div>
        )}
        {timeMs !== undefined && (
          <div>
            Time: <span className="text-ink font-bold tabular-nums">{timeMs} ms</span>
          </div>
        )}
        {memoryKb !== undefined && (
          <div>
            Memory: <span className="text-ink font-bold tabular-nums">{memoryKb} KB</span>
          </div>
        )}
      </div>
    </div>
  );
}
