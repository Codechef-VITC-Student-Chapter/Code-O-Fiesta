'use client';

import React, { useState, useEffect } from 'react';
import { useTeamResults } from '@/hooks/useTeamResults';

export interface TopBarProps {
  className?: string;
  onMenuClick?: () => void;
  /** Whether the mobile navigation drawer is currently open (drives aria-expanded). */
  menuOpen?: boolean;
}

export default function TopBar({ className = '', onMenuClick, menuOpen = false }: TopBarProps) {
  const [timeString, setTimeString] = useState<string>('10:24:36 PM');
  const { totalScore, loading: scoreLoading } = useTeamResults();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`h-[var(--topbar-height)] w-full bg-paper border-b-2 border-ink px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none text-ink ${className}`}>

      {/* Left: Mobile Menu Button & Event ID Badge */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            className="lg:hidden hd-icon-btn shrink-0"
          >
            <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2 bg-cream px-3 py-1.5 rounded-[var(--radius-sm)] border-2 border-ink">
          <span className="hd-label text-muted">EVENT ID:</span>
          <span className="text-xs font-mono font-bold text-ink">COF26</span>
        </div>
      </div>

      {/* Center: Live Status Waveform & Server Time */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0">
        {/* Live Status & Waveform */}
        <div className="flex items-center gap-2">
          <span className="hd-label text-muted hidden md:inline">
            LIVE STATUS
          </span>
          <div className="hd-badge hd-badge-ok gap-1.5 px-2.5 py-1">
            <span className="hd-dot hd-pulse-dot" aria-hidden="true" />
            <span className="text-[11px] font-mono font-bold">
              LIVE
            </span>
            {/* Waveform graphic */}
            <div className="hidden min-[420px]:flex items-center gap-0.5 h-3 ml-0.5" aria-hidden="true">
              <span className="w-0.5 h-full bg-current rounded-full animate-wave-1" />
              <span className="w-0.5 h-full bg-current rounded-full animate-wave-2" />
              <span className="w-0.5 h-full bg-current rounded-full animate-wave-3" />
            </div>
          </div>
        </div>

        {/* Server Time */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="hd-label text-muted">
            SERVER TIME
          </span>
          <span className="text-xs font-mono font-bold text-ink tabular-nums tracking-wider">
            {timeString}
          </span>
        </div>
      </div>

      {/* Right: Team ID, Score & Quick Icons */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Team ID */}
        <div className="hidden min-[400px]:flex flex-col text-right leading-tight">
          <span className="hd-label text-muted text-[9px] sm:text-[10px]">
            TEAM ID
          </span>
          <span className="text-xs font-mono font-bold text-ink">
            TEAM_014
          </span>
        </div>

        {/* Score Badge */}
        <div className="flex flex-col items-center bg-brand text-ink px-2.5 sm:px-3 py-1 rounded-[var(--radius-sm)] border-2 border-ink shadow-hd-sm leading-tight">
          <span className="hd-label text-[9px]">
            SCORE
          </span>
          <span className="text-xs sm:text-sm font-mono font-bold whitespace-nowrap">
            {scoreLoading ? '—' : `${totalScore} PTS`}
          </span>
        </div>

        {/* Notification & Settings Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button type="button" aria-label="Notifications" className="relative hd-icon-btn w-9 h-9 sm:w-10 sm:h-10">
            <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand text-ink font-mono text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-ink">
              2
            </span>
          </button>
          <button type="button" aria-label="Settings" className="hd-icon-btn w-9 h-9 sm:w-10 sm:h-10">
            <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
