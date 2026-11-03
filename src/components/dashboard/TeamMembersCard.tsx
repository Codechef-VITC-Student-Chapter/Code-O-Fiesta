'use client';

import React from 'react';

export interface TeamMember {
  id: string;
  name: string;
  isOnline: boolean;
}

export interface TeamMembersCardProps {
  members?: TeamMember[];
  className?: string;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Member 01', isOnline: true },
  { id: '2', name: 'Member 02', isOnline: true },
];

export default function TeamMembersCard({
  members = DEFAULT_MEMBERS,
  className = '',
}: TeamMembersCardProps) {
  const onlineCount = members.filter((m) => m.isOnline).length;

  return (
    <div className={`hd-card p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-3">
        <h3 className="hd-h3">
          Team members
        </h3>
        <span className="hd-badge hd-badge-ok">
          {onlineCount} / {members.length} ONLINE
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] bg-cream border-2 border-[var(--border-subtle)]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-full bg-lilac border-2 border-ink flex items-center justify-center text-ink text-xs font-mono" aria-hidden="true">
                👤
              </div>
              <span className="text-sm font-semibold text-ink truncate">{member.name}</span>
            </div>

            <span className="hd-badge hd-badge-ok shrink-0">
              <span className="hd-dot hd-pulse-dot" aria-hidden="true" />
              ONLINE
            </span>
          </div>
        ))}
      </div>

      <button type="button" className="hd-btn hd-btn-sm hd-btn-block mt-1">
        VIEW TEAM DETAILS →
      </button>
    </div>
  );
}
