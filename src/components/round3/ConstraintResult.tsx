import React from 'react';
import { SubmissionResult } from '@/types/submission';

interface ConstraintResultProps {
  submitResult: SubmissionResult;
  submissionCount: number;
}

export default function ConstraintResult({ submitResult, submissionCount }: ConstraintResultProps) {
  const violations = submitResult.constraintViolations || [];
  const isAccepted = submitResult.status === 'accepted';

  if (!isAccepted) return null;

  const baseSolvePoints = 50;
  
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

  const oneShotPoints = (submissionCount <= 1) ? 40 : 0;

  const totalPoints = baseSolvePoints + ouroborosPoints + shortPoints + oneShotPoints;

  return (
    <div className="p-3 bg-paper border-2 border-ink rounded-[10px] shadow-hd-sm max-w-sm font-mono text-xs mt-2 text-ink">
      <div className="font-bold mb-2 pb-2 border-b border-[var(--border-subtle)] flex justify-between items-center gap-3">
        <span>Crucible Score Summary</span>
        <span className="hd-badge hd-badge-ok">+{totalPoints} PTS</span>
      </div>
      <div className="flex flex-col gap-1 text-charcoal text-[0.7rem]">
        <div className="flex justify-between">
          <span>Ouroboros:</span>
          <span className={ouroborosPoints > 0 ? 'text-[#0f5b31] font-bold' : 'text-muted line-through'}>
            {ouroborosPoints > 0 ? 'Earned' : 'Missed'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Short & Sweet:</span>
          <span className={shortPoints > 0 ? 'text-[#0f5b31] font-bold' : 'text-muted line-through'}>
            {shortPoints > 0 ? 'Earned' : 'Missed'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>One-Shot Wonder:</span>
          <span className={oneShotPoints > 0 ? 'text-[#0f5b31] font-bold' : 'text-muted line-through'}>
            {oneShotPoints > 0 ? 'Earned' : 'Missed'}
          </span>
        </div>
      </div>
    </div>
  );
}
