'use client';

import React from 'react';

interface VictoryScoreStripProps {
  finalScore: number;
  roundsDone?: string;
  timeTaken?: string;
}

export default function VictoryScoreStrip({
  finalScore,
  roundsDone = '3 / 3',
  timeTaken = '1h 17m',
}: VictoryScoreStripProps) {
  const cards = [
    {
      label: 'FINAL SCORE',
      value: `${finalScore} PTS`,
      valueColor: 'text-ink',
      borderHover: 'hd-card-brand',
    },
    {
      label: 'ROUNDS DONE',
      value: roundsDone,
      valueColor: 'text-ink',
      borderHover: 'hd-card-lilac',
    },
    {
      label: 'TIME TAKEN',
      value: timeTaken,
      valueColor: 'text-ink',
      borderHover: 'hd-card',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.borderHover} hd-card-interactive p-5 sm:p-6 flex flex-col justify-between gap-4 min-h-[8.5rem]`}
        >
          <span className="hd-label text-ink">{card.label}</span>
          <span className={`hd-display text-4xl sm:text-5xl leading-none break-words ${card.valueColor}`}>
            {card.value}
          </span>
        </div>
      ))}
    </div>
  );
}
