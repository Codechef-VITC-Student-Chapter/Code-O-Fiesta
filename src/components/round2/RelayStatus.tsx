import React from 'react';

interface RelayStatusProps {
  activeTeamMember: 'member1' | 'member2';
  timeLeftSeconds: number;
}

export default function RelayStatus({ activeTeamMember, timeLeftSeconds }: RelayStatusProps) {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentLabel = activeTeamMember === 'member1' ? 'Member 1 (15m)' : 'Member 2 (25m)';
  
  return (
    <div className="flex flex-col gap-2.5 p-4 rounded-[14px] bg-paper border-2 border-ink shadow-hd-sm text-ink">
      <div className="hd-label text-muted">
        Relay Configuration
      </div>
      <div className="flex justify-between items-center gap-4 mt-1">
        <span className="text-xs text-charcoal font-mono">Current Driver:</span>
        <span className="hd-badge hd-badge-lilac">{currentLabel}</span>
      </div>
      <div className="flex justify-between items-center gap-4">
        <span className="text-xs text-charcoal font-mono">Turn Time Left:</span>
        <span className={`font-mono text-lg font-bold tabular-nums px-2 rounded-md border-2 border-ink ${timeLeftSeconds < 60 ? 'bg-bad-soft text-[#8f1a10] hd-blink' : 'bg-cream text-ink'}`}>
          {formatTime(timeLeftSeconds)}
        </span>
      </div>
    </div>
  );
}
