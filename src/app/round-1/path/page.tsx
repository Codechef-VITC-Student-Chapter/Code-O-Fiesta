'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ParticipantLayout from '@/components/layout/ParticipantLayout';
import Path from '@/components/round1/Path';
import { problemsService } from '@/services/problems';

// Right sidebar content matching the screenshot
const OVERVIEW = [
  { label: 'Round Name', value: 'The Path of Fate' },
  { label: 'Duration', value: '60 Minutes' },
  { label: 'Problems', value: '3 Problems' },
  { label: 'Solve Order', value: 'Any Order' },
  { label: 'Max Score', value: '150 Points' },
];

const HOW_IT_WORKS = [
  'Choose one of the four paths.',
  'Confirm your choice to reveal the domain/topic.',
  'Solve 3 problems in any order.',
  'Maximize your score and complete the round!',
];

const TIPS = [
  'Think before you choose.',
  'Every path is unique.',
  'All paths are challenging.',
  'Do your best and conquer!',
];

function Round1Overview() {
  return (
    <div className="flex flex-col gap-5">
      {/* Overview card */}
      <div className="hd-card p-5">
        <h3 className="hd-label text-muted mb-4">ROUND 1 OVERVIEW</h3>
        <dl className="divide-y divide-[var(--border-subtle)] text-sm">
          {OVERVIEW.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="text-charcoal">{item.label}</dt>
              <dd className="font-mono font-bold text-ink text-right">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* How it works */}
      <div className="hd-card p-5">
        <h3 className="hd-label text-muted mb-4">HOW IT WORKS</h3>
        <ol className="space-y-3 text-sm text-ink">
          {HOW_IT_WORKS.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-brand font-mono text-xs font-bold text-ink">
                {i + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Tips */}
      <div className="hd-card-flat bg-sand p-5">
        <h3 className="hd-label text-ink mb-3">TIPS</h3>
        <ul className="space-y-2 text-sm text-charcoal">
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 bg-ink" aria-hidden="true" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const PATH_NAME_TO_ID: Record<string, number> = {
  'TRIANGLE': 1,
  'CIRCLE': 2,
  'SQUARE': 3,
  'STAR': 4,
};

const PATH_ID_TO_NAME: Record<number, string> = {
  1: 'TRIANGLE',
  2: 'CIRCLE',
  3: 'SQUARE',
  4: 'STAR',
};

export default function Round1PathPage() {
  return <Round1PathContent />;
}

function Round1PathContent() {
  const router = useRouter();
  // null = still checking, false = not locked, true = locked (redirect pending)
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Ask the backend whether this team's path is already locked.
    // This is the authoritative check — localStorage is only a UI hint.
    problemsService
      .fetchRoundPathStatus(1)
      .then(({ locked, path }) => {
        if (locked) {
          // Keep localStorage in sync so the round-1 page still knows the path.
          if (path && PATH_NAME_TO_ID[path]) {
            localStorage.setItem('cof-round1-path', String(PATH_NAME_TO_ID[path]));
          }
          router.replace('/round-1');
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        // If the check fails (network error, unauthenticated, etc.) let the
        // maze render normally; the POST guard will still block a second lock.
        setChecking(false);
      });
  }, [router]);

  const handlePathConfirmed = async (pathId: number) => {
    const pathName = PATH_ID_TO_NAME[pathId];
    if (!pathName) return;

    try {
      setChecking(true);
      await problemsService.saveRoundPath(1, pathName);
      // Persist client-side so the round-1 page can read it without an extra API call.
      localStorage.setItem('cof-round1-path', String(pathId));
      sessionStorage.removeItem('cof-round1-revealed');
      router.push('/round-1');
    } catch (err: any) {
      console.error('Failed to lock path on backend:', err);
      alert(err.message || 'Failed to lock path. Please try again.');
      setChecking(false);
    }
  };

  // Render nothing while the backend check is in flight so the maze
  // never flashes before the redirect fires.
  if (checking) {
    return null;
  }

  return (
    <ParticipantLayout rightSidebar={<Round1Overview />}>
      {/* Breadcrumb */}
      <div className="mb-5 hd-label text-muted">
        Dashboard <span className="mx-1.5" aria-hidden="true">›</span>
        Round 1 <span className="mx-1.5" aria-hidden="true">›</span>
        <span className="text-ink">Path of Fate</span>
      </div>

      <Path onPathConfirmed={handlePathConfirmed} />
    </ParticipantLayout>
  );
}