import React, { useState, useEffect } from 'react';

interface ActiveRoundInfo {
  roundNumber: number;
  name: string;
  durationSeconds: number;
  status?: string;
  startedAt?: string;
  endsAt?: string;
  pausedAt?: string;
}

interface AdminRoundStatusProps {
  activeRound: ActiveRoundInfo | null;
  activeTeamsCount: number;
  onAdjustTime: (roundNumber: number, newDurationSeconds: number) => void;
}

export default function AdminRoundStatus({
  activeRound,
  activeTeamsCount,
  onAdjustTime,
}: AdminRoundStatusProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [inputMinutes, setInputMinutes] = useState<string>('');

  const isPaused = activeRound?.status === 'PAUSED';

  useEffect(() => {
    if (!activeRound) return;

    const updateTimer = () => {
      // While paused, the round's endsAt is frozen server-side until resume,
      // so ticking against it here would show a misleading falling countdown.
      const referenceTime = isPaused && activeRound.pausedAt
        ? new Date(activeRound.pausedAt).getTime()
        : Date.now();

      if (activeRound.endsAt) {
        const remaining = Math.max(0, Math.floor((new Date(activeRound.endsAt).getTime() - referenceTime) / 1000));
        setTimeLeft(remaining);
      } else {
        setTimeLeft(activeRound.durationSeconds);
      }
    };

    updateTimer();
    if (isPaused) return;

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeRound, isPaused]);

  if (!activeRound) {
    return (
      <div className="hd-card-flat hd-dots p-5 mb-6 flex items-center justify-center min-h-[120px]">
        <div className="text-center font-mono">
          <span className="hd-label text-muted block mb-1.5">STAGE TIMERS</span>
          <span className="hd-h3 text-charcoal">No round active currently</span>
        </div>
      </div>
    );
  }

  // Formatting seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [
      h > 0 ? String(h).padStart(2, '0') : null,
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0'),
    ]
      .filter(Boolean)
      .join(':');
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(inputMinutes, 10);
    if (!isNaN(mins) && mins > 0) {
      onAdjustTime(activeRound.roundNumber, mins * 60);
      setInputMinutes('');
    }
  };

  // Progress percentage
  const total = activeRound.durationSeconds;
  const progressPercent = total > 0 ? Math.min(100, ((total - timeLeft) / total) * 100) : 0;

  return (
    <div className="hd-card p-5 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        
        {/* Left: Active stage countdown */}
        <div className="flex-1 w-full min-w-0">
          <span className="hd-label text-muted block mb-1">
            ROUND 0{activeRound.roundNumber} RUNTIME STATUS
          </span>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <h2 className={`hd-display text-[clamp(2.25rem,1.5rem+3vw,3.5rem)] tabular-nums ${isPaused ? 'text-[#6e4a00]' : 'text-ink'}`}>
              {formatTime(timeLeft)}
            </h2>
            <span className="hd-label text-muted">
              remaining of {Math.floor(activeRound.durationSeconds / 60)} min
            </span>
            {isPaused && (
              <span className="hd-badge hd-badge-warn">
                <span className="hd-dot" />
                PAUSED
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-sand h-3 rounded-full mt-3 overflow-hidden border-2 border-ink">
            <div
              className="bg-brand h-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Quick actions & stats */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 w-full lg:w-auto">
          {/* Active Teams Count */}
          <div className="bg-lilac-soft border-2 border-ink p-4 rounded-xl text-center flex-1 sm:flex-initial">
            <span className="hd-label text-muted block">
              Active Teams
            </span>
            <span className="hd-h3 text-ink mt-1">
              {activeTeamsCount} Teams
            </span>
          </div>

          {/* Extend Timer Form */}
          <form onSubmit={handleAdjustSubmit} className="flex gap-2 items-center flex-1 sm:flex-initial">
            <div className="flex flex-col flex-1 sm:flex-initial">
              <label className="hd-field-label">
                Extend round (mins)
              </label>
              <input
                type="number"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                placeholder="e.g. 10"
                required
                className="hd-input w-full sm:w-32 font-mono"
              />
            </div>
            <button
              type="submit"
              className="hd-btn hd-btn-primary self-end"
            >
              APPLY
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
