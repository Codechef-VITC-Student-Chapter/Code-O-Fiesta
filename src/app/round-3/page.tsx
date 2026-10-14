'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import RoundTimer from '@/components/timer/RoundTimer';
import PixelCluster from '@/components/brand/PixelCluster';
import { problemsService } from '@/services/problems';

interface CrucibleProblem {
  id: string;
  numberStr: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  description: string;
  maxPoints: number;
  status: 'SOLVED' | 'IN_PROGRESS' | 'NOT_STARTED';
  constraintsMet: number;
  totalConstraints: number;
}

function Round3PageContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [problems, setProblems] = useState<CrucibleProblem[]>([]);
  const [totalRoundScore, setTotalRoundScore] = useState(0);
  const [maxRoundScore, setMaxRoundScore] = useState(0);

  const [timerStartAt, setTimerStartAt] = useState<number | null>(null);
  const [timerEndAt, setTimerEndAt] = useState<number | null>(null);

  useEffect(() => {
    async function loadRoundState() {
      try {
        setLoading(true);
        let state = await problemsService.fetchRoundState(3);

        if (state.status === 'NOT_STARTED') {
          // Initialize round
          state = await problemsService.startRound(3);
        }

        if (state.error) {
          setError(state.error);
          return;
        }

        setTotalRoundScore(state.score || 0);

        if (state.startedAt) {
          setTimerStartAt(new Date(state.startedAt).getTime());
        }
        if (state.endsAt) {
          setTimerEndAt(new Date(state.endsAt).getTime());
        }

        const mappedProblems = (state.problems || []).map((p: any, idx: number) => {
          let constraintsMet = 0;
          if (p.baseSolvePassed) constraintsMet++;
          if (p.ouroborosPassed) constraintsMet++;
          if (p.shortAndSweetPassed) constraintsMet++;
          if (p.oneShotWonderPassed) constraintsMet++;

          return {
            id: p.problemId,
            numberStr: String(idx + 1).padStart(2, '0'),
            title: p.title || 'Unknown Problem',
            difficulty: (p.difficulty || 'MEDIUM').toUpperCase(),
            description: p.description || '',
            maxPoints: typeof p.maxScore === 'number' ? p.maxScore : 140,
            status: p.status,
            constraintsMet,
            totalConstraints: 4,
          };
        });

        setProblems(mappedProblems);
        setMaxRoundScore(mappedProblems.reduce((sum: number, p: CrucibleProblem) => sum + p.maxPoints, 0));
      } catch (err: any) {
        setError(err.message || 'Failed to load round state');
      } finally {
        setLoading(false);
      }
    }

    loadRoundState();
  }, []);

  if (loading) {
    return (
      <ParticipantLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-3 w-3 bg-brand border-2 border-ink hd-blink" />
            <span className="h-3 w-3 bg-ink hd-blink hd-delay-2" />
            <span className="h-3 w-3 bg-brand border-2 border-ink hd-blink hd-delay-4" />
          </div>
          <div className="hd-label text-ink">
            INITIALIZING CRUCIBLE PROTOCOL...
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  if (error) {
    return (
      <ParticipantLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="hd-alert hd-alert-bad flex-col items-center text-center max-w-md w-full p-6 gap-3">
            <div className="hd-h3 text-[#8f1a10]">
              CRITICAL ERROR
            </div>
            <div className="text-ink font-mono text-sm">
              {error}
            </div>
          </div>
        </div>
      </ParticipantLayout>
    );
  }

  const solvedCount = problems.filter((p) => p.status === 'SOLVED').length;
  const totalProblems = problems.length || 3;

  const rightSidebar = (
    <div className="flex flex-col gap-5">
      {/* 1. Round Timer Card */}
      <div className="hd-card p-5 shadow-[4px_4px_0_var(--brand)] relative overflow-hidden flex flex-col items-center">
        <div className="relative z-10 w-full flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3 pb-3 border-b-2 border-ink">
            <span className="hd-label text-ink flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ROUND TIMER
            </span>
            <span className="hd-badge hd-badge-brand">
              {timerEndAt && timerStartAt
                ? `${Math.round((timerEndAt - timerStartAt) / 60000)}:00`
                : '60:00'}
            </span>
          </div>

          <RoundTimer
            startedAt={timerStartAt}
            endsAt={timerEndAt}
            label="ROUND TIME REMAINING"
          />
        </div>
      </div>

      {/* 2. Round Info Card */}
      <div className="hd-card p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-ink">
          <h3 className="hd-label text-ink">
            ROUND INFO
          </h3>
        </div>

        <dl className="flex flex-col divide-y divide-[var(--border-subtle)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
            <dt className="text-charcoal">Round</dt>
            <dd className="font-mono font-bold text-ink text-right">3 / 3 (Final)</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-charcoal">Duration</dt>
            <dd className="font-mono font-bold text-ink text-right">60 Minutes</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-charcoal">Problems</dt>
            <dd className="font-mono font-bold text-ink text-right">{totalProblems} Problems</dd>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2.5">
            <dt className="text-charcoal">Max Score</dt>
            <dd>
              <span className="hd-badge hd-badge-brand text-[0.6875rem]">{maxRoundScore} Points</span>
            </dd>
          </div>
        </dl>
      </div>

      {/* 3. Round Rules Card */}
      <div className="hd-card p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-ink">
          <h3 className="hd-label text-ink">
            CRUCIBLE RULES
          </h3>
          <span className="hd-badge hd-badge-ink">5 rules</span>
        </div>

        <ol className="flex flex-col gap-3 text-sm text-charcoal">
          {[
            <>Solve all {totalProblems} problems in any order.</>,
            <>Each passing test case earns 10 points — partial credit counts.</>,
            <><strong className="text-ink">Ouroboros (+30 pts):</strong> Recursion only, strictly no loops.</>,
            <><strong className="text-ink">Short & Sweet (+20 pts):</strong> 30 lines of code or fewer.</>,
            <><strong className="text-ink">One-Shot Wonder (+40 pts):</strong> 1st attempt solve only.</>,
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-brand font-mono text-[0.7rem] font-bold text-ink">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-snug">{rule}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );

  return (
    <ParticipantLayout rightSidebar={rightSidebar}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 hd-label text-muted">
          <Link href="/dashboard" className="hover:text-ink underline-offset-4 hover:underline transition-colors">
            Dashboard
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-ink">Round 3</span>
        </div>

        <div className="relative overflow-hidden hd-card-brand p-5 sm:p-7 lg:p-9">
          <PixelCluster
            className="absolute right-4 top-4 hidden sm:block"
            color="var(--ink)"
            accent="var(--paper)"
            cell={12}
          />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8">
            <span className="hd-display text-[clamp(4.5rem,3rem+6vw,8rem)] leading-[0.8] text-ink shrink-0" aria-hidden="true">
              03
            </span>
            <div className="flex flex-col gap-3 max-w-xl min-w-0">
              <span className="hd-kicker text-ink">
                ROUND 3
              </span>
              <h1 className="hd-h1 text-ink">
                The Constraint <span className="bg-ink text-cream px-[0.12em]">Crucible</span>
              </h1>
              <p className="text-sm sm:text-base text-ink leading-relaxed">
                Conquer the crucible by solving challenges under restrictive modifiers. Stack constraints simultaneously to earn maximum points and surge up the leaderboard.
              </p>
            </div>
          </div>
        </div>

        <div className="hd-card p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
            <div className="lg:col-span-4 flex items-center gap-4 lg:border-r-2 lg:border-ink lg:pr-6">
              <div className="h-14 w-14 rounded-xl border-2 border-ink bg-ink text-brand flex-shrink-0 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="hd-label text-muted">
                  ACTIVE MODE
                </span>
                <h3 className="hd-h3 text-ink mt-0.5">
                  Crucible protocol
                </h3>
                <span className="hd-badge hd-badge-ok mt-1.5">
                  ALL MODIFIERS ACTIVE
                </span>
              </div>
            </div>

            <div className="lg:col-span-8">
              <div className="hd-label text-muted mb-2.5">
                CRUCIBLE MODIFIERS STACK
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-[10px] bg-cream border-2 border-ink">
                  <div className="hd-label text-ink">Base Solve</div>
                  <div className="font-mono text-sm font-bold text-ink mt-1">+10 PTS / test</div>
                  <div className="text-[0.7rem] text-muted mt-0.5">Per test case passed</div>
                </div>
                <div className="p-3 rounded-[10px] bg-brand-soft border-2 border-ink">
                  <div className="hd-label text-ink">The Ouroboros</div>
                  <div className="font-mono text-sm font-bold text-ink mt-1">+30 PTS</div>
                  <div className="text-[0.7rem] text-charcoal mt-0.5">Recursion only</div>
                </div>
                <div className="p-3 rounded-[10px] bg-brand-soft border-2 border-ink">
                  <div className="hd-label text-ink">Short & Sweet</div>
                  <div className="font-mono text-sm font-bold text-ink mt-1">+20 PTS</div>
                  <div className="text-[0.7rem] text-charcoal mt-0.5">≤ 30 lines</div>
                </div>
                <div className="p-3 rounded-[10px] bg-ink border-2 border-ink text-cream">
                  <div className="hd-label text-brand">One-Shot</div>
                  <div className="font-mono text-sm font-bold text-cream mt-1">+40 PTS</div>
                  <div className="text-[0.7rem] text-cream/75 mt-0.5">1st attempt only</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1.5">
            <h2 className="hd-h3 text-ink">
              Problems (solve in any order)
            </h2>
            <span className="hd-label text-muted">
              10 PTS / test case + up to 90 bonus PTS per problem
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {problems.length === 0 ? (
              <div className="hd-card-flat text-sm text-charcoal p-5 text-center">
                No problems currently assigned.
              </div>
            ) : (
              problems.map((problem) => {
                const isSolved = problem.status === 'SOLVED';
                const isInProgress = problem.status === 'IN_PROGRESS';

                return (
                  <Link
                    key={problem.id}
                    href={`/round-3/problem/${problem.id}`}
                    className={`group rounded-[14px] border-2 border-ink p-4 sm:p-5 shadow-hd-sm transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hd flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${isSolved ? 'bg-ok-soft' : 'bg-paper'}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-11 h-11 rounded-lg border-2 border-ink flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 transition-colors ${isSolved ? 'bg-ink text-cream' : 'bg-cream text-ink group-hover:bg-brand'}`}>
                        {problem.numberStr}
                      </div>

                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="font-bold text-base text-ink truncate max-w-full">
                            {problem.title}
                          </span>
                          <span
                            className={`hd-badge ${
                              problem.difficulty === 'EASY'
                                ? 'hd-badge-ok'
                                : problem.difficulty === 'MEDIUM'
                                ? 'hd-badge-warn'
                                : 'hd-badge-bad'
                            }`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-charcoal truncate">
                          {problem.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 flex-shrink-0 pl-[3.75rem] sm:pl-0">
                      <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="font-mono text-xs font-bold text-ink">
                          +{problem.maxPoints} PTS MAX
                        </span>
                        <span className="font-mono text-[0.7rem] text-muted">
                          {problem.constraintsMet}/{problem.totalConstraints} constraints
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`hd-badge ${
                            isSolved
                              ? 'hd-badge-ok'
                              : isInProgress
                              ? 'hd-badge-lilac'
                              : 'hd-badge-muted'
                          }`}
                        >
                          {isSolved && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {isInProgress && <span className="hd-dot hd-pulse-dot" aria-hidden="true" />}
                          {problem.status.replace('_', ' ')}
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-paper text-ink transition-colors group-hover:bg-brand">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="hd-card-ink p-5 sm:p-6 shadow-[4px_4px_0_var(--brand)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 rounded-lg border-2 border-cream/30 bg-brand text-ink flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9v2a6 6 0 006 6v3m0 0H8m4 0h4m-4-9a4 4 0 01-4-4V3h8v5a4 4 0 01-4 4zM6 5H4a2 2 0 00-2 2v1a4 4 0 004 4h2M18 5h2a2 2 0 012 2v1a4 4 0 01-4 4h-2" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="hd-label text-cream/70">
                SCORE IN THIS ROUND
              </div>
              <div className="font-mono text-cream text-base mt-1">
                <span className="hd-display text-3xl text-brand align-baseline">{totalRoundScore}</span> / {maxRoundScore} PTS
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto sm:min-w-[220px]">
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="hd-label text-cream/70">PROGRESS</span>
              <span className="font-mono text-sm font-bold text-cream">
                {solvedCount} / {totalProblems} SOLVED
              </span>
            </div>
            <div className="w-full sm:w-48 h-3 bg-charcoal rounded-full overflow-hidden border-2 border-cream/40">
              <div
                className="h-full bg-brand"
                style={{ width: `${Math.round((solvedCount / totalProblems) * 100) || 0}%` }}
              />
            </div>
          </div>
        </div>

        <footer className="mt-4 pt-5 border-t-2 border-ink flex flex-col sm:flex-row items-center justify-between gap-3 hd-label text-muted text-center">
          <div>© 2026 Hackday · CodeChef VIT Chennai Student Chapter</div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span className="hover:text-ink cursor-pointer">Privacy Policy</span>
            <span aria-hidden="true">|</span>
            <span className="hover:text-ink cursor-pointer">Terms of Use</span>
            <span aria-hidden="true">|</span>
            <span className="hover:text-ink cursor-pointer">Contact Us</span>
          </div>
        </footer>
      </div>
    </ParticipantLayout>
  );
}

export default function Round3DashboardPage() {
  return <Round3PageContent />;
}
