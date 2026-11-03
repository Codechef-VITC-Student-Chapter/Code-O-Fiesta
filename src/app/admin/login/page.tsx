'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HackdayLogo from '@/components/brand/HackdayLogo';
import PixelCluster from '@/components/brand/PixelCluster';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-cream text-ink overflow-x-clip lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      {/* ---------- Organizer poster panel ---------- */}
      <section
        aria-label="Hackday organizer access"
        className="relative overflow-hidden bg-ink text-cream border-b-2 lg:border-b-0 lg:border-r-2 border-ink px-5 sm:px-10 lg:px-14 pt-6 sm:pt-8 pb-10 sm:pb-14 lg:py-12 flex flex-col"
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" aria-hidden="true" />

        <div className="relative flex items-center justify-between gap-4">
          <Link href="/" aria-label="Hackday home" className="rounded-md inline-flex items-center gap-3">
            <span className="inline-flex rounded-md bg-cream text-ink px-2 py-1">
              <HackdayLogo size="sm" />
            </span>
          </Link>
          <span className="hd-badge hd-badge-brand">Organizers only</span>
        </div>

        <div className="relative flex-1 flex flex-col justify-center mt-8 sm:mt-12 lg:mt-0">
          <PixelCluster
            className="absolute -top-2 right-0 sm:right-6 hd-float"
            color="var(--cream)"
            accent="var(--brand)"
            cell={11}
          />
          <span className="hd-kicker text-cream hd-rise">Admin access</span>
          <p
            aria-hidden="true"
            className="hd-display mt-4 text-[clamp(2.75rem,1.2rem+7vw,6.5rem)] text-cream hd-rise hd-delay-1"
          >
            Run the
            <br />
            <span className="hd-highlight">show.</span>
          </p>
          <p className="mt-6 max-w-md text-base sm:text-lg leading-snug text-cream/80 hd-rise hd-delay-2">
            Organizer control panel for rounds, timers, teams, questions and integrity monitoring.
            Participants should use the team login instead.
          </p>

          <div className="mt-8 hidden sm:flex flex-wrap items-center gap-5 hd-rise hd-delay-3">
            <p className="max-w-[18rem] leading-none">
              <span className="hd-ink-lines border border-cream/30">
                Live operations
                <br />
                Question manager
                <br />
                Integrity monitoring
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
        <p className="relative hd-label text-cream/60 mt-10 hidden lg:block">
          © 2026 Hackday · CodeChef VIT Chennai Student Chapter
        </p>
      </section>

      {/* ---------- Form panel ---------- */}
      <section className="relative flex items-center justify-center px-4 sm:px-10 py-12 sm:py-14 lg:py-12">
        <div className="absolute inset-0 hd-grid-paper opacity-70 pointer-events-none" aria-hidden="true" />
        <div className="relative w-full max-w-md hd-rise hd-delay-2">
          <div className="relative hd-card shadow-hd-lg overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 sm:px-8 py-3 border-b-2 border-ink bg-ink text-cream">
              <span className="hd-label text-cream">Admin Authentication</span>
              <span className="hd-badge hd-badge-ok">
                <span className="hd-dot hd-pulse-dot" aria-hidden="true" />
                Ready
              </span>
            </div>

            <div className="p-5 sm:p-8">
              <span className="hd-badge hd-badge-ink">ADMIN</span>
              <h1 className="hd-h2 mt-3">Admin login</h1>
              <p className="mt-2 text-sm text-charcoal">Restricted to Hackday organizers. Sign in with your organizer account.</p>

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
                  <label htmlFor="admin-login-email" className="hd-field-label">
                    Email
                  </label>
                  <input
                    id="admin-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    disabled={loading}
                    autoComplete="username"
                    className="hd-input"
                  />
                </div>

                <div>
                  <label htmlFor="admin-login-password" className="hd-field-label">
                    Password
                  </label>
                  <input
                    id="admin-login-password"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="group hd-btn hd-btn-dark hd-btn-lg hd-btn-block mt-2"
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
                      <span>LOGIN TO ADMIN</span>
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
