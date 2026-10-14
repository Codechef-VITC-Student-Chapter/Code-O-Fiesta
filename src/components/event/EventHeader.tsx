'use client';

import React from 'react';

export interface EventHeaderProps {
  eventName?: string;
  teamName?: string;
  members?: string[];
  currentRound?: string;
  currentPhase?: string;
  roundTimeRemaining?: string;
  teamScore?: number;
  statusBadge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function EventHeader({
  eventName = "VITC Hackday",
  teamName,
  members = [],
  currentRound,
  currentPhase,
  roundTimeRemaining,
  teamScore,
  statusBadge,
  actions,
  className = '',
}: EventHeaderProps) {
  return (
    <div className={`w-full py-3 px-4 sm:px-6 bg-paper text-ink border-b-2 border-ink ${className}`}>
      <div className="max-w-[var(--content-max-width)] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Section: Event Identity & Current Round */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="hd-display text-lg text-ink">
              {eventName}
            </span>
            <span className="hd-badge hd-badge-lilac">
              Freshers&apos; Edition
            </span>
            {statusBadge}
          </div>

          {(currentRound || currentPhase) && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-charcoal">
              {currentRound && <span className="text-ink font-bold">{currentRound}</span>}
              {currentRound && currentPhase && <span className="text-muted" aria-hidden="true">•</span>}
              {currentPhase && <span className="hd-badge hd-badge-brand">{currentPhase}</span>}
            </div>
          )}
        </div>

        {/* Right Section: Team Info, Timer & Score */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          {/* Team identity */}
          {teamName && (
            <div className="flex flex-col text-left min-w-0">
              <span className="hd-label text-muted flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-ink" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Team
              </span>
              <span className="text-sm font-bold text-ink break-all">{teamName}</span>
              {members.length > 0 && (
                <span className="text-[11px] text-muted truncate max-w-[200px]">
                  {members.join(' • ')}
                </span>
              )}
            </div>
          )}

          {/* Time remaining readout */}
          {roundTimeRemaining !== undefined && (
            <div className="flex flex-col items-center bg-ink text-cream px-3 py-1.5 rounded-[var(--radius-sm)] border-2 border-ink min-w-[90px]">
              <span className="hd-label text-cream/80 flex items-center gap-1">
                <svg className="w-3 h-3 text-brand" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time Left
              </span>
              <span className="text-base font-mono font-bold text-cream tabular-nums tracking-wider">
                {roundTimeRemaining}
              </span>
            </div>
          )}

          {/* Score Badge */}
          {teamScore !== undefined && (
            <div className="flex flex-col items-center bg-brand text-ink px-3 py-1.5 rounded-[var(--radius-sm)] border-2 border-ink shadow-hd-sm min-w-[80px]">
              <span className="hd-label text-ink">
                Score
              </span>
              <span className="text-base font-mono font-bold text-ink">
                {teamScore} pts
              </span>
            </div>
          )}

          {actions}
        </div>
      </div>
    </div>
  );
}
