'use client';

import React, { useState } from 'react';
import { RunResult, TestCaseResult, Verdict } from '@/types/submission';

interface OutputPanelProps {
  runResult: RunResult | null;
  isRunning: boolean;
  errorMsg?: string | null;
}

const VERDICT_STYLES: Record<Verdict, { color: string; bg: string; text: string }> = {
  ACCEPTED: { color: 'text-[#0f5b31]', bg: 'bg-ok-soft border-ink', text: 'Accepted' },
  WRONG_ANSWER: { color: 'text-[#8f1a10]', bg: 'bg-bad-soft border-ink', text: 'Wrong Answer' },
  TIME_LIMIT_EXCEEDED: { color: 'text-[#6e4a00]', bg: 'bg-warn-soft border-ink', text: 'Time Limit Exceeded' },
  COMPILATION_ERROR: { color: 'text-[#8f1a10]', bg: 'bg-bad-soft border-ink', text: 'Compilation Error' },
  RUNTIME_ERROR: { color: 'text-[#8f1a10]', bg: 'bg-bad-soft border-ink', text: 'Runtime Error' },
  PENDING: { color: 'text-[#6e4a00]', bg: 'bg-warn-soft border-ink', text: 'Pending' },
  EXECUTED: { color: 'text-ink', bg: 'bg-lilac-soft border-ink', text: 'Executed' },
};

export default function OutputPanel({ runResult, isRunning, errorMsg }: OutputPanelProps) {
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-charcoal font-mono text-xs gap-3">
        <svg className="animate-spin h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Running your code...</span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col h-full gap-3 font-mono text-xs">
        <div className="hd-alert hd-alert-bad flex-wrap !items-center !gap-x-3 !gap-y-1 !py-2 !px-3">
          <span className="text-[10px] text-[#8f1a10] uppercase font-bold tracking-wider">Execution Error:</span>
          <span className="text-ink break-words">{errorMsg}</span>
        </div>
      </div>
    );
  }

  if (!runResult) {
    return (
      <div className="flex items-center justify-center h-full min-h-[120px] text-muted font-mono text-xs text-center px-4">
        No output to display. Run code to see results.
      </div>
    );
  }

  if (runResult.mode === 'custom') {
    const { status, verdict, stdout, stderr, compileOutput, executionTime, memory } = runResult;
    const style = VERDICT_STYLES[verdict] || VERDICT_STYLES.EXECUTED;

    return (
      <div className="flex flex-col h-full gap-3 font-mono text-xs">
        <div className={`flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-[var(--radius-sm)] border-2 ${style.bg}`}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted uppercase tracking-wider">Status:</span>
            <span className={`font-bold ${style.color}`}>{style.text}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-charcoal">
            <div>Time: <span className="text-ink font-bold tabular-nums">{executionTime} ms</span></div>
            <div>Memory: <span className="text-ink font-bold tabular-nums">{memory} KB</span></div>
          </div>
        </div>

        <div className="flex-grow flex flex-col gap-2.5 overflow-auto">
          {compileOutput && (
            <div className="flex flex-col flex-grow shrink-0">
              <span className="text-[10px] text-[#8f1a10] uppercase font-bold tracking-wider mb-1">Compilation Output</span>
              <pre className="p-3 rounded-[var(--radius-sm)] bg-bad-soft border-2 border-ink text-ink font-code text-[12px] whitespace-pre-wrap break-words">
                {compileOutput}
              </pre>
            </div>
          )}
          {stderr && (
            <div className="flex flex-col flex-grow shrink-0">
              <span className="text-[10px] text-[#8f1a10] uppercase font-bold tracking-wider mb-1">Standard Error</span>
              <pre className="p-3 rounded-[var(--radius-sm)] bg-bad-soft border-2 border-ink text-ink font-code text-[12px] whitespace-pre-wrap break-words">
                {stderr}
              </pre>
            </div>
          )}
          <div className="flex flex-col flex-grow shrink-0">
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Standard Output</span>
            <pre className="hd-terminal !rounded-[var(--radius-sm)] p-3 font-code text-[12px] whitespace-pre-wrap break-words min-h-[60px]">
              {stdout || '(no stdout output)'}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // mode === 'examples'
  const { verdict, passed, total, cases } = runResult;
  const overallStyle = VERDICT_STYLES[verdict] || VERDICT_STYLES.PENDING;
  const activeCase = cases[activeCaseIdx] || cases[0];

  return (
    <div className="flex flex-col h-full font-mono text-xs overflow-hidden">
      {/* Overall Verdict */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-t-[var(--radius-sm)] border-2 border-b-0 ${overallStyle.bg}`}>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted uppercase tracking-wider">Overall:</span>
          <span className={`font-bold ${overallStyle.color}`}>{overallStyle.text}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-charcoal">
            Passed <span className={passed === total ? 'text-[#0f5b31] font-bold tabular-nums' : 'text-ink font-bold tabular-nums'}>{passed}/{total}</span>
          </span>
        </div>
      </div>

      {/* Case Tabs */}
      <div className="flex gap-1 px-2 pt-2 bg-sand border-2 border-y-0 border-ink overflow-x-auto">
        {cases.map((c, idx) => {
          const isAC = c.verdict === 'ACCEPTED';
          const isActive = idx === activeCaseIdx;
          return (
            <button
              key={idx}
              onClick={() => setActiveCaseIdx(idx)}
              className={`shrink-0 min-h-8 px-3 py-1.5 rounded-t-[var(--radius-sm)] border-2 border-b-0 transition-colors flex items-center gap-2 font-bold ${
                isActive
                  ? 'bg-paper border-ink text-ink'
                  : 'bg-transparent border-transparent text-muted hover:text-ink hover:bg-paper/60'
              }`}
            >
              {isAC ? (
                <span className="text-ok text-[10px]">●</span>
              ) : (
                <span className="text-bad text-[10px]">●</span>
              )}
              Case {c.caseNumber}
            </button>
          );
        })}
      </div>

      {/* Active Case Details */}
      <div className="flex-grow flex flex-col gap-3 p-3 bg-paper border-2 border-ink rounded-b-[var(--radius-sm)] overflow-auto">
        {activeCase && (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-charcoal mb-1">
              <div>Verdict: <span className={`font-bold ${VERDICT_STYLES[activeCase.verdict]?.color}`}>{VERDICT_STYLES[activeCase.verdict]?.text}</span></div>
              <div>Time: <span className="text-ink font-bold tabular-nums">{activeCase.executionTime} ms</span></div>
              <div>Memory: <span className="text-ink font-bold tabular-nums">{activeCase.memory} KB</span></div>
            </div>

            {activeCase.compileOutput && (
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] text-[#8f1a10] uppercase font-bold tracking-wider mb-1">Compilation Error</span>
                <pre className="p-3 rounded-[var(--radius-sm)] bg-bad-soft border-2 border-ink text-ink font-code whitespace-pre-wrap break-words text-[12px]">
                  {activeCase.compileOutput}
                </pre>
              </div>
            )}

            {activeCase.stderr && (
              <div className="flex flex-col shrink-0">
                <span className="text-[10px] text-[#8f1a10] uppercase font-bold tracking-wider mb-1">Standard Error</span>
                <pre className="p-3 rounded-[var(--radius-sm)] bg-bad-soft border-2 border-ink text-ink font-code whitespace-pre-wrap break-words text-[12px]">
                  {activeCase.stderr}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Input</span>
                <pre className="p-2.5 rounded-[var(--radius-sm)] bg-sand border border-[var(--border-subtle)] text-ink font-code whitespace-pre-wrap break-words min-h-[40px] text-[12px]">
                  {activeCase.input || '(empty)'}
                </pre>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Expected Output</span>
                <pre className="p-2.5 rounded-[var(--radius-sm)] bg-sand border border-[var(--border-subtle)] text-ink font-code whitespace-pre-wrap break-words min-h-[40px] text-[12px]">
                  {activeCase.expectedOutput || '(empty)'}
                </pre>
              </div>
            </div>

            <div className="flex flex-col shrink-0">
              <span className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Your Output</span>
              <pre className={`p-2.5 rounded-[var(--radius-sm)] border-2 font-code whitespace-pre-wrap break-words min-h-[40px] text-[12px] text-ink ${
                activeCase.matchesExpected
                  ? 'bg-ok-soft border-[#0f5b31]'
                  : 'bg-bad-soft border-[#8f1a10]'
              }`}>
                {activeCase.actualOutput || '(no stdout output)'}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
