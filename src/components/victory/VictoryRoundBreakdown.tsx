'use client';

import React, { useState } from 'react';

export interface ProblemBreakdown {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  solved: boolean;
  bestTimeMs?: number;
  points: number;
}

export interface DetailedRound {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  completed: boolean;
  problems: ProblemBreakdown[];
}

interface VictoryRoundBreakdownProps {
  rounds?: DetailedRound[];
}

const DEFAULT_DETAILED_ROUNDS: DetailedRound[] = [
  {
    id: 'round-1',
    name: 'ROUND 1 · PATH OF FATE',
    score: 50,
    maxScore: 150,
    completed: true,
    problems: [
      { id: '1', title: 'Way Too Long Words', difficulty: 'MEDIUM', solved: true, bestTimeMs: 89, points: 50 },
      { id: '2', title: 'Paint House Matrix', difficulty: 'MEDIUM', solved: false, points: 0 },
      { id: '3', title: 'Dynamic Segment Chains', difficulty: 'HARD', solved: false, points: 0 },
    ],
  },
  {
    id: 'round-2',
    name: 'ROUND 2 · BLIND RELAY',
    score: 40,
    maxScore: 150,
    completed: true,
    problems: [
      { id: '1', title: 'Rotational String Logic', difficulty: 'EASY', solved: true, bestTimeMs: 142, points: 40 },
      { id: '2', title: 'Dual Thread Handoff', difficulty: 'MEDIUM', solved: false, points: 0 },
      { id: '3', title: 'Asynchronous Stream Filter', difficulty: 'HARD', solved: false, points: 0 },
    ],
  },
  {
    id: 'round-3',
    name: 'ROUND 3 · CONSTRAINT CRUCIBLE',
    score: 30,
    maxScore: 140,
    completed: true,
    problems: [
      { id: '1', title: 'Recursive Factor Matrix', difficulty: 'MEDIUM', solved: true, bestTimeMs: 110, points: 30 },
      { id: '2', title: 'Loopless Tree Search', difficulty: 'HARD', solved: false, points: 0 },
    ],
  },
];

export default function VictoryRoundBreakdown({ rounds = DEFAULT_DETAILED_ROUNDS }: VictoryRoundBreakdownProps) {
  // Open the first round by default
  const [openRounds, setOpenRounds] = useState<Record<string, boolean>>({
    'round-1': true,
    'round-2': false,
    'round-3': false,
  });

  const toggleRound = (id: string) => {
    setOpenRounds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getDifficultyBadge = (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
    switch (difficulty) {
      case 'EASY':
        return 'hd-badge-ok';
      case 'MEDIUM':
        return 'hd-badge-warn';
      case 'HARD':
        return 'hd-badge-bad';
      default:
        return 'hd-badge-muted';
    }
  };

  return (
    <div className="flex flex-col gap-5 text-ink">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <h2 className="hd-h2">Round performance breakdown</h2>
        <span className="hd-label text-muted">
          Click any round to expand
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {rounds.map((round, rIndex) => {
          const isOpen = openRounds[round.id] ?? false;

          return (
            <div
              key={round.id || rIndex}
              className="hd-card overflow-hidden"
            >
              {/* Accordion header */}
              <button
                type="button"
                onClick={() => toggleRound(round.id)}
                aria-expanded={isOpen}
                className="w-full min-h-[3.5rem] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-lilac-soft transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`inline-flex w-7 h-7 items-center justify-center rounded-md border-2 border-ink bg-brand text-ink text-[10px] transform transition-transform duration-200 ${
                      isOpen ? 'rotate-90' : 'rotate-0'
                    }`}
                  >
                    ▶
                  </span>
                  <span className="font-display text-base sm:text-lg tracking-[-0.02em] text-ink">
                    {round.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="font-bold text-ink">
                    {round.score} / {round.maxScore} PTS
                  </span>
                  {round.completed && (
                    <span className="hd-badge hd-badge-ok">
                      <span aria-hidden="true">✓</span>
                      <span>COMPLETE</span>
                    </span>
                  )}
                </div>
              </button>

              {/* Accordion content */}
              {isOpen && (
                <div className="border-t-2 border-ink bg-cream overflow-x-auto">
                  {round.problems.length === 0 ? (
                    <p className="hd-label text-muted p-5">
                      Per-problem breakdown isn&apos;t available for this round.
                    </p>
                  ) : (
                  <table className="hd-table min-w-[620px]">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Problem title</th>
                        <th>Difficulty</th>
                        <th>Status</th>
                        <th className="text-right">Best time</th>
                        <th className="text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {round.problems.map((prob, pIndex) => (
                        <tr key={prob.id || pIndex}>
                          <td className="font-mono font-bold text-muted">
                            {String(pIndex + 1).padStart(2, '0')}
                          </td>
                          <td className="font-semibold text-ink">
                            {prob.title}
                          </td>
                          <td>
                            <span
                              className={`hd-badge ${getDifficultyBadge(
                                prob.difficulty
                              )}`}
                            >
                              {prob.difficulty}
                            </span>
                          </td>
                          <td>
                            {prob.solved ? (
                              <span className="hd-badge hd-badge-ok">
                                SOLVED
                              </span>
                            ) : (
                              <span className="text-faint font-bold">—</span>
                            )}
                          </td>
                          <td className="text-right font-mono text-charcoal">
                            {prob.bestTimeMs ? `${prob.bestTimeMs}ms` : '—'}
                          </td>
                          <td className="text-right font-mono font-bold">
                            {prob.solved ? (
                              <span className="text-[#0f5b31]">+{prob.points} pts</span>
                            ) : (
                              <span className="text-muted">0 pts</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
