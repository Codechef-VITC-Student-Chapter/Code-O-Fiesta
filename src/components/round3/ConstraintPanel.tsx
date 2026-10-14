import React from 'react';
import { SubmissionResult } from '@/types/submission';
import type { Round3PersistedStatus } from '@/hooks/useProblemState';

interface ConstraintPanelProps {
  isSolved: boolean;
  submitResult: SubmissionResult | null;
  submissionCount: number;
  // Backend-persisted bonus flags for this problem. Used as the source of
  // truth before any new submission has been made in this session (e.g.
  // right after a page refresh), so persisted bonuses never appear to reset.
  persistedStatus?: Round3PersistedStatus | null;
}

export default function ConstraintPanel({ isSolved, submitResult, persistedStatus = null }: ConstraintPanelProps) {
  const violations = submitResult?.constraintViolations || [];

  const hasResult = submitResult !== null;
  const isAccepted = submitResult?.status === 'accepted';

  // Once a new submission has landed this session, its (backend-authoritative)
  // constraintViolations list drives status; otherwise fall back to whatever
  // was already persisted for this problem so a refresh shows the truth.
  const baseKnown = hasResult ? isAccepted : !!persistedStatus?.baseSolvePassed;

  // 1. Ouroboros (30 PTS): Solve using recursion (no loops)
  const ouroborosViolated = violations.some(v =>
    v.constraintId === 'ouroboros' ||
    v.constraintId === 'no-loops' ||
    v.constraintId === 'recursion-required'
  );
  const ouroborosEarned = hasResult ? (isAccepted && !ouroborosViolated) : !!persistedStatus?.ouroborosPassed;
  const ouroborosStatus = !baseKnown ? 'pending' : (ouroborosEarned ? 'earned' : 'missed');

  // 2. Short & Sweet (20 PTS): Solution under line/char threshold
  const shortViolated = violations.some(v =>
    v.constraintId === 'shortAndSweet' ||
    v.constraintId === 'max-lines' ||
    v.constraintId === 'line-count'
  );
  const shortEarned = hasResult ? (isAccepted && !shortViolated) : !!persistedStatus?.shortAndSweetPassed;
  const shortStatus = !baseKnown ? 'pending' : (shortEarned ? 'earned' : 'missed');

  // 3. One Shot Wonder (40 PTS): Accepted on the team's literal first submission
  // attempt. This is a historical constraint decided by the backend from the
  // team's first-ever submission for this problem — it must never be
  // recomputed from submissionCount on the frontend, or a later resubmission
  // (e.g. to chase Short & Sweet) would wrongly appear to "lose" the bonus.
  const oneShotViolated = violations.some(v =>
    v.constraintId === 'oneShotWonder' ||
    v.constraintId === 'one-shot-wonder'
  );
  const oneShotEarned = hasResult ? (isAccepted && !oneShotViolated) : !!persistedStatus?.oneShotWonderPassed;
  const oneShotStatus = !baseKnown ? 'pending' : (oneShotEarned ? 'earned' : 'missed');

  const notSolvedYetMessage = 'Solve the problem to unlock this bonus';

  const bonuses = [
    {
      id: 'ouroboros',
      title: 'Ouroboros',
      points: 30,
      description: 'Solve using recursion (no loops allowed).',
      status: ouroborosStatus,
      message: !baseKnown
        ? notSolvedYetMessage
        : (violations.find(v => v.constraintId === 'ouroboros' || v.constraintId === 'no-loops' || v.constraintId === 'recursion-required')?.message || 'Loops detected or recursion missing')
    },
    {
      id: 'shortAndSweet',
      title: 'Short & Sweet',
      points: 20,
      description: 'Solve within the character/line threshold.',
      status: shortStatus,
      message: !baseKnown
        ? notSolvedYetMessage
        : (violations.find(v => v.constraintId === 'shortAndSweet' || v.constraintId === 'max-lines' || v.constraintId === 'line-count')?.message || 'Code exceeds length threshold')
    },
    {
      id: 'oneShotWonder',
      title: 'One Shot Wonder',
      points: 40,
      description: 'Get the problem accepted on your first attempt.',
      status: oneShotStatus,
      message: !baseKnown ? notSolvedYetMessage : 'Missed — solved in multiple attempts'
    }
  ];

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="hd-h3 text-ink">
          {isSolved ? 'Bonus Summary' : 'Earn these bonuses'}
        </h3>
        <span className="hd-badge hd-badge-ink">
          Crucible Modifiers
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {bonuses.map((b) => {
          let cardStyles = 'bg-paper shadow-hd-sm';
          let statusIndicator = (
            <span className="hd-badge hd-badge-brand shrink-0">
              +{b.points} PTS
            </span>
          );

          if (b.status === 'earned') {
            cardStyles = 'bg-ok-soft shadow-hd-sm';
            statusIndicator = (
              <span className="hd-badge hd-badge-ok shrink-0">
                ✓ +{b.points} PTS
              </span>
            );
          } else if (b.status === 'missed') {
            cardStyles = 'bg-sand opacity-75';
            statusIndicator = (
              <span className="hd-badge hd-badge-muted shrink-0 line-through">
                ✗ +{b.points} PTS
              </span>
            );
          }

          return (
            <div
              key={b.id}
              className={`flex flex-col justify-between p-4 rounded-[14px] border-2 border-ink transition-transform duration-200 hover:-translate-y-0.5 ${cardStyles}`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="text-sm font-bold text-ink">
                    {b.title}
                  </h4>
                  {statusIndicator}
                </div>
                <p className="text-xs text-charcoal leading-relaxed">
                  {b.description}
                </p>
              </div>
              {b.status === 'missed' && b.message && (
                <div className="mt-3 font-mono text-[0.7rem] text-[#8f1a10] bg-bad-soft border border-[#8f1a10] px-2 py-1 rounded-md">
                  {b.message}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
