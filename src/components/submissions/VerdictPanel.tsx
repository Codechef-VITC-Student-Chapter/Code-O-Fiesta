'use client';

import React from 'react';
import { SubmissionResult } from '@/types/submission';
import { IDEMode } from '@/types/problem';
import Round3ScoreCard from '@/components/round3/Round3ScoreCard';
import ScoreBreakdown from '@/components/round3/ScoreBreakdown';

interface VerdictPanelProps {
  submitResult: SubmissionResult | null;
  submissionCount: number;
  mode: IDEMode;
}

export default function VerdictPanel({ submitResult, submissionCount, mode }: VerdictPanelProps) {
  if (!submitResult) {
    return (
      <div className="flex items-center justify-center h-full min-h-[150px] text-muted font-mono text-xs">
        No submission results to show yet.
      </div>
    );
  }

  const {
    status,
    testsPassed,
    totalTests,
    timeMs,
    memoryKb,
    failedTest,
    compilerError,
    pointsEarned,
  } = submitResult;

  const isAccepted = status === 'accepted';

  // Shown on every non-accepted verdict so partial credit is never hidden
  // behind a plain "Wrong Answer" / error label.
  const testcaseScoreSummary = (
    <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-1.5 rounded-full bg-lilac-soft border-2 border-ink text-[11px] font-mono font-bold text-ink w-fit tabular-nums">
      <span>{testsPassed} / {totalTests} test cases passed</span>
      <span className="text-muted">·</span>
      <span>Points earned: {pointsEarned ?? 0}</span>
    </div>
  );

  // Render CSS confetti pieces if accepted
  const renderConfetti = () => {
    if (!isAccepted) return null;
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes confettiFall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
          }
          .confetti-piece {
            position: absolute;
            width: 6px;
            height: 12px;
            border-radius: 1px;
            animation: confettiFall 2.5s ease-out infinite;
          }
        `}} />
        {Array.from({ length: 20 }).map((_, i) => {
          const left = `${Math.random() * 100}%`;
          const delay = `${Math.random() * 2}s`;
          const color = ['#ff5034', '#bba8f2', '#080808', '#f2b705', '#1e8f50'][Math.floor(Math.random() * 5)];
          return (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left,
                animationDelay: delay,
                backgroundColor: color,
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (status) {
      case 'accepted':
        return (
          <div className="flex flex-col items-center text-center py-6 px-4 relative">
            {renderConfetti()}
            <div className="p-4 rounded-[var(--radius)] bg-ok-soft border-2 border-ink text-[#0f5b31] mb-4 z-10 shadow-hd">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="hd-h2 text-ink mb-2 z-10">
              Accepted
            </h2>
            <p className="text-sm text-charcoal font-sans mb-4 z-10">
              All {totalTests} test cases passed successfully!
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-w-xs w-full bg-paper border-2 border-ink p-3 rounded-[var(--radius-sm)] z-10 text-xs font-mono mb-4">
              <div className="text-left text-muted">Time Taken:</div>
              <div className="text-right text-ink font-bold tabular-nums">{timeMs} ms</div>
              <div className="text-left text-muted">Memory Used:</div>
              <div className="text-right text-ink font-bold tabular-nums">{memoryKb} KB</div>
            </div>

            {mode === 'constraint' ? (
              <div className="z-10 w-full flex flex-col items-center gap-3">
                <Round3ScoreCard submitResult={submitResult} submissionCount={submissionCount} />
                <ScoreBreakdown submitResult={submitResult} submissionCount={submissionCount} />
              </div>
            ) : (
              <div className="z-10 px-4 py-2 rounded-full bg-brand border-2 border-ink shadow-hd-sm text-xs font-mono font-bold text-ink tracking-[0.1em] tabular-nums">
                +{pointsEarned ?? 0} PTS EARNED
              </div>
            )}
          </div>
        );

      case 'wrong_answer':
        return (
          <div className="flex flex-col gap-4 py-4 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[var(--radius-sm)] bg-bad-soft border-2 border-ink text-[#8f1a10] shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="hd-h3 !text-lg text-[#8f1a10]">
                  Wrong answer
                </h3>
                <p className="text-xs text-charcoal font-sans leading-snug">
                  Failed on test case {failedTest ? failedTest.index : 'N/A'} ({testsPassed}/{totalTests} passed)
                </p>
              </div>
            </div>

            {testcaseScoreSummary}

            {failedTest && (
              <div className="flex flex-col gap-2.5 font-mono text-xs mt-1">
                <div className="flex flex-col">
                  <span className="hd-label text-muted mb-1">Input</span>
                  <pre className="p-3 bg-sand border border-[var(--border-subtle)] rounded-[var(--radius-sm)] font-code text-[12px] text-ink overflow-auto max-h-[96px]">
                    {failedTest.input.length > 100 ? `${failedTest.input.slice(0, 100)}...` : failedTest.input}
                  </pre>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="hd-label text-[#0f5b31] mb-1">Expected Output</span>
                    <pre className="p-3 bg-ok-soft border-2 border-[#0f5b31] rounded-[var(--radius-sm)] font-code text-[12px] text-ink overflow-auto max-h-[96px]">
                      {failedTest.expected.length > 100 ? `${failedTest.expected.slice(0, 100)}...` : failedTest.expected}
                    </pre>
                  </div>
                  <div className="flex flex-col">
                    <span className="hd-label text-[#8f1a10] mb-1">Actual Output</span>
                    <pre className="p-3 bg-sand border border-[var(--border-subtle)] rounded-[var(--radius-sm)] font-code text-[12px] text-ink overflow-auto max-h-[96px]">
                      {failedTest.actual.length > 100 ? `${failedTest.actual.slice(0, 100)}...` : failedTest.actual}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'time_limit_exceeded':
        return (
          <div className="flex flex-col gap-3 py-4 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[var(--radius-sm)] bg-warn-soft border-2 border-ink text-[#6e4a00] shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="hd-h3 !text-lg text-[#6e4a00]">
                  Time limit exceeded
                </h3>
                <p className="text-xs text-charcoal font-sans leading-snug">
                  Execution exceeded the allotted limit on test case {failedTest ? failedTest.index : 'N/A'}.
                </p>
              </div>
            </div>

            {testcaseScoreSummary}
          </div>
        );

      case 'compilation_error':
        return (
          <div className="flex flex-col gap-2.5 py-3 px-2 h-full">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[var(--radius-sm)] bg-bad-soft border-2 border-ink text-[#8f1a10] shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="hd-h3 !text-lg text-[#8f1a10]">
                  Compilation error
                </h3>
                <p className="text-xs text-charcoal font-sans leading-snug">
                  Your code failed to compile. View log details below.
                </p>
              </div>
            </div>

            {testcaseScoreSummary}

            <div className="flex-grow flex flex-col min-h-[120px]">
              <pre className="flex-grow p-4 hd-terminal !rounded-[var(--radius-sm)] !text-[#ffb4a8] font-code overflow-auto text-[12px] leading-relaxed whitespace-pre-wrap break-words max-h-[300px]">
                {compilerError || 'Undefined compile error.'}
              </pre>
            </div>
          </div>
        );

      case 'runtime_error':
      default:
        return (
          <div className="flex flex-col gap-3 py-4 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[var(--radius-sm)] bg-bad-soft border-2 border-ink text-[#8f1a10] shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="hd-h3 !text-lg text-[#8f1a10]">
                  Runtime error
                </h3>
                <p className="text-xs text-charcoal font-sans leading-snug">
                  A runtime exception occurred during execution.
                </p>
              </div>
            </div>

            {testcaseScoreSummary}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full bg-paper text-ink p-2 overflow-auto select-text">
      {renderContent()}
    </div>
  );
}
