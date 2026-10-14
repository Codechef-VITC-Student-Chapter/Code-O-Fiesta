import React from 'react';

interface PodiumTeam {
  rank: number;
  teamId: string;
  name: string;
  status: string;
  totalScore: number;
  completedRoundsCount: number;
}

interface LeaderboardPodiumProps {
  standings: PodiumTeam[];
}

const PLACES = [
  { tone: 'bg-brand', height: 'sm:min-h-[15rem]', order: 'sm:order-2', label: '1st' },
  { tone: 'bg-lilac', height: 'sm:min-h-[12.5rem]', order: 'sm:order-1', label: '2nd' },
  { tone: 'bg-paper', height: 'sm:min-h-[10.5rem]', order: 'sm:order-3', label: '3rd' },
];

/** Top-three presentation of the standings the page already fetched; ranks come from the API as-is. */
export default function LeaderboardPodium({ standings }: LeaderboardPodiumProps) {
  const top = standings.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <section aria-label="Top three teams" className="grid gap-4 sm:grid-cols-3 sm:items-end mb-8">
      {top.map((team, i) => {
        const place = PLACES[i];
        return (
          <article
            key={team.teamId}
            className={`hd-card hd-card-interactive hd-rise ${place.tone} ${place.height} ${place.order} p-5 sm:p-6 flex flex-col justify-between gap-6`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="hd-display text-6xl sm:text-7xl leading-none" aria-label={`Rank ${team.rank}`}>
                {String(team.rank).padStart(2, '0')}
              </span>
              <span className="hd-badge hd-badge-ink">{place.label}</span>
            </div>
            <div className="min-w-0">
              <h3 className="hd-h3 truncate" title={team.name}>
                {team.name}
              </h3>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="hd-label text-charcoal">{team.completedRoundsCount} stages complete</span>
                <strong className="font-display text-2xl">{team.totalScore} pts</strong>
              </div>
              {team.status === 'DISQUALIFIED' && <span className="hd-badge hd-badge-bad mt-3">DSQ</span>}
            </div>
          </article>
        );
      })}
    </section>
  );
}
