'use client';

import React from 'react';

export type EventStatusType =
  | 'UPCOMING'
  | 'READY'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'LOCKED'
  | 'EXPIRED'
  | 'ERROR';

export interface EventStatusProps {
  status: EventStatusType;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function EventStatus({
  status,
  label,
  className = '',
  size = 'md',
}: EventStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: 'bg-ok-soft',
          border: 'border-[#0f5b31]',
          text: 'text-[#0f5b31]',
          dot: 'bg-ok hd-pulse-dot',
          defaultLabel: 'Active',
        };
      case 'READY':
        return {
          bg: 'bg-lilac',
          border: 'border-ink',
          text: 'text-ink',
          dot: 'bg-ink',
          defaultLabel: 'Ready',
        };
      case 'UPCOMING':
        return {
          bg: 'bg-lilac-soft',
          border: 'border-ink',
          text: 'text-ink',
          dot: 'bg-lilac',
          defaultLabel: 'Upcoming',
        };
      case 'PAUSED':
        return {
          bg: 'bg-warn-soft',
          border: 'border-[#6e4a00]',
          text: 'text-[#6e4a00]',
          dot: 'bg-warn',
          defaultLabel: 'Paused',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-paper',
          border: 'border-ink',
          text: 'text-ink',
          dot: 'bg-ink',
          defaultLabel: 'Completed',
        };
      case 'LOCKED':
        return {
          bg: 'bg-sand',
          border: 'border-[var(--border-subtle)]',
          text: 'text-muted',
          dot: 'bg-faint',
          defaultLabel: 'Locked',
        };
      case 'EXPIRED':
        return {
          bg: 'bg-brand-soft',
          border: 'border-ink',
          text: 'text-ink',
          dot: 'bg-brand',
          defaultLabel: 'Expired',
        };
      case 'ERROR':
      default:
        return {
          bg: 'bg-bad-soft',
          border: 'border-[#8f1a10]',
          text: 'text-[#8f1a10]',
          dot: 'bg-bad',
          defaultLabel: 'Error',
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase tracking-[0.08em] rounded-full border-[1.5px] whitespace-nowrap ${config.bg} ${config.border} ${config.text} ${sizeClasses} ${className}`}
    >
      <span className={`rounded-full w-1.5 h-1.5 shrink-0 ${config.dot}`} aria-hidden="true" />
      {displayLabel}
    </span>
  );
}
