import React, { useEffect, useState } from 'react';

interface ForcedSwitchOverlayProps {
  onDismiss: () => void;
  targetMember?: string;
}

export default function ForcedSwitchOverlay({ onDismiss, targetMember = 'Member 2' }: ForcedSwitchOverlayProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      onDismiss();
    }
  }, [countdown, onDismiss]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-ink/70 flex flex-col items-center justify-center text-center p-4">
      <div className="hd-card shadow-hd-lg p-6 sm:p-8 max-w-md w-full hd-pop">
        <div className="relative mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-ink bg-lilac text-ink -rotate-3 shadow-hd-sm">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>
        <h2 className="hd-h1 text-ink mb-3">
          Time&apos;s up!
        </h2>
        <p className="text-sm text-charcoal mb-6">
          Passing editor control to <span className="hd-highlight font-bold text-ink">{targetMember}</span>.
        </p>
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-ink bg-brand shadow-hd">
          <span className="hd-display text-6xl text-ink leading-none tabular-nums" aria-live="polite">
            {countdown}
          </span>
        </div>
        <div className="hd-label text-muted mt-5">
          Switching driver in progress...
        </div>
      </div>
    </div>
  );
}
