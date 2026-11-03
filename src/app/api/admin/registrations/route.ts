import { requireAdmin } from '@/app/api/_lib/authorization';
import { getLoginUrl } from '@/app/api/_lib/app-url';
import { isMailConfigured } from '@/app/api/_lib/mailer';
import { errorResponse, successResponse } from '@/app/api/_lib/response';
import { listRegistrations, registerTeam } from '@/app/api/_services/registration.service';
import { validateRegistrationInput } from '@/app/api/_validators/registration';

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const teams = await listRegistrations();

    return successResponse({ teams, mailConfigured: isMailConfigured() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const input = validateRegistrationInput(body);
    const team = await registerTeam(input, getLoginUrl(request));

    return successResponse({ team }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
