'use client';

import { use, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CodingIDE from '@/components/ide/CodingIDE';
import PhaseTimer from '@/components/timer/PhaseTimer';
import { problemsService } from '@/services/problems';
import useAuth from '@/hooks/useAuth';

interface PageProps {
  params: Promise<{ problemId: string }>;
}

function MemberStatus({
  member,
  status,
  active,
}: {
  member: string;
  status: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius-sm)] border-2 border-ink px-3 py-2 font-mono transition-colors ${active ? 'bg-ok-soft shadow-hd-sm' : 'bg-sand'}`}
    >
      <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-ink">
        <span className={`h-2 w-2 rounded-full border border-ink ${active ? 'bg-ok hd-pulse-dot' : 'bg-faint'}`} />
        {member}
      </div>
      <div className={`mt-1 pl-4 text-[10px] font-bold tracking-wider ${active ? 'text-[#0f5b31]' : 'text-muted'}`}>
        {status}
      </div>
    </div>
  );
}

export default function Round2ProblemPage({ params }: PageProps) {
  const { problemId } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [roundState, setRoundState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const st = await problemsService.fetchRoundState(2);
      setRoundState(st);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      // The round-2 layout's RoundGate already shows a dedicated screen when
      // the round isn't active (upcoming/paused/completed) and will unmount
      // this page shortly — don't flash a raw error here while it catches up.
      if (/not currently active/i.test(message)) return;
      console.error(err);
      setError('Failed to fetch round state.');
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const handleComplete = async () => {
    try {
      await problemsService.completeRound2Question(problemId);
      // refetch state & questions, redirect to new problem ID
      const qsRes = await problemsService.fetchRoundProblems(2);
      const st = await problemsService.fetchRoundState(2);
      const nextQNum = st.currentQuestionNumber || 1;
      let nextProblemId = problemId;

      const questions = (qsRes as any).questions;
      if (questions && Array.isArray(questions)) {
        const qIdx = nextQNum - 1;
        if (questions[qIdx] && questions[qIdx].problemId) {
          nextProblemId = questions[qIdx].problemId;
        }
      }
      if (st.roundStatus === 'COMPLETED') {
        router.push('/dashboard');
      } else {
        router.push(`/round-2/problem/${nextProblemId}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete question');
    }
  };

  if (error) return <div className="min-h-screen bg-cream p-6 sm:p-10"><div className="hd-alert hd-alert-bad max-w-lg text-ink">{error}</div></div>;
  if (!roundState || !user) return <div className="min-h-screen bg-cream p-6 sm:p-10 hd-label text-charcoal">Loading...</div>;

  const currentPhase = roundState.phase;
  const activeMember = roundState.activeMember;

  const allowedActions = roundState.allowedActions ?? {};
  const isMyTurn = allowedActions.canEditCode === true;
  const member2IsActive = activeMember === 'MEMBER_2';
  const member1IsActive = activeMember === 'MEMBER_1';

  const roundStartedAt = roundState.phaseStartedAt ? new Date(roundState.phaseStartedAt).toISOString() : null;
  const roundEndsAt = roundState.phaseEndsAt ? new Date(roundState.phaseEndsAt).toISOString() : null;
  const msLeft = roundState.phaseEndsAt ? Math.max(0, new Date(roundState.phaseEndsAt).getTime() - Date.now()) : 600000;

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-cream text-ink">
      <header className="relative flex h-32 flex-none items-center border-b-2 border-ink bg-paper px-4 sm:px-6">
        <div className="w-full pr-32 sm:pr-40">
          <div className="flex items-center gap-4">
            <div className="hd-badge hd-badge-brand">
              Round 2
            </div>
            <div className="hd-label text-charcoal tabular-nums">
              Question {roundState.currentQuestionNumber} / {roundState.totalQuestions}
            </div>
          </div>
          <h1 className="mt-1 font-display text-lg sm:text-xl tracking-[-0.03em] leading-none text-ink">
            Blind Relay Workspace
          </h1>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:max-w-sm">
            <MemberStatus
              member="MEMBER 1"
              status={currentPhase === 'HANDOVER' ? 'HANDOVER IN PROGRESS' : member1IsActive ? 'ACTIVE / CODING' : 'WAITING'}
              active={member1IsActive}
            />
            <MemberStatus
              member="MEMBER 2"
              status={roundState.member2Submitted ? 'SUBMITTED / WAITING' : member2IsActive ? 'ACTIVE / YOUR TURN' : 'WAITING FOR TURN'}
              active={member2IsActive}
            />
          </div>
        </div>

        {roundStartedAt && roundEndsAt && (
          <div className="pointer-events-none absolute right-2 top-1/2 h-[104px] w-32 -translate-y-1/2 overflow-hidden sm:right-5 sm:w-36">
            <PhaseTimer
              startedAt={roundStartedAt}
              endsAt={roundEndsAt}
              className="origin-top-right scale-[0.5] sm:scale-[0.54]"
            />
          </div>
        )}
      </header>

      <main className={!isMyTurn ? 'round2-locked-ide relative min-h-0 flex-1 overflow-hidden' : 'min-h-0 flex-1'}>
        {!isMyTurn && (
          <>
            <style>{`
            .round2-locked-ide > div > div:first-child,
            .round2-locked-ide > div > div:nth-child(2) > div:nth-child(1) {
              visibility: hidden !important;
              pointer-events: none !important;
            }
            .round2-locked-ide > div > div:first-child {
              display: none !important;
            }
            `}</style>
            <aside className="absolute inset-y-0 left-0 z-20 flex w-[40%] items-center justify-center border-r-2 border-ink bg-cream hd-dots p-3 sm:p-5 text-center">
              <div className="hd-card p-4 sm:p-6 font-mono max-w-xs">
                <div className="hd-badge hd-badge-lilac">Blind Relay</div>
                <div className="mt-3 font-display text-lg tracking-[-0.03em] text-ink break-words">{user.teamMember?.replace('_', ' ')}</div>
                <div className="mt-3 inline-block rounded-[var(--radius-sm)] bg-warn-soft border-2 border-ink px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink">
                  {currentPhase === 'HANDOVER' ? 'HANDOVER — SWITCHING TO MEMBER 2' : roundState.member2Submitted ? 'SUBMITTED — WAITING FOR PHASE END' : 'WAIT FOR YOUR TURN'}
                </div>
              </div>
            </aside>
          </>
        )}
        <CodingIDE
          problemId={problemId}
          roundNumber={2}
          mode="relay"
          roundConfig={{ mode: 'relay', activeTeamMember: activeMember as any, currentUserId: user.teamMember as string, serverCode: roundState.currentCode, forceSwitchAfterMs: msLeft }}
          readOnly={!allowedActions.canEditCode}
          hideProblemStatement={!allowedActions.canSeeProblem}
          canSubmit={allowedActions.canSubmitCode === true}
        />
      </main>
    </div>
  );
}
