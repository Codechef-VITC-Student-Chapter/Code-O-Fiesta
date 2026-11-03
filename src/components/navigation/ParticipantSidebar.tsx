'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAllRoundsStatus } from '@/hooks/useRoundStatus';
import { RoundStatus } from '@/constants/event';
import VictoryExitModal from '@/components/victory/VictoryExitModal';
import HackdayLogo from '@/components/brand/HackdayLogo';

export interface ParticipantSidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

const ROUND_BADGE_STYLES: Record<string, string> = {
  [RoundStatus.ACTIVE]: 'hd-badge-ok',
  [RoundStatus.PAUSED]: 'hd-badge-warn',
  [RoundStatus.COMPLETED]: 'hd-badge-lilac',
  [RoundStatus.UPCOMING]: 'hd-badge-muted',
};

const ROUND_BADGE_LABELS: Record<string, string> = {
  [RoundStatus.ACTIVE]: 'ACTIVE',
  [RoundStatus.PAUSED]: 'PAUSED',
  [RoundStatus.COMPLETED]: 'COMPLETED',
  [RoundStatus.UPCOMING]: 'LOCKED',
};

export default function ParticipantSidebar({ className = '', onCloseMobile }: ParticipantSidebarProps) {
  const pathname = usePathname();
  const [showExitModal, setShowExitModal] = useState(false);
  const { rounds } = useAllRoundsStatus();
  const statusByRoundNumber = new Map(rounds.map((r) => [r.roundNumber, r.status]));

  const navItems = [
    {
      id: 'dashboard',
      label: 'DASHBOARD',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'round-1',
      label: 'ROUND 1',
      sublabel: 'Path of Fate',
      href: '/round-1/path',
      icon: (
        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m0 0l-2-1m2 1v2.5M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1m2 1l2-1m-2 1v-2.5M18 18l-2-1m2 1l2-1m-2 1v-2.5" />
        </svg>
      ),
    },
    {
      id: 'round-2',
      label: 'ROUND 2',
      sublabel: 'Blind Relay',
      href: '/round-2',
      icon: (
        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      id: 'round-3',
      label: 'ROUND 3',
      sublabel: 'Constraint Crucible',
      href: '/round-3',
      icon: (
        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },

    {
      id: 'victory',
      label: 'VICTORY',
      href: '/arena/victory',
      icon: (
        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`w-64 max-w-full bg-cream border-r-2 border-ink flex flex-col justify-between h-full select-none text-ink ${className}`}
    >
      {/* Top Section: Logo Branding */}
      <div className="min-h-0 flex flex-col">
        <div className="h-[var(--topbar-height)] shrink-0 px-5 border-b-2 border-ink bg-paper flex items-center justify-between gap-3">
          <Link href="/dashboard" aria-label="Hackday dashboard" className="rounded-md">
            <HackdayLogo size="sm" showOrganizer />
          </Link>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="lg:hidden hd-icon-btn"
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Items List */}
        <nav aria-label="Participant navigation" className="p-3 pt-4 flex flex-col gap-2 overflow-y-auto">
          <span className="hd-label text-muted px-2 pb-1">Menu</span>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onCloseMobile}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 min-h-11 rounded-[var(--radius-sm)] border-2 font-mono text-xs font-bold transition-[transform,box-shadow,background-color] duration-150 group ${
                  isActive
                    ? 'bg-brand text-ink border-ink shadow-hd'
                    : 'text-ink border-transparent hover:bg-paper hover:border-ink hover:shadow-hd-sm'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-md border-2 border-ink ${
                      isActive ? 'bg-paper' : 'bg-paper group-hover:bg-lilac'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="tracking-[0.08em] truncate">{item.label}</span>
                    {item.sublabel && (
                      <span className={`text-[10px] font-normal truncate ${isActive ? 'text-ink' : 'text-muted'}`}>
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                {item.id.startsWith('round-') && (() => {
                  const roundNumber = Number(item.id.replace('round-', ''));
                  const status = statusByRoundNumber.get(roundNumber) ?? RoundStatus.UPCOMING;
                  return (
                    <span className={`hd-badge text-[8.5px] px-1.5 shrink-0 ${ROUND_BADGE_STYLES[status]}`}>
                      {ROUND_BADGE_LABELS[status]}
                    </span>
                  );
                })()}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Connection Telemetry & Exit Arena Action */}
      <div className="p-4 border-t-2 border-ink bg-paper flex flex-col gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-[#0f5b31]">
            <span className="hd-dot hd-pulse-dot bg-ok" aria-hidden="true" />
            <span className="hd-label font-bold">
              SYSTEM STATUS
            </span>
          </div>
          <p className="text-[11px] font-mono text-muted mt-1">
            All systems operational
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowExitModal(true)}
          className="group hd-btn hd-btn-sm hd-btn-block hd-btn-square hover:bg-bad-soft text-[#8f1a10]"
        >
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>CLOSE ARENA</span>
        </button>
      </div>

      <VictoryExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
      />
    </aside>
  );
}
