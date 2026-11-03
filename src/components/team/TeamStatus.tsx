'use client';

import React from 'react';

export type TeamStatusType =
  | 'READY'
  | 'ACTIVE'
  | 'WAITING'
  | 'COMPLETED'
  | 'LOCKED'
  | 'DISCONNECTED';

export interface TeamStatusProps {
  status: TeamStatusType;
  label?: string;
  className?: string;
}

export default function TeamStatus({
  status,
  label,
  className = '',
}: TeamStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'bg-ok-soft',
          border: 'border-[#0f5b31]',
          text: 'text-[#0f5b31]',
          defaultLabel: 'Active',
        };
      case 'READY':
        return {
          bg: 'bg-lilac',
          border: 'border-ink',
          text: 'text-ink',
          defaultLabel: 'Ready',
        };
      case 'WAITING':
        return {
          bg: 'bg-warn-soft',
          border: 'border-[#6e4a00]',
          text: 'text-[#6e4a00]',
          defaultLabel: 'Waiting',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-paper',
          border: 'border-ink',
          text: 'text-ink',
          defaultLabel: 'Finished',
        };
      case 'DISCONNECTED':
        return {
          bg: 'bg-bad-soft',
          border: 'border-[#8f1a10]',
          text: 'text-[#8f1a10]',
          defaultLabel: 'Disconnected',
        };
      case 'LOCKED':
      default:
        return {
          bg: 'bg-sand',
          border: 'border-[var(--border-subtle)]',
          text: 'text-muted',
          defaultLabel: 'Locked',
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-[0.08em] rounded-full border-[1.5px] whitespace-nowrap ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      {displayLabel}
    </span>
  );
}
