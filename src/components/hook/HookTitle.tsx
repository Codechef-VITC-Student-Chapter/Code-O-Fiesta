import React from 'react';

export interface HookTitleProps {
  className?: string;
}

/** Oversized poster headline for the landing hero. */
export default function HookTitle({ className = '' }: HookTitleProps) {
  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      <span className="hd-label leading-relaxed text-ink hd-rise flex gap-3">
        <span aria-hidden="true" className="mt-[0.6em] w-6 h-[2px] bg-ink shrink-0" />
        <span>
          VITC Student Chapter
          <br />
          Freshers&apos; Edition 2026
        </span>
      </span>

      <h1 className="mt-6 text-ink">
        <span className="hd-display hd-highlight inline-block text-[clamp(4.25rem,1.5rem+11vw,10.5rem)] pt-[0.02em] hd-pop hd-delay-1">
          Hackday
        </span>
        <span className="hd-display block mt-3 text-[clamp(1.9rem,0.9rem+3.6vw,3.4rem)] hd-rise hd-delay-3">
          Chennai <span className="font-sans font-light">×</span> CodeChef
        </span>
      </h1>

      <div className="mt-6 flex items-center gap-4 w-full max-w-lg hd-rise hd-delay-4">
        <span className="hd-label text-ink whitespace-nowrap">Code / Collaborate / Compete</span>
        <span aria-hidden="true" className="h-[2px] flex-1 bg-ink" />
      </div>
    </div>
  );
}
