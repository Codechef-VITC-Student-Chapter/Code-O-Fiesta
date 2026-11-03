'use client';

import React from 'react';

export type TeamMemberState = 'active' | 'inactive' | 'locked' | 'waiting';

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  state?: TeamMemberState;
  isCurrentDriver?: boolean;
}

export interface TeamMembersProps {
  members: TeamMember[];
  title?: string;
  className?: string;
}

export default function TeamMembers({
  members,
  title = "Team Members",
  className = '',
}: TeamMembersProps) {
  const getMemberDot = (state?: TeamMemberState) => {
    switch (state) {
      case 'active':
        return 'bg-ok hd-pulse-dot';
      case 'waiting':
        return 'bg-lilac border border-ink';
      case 'locked':
        return 'bg-faint';
      case 'inactive':
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className={`hd-card p-4 sm:p-5 flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between border-b-2 border-ink pb-3">
        <h3 className="hd-h3 text-ink">
          {title} ({members.length})
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <div
            key={member.id}
            className={`flex flex-wrap items-center justify-between gap-2 p-3 rounded-[var(--radius-sm)] border-2 transition-colors ${
              member.isCurrentDriver
                ? 'bg-lilac-soft border-ink text-ink'
                : 'bg-cream border-[var(--border-subtle)] text-charcoal'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${getMemberDot(member.state)}`} aria-hidden="true" />
              <span className="text-sm font-semibold">{member.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {member.role && (
                <span className="hd-badge hd-badge-muted">
                  {member.role}
                </span>
              )}
              {member.isCurrentDriver && (
                <span className="hd-badge hd-badge-brand">
                  ACTIVE DRIVER
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
