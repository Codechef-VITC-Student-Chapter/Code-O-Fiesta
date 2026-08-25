'use client';

import React from 'react';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import EventProgress from '@/components/event/EventProgress';
import RoundTimer from '@/components/timer/RoundTimer';
import PhaseTimer from '@/components/timer/PhaseTimer';
import TeamMembersCard from '@/components/dashboard/TeamMembersCard';
import { useEventState } from '@/hooks/useEventState';
import { useTimerWindow } from '@/hooks/useTimerWindow';
import { buildEventProgressSteps } from '@/lib/eventProgress';
import { ROUND_2_CONFIG } from '@/config/rounds';

export default function Round2Page() {
  const eventState = useEventState();

  const round = useTimerWindow(
    eventState.currentRound === 2,
    ROUND_2_CONFIG.durationMinutes,
    eventState.roundStartedAt,
    eventState.roundEndsAt
  );

  // No live per-member phase state exists yet (that belongs to useProblemState,
  // owned separately) — this demonstrates Member 1's phase countdown using the
  // same reusable PhaseTimer, ready to take real phase timestamps once available.
  const phase = useTimerWindow(false, ROUND_2_CONFIG.member1DurationMinutes, null, null);

  return (
    <ParticipantLayout rightSidebar={<TeamMembersCard />}>
      <div className="flex flex-col gap-6">
        <EventProgress steps={buildEventProgressSteps(eventState)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RoundTimer startedAt={round.startedAt} endsAt={round.endsAt} label="ROUND 2 TIME REMAINING" />
          <PhaseTimer startedAt={phase.startedAt} endsAt={phase.endsAt} activeMemberLabel="MEMBER 1" />
        </div>

        <div className="bg-[#0d0e24] border border-[#1e224d] rounded-xl p-6 shadow-sm">
          <div className="text-[10px] font-mono text-purple-400 font-bold uppercase mb-1">
            [ ANANYA / ROUND 2 OWNER PLACEHOLDER ]
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Round 2: The Blind Relay</h2>
          <p className="text-xs text-slate-300">
            This page consumes <code className="font-mono text-cyan-400">ParticipantLayout</code>. Ananya will implement relay turn-swaps, hidden code overlays, and active driver mechanics here.
          </p>
        </div>
      </div>
    </ParticipantLayout>
  );
}
