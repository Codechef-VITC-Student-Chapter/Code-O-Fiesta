import React from 'react';
import Link from 'next/link';
import HookTitle from './HookTitle';
import HookCTA from './HookCTA';
import HackdayLogo from '@/components/brand/HackdayLogo';
import PixelCluster from '@/components/brand/PixelCluster';
import ChennaiSkyline from '@/components/brand/ChennaiSkyline';
import Marquee from '@/components/brand/Marquee';
import Sticker from '@/components/brand/Sticker';
import Reveal from '@/components/brand/Reveal';
import { EVENT_CONFIG } from '@/config/event';
import { ROUND_1_CONFIG, ROUND_2_CONFIG, ROUND_3_CONFIG } from '@/config/rounds';

const ROUNDS = [
  {
    number: '01',
    name: 'The Path of Fate',
    minutes: ROUND_1_CONFIG.durationMinutes,
    tone: 'bg-paper',
    summary: `Pick your path and solve ${ROUND_1_CONFIG.problemCount} problems in any order you like.`,
    tags: ['Choose a path', `${ROUND_1_CONFIG.problemCount} problems`],
  },
  {
    number: '02',
    name: 'Blind Relay',
    minutes: ROUND_2_CONFIG.durationMinutes,
    tone: 'bg-lilac',
    summary: `Member one reads the problem and starts the code. Member two takes over for ${ROUND_2_CONFIG.member2DurationMinutes} minutes without ever seeing the statement.`,
    tags: ['Tag-team', 'No comments'],
  },
  {
    number: '03',
    name: 'Constraint Crucible',
    minutes: ROUND_3_CONFIG.durationMinutes,
    tone: 'bg-brand',
    summary: 'Solve under strict coding constraints and earn bonuses for elegant, short and first-try solutions.',
    tags: ['Bonus points', 'Constraints'],
  },
];

const TICKER = [
  'Code',
  'Collaborate',
  'Compete',
  'Round 01 · Path of Fate',
  'Round 02 · Blind Relay',
  'Round 03 · Constraint Crucible',
  'Eat · Code · Repeat',
];

export default function HookScene() {
  return (
    <div className="relative w-full min-h-screen bg-cream text-ink overflow-x-clip">
      {/* ---------- Top bar ---------- */}
      <header className="relative z-30 px-4 sm:px-8 lg:px-12 pt-5 sm:pt-7">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between gap-4">
          <Link href="/" aria-label="Hackday home" className="rounded-md">
            <HackdayLogo size="sm" />
          </Link>
          <div className="hidden md:flex items-center gap-6 hd-label text-charcoal">
            <span>Ideas / Community / Impact</span>
            <span className="w-10 h-[2px] bg-ink" aria-hidden="true" />
            <span>CodeChef VITC</span>
          </div>
          <Link href="/login" className="hd-btn hd-btn-dark hd-btn-sm">
            Team login
          </Link>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="relative z-10 px-4 sm:px-8 lg:px-12 pt-10 sm:pt-14 lg:pt-10 pb-16 lg:pb-24">
        <div className="absolute inset-0 hd-dots opacity-60 pointer-events-none [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" aria-hidden="true" />

        <div className="relative mx-auto max-w-[1400px] grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-12 lg:gap-8 items-center">
          <div className="relative">
            <HookTitle />

            <p className="mt-8 max-w-xl text-lg sm:text-xl leading-snug text-charcoal hd-rise hd-delay-4">
              {EVENT_CONFIG.tagline}. Three rounds, two teammates, one leaderboard. Built for
              first-years by the CodeChef VIT Chennai Student Chapter.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4 hd-rise hd-delay-5">
              <HookCTA />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[680px] lg:max-w-none hd-fade hd-delay-2">
            <ChennaiSkyline className="w-full h-auto" />

            <Sticker tone="lilac" rotate={-6} className="absolute left-[28%] sm:left-[34%] -top-4 sm:top-0 hd-float [--hd-rot:-6deg]">
              <span className="block font-mono font-bold uppercase text-sm sm:text-base leading-tight tracking-wide">
                Good
                <br />
                code
                <br />
                Brighter
                <br />
                futures
              </span>
            </Sticker>

            <PixelCluster className="absolute -top-6 right-2" variant="scatter" cell={12} />
          </div>
        </div>

        <div className="relative mx-auto max-w-[1400px] mt-12 flex items-end justify-between gap-6">
          <p className="max-w-[22rem] hd-rise hd-delay-5">
            <span className="hd-ink-lines">
              People
              <br />
              Ideas
              <br />
              Pull requests
              <br />
              A brighter tomorrow
            </span>
          </p>
          <PixelCluster className="hidden sm:block" variant="block" color="var(--lilac)" accent="var(--brand)" cell={12} />
        </div>
      </section>

      {/* ---------- Ticker band ---------- */}
      <div className="relative z-20 -rotate-1 bg-ink text-cream border-y-4 border-ink py-4 my-2">
        <Marquee items={TICKER} className="hd-display text-2xl sm:text-3xl" />
      </div>

      {/* ---------- Rounds ---------- */}
      <section className="relative px-4 sm:px-8 lg:px-12 py-20 sm:py-28" aria-labelledby="rounds-heading">
        <div className="mx-auto max-w-[1400px]">
          <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="hd-kicker text-ink">The format</span>
              <h2 id="rounds-heading" className="hd-display mt-4 leading-[1.02] text-[clamp(2.75rem,1.5rem+5vw,6rem)]">
                Three rounds.
                <br />
                <span className="hd-highlight">Zero</span> chill.
              </h2>
            </div>
            <p className="max-w-sm text-charcoal text-base leading-relaxed">
              Each round has its own twist and its own clock. Points from every round add up to your team&apos;s
              place on the leaderboard.
            </p>
          </Reveal>

          <ol className="grid gap-6 md:grid-cols-3">
            {ROUNDS.map((round, i) => (
              <Reveal as="li" key={round.number} delay={i * 110} className="list-none">
                <article className={`hd-card hd-card-interactive ${round.tone} h-full p-6 sm:p-7 flex flex-col`}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="hd-display text-7xl leading-none">{round.number}</span>
                    <span className="hd-badge hd-badge-ink">{round.minutes} min</span>
                  </div>
                  <h3 className="hd-h3 mt-8">{round.name}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-charcoal flex-1">{round.summary}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {round.tags.map((tag) => (
                      <span key={tag} className="hd-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Closing CTA ---------- */}
      <section className="px-4 sm:px-8 lg:px-12 pb-16">
        <Reveal className="relative mx-auto max-w-[1400px] hd-card-brand overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
          <PixelCluster className="absolute right-4 top-4 sm:right-10 sm:top-8" color="var(--ink)" accent="var(--paper)" cell={14} />
          <span className="hd-kicker text-ink">Eat / Code / Repeat</span>
          <h2 className="hd-display mt-4 text-[clamp(2.5rem,1.4rem+5vw,5.5rem)] max-w-4xl">
            Grab your teammate. Ship the solution.
          </h2>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/login" className="group hd-btn hd-btn-dark hd-btn-lg">
              <span>Login to compete</span>
              <svg aria-hidden="true" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t-2 border-ink px-4 sm:px-8 lg:px-12 py-8">
        <div className="mx-auto max-w-[1400px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <HackdayLogo size="sm" showOrganizer />
          <p className="hd-label text-muted">© 2026 Hackday · CodeChef VIT Chennai Student Chapter</p>
        </div>
      </footer>
    </div>
  );
}
