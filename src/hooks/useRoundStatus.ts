'use client';

import { apiCall } from '@/lib/api';
import { createSharedPoller } from '@/lib/sharedPoller';
import { RoundStatus } from '@/constants/event';

export interface RoundStatusData {
  roundNumber: number;
  name: string;
  status: RoundStatus;
  startedAt: string | null;
  endsAt: string | null;
  maxScore: number;
}

// One poller for all three rounds, shared by the navbar, the sidebar and every
// round gate. GET /api/rounds/status returns the same data the per-round
// endpoint does, so a single request covers every consumer.
const roundsPoller = createSharedPoller(
  async (): Promise<RoundStatusData[]> => {
    const result = await apiCall('/api/rounds/status');
    return result.rounds ?? [];
  },
  { intervalMs: 5000, errorMessage: 'Unable to load round status.' },
);

export interface UseRoundStatusResult {
  data: RoundStatusData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useRoundStatus(roundNumber: number): UseRoundStatusResult {
  const { data, loading, error } = roundsPoller.usePoller();

  return {
    data: data?.find((round) => round.roundNumber === roundNumber) ?? null,
    loading,
    error,
    refresh: roundsPoller.refresh,
  };
}

export interface UseAllRoundsStatusResult {
  rounds: RoundStatusData[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAllRoundsStatus(): UseAllRoundsStatusResult {
  const { data, loading, error } = roundsPoller.usePoller();

  return { rounds: data ?? [], loading, error, refresh: roundsPoller.refresh };
}
