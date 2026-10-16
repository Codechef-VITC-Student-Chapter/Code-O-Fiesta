'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/app/guards/AuthGuard';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminNav from '@/components/admin/AdminNav';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';
import {
  registrationService,
  type EmailStatus,
  type RegisteredMember,
  type RegisteredTeam,
} from '@/services/registration';

const EMPTY_FORM = {
  teamName: '',
  m1Name: '',
  m1Email: '',
  m2Name: '',
  m2Email: '',
};

const MEMBER_LABEL = { MEMBER_1: 'Member 1', MEMBER_2: 'Member 2' } as const;

function EmailBadge({ status }: { status?: EmailStatus }) {
  if (status === 'SENT') return <span className="hd-badge hd-badge-ok">Email sent</span>;
  if (status === 'FAILED') return <span className="hd-badge hd-badge-bad">Email failed</span>;
  if (status === 'NOT_CONFIGURED') return <span className="hd-badge hd-badge-warn">Mail not set up</span>;
  return null;
}

function DeliveryResult({ team, onDismiss }: { team: RegisteredTeam; onDismiss: () => void }) {
  const allSent = team.members.every((m) => m.emailStatus === 'SENT');

  return (
    <div role="status" className={`hd-alert ${allSent ? 'hd-alert-ok' : 'hd-alert-warn'} flex-col !items-stretch gap-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold break-words">
            {team.name} registered <span className="font-mono text-xs">({team.teamCode})</span>
          </p>
          <p className="text-sm mt-0.5">
            {allSent
              ? 'Login credentials were emailed to both members.'
              : 'Registered, but not every credentials email was delivered — use “Resend” in the list below once mail is working.'}
          </p>
        </div>
        <button type="button" onClick={onDismiss} className="hd-icon-btn shrink-0" aria-label="Dismiss">
          ✕
        </button>
      </div>
      <ul className="flex flex-col gap-1.5">
        {team.members.map((m) => (
          <li key={m.teamMember} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="hd-badge hd-badge-ink">{MEMBER_LABEL[m.teamMember]}</span>
            <span className="break-all">{m.email}</span>
            <EmailBadge status={m.emailStatus} />
            {m.emailError && <span className="text-xs text-muted break-all">{m.emailError}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RegistrationContent() {
  const [teams, setTeams] = useState<RegisteredTeam[]>([]);
  const [mailConfigured, setMailConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastRegistered, setLastRegistered] = useState<RegisteredTeam | null>(null);

  const [search, setSearch] = useState('');
  const [busyTeamId, setBusyTeamId] = useState<string | null>(null);
  const [rowNotice, setRowNotice] = useState<{ teamId: string; kind: 'ok' | 'bad'; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await registrationService.list();
      setTeams(res.teams);
      setMailConfigured(res.mailConfigured);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    registrationService
      .list()
      .then((res) => {
        if (cancelled) return;
        setTeams(res.teams);
        setMailConfigured(res.mailConfigured);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load registrations');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const update = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setFormError(null);
    setLastRegistered(null);
    setSubmitting(true);

    try {
      const { team } = await registrationService.register({
        teamName: form.teamName,
        member1: { name: form.m1Name, email: form.m1Email },
        member2: { name: form.m2Name, email: form.m2Email },
      });
      setLastRegistered(team);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async (team: RegisteredTeam) => {
    if (
      !window.confirm(
        `Issue NEW passwords for "${team.name}" and email them? Their current passwords will stop working.`,
      )
    ) {
      return;
    }

    setBusyTeamId(team.id);
    setRowNotice(null);
    try {
      const { members } = await registrationService.resend(team.id);
      const failed = members.filter((m: RegisteredMember) => m.emailStatus !== 'SENT');
      setRowNotice(
        failed.length === 0
          ? { teamId: team.id, kind: 'ok', text: 'New credentials emailed to both members.' }
          : {
              teamId: team.id,
              kind: 'bad',
              text: `Could not email: ${failed.map((m) => m.email).join(', ')}. Passwords were rotated — try again.`,
            },
      );
    } catch (err) {
      setRowNotice({ teamId: team.id, kind: 'bad', text: err instanceof Error ? err.message : 'Resend failed' });
    } finally {
      setBusyTeamId(null);
    }
  };

  const handleRemove = async (team: RegisteredTeam) => {
    if (!window.confirm(`Remove "${team.name}" and both member accounts? This cannot be undone.`)) return;

    setBusyTeamId(team.id);
    setRowNotice(null);
    try {
      await registrationService.remove(team.id);
      await load();
    } catch (err) {
      setRowNotice({ teamId: team.id, kind: 'bad', text: err instanceof Error ? err.message : 'Remove failed' });
    } finally {
      setBusyTeamId(null);
    }
  };

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) ||
        t.teamCode.toLowerCase().includes(needle) ||
        t.members.some((m) => m.name.toLowerCase().includes(needle) || m.email.toLowerCase().includes(needle)),
    );
  }, [teams, search]);

  if (loading) {
    return (
      <AdminLayout title="Participant Registration" nav={<AdminNav />}>
        <LoadingState message="Loading registrations..." mode="full-page" />
      </AdminLayout>
    );
  }

  if (loadError && teams.length === 0) {
    return (
      <AdminLayout title="Participant Registration" nav={<AdminNav />}>
        <ErrorState title="Failed to load registrations" message={loadError} onRetry={load} variant="connection" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Participant Registration"
      subtitle="Register teams and email each member their login credentials"
      nav={<AdminNav />}
    >
      <div className="flex flex-col gap-6">
        {!mailConfigured && (
          <div role="alert" className="hd-alert hd-alert-warn">
            <span>
              Email is not configured on the server (set <code className="font-mono">SMTP_HOST</code>,{' '}
              <code className="font-mono">SMTP_USER</code>, <code className="font-mono">SMTP_PASS</code>). Teams can still be
              registered, but credentials will not be emailed.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] gap-6 items-start">
          {/* ---------- Registration form ---------- */}
          <section className="hd-card p-5 sm:p-6">
            <span className="hd-badge hd-badge-ink">NEW TEAM</span>
            <h2 className="hd-h3 mt-3">Register a team</h2>
            <p className="mt-1 text-sm text-charcoal">
              Every team has two members. Each gets their own login, generated automatically and sent to their email.
            </p>

            {formError && (
              <div role="alert" className="hd-alert hd-alert-bad mt-4 text-[#8f1a10]">
                <span>{formError}</span>
              </div>
            )}

            <form className="mt-5 flex flex-col gap-5" onSubmit={handleSubmit} noValidate={false}>
              <div>
                <label htmlFor="reg-team-name" className="hd-field-label">Team name</label>
                <input
                  id="reg-team-name"
                  className="hd-input"
                  value={form.teamName}
                  onChange={update('teamName')}
                  required
                  minLength={2}
                  maxLength={60}
                  placeholder="e.g. Byte Benders"
                  disabled={submitting}
                  autoComplete="off"
                />
              </div>

              {(
                [
                  ['MEMBER_1', 'm1Name', 'm1Email', 'Member 1 (team captain)'],
                  ['MEMBER_2', 'm2Name', 'm2Email', 'Member 2'],
                ] as const
              ).map(([slot, nameKey, emailKey, title]) => (
                <fieldset key={slot} className="hd-card-flat p-4 flex flex-col gap-4 min-w-0">
                  <legend className="hd-label text-ink px-1">{title}</legend>
                  <div>
                    <label htmlFor={`reg-${slot}-name`} className="hd-field-label">Full name</label>
                    <input
                      id={`reg-${slot}-name`}
                      className="hd-input"
                      value={form[nameKey]}
                      onChange={update(nameKey)}
                      required
                      minLength={2}
                      maxLength={80}
                      disabled={submitting}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor={`reg-${slot}-email`} className="hd-field-label">Email</label>
                    <input
                      id={`reg-${slot}-email`}
                      type="email"
                      className="hd-input"
                      value={form[emailKey]}
                      onChange={update(emailKey)}
                      required
                      maxLength={254}
                      placeholder="name@example.com"
                      disabled={submitting}
                      autoComplete="off"
                    />
                  </div>
                </fieldset>
              ))}

              <button type="submit" disabled={submitting} className="hd-btn hd-btn-primary hd-btn-lg hd-btn-block">
                {submitting ? 'REGISTERING & SENDING EMAILS...' : 'SIGN UP & EMAIL CREDENTIALS'}
              </button>
            </form>

            {lastRegistered && (
              <div className="mt-5">
                <DeliveryResult team={lastRegistered} onDismiss={() => setLastRegistered(null)} />
              </div>
            )}
          </section>

          {/* ---------- Registered teams ---------- */}
          <section className="hd-card p-0 overflow-hidden min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b-2 border-ink">
              <div>
                <h2 className="hd-h3">Registered teams</h2>
                <p className="hd-label text-muted mt-0.5">{teams.length} total</p>
              </div>
              <input
                className="hd-input w-full sm:w-64 text-sm"
                placeholder="Search team, name or email"
                aria-label="Search registrations"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <p className="p-6 text-sm text-charcoal">
                {teams.length === 0 ? 'No teams registered yet.' : 'No teams match your search.'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="hd-table min-w-[40rem] text-left">
                  <thead>
                    <tr>
                      <th className="pl-5">TEAM</th>
                      <th>MEMBERS</th>
                      <th className="text-right pr-5">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((team) => (
                      <tr key={team.id}>
                        <td className="pl-5 align-top">
                          <p className="font-bold break-words">{team.name}</p>
                          <p className="font-mono text-xs text-muted">{team.teamCode}</p>
                        </td>
                        <td className="align-top">
                          <ul className="flex flex-col gap-1.5">
                            {team.members.map((m) => (
                              <li key={m.teamMember} className="flex flex-wrap items-center gap-2">
                                <span className="hd-badge hd-badge-muted">{MEMBER_LABEL[m.teamMember]}</span>
                                <span className="text-sm">{m.name}</span>
                                <span className="text-xs text-muted break-all">{m.email}</span>
                              </li>
                            ))}
                          </ul>
                          {rowNotice?.teamId === team.id && (
                            <p className={`mt-2 text-xs ${rowNotice.kind === 'ok' ? 'text-ok' : 'text-bad'}`} role="status">
                              {rowNotice.text}
                            </p>
                          )}
                        </td>
                        <td className="text-right pr-5 align-top">
                          <div className="inline-flex gap-2">
                            <button
                              type="button"
                              className="hd-btn hd-btn-ghost hd-btn-sm"
                              disabled={busyTeamId === team.id || !mailConfigured}
                              title={mailConfigured ? 'Rotate passwords and email them again' : 'Mail is not configured'}
                              onClick={() => handleResend(team)}
                            >
                              {busyTeamId === team.id ? 'Working…' : 'Resend'}
                            </button>
                            <button
                              type="button"
                              className="hd-btn hd-btn-danger hd-btn-sm"
                              disabled={busyTeamId === team.id}
                              onClick={() => handleRemove(team)}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminRegistrationPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <RegistrationContent />
    </AuthGuard>
  );
}
