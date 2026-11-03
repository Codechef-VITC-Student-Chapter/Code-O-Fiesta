/**
 * Resets all event progress while keeping Users and Problems (questions) intact.
 *
 *   npm run db:reset            # dry run: prints what would change, writes nothing
 *   npm run db:reset -- --apply # performs the reset
 *   npm run db:reset -- --apply --clear-sessions   # also logs everyone out (users.sessionId = null)
 *
 * KEPT as-is:  users, problems, globalsettings (admin config), team documents
 *              (users reference them via teamId, so they are reset, not deleted)
 * RESET:       rounds -> UPCOMING with no start/end/pause times
 *              teams  -> status ACTIVE (un-disqualifies)
 * DELETED:     teamRounds, scores, submissions, integrity_logs,
 *              participant_integrity, rate_limits, run_rate_limits
 *
 * Deleted documents are backed up to a JSON file in the OS temp dir first.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import mongoose from 'mongoose';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import { RoundStatus, TeamStatus } from '../src/constants/event';

const APPLY = process.argv.includes('--apply');
const CLEAR_SESSIONS = process.argv.includes('--clear-sessions');

const COLLECTIONS_TO_WIPE = [
  'teamRounds',
  'scores',
  'submissions',
  'integrity_logs',
  'participant_integrity',
  'rate_limits',
  'run_rate_limits',
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined.');

  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  console.log(`Connected to database "${db.databaseName}"`);
  console.log(APPLY ? 'MODE: APPLY (writing changes)\n' : 'MODE: DRY RUN (no changes; pass --apply to execute)\n');

  const existing = new Set((await db.listCollections().toArray()).map((c) => c.name));

  const backup: Record<string, unknown[]> = {};
  for (const name of COLLECTIONS_TO_WIPE) {
    if (!existing.has(name)) continue;
    const docs = await db.collection(name).find({}).toArray();
    backup[name] = docs;
    console.log(`wipe   ${name.padEnd(22)} ${docs.length} docs`);
  }

  const rounds = db.collection('rounds');
  const teams = db.collection('teams');
  const users = db.collection('users');

  const roundsToReset = await rounds.countDocuments({
    $or: [
      { status: { $ne: RoundStatus.UPCOMING } },
      { startedAt: { $ne: null } },
      { endsAt: { $ne: null } },
      { pausedAt: { $ne: null } },
    ],
  });
  const teamsToReset = await teams.countDocuments({ status: { $ne: TeamStatus.ACTIVE } });
  const sessions = CLEAR_SESSIONS ? await users.countDocuments({ sessionId: { $ne: null } }) : 0;

  console.log(`reset  rounds                 ${roundsToReset} of ${await rounds.countDocuments()} need resetting`);
  console.log(`reset  teams.status           ${teamsToReset} of ${await teams.countDocuments()} need resetting`);
  if (CLEAR_SESSIONS) console.log(`reset  users.sessionId        ${sessions} sessions`);
  console.log(
    `keep   users ${await users.countDocuments()}, problems ${await db.collection('problems').countDocuments()}, globalsettings ${await db.collection('globalsettings').countDocuments()}`,
  );

  if (!APPLY) {
    console.log('\nDry run complete. Nothing was changed.');
    return;
  }

  const backupFile = path.join(os.tmpdir(), `cof-reset-backup-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backup));
  console.log(`\nBackup written to ${backupFile}`);

  for (const name of Object.keys(backup)) {
    const r = await db.collection(name).deleteMany({});
    console.log(`deleted ${name}: ${r.deletedCount}`);
  }

  const rr = await rounds.updateMany(
    {},
    { $set: { status: RoundStatus.UPCOMING, startedAt: null, endsAt: null, pausedAt: null } },
  );
  console.log(`rounds reset: ${rr.modifiedCount}`);

  const tr = await teams.updateMany({}, { $set: { status: TeamStatus.ACTIVE } });
  console.log(`teams reset: ${tr.modifiedCount}`);

  if (CLEAR_SESSIONS) {
    const ur = await users.updateMany({ sessionId: { $ne: null } }, { $set: { sessionId: null } });
    console.log(`sessions cleared: ${ur.modifiedCount}`);
  }

  console.log('\nReset complete.');
}

main()
  .catch((error) => {
    console.error('Reset failed:', error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
