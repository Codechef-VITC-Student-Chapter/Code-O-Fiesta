import React from 'react';

interface RoundProgress {
  roundNumber: number;
  score: number;
}

interface TeamStanding {
  rank: number;
  teamId: string;
  name: string;
  status: string;
  totalScore: number;
  completedRoundsCount: number;
  roundDetails: RoundProgress[];
}

interface AdminLeaderboardProps {
  standings: TeamStanding[];
}

export default function AdminLeaderboard({ standings }: AdminLeaderboardProps) {
  return (
    <div className="hd-card overflow-hidden mb-6">
      <div className="px-5 py-4 border-b-2 border-ink bg-sand">
        <h3 className="hd-label text-ink">
          LIVE STANDINGS ANALYTICS
        </h3>
      </div>

      <div className="divide-y divide-[var(--border-subtle)] max-h-[350px] overflow-y-auto">
        {standings.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-muted">
            No standings calculated yet.
          </div>
        ) : (
          standings.map((team) => (
            <div
              key={team.teamId}
              className="flex justify-between items-center gap-3 px-5 py-3 hover:bg-lilac-soft transition-colors text-xs font-mono"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 w-6 h-6 rounded-md bg-ink text-cream text-[10px] font-bold flex items-center justify-center">
                  {team.rank}
                </span>
                <span className="font-bold text-ink uppercase tracking-wide truncate">
                  {team.name}
                </span>
                {team.status === 'DISQUALIFIED' && (
                  <span className="hd-badge hd-badge-bad">
                    DSQ
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-muted text-right">
                  {team.completedRoundsCount} STAGES COMPLETE
                </span>
                <strong className="font-display text-ink text-sm whitespace-nowrap">
                  {team.totalScore} PTS
                </strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
