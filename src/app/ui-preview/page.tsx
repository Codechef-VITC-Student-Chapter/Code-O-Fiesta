'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import EventLayout from '@/components/layout/EventLayout';
import EventStatus from '@/components/event/EventStatus';
import EventProgress from '@/components/event/EventProgress';
import TeamMembersCard from '@/components/dashboard/TeamMembersCard';
import TeamStatus from '@/components/team/TeamStatus';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import LockOverlay from '@/components/common/LockOverlay';
import Modal from '@/components/common/Modal';

export default function UIPreviewPage() {
  const [activeLayoutTab, setActiveLayoutTab] = useState<'participant' | 'admin' | 'event'>('participant');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLockOverlayVisible, setIsLockOverlayVisible] = useState(false);

  return (
    <div>
      {/* Dev View Switcher Bar */}
      <div className="bg-ink text-cream border-b-2 border-ink px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className="text-cream/80 hover:text-brand underline-offset-4 hover:underline mr-2">← Back to Hook</Link>
          <span className="hd-label text-brand">UI showcase:</span>
          <button
            onClick={() => setActiveLayoutTab('participant')}
            className={`min-h-9 px-3 py-1 rounded-full border-2 transition-colors ${
              activeLayoutTab === 'participant'
                ? 'bg-brand text-ink border-ink font-bold'
                : 'bg-transparent text-cream border-cream/40 hover:border-cream'
            }`}
          >
            Participant Shell
          </button>
          <button
            onClick={() => setActiveLayoutTab('admin')}
            className={`min-h-9 px-3 py-1 rounded-full border-2 transition-colors ${
              activeLayoutTab === 'admin'
                ? 'bg-brand text-ink border-ink font-bold'
                : 'bg-transparent text-cream border-cream/40 hover:border-cream'
            }`}
          >
            Admin Shell
          </button>
          <button
            onClick={() => setActiveLayoutTab('event')}
            className={`min-h-9 px-3 py-1 rounded-full border-2 transition-colors ${
              activeLayoutTab === 'event'
                ? 'bg-lilac text-ink border-ink font-bold'
                : 'bg-transparent text-cream border-cream/40 hover:border-cream'
            }`}
          >
            Event Shell
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="hd-btn hd-btn-lilac hd-btn-sm"
          >
            Test Modal
          </button>
          <button
            onClick={() => setIsLockOverlayVisible(!isLockOverlayVisible)}
            className="hd-btn hd-btn-warn hd-btn-sm"
          >
            Toggle Lock Overlay
          </button>
        </div>
      </div>

      {activeLayoutTab === 'participant' && (
        <ParticipantLayout rightSidebar={<TeamMembersCard />}>
          <div className="flex flex-col gap-6 relative min-h-[500px]">
            {isLockOverlayVisible && (
              <LockOverlay
                type="NOT_YOUR_TURN"
                actions={
                  <button
                    onClick={() => setIsLockOverlayVisible(false)}
                    className="hd-btn hd-btn-dark hd-btn-sm"
                  >
                    DISMISS LOCK PREVIEW
                  </button>
                }
              />
            )}

            <EventProgress />

            <div className="hd-card p-6">
              <h2 className="hd-h2 mb-2">
                Foundation Component Showcase
              </h2>
              <p className="text-sm text-charcoal leading-relaxed">
                This route displays the shared components and visual language used by all competition routes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="hd-card p-5">
                <h3 className="hd-label text-ink mb-4">
                  Event Status Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  <EventStatus status="ACTIVE" />
                  <EventStatus status="READY" />
                  <EventStatus status="UPCOMING" />
                  <EventStatus status="PAUSED" />
                  <EventStatus status="COMPLETED" />
                  <EventStatus status="LOCKED" />
                  <EventStatus status="EXPIRED" />
                  <EventStatus status="ERROR" />
                </div>
              </div>

              <div className="hd-card p-5">
                <h3 className="hd-label text-ink mb-4">
                  Team Status Badges
                </h3>
                <div className="flex flex-wrap gap-2">
                  <TeamStatus status="READY" />
                  <TeamStatus status="ACTIVE" />
                  <TeamStatus status="WAITING" />
                  <TeamStatus status="COMPLETED" />
                  <TeamStatus status="LOCKED" />
                  <TeamStatus status="DISCONNECTED" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <LoadingState message="Evaluating test cases..." subtext="Running input set 4 / 12" />
              <ErrorState title="Connection Interrupted" message="Lost real-time sync with server." variant="connection" />
            </div>
          </div>
        </ParticipantLayout>
      )}

      {activeLayoutTab === 'admin' && (
        <AdminLayout title="Organizer Control Panel" subtitle="Admin Shell Verification">
          <div className="hd-card p-6">
            <h2 className="hd-h3 mb-2">Admin Shell Verification</h2>
          </div>
        </AdminLayout>
      )}

      {activeLayoutTab === 'event' && (
        <EventLayout>
          <div className="hd-card p-6">
            <h2 className="hd-h3 mb-2">Generic Event Shell Verification</h2>
          </div>
        </EventLayout>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Action"
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={() => setIsModalOpen(false)}
      >
        <p className="text-sm text-charcoal">Modal component demonstration.</p>
      </Modal>
    </div>
  );
}
