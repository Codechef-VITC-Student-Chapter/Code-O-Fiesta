'use client';

import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  variant?: 'default' | 'danger' | 'warning';
  maxWidth?: 'sm' | 'md' | 'lg';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
  isConfirmDisabled = false,
  variant = 'default',
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-xl';
      case 'md':
      default:
        return 'max-w-md';
    }
  };

  const getConfirmButtonClasses = () => {
    if (variant === 'danger') {
      return 'hd-btn-danger';
    }
    if (variant === 'warning') {
      return 'hd-btn-warn';
    }
    return 'hd-btn-primary';
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`hd-card shadow-hd-lg w-full ${getMaxWidth()} max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col hd-pop text-ink`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b-2 border-ink bg-cream">
          <div className="min-w-0">
            <h3 id="modal-title" className="hd-h3 text-ink">
              {title}
            </h3>
            {description && <p className="text-sm text-charcoal mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="hd-icon-btn shrink-0 disabled:opacity-50"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        {children && <div className="p-5 sm:p-6 text-sm text-charcoal overflow-y-auto">{children}</div>}

        {/* Footer Actions */}
        {(onConfirm || cancelText) && (
          <div className="flex flex-wrap items-center justify-end gap-3 px-5 sm:px-6 py-4 border-t-2 border-ink bg-sand">
            {cancelText && (
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="hd-btn hd-btn-sm"
              >
                {cancelText}
              </button>
            )}

            {onConfirm && confirmText && (
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading || isConfirmDisabled}
                className={`hd-btn hd-btn-sm ${getConfirmButtonClasses()}`}
              >
                {isLoading && (
                  <svg className="animate-spin h-3.5 w-3.5 text-current" aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
