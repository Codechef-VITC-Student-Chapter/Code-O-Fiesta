import { NextResponse } from 'next/server';

import { ApiError, TooManyRequestsError } from './errors';

export function successResponse<T>(
  data: T,
  status = 200,
) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: unknown, statusOverride?: number) {
  if (error instanceof TooManyRequestsError) {
    return NextResponse.json(
      { message: error.message },
      {
        status: 429,
        headers: { 'Retry-After': String(error.retryAfterSeconds) },
      },
    );
  }

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: statusOverride ?? error.status },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      message: 'Internal server error',
    },
    {
      status: statusOverride ?? 500,
    },
  );
}
