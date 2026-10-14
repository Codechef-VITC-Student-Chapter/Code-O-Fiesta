'use client';

import React from 'react';
import { IDEMode, CodeConstraint } from '@/types/problem';

interface ProblemConstraintsProps {
  timeLimit: number;   // ms
  memoryLimit: number; // KB
  constraints: string[];
  mode: IDEMode;
  activeConstraints?: CodeConstraint[];
}

export default function ProblemConstraints({
  timeLimit,
  memoryLimit,
  constraints,
  mode,
  activeConstraints,
}: ProblemConstraintsProps) {
  return (
    <div className="flex flex-col gap-5 pb-8 select-text text-ink">
      {/* Execution Limits */}
      <div className="hd-card-flat overflow-hidden flex flex-col">
        <h4 className="hd-label text-cream bg-ink px-4 py-2 select-none">
          Resource Boundaries
        </h4>
        <div className="grid grid-cols-2 divide-x-2 divide-ink">
          <div className="flex flex-col gap-1 px-4 py-3">
            <span className="hd-label text-muted">Time Limit:</span>
            <span className="font-display text-2xl tracking-[-0.03em] text-ink tabular-nums">{timeLimit} <span className="font-mono text-xs text-charcoal">ms</span></span>
          </div>
          <div className="flex flex-col gap-1 px-4 py-3">
            <span className="hd-label text-muted">Memory Limit:</span>
            <span className="font-display text-2xl tracking-[-0.03em] text-ink tabular-nums">{memoryLimit} <span className="font-mono text-xs text-charcoal">KB</span></span>
          </div>
        </div>
      </div>

      {/* Logical Constraints */}
      <div className="hd-card-flat p-4 flex flex-col gap-2">
        <h4 className="hd-label text-ink mb-1 border-b-2 border-ink pb-2 select-none">
          Problem Constraints
        </h4>
        {constraints.length === 0 ? (
          <div className="text-muted text-sm py-1 select-none">
            No standard value constraints defined.
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
            {constraints.map((c, i) => (
              <li key={i} className="flex gap-3 items-baseline py-2 font-code text-[13px] leading-relaxed text-ink break-words">
                <span className="h-2 w-2 shrink-0 translate-y-[-1px] bg-brand border border-ink" aria-hidden="true" />
                <span className="min-w-0">{c}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AST Coding Constraints */}
      {mode === 'constraint' && activeConstraints && activeConstraints.length > 0 && (
        <div className="hd-card-lilac !shadow-hd-sm p-4 flex flex-col gap-3">
          <h4 className="hd-label text-ink border-b-2 border-ink pb-2 select-none flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Active Code Constraints
          </h4>
          <div className="flex flex-col gap-2">
            {activeConstraints.map((c) => (
              <div key={c.id} className="flex gap-2 items-start py-0.5 text-sm leading-relaxed">
                <span className="text-ink font-bold">•</span>
                <div>
                  <span className="text-ink font-bold">{c.label}: </span>
                  <span className="text-charcoal">{c.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
