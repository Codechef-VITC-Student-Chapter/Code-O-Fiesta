'use client';

import React from 'react';

export interface TeamOverviewCardProps {
  teamId?: string;
  joinedAt?: string;
  rank?: string;
  activityStatus?: string;
  className?: string;
}

export default function TeamOverviewCard({
  teamId = 'TEAM_014',
  joinedAt = '10:05:21 PM',
  rank = '—',
  activityStatus = 'ACTIVE NOW',
  className = '',
}: TeamOverviewCardProps) {
  return (
    <div className={`hd-card p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between border-b-2 border-ink pb-3">
        <h3 className="hd-h3 flex items-center gap-2">
          <svg className="w-5 h-5 text-ink" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Team overview
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <div>
          <span className="hd-label text-muted block mb-1">TEAM ID</span>
          <span className="text-sm font-mono font-bold text-ink break-all">{teamId}</span>
        </div>

        <div>
          <span className="hd-label text-muted block mb-1">JOINED AT</span>
          <span className="text-sm font-mono text-charcoal">{joinedAt}</span>
        </div>

        <div>
          <span className="hd-label text-muted block mb-1">TEAM RANK</span>
          <span className="inline-block mt-0.5 hd-badge hd-badge-brand">{rank}</span>
        </div>

        <div>
          <span className="hd-label text-muted block mb-1">LAST ACTIVITY</span>
          <span className="hd-badge hd-badge-ok mt-0.5">
            <span className="hd-dot hd-pulse-dot" aria-hidden="true" />
            {activityStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
