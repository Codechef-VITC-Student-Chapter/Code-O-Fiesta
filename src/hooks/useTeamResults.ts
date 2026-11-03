'use client';

import { useCallback } from 'react';
import { apiCall } from '@/lib/api';
import { createSharedPoller } from '@/lib/sharedPoller';

export interface TeamRoundResult {
  roundNumber: number;
  status: string;
  score: number;
  achievements: {
    baseSolve: boolean;
    ouroboros: boolean;
    shortAndSweet: boolean;
    oneShotWonder: boolean;
  } | null;
  completedAt: string | null;
}

export interface TeamResults {
  teamName: string;
  totalScore: number;
  rank: number | null;
  rounds: TeamRoundResult[];
  status: string;
}

export interface UseTeamResultsResult {
  results: TeamResults | null;
  totalScore: number;
  getRoundScore: (roundNumber: number) => number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// The top bar, round gate and page all read the team's results; share one poll.
const resultsPoller = createSharedPoller<TeamResults>(() => apiCall('/api/results/me'), {
  intervalMs: 15000,
  errorMessage: 'Unable to load team results.',
});

export function useTeamResults(): UseTeamResultsResult {
  const { data: results, loading, error } = resultsPoller.usePoller();

  const getRoundScore = useCallback(
    (roundNumber: number) =>
      results?.rounds.find((round) => round.roundNumber === roundNumber)?.score ?? 0,
    [results],
  );

  return {
    results,
    totalScore: results?.totalScore ?? 0,
    getRoundScore,
    loading,
    error,
    refresh: resultsPoller.refresh,
  };
}
