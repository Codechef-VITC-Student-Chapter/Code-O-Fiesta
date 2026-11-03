import React from 'react';

interface ActiveMemberIndicatorProps {
  activeTeamMember?: 'member1' | 'member2';
}

export default function ActiveMemberIndicator({ activeTeamMember = 'member1' }: ActiveMemberIndicatorProps) {
  const memberLabel = activeTeamMember === 'member1' ? 'Member 1' : 'Member 2';
  
  return (
    <div className="hd-badge hd-badge-lilac px-3 py-1.5 text-[0.6875rem]">
      <span className="hd-dot hd-pulse-dot text-ok" aria-hidden="true" />
      <span>{memberLabel} Active</span>
    </div>
  );
}
