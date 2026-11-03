'use client';

import React, { useState } from 'react';
import { Problem, IDEMode, CodeConstraint } from '@/types/problem';
import { SubmissionResult } from '@/types/submission';
import ProblemStatement from './ProblemStatement';
import ProblemExamples from './ProblemExamples';
import ProblemConstraints from './ProblemConstraints';
import ProblemNavigation from './ProblemNavigation';
import ProblemHiddenOverlay from '@/components/round2/ProblemHiddenOverlay';
import ConstraintPanel from '@/components/round3/ConstraintPanel';
import type { Round3PersistedStatus } from '@/hooks/useProblemState';

interface ProblemPanelProps {
  problem: Problem;
  mode: IDEMode;
  activeConstraints?: CodeConstraint[];
  hideProblemStatement?: boolean;
  prevProblemId: string | null;
  nextProblemId: string | null;
  onNavigate?: (id: string) => void;
  onUseAsInput?: (input: string) => void;
  submissionHistoryChild?: React.ReactNode;
  submitResult?: SubmissionResult | null;
  submissionCount?: number;
  isSolved?: boolean;
  round3Status?: Round3PersistedStatus | null;
}

export default function ProblemPanel({
  problem,
  mode,
  activeConstraints,
  hideProblemStatement = false,
  prevProblemId,
  nextProblemId,
  onNavigate,
  onUseAsInput,
  submissionHistoryChild,
  submitResult = null,
  submissionCount = 0,
  isSolved = false,
  round3Status = null,
}: ProblemPanelProps) {
  const [activeTab, setActiveTab] = useState<'statement' | 'examples' | 'constraints' | 'submissions'>('statement');

  const { title, difficulty, points, statement, examples, constraints, timeLimit, memoryLimit } = problem;
  const activeRoundNumber = mode === 'constraint' ? 3 : mode === 'relay' ? 2 : (problem.roundNumber || 1);

  const getDifficultyBadge = () => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="hd-badge hd-badge-ok select-none">
            Easy
          </span>
        );
      case 'hard':
        return (
          <span className="hd-badge hd-badge-bad select-none">
            Hard
          </span>
        );
      case 'medium':
      default:
        return (
          <span className="hd-badge hd-badge-warn select-none">
            Medium
          </span>
        );
    }
  };

  // Convert points to display text
  const pointsLabel = points ? `+${points} PTS` : '+50 PTS';

  return (
    <div className="flex flex-col h-full bg-paper text-ink select-none">
      {/* Header Info */}
      <div className="px-4 sm:px-5 py-4 border-b-2 border-ink flex flex-col gap-3">
        <div className="flex flex-wrap justify-between items-start gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex items-center justify-center h-8 min-w-10 px-1.5 shrink-0 rounded-[var(--radius-sm)] bg-brand border-2 border-ink text-xs font-mono font-bold text-ink">
              01
            </span>
            <h2 className="hd-h3 !text-xl sm:!text-2xl text-ink select-text break-words min-w-0">
              {title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {getDifficultyBadge()}
            <span className="hd-badge hd-badge-ink tabular-nums">
              {pointsLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-ink bg-sand h-11 select-none overflow-x-auto">
        {([
          { id: 'statement', label: 'Statement' },
          { id: 'examples', label: 'Examples' },
          { id: 'constraints', label: 'Constraints' },
          { id: 'submissions', label: 'Submissions' },
        ] as const).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`flex-1 min-w-max px-3 text-center font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] transition-colors cursor-pointer border-r border-[var(--border-subtle)] last:border-r-0 ${
                isActive
                  ? 'bg-paper text-ink shadow-[inset_0_-3px_0_var(--brand)]'
                  : 'text-muted hover:text-ink hover:bg-paper/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-grow px-4 py-5 sm:px-6 overflow-y-auto custom-scrollbar">
        {activeTab === 'statement' && (
          hideProblemStatement ? (
            <ProblemHiddenOverlay />
          ) : (
            <>
              <ProblemStatement statement={statement} mode={mode} activeConstraints={activeConstraints} />
              {mode === 'constraint' && (
                <div className="mt-2 pt-4 pb-4 border-t-2 border-ink">
                  <ConstraintPanel
                    isSolved={isSolved}
                    submitResult={submitResult}
                    submissionCount={submissionCount}
                    persistedStatus={round3Status}
                  />
                </div>
              )}
            </>
          )
        )}
        {activeTab === 'examples' && (
          <ProblemExamples examples={examples} onUseAsInput={onUseAsInput} />
        )}
        {activeTab === 'constraints' && (
          <ProblemConstraints
            timeLimit={timeLimit}
            memoryLimit={memoryLimit}
            constraints={constraints}
            mode={mode}
            activeConstraints={activeConstraints}
          />
        )}
        {activeTab === 'submissions' && submissionHistoryChild}
      </div>

      {/* Footer Navigation */}
      <ProblemNavigation
        roundNumber={activeRoundNumber}
        prevProblemId={prevProblemId}
        nextProblemId={nextProblemId}
        onNavigate={onNavigate}
      />
    </div>
  );
}
