'use client';

import React from 'react';
import HackdayLogo from '@/components/brand/HackdayLogo';

export interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  nav?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function AdminLayout({
  children,
  title = "Organizer Control Panel",
  subtitle = "Hackday Event Management",
  nav,
  actions,
  className = '',
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink overflow-x-clip">
      {/* Distinct Top Accent Bar for Admin */}
      <div className="h-1.5 w-full bg-brand" aria-hidden="true" />

      <header className="sticky top-0 z-40 w-full border-b-2 border-ink bg-paper px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-[var(--content-max-width)] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <HackdayLogo size="sm" className="shrink-0" />
            <span className="hd-badge hd-badge-ink shrink-0">ADMIN</span>
            <span className="hidden sm:block w-[2px] self-stretch bg-ink/15" aria-hidden="true" />
            <div className="min-w-0">
              <h1 className="hd-h3 text-ink flex items-center gap-2 truncate">
                {title}
              </h1>
              {subtitle && <p className="hd-label text-muted mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>

          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>

        {nav && <div className="max-w-[var(--content-max-width)] mx-auto mt-3 border-t border-[var(--border-subtle)] pt-2">{nav}</div>}
      </header>

      <main className={`flex-1 max-w-[var(--content-max-width)] mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
        {children}
      </main>
    </div>
  );
}
