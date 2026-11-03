'use client';

import React from 'react';
import PixelCluster from '@/components/brand/PixelCluster';

export interface RoundSummary {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  completed: boolean;
}

interface VictoryTeamCardProps {
  teamId: string;
  memberNames: string[];
  finalScore: number;
  roundsDone?: string;
  roundSummaries?: RoundSummary[];
}

const DEFAULT_ROUND_SUMMARIES: RoundSummary[] = [
  { id: '1', name: 'Round 1: Path of Fate', score: 50, maxScore: 50, completed: true },
  { id: '2', name: 'Round 2: Blind Relay', score: 40, maxScore: 40, completed: true },
  { id: '3', name: 'Round 3: Constraint Crucible', score: 30, maxScore: 50, completed: true },
];

/*
 * NOTE: everything inside #team-victory-card is rasterised by html-to-image /
 * html2canvas. Colours there come ONLY from the plain-hex `.victory-export-*`
 * classes in globals.css or plain-hex inline styles — no Tailwind colour
 * utilities (oklch / color-mix) and no CSS variables.
 */
export default function VictoryTeamCard({
  teamId,
  memberNames = ['Member 01', 'Member 02'],
  finalScore,
  roundsDone = '3 / 3',
  roundSummaries = DEFAULT_ROUND_SUMMARIES,
}: VictoryTeamCardProps) {
  const safeTeamName = teamId || 'TEAM_014';

  return (
    <div className="hd-card p-5 sm:p-8 flex flex-col gap-6 relative text-ink">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-ink pb-4">
        <div>
          <span className="hd-label text-muted">Keep this one</span>
          <h2 className="hd-h2 mt-1">Your team certificate</h2>
        </div>
        <p className="hd-label text-charcoal sm:text-right max-w-xs">
          Official proof of completion and arena victory
        </p>
      </div>

      {/* Certificate card */}
      <div className="flex justify-center w-full pb-2 pr-2">
        <div
          id="team-victory-card"
          className="victory-export-card w-full max-w-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col gap-6 font-mono"
        >
          {/* Decorative pixels (plain hex fills) */}
          <PixelCluster
            className="absolute right-5 top-16 sm:right-8 sm:top-20"
            color="#ff5034"
            accent="#bba8f2"
            cell={10}
          />

          {/* Card Top Brand & Event ID */}
          <div className="victory-export-topbar relative flex items-center justify-between gap-3 pb-3 text-xs tracking-wider">
            <span
              className="font-display text-xl leading-none"
              style={{
                backgroundColor: '#ff5034',
                color: '#080808',
                padding: '3px 6px 1px',
                letterSpacing: '-0.05em',
              }}
            >
              Hackday
            </span>
            <span className="victory-export-badge px-2.5 py-0.5 rounded-md text-[11px] font-bold">
              COF25
            </span>
          </div>

          {/* Arena Conquered Pill & Title */}
          <div className="relative flex flex-col gap-2 pr-16 sm:pr-20">
            <div className="victory-export-pill inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em]">
              <span>🏆</span>
              <span>Arena conquered</span>
            </div>
            <h3
              className="victory-export-team-name font-display text-3xl sm:text-5xl leading-[0.95] uppercase break-words"
              style={{ letterSpacing: '-0.04em' }}
            >
              {safeTeamName}
            </h3>
            <p className="victory-export-meta text-xs font-sans tracking-wide">
              {memberNames.length > 0 ? memberNames.join('  ·  ') : 'Team Participants'}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="victory-export-stats grid grid-cols-2 rounded-xl text-center overflow-hidden">
            <div className="victory-export-stat flex flex-col gap-1 p-4" style={{ borderRight: '2px solid #080808' }}>
              <span className="victory-export-label text-[10px] tracking-wider uppercase">FINAL SCORE</span>
              <span className="victory-export-score font-display text-2xl sm:text-4xl leading-none">{finalScore} PTS</span>
            </div>
            <div className="victory-export-stat flex flex-col gap-1 p-4">
              <span className="victory-export-label text-[10px] tracking-wider uppercase">ROUNDS</span>
              <span className="victory-export-total font-display text-2xl sm:text-4xl leading-none">{roundsDone}</span>
            </div>
          </div>

          {/* Round Progress Lines */}
          <div className="flex flex-col gap-3.5 py-1">
            {roundSummaries.map((round) => {
              const pct = round.maxScore > 0 ? Math.min(100, Math.round((round.score / round.maxScore) * 100)) : 100;
              return (
                <div key={round.id} className="victory-export-round flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="victory-export-round-name font-medium">{round.name}</span>
                    <span className="victory-export-round-score flex items-center gap-1.5 font-bold whitespace-nowrap">
                      <span>✓</span>
                      <span>{round.score} pts</span>
                    </span>
                  </div>
                  {/* Progress Bar Track */}
                  <div className="victory-export-progress-track w-full h-2.5 rounded-full overflow-hidden">
                    <div
                      className="victory-export-progress-bar h-full rounded-full"
                      style={{ width: `${Math.max(10, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Card Footer Branding */}
          <div className="victory-export-footer border-t-2 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] uppercase tracking-[0.08em]">
            <span>CodeChef VIT Chennai Student Chapter</span>
            <span className="victory-export-footer-accent font-bold">EVENT ID: COF25</span>
          </div>
        </div>
      </div>
    </div>
  );
}
