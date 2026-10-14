'use client';

import React from 'react';
import { ShapeType } from './ShapeCard';

interface ShapeConfirmationProps {
  pathId: number;
  shape: ShapeType;
  onCancel: () => void;
  onConfirm: () => void;
}

const shapeLabels: Record<ShapeType, string> = {
  triangle: 'Triangle',
  circle: 'Circle',
  square: 'Square',
  star: 'Star',
};

export default function ShapeConfirmation({
  pathId,
  shape,
  onCancel,
  onConfirm,
}: ShapeConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/70"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md hd-card shadow-hd-lg p-6 sm:p-7 hd-pop">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-ink bg-brand -rotate-3 shadow-hd-sm">
            <svg className="h-7 w-7 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 className="hd-h2 text-ink mb-3">
            Lock in Path {pathId.toString().padStart(2, '0')}?
          </h3>
          <p className="text-sm text-charcoal mb-1">
            You selected the <span className="hd-highlight font-bold">{shapeLabels[shape]}</span> path.
          </p>
          <p className="text-xs text-muted mb-6">
            The domain will be revealed and this choice cannot be undone.
          </p>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="hd-btn hd-btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="hd-btn hd-btn-primary flex-1"
            >
              Confirm & Lock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
