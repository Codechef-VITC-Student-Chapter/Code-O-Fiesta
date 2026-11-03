import React from 'react';

interface RoundBreakdown {
  roundNumber: number;
  roundName: string;
  status: string;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  completedAt: string | null;
  achievements: string[];
}

interface FinalScoreProps {
  grandTotalScore: number;
  rank: number;
  roundBreakdowns: RoundBreakdown[];
}

export default function FinalScore({
  grandTotalScore,
  rank,
  roundBreakdowns,
}: FinalScoreProps) {
  return (
    <div className="flex flex-col gap-8 text-ink">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Final Rank Card */}
        <div className="hd-card-brand p-6 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="hd-label text-ink">Overall ranking</span>
            <span className="hd-display text-6xl sm:text-7xl leading-none">#{rank}</span>
            <span className="hd-label text-ink">Top percentile finish</span>
          </div>
          <div className="w-14 h-14 shrink-0 bg-paper border-2 border-ink rounded-xl shadow-hd-sm flex items-center justify-center text-ink">
            <svg aria-hidden="true" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        {/* Final Points Card */}
        <div className="hd-card-lilac p-6 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="hd-label text-ink">Total accumulated points</span>
            <span className="hd-display text-5xl sm:text-6xl leading-none">
              {grandTotalScore} <span className="text-2xl sm:text-3xl">PTS</span>
            </span>
            <span className="hd-label text-ink">Base + bonus milestones</span>
          </div>
          <div className="w-14 h-14 shrink-0 bg-paper border-2 border-ink rounded-xl shadow-hd-sm flex items-center justify-center text-ink">
            <svg aria-hidden="true" className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Round Breakdown Tables/Cards */}
      <div className="flex flex-col gap-4">
        <h3 className="hd-h3">Round-by-round analytics</h3>

        <div className="grid grid-cols-1 gap-5">
          {roundBreakdowns.map((round) => {
            const isCompleted = round.status === 'COMPLETED';
            return (
              <div key={round.roundNumber} className="hd-card p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-ink pb-4 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="hd-display text-4xl leading-none">0{round.roundNumber}</span>
                    <div>
                      <h4 className="font-bold text-base text-ink">{round.roundName}</h4>
                      <p className="hd-label text-muted mt-0.5">Stage: {round.status}</p>
                    </div>
                  </div>

                  {/* Score badge for round */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="hd-label text-muted">Round score</div>
                      <div className="font-mono text-base font-bold text-ink">{round.totalScore} PTS</div>
                    </div>
                    <span
                      aria-hidden="true"
                      className={`w-3 h-3 rounded-full border border-ink ${isCompleted ? 'bg-ok hd-pulse-dot' : 'bg-warn'}`}
                    />
                  </div>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-cream border-2 border-ink p-3 rounded-[10px] text-center">
                    <span className="hd-label text-muted block">Base score</span>
                    <span className="font-mono text-sm font-bold text-ink">{round.baseScore} pts</span>
                  </div>

                  <div className="bg-lilac-soft border-2 border-ink p-3 rounded-[10px] text-center">
                    <span className="hd-label text-muted block">Bonus points</span>
                    <span className="font-mono text-sm font-bold text-ink">+{round.bonusScore} pts</span>
                  </div>

                  <div className="bg-cream border-2 border-ink p-3 rounded-[10px] col-span-2 sm:col-span-2 text-left sm:text-center flex flex-col justify-center gap-1">
                    <span className="hd-label text-muted block">Status</span>
                    <span>
                      <span className={`hd-badge ${isCompleted ? 'hd-badge-ok' : 'hd-badge-warn'}`}>
                        {isCompleted ? 'COMPLETED ✓' : 'IN PROGRESS'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Achievements list */}
                {round.achievements && round.achievements.length > 0 && (
                  <div className="bg-sand border border-[var(--border-subtle)] rounded-[10px] p-3">
                    <span className="hd-label text-muted block mb-2">Stage achievements</span>
                    <div className="flex flex-wrap gap-2">
                      {round.achievements.map((ach, i) => (
                        <span key={i} className="hd-badge hd-badge-lilac">
                          🏆 {ach}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
