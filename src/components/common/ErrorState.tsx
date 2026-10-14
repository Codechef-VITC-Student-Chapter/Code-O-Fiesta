'use client';

import React from 'react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'general' | 'connection' | 'unauthorized' | 'access-denied';
  className?: string;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't process your request or load the competition state.",
  onRetry,
  variant = 'general',
  className = '',
}: ErrorStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'connection':
        return {
          bg: 'bg-warn-soft',
          titleColor: 'text-ink',
          icon: (
            <svg className="w-8 h-8 text-[#6e4a00]" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m10.607 2.121a6 6 0 010 8.485m-8.485 0a6 6 0 010-8.485m4.243 1.414a2 2 0 010 2.828" />
            </svg>
          ),
        };
      case 'unauthorized':
      case 'access-denied':
        return {
          bg: 'bg-lilac-soft',
          titleColor: 'text-ink',
          icon: (
            <svg className="w-8 h-8 text-ink" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ),
        };
      case 'general':
      default:
        return {
          bg: 'bg-bad-soft',
          titleColor: 'text-ink',
          icon: (
            <svg className="w-8 h-8 text-[#8f1a10]" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className={`p-6 sm:p-8 rounded-[var(--radius)] border-2 border-ink shadow-hd flex flex-col items-center text-center max-w-lg mx-auto my-4 ${style.bg} ${className}`}>
      <div className="mb-4 w-14 h-14 rounded-[var(--radius-sm)] bg-paper border-2 border-ink flex items-center justify-center">{style.icon}</div>
      <h3 className={`hd-h3 ${style.titleColor}`}>{title}</h3>
      <p className="text-sm text-charcoal mt-2 max-w-sm leading-relaxed">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 hd-btn hd-btn-dark hd-btn-sm"
        >
          TRY AGAIN
        </button>
      )}
    </div>
  );
}
