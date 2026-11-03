import { Types } from 'mongoose';

import { requireAdmin } from '@/app/api/_lib/authorization';
import { getLoginUrl } from '@/app/api/_lib/app-url';
import { BadRequestError } from '@/app/api/_lib/errors';
import { errorResponse, successResponse } from '@/app/api/_lib/response';
import { resendCredentials } from '@/app/api/_services/registration.service';
import { validateTeamMemberParam } from '@/app/api/_validators/registration';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    await requireAdmin(request);

    const { teamId } = await params;
    if (!Types.ObjectId.isValid(teamId)) throw new BadRequestError('Invalid team id');

    let body: Record<string, unknown> = {};
    try {
      const parsed = await request.json();
      if (parsed && typeof parsed === 'object') body = parsed as Record<string, unknown>;
    } catch {
      // empty body = resend to both members
    }

    const members = await resendCredentials(
      teamId,
      validateTeamMemberParam(body.teamMember),
      getLoginUrl(request),
    );

    return successResponse({ members });
  } catch (error) {
    return errorResponse(error);
  }
}
