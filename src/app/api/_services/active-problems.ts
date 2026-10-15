import { Types } from 'mongoose';

import connectDB from '@/lib/db';
import Problem from '@/models/Problem';

import { ttlCached } from '../_lib/ttl-cache';

// Rounds 2 and 3 serve every active problem the admin has added for that round,
// in the order they were created. This is read on every participant poll, so it
// is cached briefly per server instance: a newly added question shows up within
// a couple of seconds.
const ACTIVE_PROBLEMS_TTL_MS = 2000;

const loaders = new Map<number, () => Promise<Types.ObjectId[]>>();

export function getActiveProblemIds(roundNumber: 2 | 3): Promise<Types.ObjectId[]> {
  let load = loaders.get(roundNumber);
  if (!load) {
    load = ttlCached(ACTIVE_PROBLEMS_TTL_MS, async () => {
      await connectDB();
      const docs = await Problem.find({ roundNumber, isActive: true })
        .sort({ _id: 1 })
        .select('_id')
        .lean();
      return docs.map((doc) => doc._id as Types.ObjectId);
    });
    loaders.set(roundNumber, load);
  }
  return load();
}
