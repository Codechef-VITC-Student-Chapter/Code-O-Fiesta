'use client';

import React, { useEffect, useRef, useState } from 'react';

export type TimerVisualState = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'EXPIRED' | 'PAUSED' | 'LOCKED';

export interface CountdownTimerProps {
  endAt: string | number | null;
  startAt?: string | number | null;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  paused?: boolean;
  locked?: boolean;
  onExpire?: () => void;
  className?: string;
}

const WARNING_THRESHOLD_MS = 5 * 60 * 1000;
const CRITICAL_THRESHOLD_MS = 60 * 1000;

function toMs(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'number' ? value : new Date(value).getTime();
}

function splitDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad2 = (n: number) => n.toString().padStart(2, '0');

const STATE_RING_COLOR: Record<TimerVisualState, string> = {
  NORMAL: 'var(--brand)',
  WARNING: 'var(--warn)',
  CRITICAL: 'var(--bad)',
  EXPIRED: 'var(--faint)',
  PAUSED: 'var(--faint)',
  LOCKED: 'var(--faint)',
};

const STATE_TEXT_CLASS: Record<TimerVisualState, string> = {
  NORMAL: 'text-ink',
  WARNING: 'text-[#8a5b00]',
  CRITICAL: 'text-bad animate-pulse',
  EXPIRED: 'text-muted',
  PAUSED: 'text-charcoal',
  LOCKED: 'text-muted',
};

const SIZE_CONFIG: Record<'sm' | 'md' | 'lg', { wrapper: string; digit: string; seconds: string; label: string; ring: number }> = {
  sm: { wrapper: 'w-28 h-28', digit: 'text-xl', seconds: 'text-[11px]', label: 'text-[9px]', ring: 9 },
  md: { wrapper: 'w-40 h-40', digit: 'text-3xl', seconds: 'text-sm', label: 'text-[10px]', ring: 10 },
  lg: { wrapper: 'w-56 h-56', digit: 'text-5xl', seconds: 'text-lg', label: 'text-[11px]', ring: 11 },
};

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownTimer({
  endAt,
  startAt = null,
  label,
  size = 'md',
  paused = false,
  locked = false,
  onExpire,
  className = '',
}: CountdownTimerProps) {
  const endMs = toMs(endAt);
  const startMs = toMs(startAt);
  // Starts at 0 rather than computing from Date.now() here — that read must
  // happen client-side only (in the effect below), otherwise it runs once
  // during server rendering and again during hydration with a different
  // timestamp, producing a hydration mismatch.
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const hasFiredExpireRef = useRef(false);

  useEffect(() => {
    hasFiredExpireRef.current = false;
  }, [endMs]);

  useEffect(() => {
    if (endMs === null || paused || locked) return;

    const tick = () => setRemainingMs(endMs - Date.now());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endMs, paused, locked]);

  useEffect(() => {
    if (endMs !== null && remainingMs <= 0 && !hasFiredExpireRef.current) {
      hasFiredExpireRef.current = true;
      onExpire?.();
    }
  }, [remainingMs, endMs, onExpire]);

  const visualState: TimerVisualState = locked
    ? 'LOCKED'
    : paused
    ? 'PAUSED'
    : endMs === null
    ? 'NORMAL'
    : remainingMs <= 0
    ? 'EXPIRED'
    : remainingMs <= CRITICAL_THRESHOLD_MS
    ? 'CRITICAL'
    : remainingMs <= WARNING_THRESHOLD_MS
    ? 'WARNING'
    : 'NORMAL';

  const totalMs = startMs !== null && endMs !== null ? endMs - startMs : null;
  const progress = totalMs && totalMs > 0 ? Math.min(1, Math.max(0, remainingMs / totalMs)) : 1;

  const ringColor = STATE_RING_COLOR[visualState];
  const textClass = STATE_TEXT_CLASS[visualState];
  const sizeConfig = SIZE_CONFIG[size];

  const isBlank = visualState === 'LOCKED' || endMs === null;
  const { hours, minutes, seconds } = splitDuration(remainingMs);
  const fullText = isBlank ? '--:--:--' : `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;

  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {label && (
        <span className="hd-label text-ink">
          {label}
        </span>
      )}

      <div className={`relative ${sizeConfig.wrapper}`} role="timer" aria-live="polite" aria-label={fullText}>
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle cx="100" cy="100" r="98" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border-subtle)" strokeWidth="1.5" />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="var(--sand)"
            strokeWidth={sizeConfig.ring}
          />
          {!isBlank && (
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth={sizeConfig.ring}
              strokeLinecap="butt"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className={`font-mono font-bold tabular-nums leading-none tracking-tight ${sizeConfig.digit} ${textClass}`}>
              {isBlank ? '--' : pad2(hours)}
            </span>
            <span className={`font-mono font-bold leading-none ${sizeConfig.digit} ${textClass} opacity-60`}>:</span>
            <span className={`font-mono font-bold tabular-nums leading-none tracking-tight ${sizeConfig.digit} ${textClass}`}>
              {isBlank ? '--' : pad2(minutes)}
            </span>
          </div>
          <span className={`mt-1 px-1.5 rounded-sm bg-ink text-cream font-mono font-bold tabular-nums ${sizeConfig.seconds}`}>
            {isBlank ? '--' : pad2(seconds)}
          </span>
        </div>
      </div>

      <div className={`flex gap-6 font-mono uppercase tracking-widest text-muted ${sizeConfig.label}`}>
        <span className="w-8 text-center">Hrs</span>
        <span className="w-8 text-center">Min</span>
      </div>

      {visualState === 'LOCKED' && (
        <span className="hd-badge hd-badge-muted">Locked</span>
      )}
    </div>
  );
}
