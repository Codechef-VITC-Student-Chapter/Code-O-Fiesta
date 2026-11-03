'use client';

import React from 'react';
import { IDEMode } from '@/types/problem';

interface EditorLockOverlayProps {
  locked: boolean;
  mode: IDEMode;
  activeTeamMemberName?: string;
  readOnly?: boolean;
}

export default function EditorLockOverlay({
  locked,
  mode,
  activeTeamMemberName = 'your partner',
  readOnly = false,
}: EditorLockOverlayProps) {
  if (!locked) return null;

  const displayMessage = readOnly
    ? 'Problem solved — editor is locked'
    : mode === 'relay'
    ? `Waiting for ${activeTeamMemberName} to finish their turn`
    : 'Editor is read-only';

  return (
    <div className="absolute inset-0 z-30 bg-[#121210]/85 flex flex-col items-center justify-center text-center p-4 select-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes lockPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }
        .lock-pulsing {
          animation: lockPulse 2s infinite ease-in-out;
        }
      `}} />

      <div className="hd-card flex flex-col items-center max-w-xs px-6 py-5 text-ink">
        <div className="lock-pulsing p-3 rounded-[var(--radius-sm)] bg-brand border-2 border-ink text-ink shadow-hd-sm mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h4 className="hd-h3 !text-lg text-ink mb-2">
          Editor locked
        </h4>
        <p className="text-sm text-charcoal leading-relaxed">
          {displayMessage}
        </p>
      </div>
    </div>
  );
}
