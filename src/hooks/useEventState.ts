'use client';

import { createSharedPoller } from '@/lib/sharedPoller';
import { eventService } from '@/services/event';
import type { EventState } from '@/types/event';

const INITIAL_STATE: EventState = {
  eventStatus: 'UPCOMING',
  currentRound: 0,
  currentPhase: null,
  roundStartedAt: null,
  roundEndsAt: null,
  teamStatus: 'ACTIVE',
  teamScore: 0,
  activeMember: null,
  currentProblem: null,
};

// One poller shared by every component that reads the event state.
const eventPoller = createSharedPoller(() => eventService.getEventState(), {
  intervalMs: 5000,
  errorMessage: 'Unable to reach the event server.',
});

export interface UseEventStateResult extends EventState {
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useEventState(): UseEventStateResult {
  const { data, loading, error } = eventPoller.usePoller();

  return { ...(data ?? INITIAL_STATE), loading, error, refresh: eventPoller.refresh };
}
