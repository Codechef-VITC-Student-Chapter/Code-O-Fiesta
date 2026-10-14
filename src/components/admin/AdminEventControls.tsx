import React, { useState } from 'react';

interface RoundInfo {
  roundNumber: number;
  name: string;
  status: string;
  durationSeconds: number;
}

interface AdminEventControlsProps {
  rounds: RoundInfo[];
  onStartRound: (roundNumber: number) => void;
  onPauseRound: (roundNumber: number) => void;
  onResumeRound: (roundNumber: number) => void;
  onCompleteRound: (roundNumber: number) => void;
  onRestartRound: (roundNumber: number) => void;
}

export default function AdminEventControls({
  rounds,
  onStartRound,
  onPauseRound,
  onResumeRound,
  onCompleteRound,
  onRestartRound,
}: AdminEventControlsProps) {
  const [confirmRestart, setConfirmRestart] = useState<number | null>(null);

  const handleRestartClick = (roundNumber: number) => {
    setConfirmRestart(roundNumber);
  };

  const handleConfirm = () => {
    if (confirmRestart !== null) {
      onRestartRound(confirmRestart);
      setConfirmRestart(null);
    }
  };

  return (
    <>
      {/* Confirmation Modal */}
      {confirmRestart !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="hd-card shadow-hd-lg p-6 max-w-sm w-full hd-pop">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-bad-soft border-2 border-ink">
                <svg className="w-5 h-5 text-bad" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="hd-h3 text-ink">
                Confirm restart
              </h3>
            </div>
            <p className="text-sm text-charcoal leading-relaxed mb-5">
              This will <span className="font-bold text-bad">delete all team progress</span> for Round {confirmRestart} and restart it from scratch. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRestart(null)}
                className="hd-btn hd-btn-sm flex-1"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirm}
                className="hd-btn hd-btn-danger hd-btn-sm flex-1"
              >
                RESTART ↺
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hd-card p-5 mb-6">
        <h3 className="hd-label text-ink mb-4">
          STAGE CONTROL PANEL
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rounds.map((round) => {
            const isUpcoming = round.status === 'UPCOMING';
            const isActive = round.status === 'ACTIVE';
            const isPaused = round.status === 'PAUSED';
            const isCompleted = round.status === 'COMPLETED';

            let statusColor = 'hd-badge-muted';
            let borderStyle = 'bg-sand border-[var(--border-subtle)]';
            let statusLabel = 'LOCKED';

            if (isActive) {
              statusColor = 'hd-badge-brand';
              borderStyle = 'bg-paper border-ink shadow-hd-sm';
              statusLabel = 'ACTIVE NOW';
            } else if (isPaused) {
              statusColor = 'hd-badge-warn';
              borderStyle = 'bg-warn-soft border-ink';
              statusLabel = 'PAUSED';
            } else if (isCompleted) {
              statusColor = 'hd-badge-ok';
              borderStyle = 'bg-paper border-[var(--border-subtle)]';
              statusLabel = 'COMPLETED';
            }

            return (
              <div
                key={round.roundNumber}
                className={`border-2 ${borderStyle} rounded-xl p-4 flex flex-col justify-between min-w-0`}
              >
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="min-w-0">
                    <span className="hd-label text-muted block">
                      STAGE 0{round.roundNumber}
                    </span>
                    <h4 className="hd-h3 text-base text-ink mt-1">
                      {round.name}
                    </h4>
                  </div>
                  <span className={`hd-badge shrink-0 ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-col gap-2">
                  {isUpcoming && (
                    <button
                      onClick={() => onStartRound(round.roundNumber)}
                      className="hd-btn hd-btn-primary hd-btn-sm hd-btn-block"
                    >
                      START ROUND →
                    </button>
                  )}

                  {isActive && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onPauseRound(round.roundNumber)}
                        className="hd-btn hd-btn-warn hd-btn-sm flex-1"
                      >
                        PAUSE ⏸
                      </button>
                      <button
                        onClick={() => onCompleteRound(round.roundNumber)}
                        className="hd-btn hd-btn-dark hd-btn-sm flex-1"
                      >
                        COMPLETE ✓
                      </button>
                    </div>
                  )}

                  {isPaused && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onResumeRound(round.roundNumber)}
                        className="hd-btn hd-btn-ok hd-btn-sm flex-1"
                      >
                        RESUME ▶
                      </button>
                      <button
                        onClick={() => onCompleteRound(round.roundNumber)}
                        className="hd-btn hd-btn-dark hd-btn-sm flex-1"
                      >
                        COMPLETE ✓
                      </button>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="w-full py-2.5 bg-ok-soft border-2 border-[#0f5b31] rounded-full text-center hd-label text-[#0f5b31]">
                      STAGE FINISHED
                    </div>
                  )}

                  {/* Restart button — shown for ACTIVE, PAUSED, and COMPLETED */}
                  {(isActive || isPaused || isCompleted) && (
                    <button
                      onClick={() => handleRestartClick(round.roundNumber)}
                      className="hd-btn hd-btn-danger hd-btn-sm hd-btn-block"
                    >
                      RESTART ↺
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}


