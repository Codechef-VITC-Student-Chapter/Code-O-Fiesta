'use client';

import React from 'react';

export interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  statusBadge?: React.ReactNode;
  accentColor?: 'purple' | 'emerald' | 'cyan' | 'amber';
  className?: string;
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  statusBadge,
  accentColor = 'purple',
  className = '',
}: SummaryCardProps) {
  const getIconBorder = () => {
    switch (accentColor) {
      case 'emerald':
        return 'bg-ok-soft text-[#0f5b31]';
      case 'cyan':
        return 'bg-lilac text-ink';
      case 'amber':
        return 'bg-warn-soft text-[#6e4a00]';
      case 'purple':
      default:
        return 'bg-brand text-ink';
    }
  };

  return (
    <div className={`hd-card hd-card-interactive p-4 flex items-center gap-3.5 min-w-0 ${className}`}>
      {icon && (
        <div className={`w-11 h-11 rounded-[var(--radius-sm)] border-2 border-ink flex items-center justify-center shrink-0 ${getIconBorder()}`}>
          {icon}
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="hd-label text-muted">
          {title}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-lg font-mono font-bold text-ink truncate">
            {value}
          </span>
          {statusBadge}
        </div>
        {subtitle && (
          <span className="text-[11px] font-mono text-charcoal truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
