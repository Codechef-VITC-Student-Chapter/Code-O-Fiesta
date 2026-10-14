'use client';

import React, { useEffect, useState, useRef } from 'react';

interface RunButtonProps {
  onClick: (mode: 'examples' | 'custom') => void;
  disabled?: boolean;
  isRunning: boolean;
}

export default function RunButton({ onClick, disabled, isRunning }: RunButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && !isRunning) {
          onClick('examples');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick, disabled, isRunning]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex rounded-full shadow-[2px_2px_0_var(--brand)]" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(false);
          onClick('examples');
        }}
        disabled={disabled || isRunning}
        type="button"
        className="hd-btn hd-btn-dark !rounded-r-none !pr-3 sm:!pr-4 !pl-3.5 sm:!pl-5 !min-h-10 !shadow-none hover:!shadow-none hover:!transform-none"
      >
        {isRunning ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-brand" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Running...</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Run<span className="hidden sm:inline"> Examples</span></span>
          </>
        )}
      </button>

      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isRunning}
        type="button"
        className="hd-btn hd-btn-dark !rounded-l-none !border-l-[#3a3830] !px-2.5 !min-h-10 !shadow-none hover:!shadow-none hover:!transform-none"
        aria-label="More run options"
      >
        <svg className="w-4 h-4 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-52 rounded-[var(--radius-sm)] shadow-hd bg-paper border-2 border-ink overflow-hidden z-[100] py-1">
          <button
            onClick={() => {
              setIsOpen(false);
              onClick('examples');
            }}
            className="w-full text-left px-4 py-2.5 min-h-10 text-xs font-mono font-bold text-ink hover:bg-lilac-soft transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 text-ink" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Run Examples
          </button>
          <div className="h-px bg-[var(--border-subtle)] mx-2 my-1" />
          <button
            onClick={() => {
              setIsOpen(false);
              onClick('custom');
            }}
            className="w-full text-left px-4 py-2.5 min-h-10 text-xs font-mono font-bold text-ink hover:bg-lilac-soft transition-colors cursor-pointer flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Run Custom Input
          </button>
        </div>
      )}
    </div>
  );
}
