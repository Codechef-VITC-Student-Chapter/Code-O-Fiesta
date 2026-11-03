'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface RevealProps {
  children: React.ReactNode;
  as?: 'div' | 'section' | 'li' | 'article';
  className?: string;
  /** Delay in ms before the element animates in once visible. */
  delay?: number;
}

/**
 * Fades and lifts content in when it scrolls into view. Content that is
 * already on screen at mount is shown immediately, so nothing flashes and
 * nothing stays hidden if IntersectionObserver is unavailable.
 */
export default function Reveal({ children, as: Tag = 'div', className = '', delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    // Deferred so the hidden state is applied after paint, outside the effect body.
    const raf = requestAnimationFrame(() => setState('hidden'));
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState('shown');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    observer.observe(node);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return React.createElement(
    Tag,
    {
      ref,
      className: `hd-reveal ${className}`,
      'data-reveal': state,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children
  );
}
