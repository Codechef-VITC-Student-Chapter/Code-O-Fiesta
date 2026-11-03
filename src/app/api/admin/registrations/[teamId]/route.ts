import { Types } from 'mongoose';

import { requireAdmin } from '@/app/api/_lib/authorization';
import { BadRequestError } from '@/app/api/_lib/errors';
import { errorResponse, successResponse } from '@/app/api/_lib/response';
import { deleteRegistration } from '@/app/api/_services/registration.service';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    await requireAdmin(request);

    const { teamId } = await params;
    if (!Types.ObjectId.isValid(teamId)) throw new BadRequestError('Invalid team id');

    await deleteRegistration(teamId);

    return successResponse({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
