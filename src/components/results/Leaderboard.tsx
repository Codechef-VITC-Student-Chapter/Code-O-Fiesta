import React, { useState } from 'react';
import PixelCluster from '@/components/brand/PixelCluster';

interface RoundDetail {
  roundNumber: number;
  roundName: string;
  status: string;
  score: number;
  completedAt: string | null;
}

interface StandingTeam {
  rank: number;
  teamId: string;
  name: string;
  status: string;
  totalScore: number;
  completedRoundsCount: number;
  roundDetails: RoundDetail[];
}

interface LeaderboardProps {
  standings: StandingTeam[];
  currentUserTeamId?: string | null;
}

export default function Leaderboard({
  standings,
  currentUserTeamId,
}: LeaderboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  // Filter standings based on search query
  const filteredStandings = standings.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top 3 teams for the podium
  const topTeams = standings.slice(0, 3);
  const podiumOrder = [
    topTeams[1], // 2nd Place (Left)
    topTeams[0], // 1st Place (Center)
    topTeams[2], // 3rd Place (Right)
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-8 text-ink">
      {/* 1. PODIUM — top three */}
      {searchQuery === '' && standings.length >= 1 && (
        <section aria-label="Top three teams" className="relative">
          <div className="flex items-center justify-between gap-4 mb-5">
            <span className="hd-kicker text-ink">The podium</span>
            <PixelCluster cell={8} variant="scatter" className="hidden sm:block" />
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-center gap-5 md:gap-6 pb-2">
            {podiumOrder.map((team) => {
              // Determine place from original rank
              const isFirst = team.rank === 1;
              const isSecond = team.rank === 2;
              const isThird = team.rank === 3;
              const isUserTeam = team.teamId === currentUserTeamId;

              // Mobile stacks 1 → 2 → 3; desktop shows 2 · 1 · 3 podium order.
              let cardHeight = 'md:h-60 shadow-hd';
              let bgStyle = 'bg-paper';
              let rotate = '';
              let placeLabel = 'Place';

              if (isFirst) {
                cardHeight = 'md:h-80 order-1 md:order-2 z-10 shadow-hd-lg';
                bgStyle = 'bg-brand';
                rotate = 'md:-rotate-1';
                placeLabel = 'Champion';
              } else if (isSecond) {
                cardHeight = 'md:h-68 order-2 md:order-1 shadow-hd';
                bgStyle = 'bg-lilac';
                rotate = 'md:rotate-1';
                placeLabel = 'Runner-up';
              } else if (isThird) {
                cardHeight = 'md:h-60 order-3 md:order-3 shadow-hd';
                bgStyle = 'bg-paper';
                placeLabel = 'Third place';
              }

              return (
                <div
                  key={team.teamId}
                  className={`w-full md:w-64 ${cardHeight} ${bgStyle} ${rotate} border-2 border-ink rounded-[14px] text-ink flex flex-col justify-between p-5 sm:p-6 relative overflow-hidden transition-transform duration-300 hover:-translate-y-1`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="hd-display leading-[0.8] text-[clamp(4.5rem,3rem+5vw,7.5rem)]">
                      {team.rank}
                    </span>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`hd-badge ${isFirst ? 'hd-badge-ink' : ''}`}>{placeLabel}</span>
                      {isUserTeam && <span className="hd-badge hd-badge-ink">You</span>}
                    </div>
                  </div>

                  {isFirst && (
                    <PixelCluster
                      className="absolute right-4 top-24 hidden md:block"
                      color="var(--ink)"
                      accent="var(--paper)"
                      cell={9}
                    />
                  )}

                  <div className="mt-6 flex flex-col gap-3">
                    <div className="min-w-0">
                      <h3 className="hd-h3 truncate">{team.name}</h3>
                      <span className="hd-label text-charcoal mt-1 block">
                        {team.completedRoundsCount} stages complete
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 border-t-2 border-ink pt-3">
                      <span className="hd-display text-4xl leading-none">{team.totalScore}</span>
                      <span className="hd-label text-ink">Points</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. SEARCH & CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <span className="hd-label text-muted">Live rankings</span>
          <h2 className="hd-h2 mt-1">Event standings</h2>
        </div>

        {/* Search bar */}
        <div className="w-full sm:w-80 relative">
          <label htmlFor="leaderboard-search" className="sr-only">
            Search team name
          </label>
          <input
            id="leaderboard-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team name..."
            className="hd-input pl-10"
          />
          <svg
            aria-hidden="true"
            className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 3. LEADERBOARD LIST */}
      <div className="hd-card overflow-hidden">
        {filteredStandings.length === 0 ? (
          <div className="p-10 text-center">
            <p className="hd-label text-muted">No teams match your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="hd-table min-w-[560px]">
              <thead>
                <tr>
                  <th className="w-24">Rank</th>
                  <th>Team</th>
                  <th className="text-right">Completed stages</th>
                  <th className="text-right">Total points</th>
                </tr>
              </thead>
              <tbody>
                {filteredStandings.map((team) => {
                  const isUserTeam = team.teamId === currentUserTeamId;
                  const isExpanded = expandedTeamId === team.teamId;

                  return (
                    <React.Fragment key={team.teamId}>
                      {/* Team Summary Row */}
                      <tr
                        onClick={() => toggleExpand(team.teamId)}
                        aria-expanded={isExpanded}
                        className={`cursor-pointer select-none ${isUserTeam ? 'bg-brand-soft' : ''}`}
                      >
                        {/* Rank Badge */}
                        <td className={isUserTeam ? 'border-l-4 border-l-brand' : ''}>
                          <span
                            className={`inline-flex items-center justify-center min-w-9 h-9 px-1.5 rounded-lg border-2 border-ink font-mono font-bold text-sm ${
                              team.rank === 1
                                ? 'bg-brand text-ink shadow-hd-sm'
                                : team.rank === 2
                                ? 'bg-lilac text-ink shadow-hd-sm'
                                : team.rank === 3
                                ? 'bg-paper text-ink shadow-hd-sm'
                                : 'bg-sand text-charcoal'
                            }`}
                          >
                            {team.rank}
                          </span>
                        </td>

                        {/* Team Name */}
                        <td>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold uppercase tracking-wide text-ink">{team.name}</span>
                            {isUserTeam && <span className="hd-badge hd-badge-brand">You</span>}
                            {team.status === 'DISQUALIFIED' && <span className="hd-badge hd-badge-bad">DSQ</span>}
                            <svg
                              aria-hidden="true"
                              className={`w-3.5 h-3.5 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </td>

                        {/* Completed stages count */}
                        <td className="text-right font-mono text-charcoal">{team.completedRoundsCount} / 3</td>

                        {/* Score */}
                        <td className="text-right">
                          <span className="font-display text-xl leading-none text-ink">{team.totalScore}</span>
                        </td>
                      </tr>

                      {/* Expanded Breakdown Panel */}
                      {isExpanded && (
                        <tr className="bg-cream">
                          <td colSpan={4}>
                            <span className="hd-label text-muted block mb-3">Round breakdown</span>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {team.roundDetails.map((round) => {
                                const isRoundCompleted = round.status === 'COMPLETED';
                                return (
                                  <div
                                    key={round.roundNumber}
                                    className="bg-paper border-2 border-ink rounded-[10px] p-3 flex flex-col justify-between"
                                  >
                                    <div className="flex justify-between items-center gap-2">
                                      <span className="text-xs font-bold text-ink truncate max-w-[150px]">
                                        R{round.roundNumber}: {round.roundName}
                                      </span>
                                      <span
                                        aria-hidden="true"
                                        className={`w-2.5 h-2.5 shrink-0 rounded-full border border-ink ${isRoundCompleted ? 'bg-ok' : 'bg-warn'}`}
                                      />
                                    </div>
                                    <div className="flex justify-between items-end mt-4 gap-2">
                                      <span className="font-mono text-[10px] uppercase text-muted">
                                        Status: {round.status}
                                      </span>
                                      <span className="font-mono text-xs font-bold text-ink">{round.score} PTS</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
