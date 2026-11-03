'use client';

import React from 'react';

export type EventStepState = 'completed' | 'active' | 'upcoming' | 'locked';

export interface EventStep {
  id: string;
  name: string;
  state: EventStepState;
  description?: string;
}

export interface EventProgressProps {
  steps?: EventStep[];
  className?: string;
  onStepClick?: (stepId: string) => void;
}

const DEFAULT_STEPS: EventStep[] = [
  { id: 'round-1', name: 'Round 1: Maze of Fate', state: 'completed', description: 'Topic Selection' },
  { id: 'round-2', name: 'Round 2: Blind Relay', state: 'active', description: 'Member Rotation' },
  { id: 'round-3', name: 'Round 3: Constraint Crucible', state: 'upcoming', description: 'Modifiers' },
  { id: 'results', name: 'Leaderboard & Results', state: 'locked', description: 'Final Standings' },
];

export default function EventProgress({
  steps = DEFAULT_STEPS,
  className = '',
  onStepClick,
}: EventProgressProps) {
  return (
    <div className={`w-full hd-card p-4 sm:p-5 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
        {steps.map((step, index) => {
          const isCompleted = step.state === 'completed';
          const isActive = step.state === 'active';
          const isLocked = step.state === 'locked';

          return (
            <React.Fragment key={step.id}>
              <div
                onClick={() => !isLocked && onStepClick?.(step.id)}
                className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 flex-1 z-10 transition-all ${
                  onStepClick && !isLocked ? 'cursor-pointer hover:opacity-90' : ''
                }`}
              >
                {/* Step Indicator Dot/Badge */}
                <div
                  className={`w-9 h-9 shrink-0 rounded-[var(--radius-sm)] flex items-center justify-center font-mono text-xs font-bold border-2 transition-all ${
                    isCompleted
                      ? 'bg-ok-soft text-[#0f5b31] border-ink'
                      : isActive
                      ? 'bg-brand text-ink border-ink shadow-hd-sm'
                      : isLocked
                      ? 'bg-sand text-muted border-[var(--border-subtle)]'
                      : 'bg-paper text-ink border-ink'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isLocked ? (
                    <svg className="w-3.5 h-3.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm font-semibold ${
                      isActive
                        ? 'text-ink font-bold'
                        : isCompleted
                        ? 'text-[#0f5b31]'
                        : isLocked
                        ? 'text-muted'
                        : 'text-charcoal'
                    }`}
                  >
                    {step.name}
                  </span>
                  {step.description && (
                    <span className="hd-label text-muted hidden lg:inline mt-0.5">
                      {step.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Connecting Line between steps (Desktop) */}
              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block flex-1 h-0.5 max-w-[60px] self-center transition-colors ${
                    isCompleted
                      ? 'bg-ink'
                      : 'bg-[var(--border-subtle)]'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
