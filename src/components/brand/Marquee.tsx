import React from 'react';

export interface MarqueeProps {
  items: string[];
  className?: string;
  separator?: React.ReactNode;
}

/** Endless horizontal ticker band. Motion stops under prefers-reduced-motion. */
export default function Marquee({ items, className = '', separator }: MarqueeProps) {
  const sep = separator ?? <span aria-hidden="true" className="inline-block w-3 h-3 bg-brand border-2 border-current rotate-45" />;
  const track = (hidden: boolean) => (
    <div className="hd-marquee-track" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <React.Fragment key={`${item}-${i}`}>
          <span className="whitespace-nowrap">{item}</span>
          {sep}
        </React.Fragment>
      ))}
    </div>
  );
  return (
    <div className={`hd-marquee ${className}`}>
      {track(false)}
      {track(true)}
    </div>
  );
}
