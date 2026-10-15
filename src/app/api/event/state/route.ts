import {
  errorResponse,
  successResponse,
} from '../../_lib/response';

import { getEventState } from '../../_services/event.service';

export async function GET() {
  try {
    const eventState = await getEventState();

    const response = successResponse(eventState);
    // Public, user-independent data: let the CDN absorb most participant polls.
    response.headers.set('Cache-Control', 'public, s-maxage=2, stale-while-revalidate=5');
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}