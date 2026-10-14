'use client';

import React from 'react';

export interface TeamHeaderProps {
  teamName: string;
  teamId?: string;
  score?: number;
  memberCount?: number;
  statusBadge?: React.ReactNode;
  className?: string;
}

export default function TeamHeader({
  teamName,
  teamId,
  score,
  memberCount,
  statusBadge,
  className = '',
}: TeamHeaderProps) {
  return (
    <div className={`hd-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 shrink-0 rounded-[var(--radius-sm)] bg-lilac border-2 border-ink flex items-center justify-center hd-display text-xl text-ink" aria-hidden="true">
          {teamName.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="hd-h3 text-ink break-all">{teamName}</h2>
            {statusBadge}
          </div>
          {teamId && (
            <span className="text-xs font-mono text-muted mt-0.5">
              ID: {teamId} {memberCount !== undefined ? `• ${memberCount} Members` : ''}
            </span>
          )}
        </div>
      </div>

      {score !== undefined && (
        <div className="flex flex-col items-end bg-brand text-ink px-3.5 py-1.5 rounded-[var(--radius-sm)] border-2 border-ink shadow-hd-sm">
          <span className="hd-label text-ink">
            Total Points
          </span>
          <span className="text-xl font-mono font-bold text-ink tabular-nums">
            {score}
          </span>
        </div>
      )}
    </div>
  );
}
