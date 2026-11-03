'use client';

import React, { useState, useEffect } from 'react';

interface StrictModeProtectionProps {
  strictMode: boolean;
  isSubmissionsLocked: boolean;
  remainingSwitches: number;
  onCheckStatus: () => Promise<void>;
  children: React.ReactNode;
}

export default function StrictModeProtection({
  strictMode,
  isSubmissionsLocked,
  remainingSwitches,
  onCheckStatus,
  children
}: StrictModeProtectionProps) {
  const [isProtected, setIsProtected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!strictMode) {
      setIsProtected(false);
      return;
    }

    const handleFocusLoss = () => {
      setIsProtected(true);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleFocusLoss();
      }
    };

    const onBlur = () => {
      handleFocusLoss();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    // Initial check
    if (document.hidden || !document.hasFocus()) {
      handleFocusLoss();
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [strictMode]);

  const handleResume = async () => {
    // Only allow resume if actually focused and visible
    if (!document.hidden && document.hasFocus()) {
      setIsChecking(true);
      try {
        await onCheckStatus();
        // We don't hide it immediately here if submissions are locked, because the re-render will handle it
        // Wait, if isSubmissionsLocked is true, it shouldn't be hidden.
        // Actually, we can just hide `isProtected` if submissions are NOT locked.
        // If they are locked, they stay locked.
        setIsProtected(false);
      } finally {
        setIsChecking(false);
      }
    } else {
      alert("Please ensure the competition window is visible and focused before resuming.");
    }
  };

  return (
    <>
      {children}
      {(isProtected || isSubmissionsLocked) && strictMode && (
        <div
          className="fixed inset-0 bg-ink z-[2147483647] flex flex-col items-center justify-center text-ink p-4 sm:p-6 overflow-y-auto"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: '#080808', zIndex: 2147483647 }}
        >
          <div className="bg-paper border-2 border-ink rounded-[var(--radius-lg)] p-6 sm:p-8 max-w-md w-full text-center shadow-[7px_7px_0_var(--brand)]">
            <div className="mb-6 flex justify-center">
              <div className="bg-bad-soft p-4 rounded-[var(--radius)] border-2 border-ink">
                <svg className="w-12 h-12 text-bad" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            {isSubmissionsLocked ? (
              <>
                <h2 className="hd-h2 mb-3 text-ink">IDE locked</h2>
                <p className="text-charcoal leading-relaxed mb-8">
                  You have exceeded the maximum allowed tab switches or your IDE has been locked by an administrator.
                  <br/><br/>
                  Please wait for an administrator to review your activity and release your submissions.
                </p>
                <div className="w-full py-4 bg-sand text-muted border-2 border-dashed border-ink/40 font-mono text-xs font-bold uppercase tracking-[0.12em] rounded-full cursor-not-allowed">
                  Awaiting Admin Review...
                </div>
              </>
            ) : (
              <>
                <h2 className="hd-h2 mb-3 text-ink">Screen protected</h2>
                <p className="text-charcoal leading-relaxed mb-6">
                  The competition window lost focus or was hidden.
                  <br/><br/>
                  Switching applications, changing tabs, or minimizing the browser is recorded as a strict mode violation.
                </p>

                {remainingSwitches <= 2 && (
                  <div className="mb-6 hd-alert hd-alert-bad justify-center text-left text-sm font-medium text-ink">
                    WARNING: You have {remainingSwitches} tab switch{remainingSwitches === 1 ? '' : 'es'} remaining before your IDE is automatically locked.
                  </div>
                )}

                <button
                  onClick={handleResume}
                  disabled={isChecking}
                  className={`hd-btn hd-btn-primary hd-btn-lg hd-btn-block ${isChecking ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {isChecking ? 'Checking status...' : 'Resume Competition'}
                </button>
              </>
            )}
            <p className="hd-label text-muted mt-5">
              Event logged to Administrator
            </p>
          </div>
        </div>
      )}
    </>
  );
}
