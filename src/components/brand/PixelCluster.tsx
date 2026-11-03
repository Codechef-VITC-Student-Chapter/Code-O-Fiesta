import React from 'react';

export interface PixelClusterProps {
  /** Colour of the filled squares. Defaults to the orange brand colour. */
  color?: string;
  /** Optional second colour used for a few accent squares. */
  accent?: string;
  /** Square edge length in px. */
  cell?: number;
  variant?: 'stairs' | 'scatter' | 'block';
  className?: string;
}

// Coordinates are [column, row, useAccent]
const PATTERNS: Record<NonNullable<PixelClusterProps['variant']>, Array<[number, number, boolean]>> = {
  stairs: [
    [0, 3, false], [1, 3, false], [2, 3, false], [3, 3, true],
    [1, 2, false], [2, 2, true], [3, 2, false],
    [2, 1, false], [3, 1, false],
    [3, 0, true],
  ],
  scatter: [
    [0, 0, false], [2, 0, true], [1, 1, false], [3, 1, false],
    [0, 2, true], [2, 2, false], [1, 3, false], [3, 3, true],
  ],
  block: [
    [0, 0, false], [1, 0, false], [2, 0, true],
    [0, 1, false], [1, 1, true], [2, 1, false],
    [0, 2, true], [1, 2, false],
  ],
};

/** Stepped pixel-square cluster, the poster's recurring decorative motif. */
export default function PixelCluster({
  color = 'var(--brand)',
  accent = 'var(--lilac)',
  cell = 14,
  variant = 'stairs',
  className = '',
}: PixelClusterProps) {
  const squares = PATTERNS[variant];
  const size = cell * 4;
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {squares.map(([c, r, isAccent]) => (
        <rect
          key={`${c}-${r}`}
          x={c * cell}
          y={r * cell}
          width={cell}
          height={cell}
          fill={isAccent ? accent : color}
        />
      ))}
    </svg>
  );
}
