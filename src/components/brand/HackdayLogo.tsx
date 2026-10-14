import React from 'react';

export interface HackdayLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Shows the "by CodeChef VITC" organizer line under the wordmark. */
  showOrganizer?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<HackdayLogoProps['size']>, string> = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
};

/** The Hackday wordmark: heavy black type on a flat orange bar, as on the poster. */
export default function HackdayLogo({ size = 'md', className = '', showOrganizer = false }: HackdayLogoProps) {
  return (
    <span className={`inline-flex flex-col items-start leading-none ${className}`}>
      <span className={`hd-display hd-highlight inline-block pt-[0.04em] pb-[0.02em] ${SIZE_CLASSES[size]}`}>
        Hackday
      </span>
      {showOrganizer && <span className="hd-label mt-1.5 text-[0.6rem] text-muted">by CodeChef VITC</span>}
    </span>
  );
}
