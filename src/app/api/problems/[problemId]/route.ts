import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { ApiError } from '@/app/api/_lib/errors';
import {
  getProblemById,
  buildSafeProblem,
} from '@/app/api/_services/problem.service';
import { roundService } from '@/app/api/_services/round.service';
import { requireAuthentication } from '@/app/api/_lib/authorization';
import connectDB from '@/lib/db';
import TeamRound from '@/models/TeamRound';
import { UserRole } from '@/constants/event';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;

    const session = await requireAuthentication(req);

    const problem = await getProblemById(problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    // Participants may only read problems assigned to their own team, so a
    // guessed ObjectId can't be used to peek at other rounds' problems.
    // Round 2 has its own stricter phase-based check below.
    if (session.role !== UserRole.ADMIN && (problem as any).roundNumber !== 2) {
      if (!session.teamId || !Types.ObjectId.isValid(session.teamId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      await connectDB();
      const assigned = await TeamRound.exists({
        teamId: new Types.ObjectId(session.teamId),
        $or: [
          { 'round1.problems.problemId': (problem as any)._id },
          { 'round3.problems.problemId': (problem as any)._id },
        ],
      });
      if (!assigned) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Round 2 statements are sensitive: do not rely on a client-side overlay
    // when Member 2 or either member during handover asks for a direct URL.
    if ((problem as any).roundNumber === 2) {
      const actor = await roundService.resolveActor(req);
      const scoped = { roundNumber: 2 as const, actor };
      await roundService.applyLazyPhaseHandover(scoped);
      const state = await roundService.getState(scoped);
      if (!state.allowedActions.canSeeProblem) {
        return NextResponse.json({ error: 'Problem statement is unavailable during this Round 2 phase.' }, { status: 403 });
      }
    }

    return NextResponse.json(buildSafeProblem(problem));
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[GET /api/problems/[problemId]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
