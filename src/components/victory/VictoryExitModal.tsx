'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/common/Modal';
import { authService } from '@/services/auth';

interface VictoryExitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VictoryExitModal({ isOpen, onClose }: VictoryExitModalProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleExit = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      // Clear client session caches
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      router.push('/');
    } catch (err) {
      console.error('Error during exit:', err);
      router.push('/');
    } finally {
      setIsLoggingOut(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Exit the Arena?"
      confirmText="Exit Arena →"
      cancelText="Cancel"
      onConfirm={handleExit}
      isLoading={isLoggingOut}
      variant="danger"
      maxWidth="sm"
    >
      <div className="flex flex-col gap-3 py-1">
        <p className="hd-alert hd-alert-ok text-sm text-ink">
          Your progress has been saved.
        </p>
        <p className="text-sm text-charcoal leading-relaxed">
          You will be logged out and returned to the main screen.
        </p>
      </div>
    </Modal>
  );
}
