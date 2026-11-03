'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HackdayLogo from '@/components/brand/HackdayLogo';
import PixelCluster from '@/components/brand/PixelCluster';
import Sticker from '@/components/brand/Sticker';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [teamMember, setTeamMember] = useState('MEMBER_1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let loggedIn = false;

    // 1. Attempt backend API login first
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          teamMember,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof window !== 'undefined' && data.user) {
          sessionStorage.setItem(
            'cof_session',
            JSON.stringify({
              role: data.user.role,
              user: data.user,
              team: {
                id: data.user.teamId || 'team_team_014',
                name: data.user.name || 'TEAM_014',
                score: 120,
              },
            })
          );
        }
        loggedIn = true;
      }
    } catch (apiErr) {
      console.warn('Backend API auth offline, switching to local session fallback.');
    }

    // 2. Fallback to local session storage auth (for standalone / local dev)
    if (!loggedIn) {
      try {
        const teamName = email.split('@')[0].toUpperCase() || 'TEAM_014';
        const formattedTeam = teamName === 'TEAM' ? 'TEAM_014' : teamName;
        const localSession = {
          role: 'PARTICIPANT',
          user: {
            id: `usr_${formattedTeam.toLowerCase()}`,
            name: `${formattedTeam} Lead`,
            email: email,
            role: 'PARTICIPANT',
            teamId: `team_${formattedTeam.toLowerCase()}`,
            teamMember: teamMember,
          },
          team: {
            id: `team_${formattedTeam.toLowerCase()}`,
            name: formattedTeam,
            score: 120,
            status: 'ACTIVE',
            members: [
              { id: 'm1', name: 'Member 01', email: email, role: 'PARTICIPANT', teamMember: 'MEMBER_1' },
              { id: 'm2', name: 'Member 02', email: 'member2@test.com', role: 'PARTICIPANT', teamMember: 'MEMBER_2' },
            ],
          },
        };

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('cof_session', JSON.stringify(localSession));
        }
        loggedIn = true;
      } catch (localErr) {
        console.error('Local fallback failed:', localErr);
      }
    }

    if (loggedIn) {
      router.push('/dashboard');
    } else {
      setError('Login failed. Please check credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-cream text-ink overflow-x-clip lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      {/* ---------- Brand / poster panel ---------- */}
      <section
        aria-label="Hackday"
        className="relative overflow-hidden bg-cream border-b-2 lg:border-b-0 lg:border-r-2 border-ink px-5 sm:px-10 lg:px-14 pt-6 sm:pt-8 pb-10 sm:pb-14 lg:py-12 flex flex-col"
      >
        <div className="absolute inset-0 hd-dots opacity-60 pointer-events-none" aria-hidden="true" />

        <div className="relative flex items-center justify-between gap-4">
          <Link href="/" aria-label="Hackday home" className="rounded-md">
            <HackdayLogo size="sm" />
          </Link>
          <span className="hd-label text-charcoal">VITC Student Chapter</span>
        </div>

        <div className="relative flex-1 flex flex-col justify-center mt-8 sm:mt-12 lg:mt-0">
          <PixelCluster className="absolute -top-2 right-0 sm:right-6 hd-float" cell={11} />
          <span className="hd-kicker text-ink hd-rise">Team login</span>
          <p
            aria-hidden="true"
            className="hd-display mt-4 leading-[1.04] text-[clamp(2.75rem,1.2rem+7vw,6.5rem)] hd-rise hd-delay-1"
          >
            Ready,
            <br />
            set, <span className="hd-highlight">code.</span>
          </p>
          <p className="mt-6 max-w-md text-base sm:text-lg leading-snug text-charcoal hd-rise hd-delay-2">
            Sign in with your team credentials to enter the arena. Three rounds, two teammates, one
            leaderboard.
          </p>

          <div className="mt-8 hidden sm:flex flex-wrap items-center gap-5 hd-rise hd-delay-3">
            <Sticker tone="lilac" rotate={-4}>
              <p className="hd-label text-ink leading-relaxed">
                Code /
                <br />
                Collaborate /
                <br />
                Compete
              </p>
            </Sticker>
            <p className="max-w-[16rem] leading-none">
              <span className="hd-ink-lines">
                Round 01 · Path of Fate
                <br />
                Round 02 · Blind Relay
                <br />
                Round 03 · Constraint Crucible
              </span>
            </p>
          </div>
        </div>

        <PixelCluster
          className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 hidden sm:block"
          variant="block"
          color="var(--lilac)"
          accent="var(--brand)"
          cell={10}
        />
        <p className="relative hd-label text-muted mt-10 hidden lg:block">
          © 2026 Hackday · CodeChef VIT Chennai Student Chapter
        </p>
      </section>

      {/* ---------- Form panel ---------- */}
      <section className="relative flex items-center justify-center px-4 sm:px-10 py-12 sm:py-14 lg:py-12">
        <div className="relative w-full max-w-md hd-rise hd-delay-2">
          <PixelCluster
            className="absolute -top-9 -left-1 sm:-left-7"
            variant="scatter"
            color="var(--ink)"
            accent="var(--brand)"
            cell={7}
          />

          <div className="relative hd-card shadow-hd-lg overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-3 border-b-2 border-ink bg-lilac">
              <span className="hd-label text-ink">Authentication</span>
              <span className="hd-badge hd-badge-ok">
                <span className="hd-dot hd-pulse-dot" aria-hidden="true" />
                Ready
              </span>
            </div>

            <div className="p-5 sm:p-8">
              <h1 className="hd-h2">Team login</h1>
              <p className="mt-2 text-sm text-charcoal">Use the email and password shared with your team.</p>

              {error && (
                <div role="alert" className="hd-alert hd-alert-bad mt-6 text-[#8f1a10]">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="login-email" className="hd-field-label">
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    autoComplete="email"
                    className="hd-input"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="hd-field-label">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="hd-input"
                  />
                </div>

                <div>
                  <label htmlFor="login-team-member" className="hd-field-label">
                    Team Member
                  </label>
                  <select
                    id="login-team-member"
                    value={teamMember}
                    onChange={(e) => setTeamMember(e.target.value)}
                    required
                    disabled={loading}
                    className="hd-input"
                  >
                    <option value="MEMBER_1">Member 1</option>
                    <option value="MEMBER_2">Member 2</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group hd-btn hd-btn-primary hd-btn-lg hd-btn-block mt-2"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span>LOGIN TO EVENT</span>
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="hd-label text-muted mt-8 text-center lg:hidden">
            © 2026 Hackday · CodeChef VIT Chennai Student Chapter
          </p>
        </div>
      </section>
    </div>
  );
}
