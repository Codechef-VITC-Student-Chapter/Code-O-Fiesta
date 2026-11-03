'use client';

import React from 'react';

export default function RelayInstructions() {
  return (
    <div className="hd-card p-5 sm:p-6 flex flex-col gap-5 text-sm text-charcoal select-text">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-3 select-none">
        <h3 className="hd-h3 text-ink">
          Relay arena instructions
        </h3>
        <span className="hd-badge hd-badge-lilac">4 rules</span>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2">
        <li className="flex gap-3 rounded-[10px] border-2 border-ink bg-paper p-4">
          <span className="hd-display text-3xl leading-none text-ink shrink-0" aria-hidden="true">1</span>
          <p className="leading-relaxed">
            <span className="block font-bold text-ink mb-1">Relay Turn Timing:</span> The administrator configures the Member 1 duration, the handover gap, and the Member 2 duration. The workspace always displays the server-authoritative timer.
          </p>
        </li>
        <li className="flex gap-3 rounded-[10px] border-2 border-ink bg-lilac-soft p-4">
          <span className="hd-display text-3xl leading-none text-ink shrink-0" aria-hidden="true">2</span>
          <p className="leading-relaxed">
            <span className="block font-bold text-ink mb-1">Blind Play:</span> The problem description is visible to Member 1, but completely <span className="hd-highlight font-bold text-ink">hidden</span> for Member 2. Member 2 must analyze and complete the code written by Member 1 without seeing the statement.
          </p>
        </li>
        <li className="flex gap-3 rounded-[10px] border-2 border-ink bg-lilac-soft p-4">
          <span className="hd-display text-3xl leading-none text-ink shrink-0" aria-hidden="true">3</span>
          <p className="leading-relaxed">
            <span className="block font-bold text-ink mb-1">Comments Banned:</span> Adding any comments (<code className="font-code text-[0.8em] rounded border border-ink bg-bad-soft px-1 text-[#8f1a10]">{'//'}</code>, <code className="font-code text-[0.8em] rounded border border-ink bg-bad-soft px-1 text-[#8f1a10]">{'/* */'}</code>, <code className="font-code text-[0.8em] rounded border border-ink bg-bad-soft px-1 text-[#8f1a10]">#</code>) is strictly forbidden. Submissions containing comment syntax will be automatically rejected.
          </p>
        </li>
        <li className="flex gap-3 rounded-[10px] border-2 border-ink bg-paper p-4">
          <span className="hd-display text-3xl leading-none text-ink shrink-0" aria-hidden="true">4</span>
          <p className="leading-relaxed">
            <span className="block font-bold text-ink mb-1">Shared Codebase:</span> You are collaborating on the same codebase. When your turn begins, you pick up exactly where your partner left off.
          </p>
        </li>
      </ol>
    </div>
  );
}
