'use client';

import React from 'react';

export type ShapeType = 'triangle' | 'circle' | 'square' | 'star';

interface ShapeCardProps {
  pathNumber: number;
  shape: ShapeType;
  selected?: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const shapeConfig = {
  triangle: {
    label: 'Path 01',
    tile: 'bg-brand',
    selectedBg: 'bg-brand-soft',
  },
  circle: {
    label: 'Path 02',
    tile: 'bg-lilac',
    selectedBg: 'bg-lilac-soft',
  },
  square: {
    label: 'Path 03',
    tile: 'bg-sand',
    selectedBg: 'bg-sand',
  },
  star: {
    label: 'Path 04',
    tile: 'bg-paper',
    selectedBg: 'bg-brand-soft',
  },
};

function ShapeIcon({ shape, className }: { shape: ShapeType; className?: string }) {
  const common = `w-12 h-12 ${className ?? ''}`;
  switch (shape) {
    case 'triangle':
      return (
        <svg viewBox="0 0 100 100" className={common} fill="none" stroke="currentColor" strokeWidth="8">
          <polygon points="50,12 90,88 10,88" />
        </svg>
      );
    case 'circle':
      return (
        <svg viewBox="0 0 100 100" className={common} fill="none" stroke="currentColor" strokeWidth="8">
          <circle cx="50" cy="50" r="38" />
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 100 100" className={common} fill="none" stroke="currentColor" strokeWidth="8">
          <rect x="18" y="18" width="64" height="64" rx="4" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 100 100" className={common} fill="none" stroke="currentColor" strokeWidth="7" strokeLinejoin="round">
          <polygon points="50,8 61,38 94,38 68,58 79,90 50,70 21,90 32,58 6,38 39,38" />
        </svg>
      );
  }
}

export default function ShapeCard({
  pathNumber,
  shape,
  selected = false,
  onSelect,
  disabled = false,
}: ShapeCardProps) {
  const config = shapeConfig[shape];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`
        group relative flex flex-col items-center justify-between
        w-full min-h-[220px] p-4 sm:p-5 rounded-[14px] border-2 border-ink text-ink
        transition-[transform,box-shadow,background-color] duration-200
        ${selected ? `${config.selectedBg} shadow-hd-lg -translate-x-0.5 -translate-y-0.5 outline outline-[3px] outline-offset-2 outline-brand` : 'bg-paper shadow-hd hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hd-lg'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {selected && (
        <span className="absolute -top-3 -right-2 hd-badge hd-badge-ink rotate-3">Selected</span>
      )}

      {/* Shape */}
      <div className={`mt-1 flex h-20 w-20 items-center justify-center rounded-xl border-2 border-ink ${config.tile} transition-transform duration-300 group-hover:-rotate-3`}>
        <ShapeIcon shape={shape} />
      </div>

      {/* Labels */}
      <div className="flex flex-col items-center gap-1 mt-4">
        <span className="hd-display text-xl sm:text-2xl">
          {config.label}
        </span>
        <span className="text-xs text-charcoal font-medium">Unknown Domain</span>
      </div>

      {/* Lock badge */}
      <div className="mt-4 hd-badge hd-badge-muted">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Topic hidden
      </div>
    </button>
  );
}
