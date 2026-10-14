'use client';

import React from 'react';

export interface EventLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  maxWidth?: 'full' | 'standard' | 'narrow';
}

export default function EventLayout({
  children,
  header,
  className = '',
  maxWidth = 'standard',
}: EventLayoutProps) {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'full':
        return 'w-full px-4 sm:px-6 lg:px-8';
      case 'narrow':
        return 'max-w-4xl mx-auto w-full px-4 sm:px-6';
      case 'standard':
      default:
        return 'max-w-[var(--content-max-width)] mx-auto w-full px-4 sm:px-6 lg:px-8';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink overflow-x-clip">
      {header && <header className="sticky top-0 z-40 w-full border-b-2 border-ink bg-paper">{header}</header>}
      <main className={`flex-1 py-6 flex flex-col ${getMaxWidthClass()} ${className}`}>
        {children}
      </main>
    </div>
  );
}
