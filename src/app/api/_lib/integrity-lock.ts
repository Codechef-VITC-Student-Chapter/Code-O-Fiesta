import { UserRole } from '@/constants/event';
import connectDB from '@/lib/db';
import ParticipantIntegrity from '@/models/ParticipantIntegrity';

import { ForbiddenError } from './errors';

import type { SessionPayload } from './auth';

/**
 * Rejects a submission from a participant whose submissions an admin (or the
 * tab-switch limit) has locked. The IDE already disables its submit button and
 * shows a lock screen, but that is only the browser: without this check the
 * lock could be bypassed by calling the API directly.
 */
export async function assertSubmissionsNotLocked(session: SessionPayload) {
  if (session.role === UserRole.ADMIN) return;

  await connectDB();
  const status = await ParticipantIntegrity.findOne({ userId: session.userId })
    .select('isSubmissionsLocked')
    .lean();

  if (status?.isSubmissionsLocked) {
    throw new ForbiddenError(
      'Your submissions are locked. Please wait for an administrator to review your activity.',
    );
  }
}
