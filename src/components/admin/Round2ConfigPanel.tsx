'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/admin';

type Config = { totalDurationSeconds: number; member1DurationSeconds: number; handoverDurationSeconds: number; member2DurationSeconds: number };
const empty: Config = { totalDurationSeconds: 3600, member1DurationSeconds: 600, handoverDurationSeconds: 120, member2DurationSeconds: 900 };

export default function Round2ConfigPanel() {
  const [config, setConfig] = useState<Config>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { adminService.getRound2Config().then(setConfig).catch((err) => setMessage(err.message ?? 'Unable to load Round 2 configuration.')).finally(() => setLoading(false)); }, []);

  const update = (key: keyof Config, value: string) => setConfig((current) => ({ ...current, [key]: Number(value) * 60 }));
  const save = async () => { setSaving(true); setMessage(null); try { const saved = await adminService.updateRound2Config(config); setConfig(saved); setMessage('Round 2 timing saved.'); } catch (err: any) { setMessage(err.message ?? 'Unable to save timing configuration.'); } finally { setSaving(false); } };
  const fields: Array<[keyof Config, string, boolean]> = [['totalDurationSeconds', 'Total Round Duration', false], ['member1DurationSeconds', 'Member 1 Coding Duration', false], ['handoverDurationSeconds', 'Handover / Switching Gap', true], ['member2DurationSeconds', 'Member 2 Coding Duration', false]];

  return (
    <section className="hd-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="hd-h3 text-ink">Round 2 timing</h2>
          <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-charcoal">Minutes. New teams use these settings; active teams update immediately without restarting their current phase. Elapsed time is preserved, and the overall round deadline still applies.</p>
        </div>
        <span className="hd-badge hd-badge-lilac">Blind Relay</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([key, label, zeroAllowed]) => (
          <label key={key} className="hd-field-label">
            {label}
            <input aria-label={label} type="number" min={zeroAllowed ? 0 : 1} step="1" disabled={loading || saving} value={config[key] / 60} onChange={(event) => update(key, event.target.value)} className="hd-input mt-1.5 font-mono normal-case tracking-normal" />
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={loading || saving} className="hd-btn hd-btn-primary hd-btn-sm">{saving ? 'SAVING...' : 'SAVE SETTINGS'}</button>
        {message && <span className="text-xs text-charcoal">{message}</span>}
      </div>
    </section>
  );
}
