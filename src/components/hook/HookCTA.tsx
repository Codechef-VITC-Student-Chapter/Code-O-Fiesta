import React from 'react';
import Link from 'next/link';

export interface HookCTAProps {
  className?: string;
  label?: string;
}

export default function HookCTA({ className = '', label = 'Enter Hackday' }: HookCTAProps) {
  return (
    <Link href="/login" className={`group hd-btn hd-btn-primary hd-btn-lg ${className}`}>
      <span>{label}</span>
      <svg
        aria-hidden="true"
        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </Link>
  );
}
