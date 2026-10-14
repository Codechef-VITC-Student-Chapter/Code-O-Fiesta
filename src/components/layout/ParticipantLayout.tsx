'use client';

import React, { useState } from 'react';
import ParticipantSidebar from '@/components/navigation/ParticipantSidebar';
import TopBar from '@/components/navigation/TopBar';

export interface ParticipantLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
  className?: string;
}

export default function ParticipantLayout({
  children,
  rightSidebar,
  className = '',
}: ParticipantLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-cream text-ink">

      {/* 1. PERSISTENT LEFT SIDEBAR (Desktop) */}
      <div className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0 z-30">
        <ParticipantSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div
            className="fixed inset-0 bg-ink/60 transition-opacity duration-300 starting:opacity-0"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-64 max-w-[85vw] h-full shadow-hd-lg transition-transform duration-300 ease-[var(--ease-out)] starting:-translate-x-full">
            <ParticipantSidebar className="w-full" onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        {/* Top Header Bar */}
        <TopBar
          className="sticky top-0 z-20"
          onMenuClick={() => setMobileSidebarOpen(true)}
          menuOpen={mobileSidebarOpen}
        />

        {/* Page Content Body */}
        <main className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto ${className}`}>
          {rightSidebar ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-8 flex flex-col gap-6 min-w-0">
                {children}
              </div>
              <div className="xl:col-span-4 flex flex-col gap-6 min-w-0">
                {rightSidebar}
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
