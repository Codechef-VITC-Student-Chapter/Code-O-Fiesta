import connectDB from '@/lib/db';
import RateLimit from '@/models/RateLimit';

import { TooManyRequestsError } from './errors';

type Window = { key: string; limit: number; windowSeconds: number };

/**
 * Atomically count one hit against a fixed window and throw once the limit is
 * exceeded. A single upsert per key keeps it safe across instances.
 */
async function hit({ key, limit, windowSeconds }: Window) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  // Start a fresh window if the previous one lapsed but the TTL monitor
  // hasn't removed the document yet.
  await RateLimit.updateOne(
    { _id: key, expiresAt: { $lte: now } },
    { $set: { count: 0, expiresAt } },
  );

  let doc;
  try {
    doc = await RateLimit.findOneAndUpdate(
      { _id: key },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { upsert: true, new: true },
    ).lean();
  } catch (err) {
    // Two requests raced to create the same key; the loser retries as an update.
    if ((err as { code?: number }).code !== 11000) throw err;
    doc = await RateLimit.findOneAndUpdate(
      { _id: key },
      { $inc: { count: 1 } },
      { new: true },
    ).lean();
  }

  if (doc && doc.count > limit) {
    const retryAfter = Math.max(
      1,
      Math.ceil((doc.expiresAt.getTime() - now.getTime()) / 1000),
    );
    throw new TooManyRequestsError(
      'Too many login attempts. Please wait a few minutes and try again.',
      retryAfter,
    );
  }
}

export function getClientIp(request: Request): string {
  // Only trustworthy when the app sits behind a proxy that overwrites this
  // header (Vercel, nginx, Cloudflare). Per-email limiting is the real guard.
  const forwarded = request.headers.get('x-forwarded-for');
  return (
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Per-account limit is tight (stops password guessing); the per-IP limit is
// loose because a whole venue may share one NAT address on event day.
const EMAIL_LIMIT = { limit: 10, windowSeconds: 10 * 60 };
const IP_LIMIT = { limit: 600, windowSeconds: 10 * 60 };

export async function enforceLoginRateLimit(request: Request, email: string) {
  await connectDB();
  await hit({ key: `login:ip:${getClientIp(request)}`, ...IP_LIMIT });
  await hit({ key: `login:email:${email}`, ...EMAIL_LIMIT });
}

export async function clearLoginRateLimit(email: string) {
  await RateLimit.deleteOne({ _id: `login:email:${email}` });
}
