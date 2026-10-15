'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import AuthGuard from '@/app/guards/AuthGuard';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminNav from '@/components/admin/AdminNav';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function formatDuration(ms: number) {
  if (ms < 1000) return '0s';
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    NORMAL: { label: 'Normal', color: 'hd-badge-ok' },
    REVIEW: { label: 'Review', color: 'hd-badge-warn' },
    SUSPICIOUS: { label: 'Suspicious', color: 'hd-badge-brand' },
    HIGH_ALERT: { label: 'High Alert', color: 'hd-badge-bad' },
  };
  const s = map[status] || map.NORMAL;
  return (
    <span className={`hd-badge ${s.color}`}>
      <span className="hd-dot" aria-hidden="true" />
      {s.label}
    </span>
  );
}

function IntegrityContent() {
  const formatReasons = (reasons?: string[]) => {
    if (!reasons || reasons.length === 0) return null;
    const map: Record<string, string> = {
      'TAB_HIDDEN': 'Switched Tabs',
      'WINDOW_BLUR': 'Clicked Outside',
      'FULLSCREEN_EXIT': 'Exited Fullscreen',
    };
    return reasons.map(r => map[r] || r).join(', ');
  };

  const { data, error, mutate } = useSWR('/api/admin/integrity', fetcher, {
    refreshInterval: 2000,
  });

  const { strictMode, copyPasteBlocker, maxTabSwitches, mutate: mutateSettings } = useGlobalSettings();
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [localMaxTabs, setLocalMaxTabs] = useState<number | ''>('');

  useEffect(() => {
    if (maxTabSwitches !== undefined && localMaxTabs === '') {
      setLocalMaxTabs(maxTabSwitches);
    }
  }, [maxTabSwitches, localMaxTabs]);

  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  const toggleStrictMode = async () => {
    if (isUpdatingSettings) return;
    const newValue = !strictMode;
    let reason = '';
    if (!newValue) {
      const confirmReason = prompt('⚠ DISABLE STRICT SCREEN PROTECTION?\nParticipants will no longer be blocked for leaving fullscreen, and the black deterrent screen will be disabled.\nActivity monitoring will continue.\n\nReason:');
      if (confirmReason === null) return;
      reason = confirmReason;
    } else {
      const confirm = window.confirm('⚠ ENABLE STRICT SCREEN PROTECTION?\nThis will:\n• Require fullscreen mode\n• Restrict Run/Submit outside fullscreen\n• Activate black deterrent screen on focus loss\n• Monitor away sessions\n\nExisting participants will receive the updated policy instantly.');
      if (!confirm) return;
    }
    
    setIsUpdatingSettings(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strictMode: newValue, reason }),
      });
      mutateSettings();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const saveMaxTabs = async (val: number) => {
    if (val < 1 || isUpdatingSettings) return;
    setIsUpdatingSettings(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxTabSwitches: val }),
      });
      mutateSettings();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const toggleCopyPaste = async () => {
    if (isUpdatingSettings) return;
    const newValue = !copyPasteBlocker;
    const action = newValue ? 'ENABLE' : 'DISABLE';
    const confirm = window.confirm(`⚠ ${action} COPY-PASTE BLOCKER?\nAre you sure you want to ${action.toLowerCase()} the global copy-paste blocker?`);
    if (!confirm) return;
    
    setIsUpdatingSettings(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copyPasteBlocker: newValue }),
      });
      mutateSettings();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  useEffect(() => {
    if (selectedParticipant && data?.participants) {
      const updated = data.participants.find((p: any) => p._id === selectedParticipant._id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedParticipant)) {
        setSelectedParticipant(updated);
      }
    }
  }, [data?.participants, selectedParticipant]);

  // Fetch logs initially and whenever awaySessionCount changes
  useEffect(() => {
    if (selectedParticipant) {
      const targetId = selectedParticipant.userId?._id || selectedParticipant.userId;
      if (targetId) {
        setIsLogsLoading(logs.length === 0);
        fetch(`/api/admin/integrity/${targetId}`)
          .then((res) => res.json())
          .then((d) => {
            if (d.error) console.error('Logs fetch error:', d.error);
            setLogs(d.logs || []);
          })
          .finally(() => setIsLogsLoading(false));
      } else {
        setLogs([]);
        setIsLogsLoading(false);
      }
    }
  }, [selectedParticipant?.userId, selectedParticipant?.awaySessionCount]);

  const handleAction = async (action: string, extraArg?: string) => {
    if (!selectedParticipant) return;
    try {
      let finalExtraArg = extraArg;
      if (action === 'LOCK_SUBMISSIONS' && extraArg === undefined) {
        finalExtraArg = window.prompt('Enter reason for locking (optional):') || '';
      }
      const targetId = selectedParticipant.userId?._id || selectedParticipant.userId;
      const body: any = { action, userId: targetId };
      if (action === 'LOCK_SUBMISSIONS') body.reason = finalExtraArg;
      
      const res = await fetch('/api/admin/integrity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert('Error: ' + errorData.error);
        return;
      }
      mutate();
      if (action === 'MARK_REVIEWED') setSelectedParticipant(null);
    } catch (e) {
      console.error(e);
    }
  };

  if (error) return <div className="min-h-screen bg-cream p-4 sm:p-8"><div role="alert" className="hd-alert hd-alert-bad text-[#8f1a10] max-w-2xl">Failed to load integrity data: {error.message}</div></div>;
  if (!data) return <div className="min-h-screen bg-cream p-4 sm:p-8"><div className="hd-label text-muted">Loading...</div></div>;
  if (data.error) return <div className="min-h-screen bg-cream p-4 sm:p-8"><div role="alert" className="hd-alert hd-alert-bad text-[#8f1a10] max-w-2xl">Error: {data.error}</div></div>;

  return (
    <AdminLayout
      title="Integrity Monitoring"
      subtitle="Live monitoring of participant away sessions and fullscreen exits."
      nav={<AdminNav />}
    >
      <div className="hd-card flex flex-col md:flex-row gap-6 mb-8 p-5 sm:p-6">
        <div className="flex-1 min-w-0">
          <h2 className="hd-h3 mb-1.5">Global settings</h2>
          <p className="text-sm text-charcoal mb-4">Real-time enforcement controls. These apply instantly to all active participants.</p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="bg-lilac-soft border-2 border-ink p-3 rounded-lg text-center">
              <div className="hd-label text-muted mb-1">Active Teams</div>
              <div className="hd-display text-2xl">{data.stats?.activeTeams || 0}</div>
            </div>
            <div className="bg-sand border-2 border-ink p-3 rounded-lg text-center">
              <div className="hd-label text-muted mb-1">Global Tab Switches</div>
              <div className="hd-display text-2xl">{data.stats?.totalTabSwitches || 0}</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4 p-4 bg-paper border-2 border-[var(--border-subtle)] rounded-lg">
              <div className="min-w-0">
                <div className="font-bold mb-1 flex flex-wrap items-center gap-2">
                  Strict Screen Protection
                  <span className={`hd-badge ${strictMode ? 'hd-badge-ok' : 'hd-badge-muted'}`}>{strictMode ? 'On' : 'Off'}</span>
                </div>
                <div className="text-xs text-charcoal">Activates black screen deterrent on focus loss and enforces fullscreen mode.</div>
              </div>
              <button
                onClick={toggleStrictMode}
                disabled={isUpdatingSettings}
                role="switch"
                aria-checked={!!strictMode}
                aria-label="Strict Screen Protection"
                className={`relative shrink-0 inline-flex h-8 w-16 items-center rounded-full border-2 border-ink transition-colors ${strictMode ? 'bg-ok' : 'bg-sand'} ${isUpdatingSettings ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-paper border-2 border-ink transition-transform ${strictMode ? 'translate-x-8' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-paper border-2 border-[var(--border-subtle)] rounded-lg">
              <div className="min-w-0">
                <div className="font-bold mb-1 flex flex-wrap items-center gap-2">
                  Copy-Paste Blocker
                  <span className={`hd-badge ${copyPasteBlocker ? 'hd-badge-ok' : 'hd-badge-muted'}`}>{copyPasteBlocker ? 'On' : 'Off'}</span>
                </div>
                <div className="text-xs text-charcoal">Prevents pasting code into the IDE editor.</div>
              </div>
              <button
                onClick={toggleCopyPaste}
                disabled={isUpdatingSettings}
                role="switch"
                aria-checked={!!copyPasteBlocker}
                aria-label="Copy-Paste Blocker"
                className={`relative shrink-0 inline-flex h-8 w-16 items-center rounded-full border-2 border-ink transition-colors ${copyPasteBlocker ? 'bg-ok' : 'bg-sand'} ${isUpdatingSettings ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-paper border-2 border-ink transition-transform ${copyPasteBlocker ? 'translate-x-8' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-paper border-2 border-[var(--border-subtle)] rounded-lg">
              <div className="min-w-0">
                <div className="font-bold mb-1">Max Tab Switches</div>
                <div className="text-xs text-charcoal">Auto-locks submissions if participant exceeds this limit.</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  min="1"
                  aria-label="Max Tab Switches"
                  className="hd-input w-20 text-center font-mono"
                  value={localMaxTabs}
                  disabled={isUpdatingSettings}
                  onChange={(e) => setLocalMaxTabs(parseInt(e.target.value) || '')}
                  onBlur={() => {
                    if (typeof localMaxTabs === 'number' && localMaxTabs !== maxTabSwitches) {
                      saveMaxTabs(localMaxTabs);
                    } else if (localMaxTabs === '') {
                      setLocalMaxTabs(maxTabSwitches);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hd-card overflow-hidden mb-8 min-w-0">
        <div className="px-5 py-4 border-b-2 border-ink bg-sand flex flex-wrap justify-between items-center gap-2">
          <h3 className="hd-label text-ink">Participant away sessions</h3>
          <span className="hd-badge hd-badge-ok">
            <span className="hd-dot hd-pulse-dot" />
            Live
          </span>
        </div>
        <div className="overflow-x-auto">
        <table className="hd-table min-w-[640px] text-left text-sm">
          <thead>
            <tr>
              <th className="px-6">Participant</th>
              <th className="px-6">Sessions</th>
              <th className="px-6">Total Away</th>
              <th className="px-6">Longest</th>
              <th className="px-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data.participants || []).map((p: any) => {
              const isSelected = selectedParticipant?._id === p._id;
              return (
                <React.Fragment key={p._id}>
                  <tr
                    onClick={() => setSelectedParticipant(isSelected ? null : p)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-lilac hover:bg-lilac' : ''}`}
                  >
                    <td className="px-6 font-bold">
                      <span className="flex items-center gap-2">
                        {p.userId?.username || p.userId?.name || 'Unknown'}
                        {p.currentlyAway && (
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bad opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-bad border border-ink"></span>
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 font-mono text-charcoal">{p.awaySessionCount}</td>
                    <td className="px-6 font-mono text-charcoal">{formatDuration(p.totalAwayTimeMs)}</td>
                    <td className="px-6 font-mono text-charcoal">{formatDuration(p.longestAwaySessionMs)}</td>
                    <td className="px-6"><StatusBadge status={p.currentStatus} /></td>
                  </tr>

                  {isSelected && (
                    <tr className="hover:bg-transparent">
                      <td colSpan={5} className="p-0 border-b-4 border-ink">
                        <div className="bg-cream p-4 sm:p-6 border-t-2 border-ink hd-fade">
                          <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">

                            {/* Left Side: Stats & Actions */}
                            <div className="xl:w-1/3 flex flex-col gap-6 min-w-0">
                              <div>
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                  <h3 className="hd-h3 text-ink break-words">{p.userId?.username} Detailed Review</h3>
                                  {p.currentlyAway && (
                                    <div className="hd-badge hd-badge-bad">
                                      <span className="hd-dot hd-pulse-dot" />
                                      Currently Away
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div className="bg-paper p-3 rounded-lg border-2 border-ink">
                                    <div className="hd-label text-muted mb-1">Away Sessions</div>
                                    <div className="hd-display text-ink text-xl">{p.awaySessionCount}</div>
                                  </div>
                                  <div className="bg-paper p-3 rounded-lg border-2 border-ink">
                                    <div className="hd-label text-muted mb-1">Total Away</div>
                                    <div className="hd-display text-ink text-xl">{formatDuration(p.totalAwayTimeMs)}</div>
                                  </div>
                                  <div className="bg-paper p-3 rounded-lg border-2 border-ink">
                                    <div className="hd-label text-muted mb-1">Longest Session</div>
                                    <div className="hd-display text-ink text-xl">{formatDuration(p.longestAwaySessionMs)}</div>
                                  </div>
                                  <div className="bg-paper p-3 rounded-lg border-2 border-ink">
                                    <div className="hd-label text-muted mb-1">Fullscreen Exits</div>
                                    <div className="hd-display text-ink text-xl">{p.fullscreenExitCount}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-paper p-4 rounded-lg border-2 border-ink flex flex-col gap-3">
                                <h4 className="hd-label text-ink mb-1">Admin Actions</h4>
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleAction('MARK_REVIEWED')}
                                    className="hd-btn hd-btn-ok hd-btn-sm flex-1"
                                  >
                                    {p.isSubmissionsLocked ? '✓ Mark Reviewed & Release' : '✓ Mark Reviewed'}
                                  </button>
                                  {p.isSubmissionsLocked ? (
                                    <button
                                      onClick={() => handleAction('RELEASE_SUBMISSIONS')}
                                      className="hd-btn hd-btn-sm flex-1"
                                    >
                                      Release Submissions
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        const reason = prompt('Reason for locking submissions:');
                                        if (reason !== null) handleAction('LOCK_SUBMISSIONS', reason);
                                      }}
                                      className="hd-btn hd-btn-warn hd-btn-sm flex-1"
                                    >
                                      Lock Submissions
                                    </button>
                                  )}
                                </div>
                                <div className="mt-2 border-t border-[var(--border-subtle)] pt-3">
                                  {p.userId?.teamId?.status === 'DISQUALIFIED' ? (
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to RE-ADMIT this team?')) {
                                          handleAction('READMIT');
                                        }
                                      }}
                                      className="hd-btn hd-btn-lilac hd-btn-sm hd-btn-block"
                                    >
                                      Re-admit Team
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to DISQUALIFY this team? They will be permanently locked out of the contest.')) {
                                          handleAction('DISQUALIFY');
                                        }
                                      }}
                                      className="hd-btn hd-btn-danger hd-btn-sm hd-btn-block"
                                    >
                                      ⚠ Disqualify Team
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Activity Logs */}
                            <div className="xl:w-2/3 flex flex-col bg-paper border-2 border-ink rounded-lg overflow-hidden min-w-0">
                              <div className="bg-ink text-cream px-4 py-3 flex flex-wrap justify-between items-center gap-2">
                                <h4 className="hd-label text-cream">Detailed Activity Logs</h4>
                                <span className="font-mono text-xs text-cream/70">{logs.length} events recorded</span>
                              </div>
                              <div className="p-3 sm:p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar bg-paper">
                                {isLogsLoading ? (
                                  <div className="flex items-center justify-center h-full hd-label text-muted py-6">Loading activity...</div>
                                ) : logs.length > 0 ? (
                                  <div className="space-y-2.5">
                                    {logs.map((log) => (
                                      <div key={log._id} className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 p-3 bg-cream rounded-lg border border-[var(--border-subtle)] hover:border-ink transition-colors">
                                        <div className="flex-shrink-0 sm:w-24 text-xs text-muted font-mono sm:pt-0.5">
                                          {new Date(log.timestamp).toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex flex-wrap items-center gap-2 mb-1">
                                            {log.type === 'AWAY_SESSION_END' ? (
                                              <span className="text-[#0f5b31] font-bold text-sm">Returned to IDE</span>
                                            ) : log.type === 'AWAY_SESSION_START' ? (
                                              <span className="text-[#8f1a10] font-bold text-sm">Left IDE</span>
                                            ) : log.type === 'ADMIN_ACTION' ? (
                                              <span className="text-ink font-bold text-sm">Admin Action</span>
                                            ) : (
                                              <span className="text-charcoal font-bold text-sm">{log.type}</span>
                                            )}

                                            {log.type === 'AWAY_SESSION_END' && log.durationMs > 0 && (
                                              <span className="hd-badge hd-badge-muted">
                                                Away for {formatDuration(log.durationMs)}
                                              </span>
                                            )}
                                            {log.severity && log.severity !== 'NONE' && (
                                              <span className={`hd-badge ${log.severity === 'CRITICAL' ? 'hd-badge-bad' : 'hd-badge-warn'}`}>
                                                {log.severity}
                                              </span>
                                            )}
                                          </div>

                                          {(log.reasons?.length > 0 || log.details) && (
                                            <div className="text-sm text-charcoal">
                                              {log.details ? (
                                                <span className="italic break-words">{log.details}</span>
                                              ) : (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                  {log.reasons.map((r: string, idx: number) => {
                                                    const map: Record<string, string> = {
                                                      'TAB_HIDDEN': 'Switched Tabs',
                                                      'WINDOW_BLUR': 'Clicked Outside',
                                                      'FULLSCREEN_EXIT': 'Exited Fullscreen',
                                                    };
                                                    return (
                                                      <span key={idx} className="hd-badge hd-badge-lilac">
                                                        {map[r] || r}
                                                      </span>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-muted gap-2 py-6">
                                    <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="hd-label">No activity recorded.</span>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {(data.participants || []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">No participants tracked yet.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function IntegrityDashboard() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <IntegrityContent />
    </AuthGuard>
  );
}
