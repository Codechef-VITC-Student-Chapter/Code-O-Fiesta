'use client';

import React from 'react';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import EventProgress from '@/components/event/EventProgress';
import RoundTimer from '@/components/timer/RoundTimer';
import { useEventState } from '@/hooks/useEventState';
import { useTimerWindow } from '@/hooks/useTimerWindow';
import { buildEventProgressSteps } from '@/lib/eventProgress';
import { ROUND_1_CONFIG } from '@/config/rounds';

export default function Round1Page() {
  const eventState = useEventState();
  const { startedAt, endsAt } = useTimerWindow(
    eventState.currentRound === 1,
    ROUND_1_CONFIG.durationMinutes,
    eventState.roundStartedAt,
    eventState.roundEndsAt
  );

  return (
    <ParticipantLayout>
      <div className="flex flex-col gap-6">
        <EventProgress steps={buildEventProgressSteps(eventState)} />

        <RoundTimer startedAt={startedAt} endsAt={endsAt} label="ROUND 1 TIME REMAINING" />

        <div className="bg-[#0d0e24] border border-[#1e224d] rounded-xl p-6 shadow-sm">
          <div className="text-[10px] font-mono text-purple-400 font-bold uppercase mb-1">
            [ ROUND 1 OWNER PLACEHOLDER ]
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Round 1: The Maze of Fate</h2>
          <p className="text-xs text-slate-300">
            This page consumes <code className="font-mono text-cyan-400">ParticipantLayout</code>. Topic card selections, maze progression, problem panels, and IDE integration will be implemented here.
          </p>
        </div>
      </div>
    </ParticipantLayout>
  );
}
