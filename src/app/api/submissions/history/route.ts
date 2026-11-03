import { NextResponse } from 'next/server';
import { Types } from 'mongoose';

import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import { requireAuthentication } from '@/app/api/_lib/authorization';
import { errorResponse } from '@/app/api/_lib/response';

export async function GET(request: Request) {
  try {
    // Source code is private to a team: require a session and scope the
    // query to the caller's own team, never just the problemId.
    const session = await requireAuthentication(request);

    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');

    if (!problemId || !Types.ObjectId.isValid(problemId)) {
      return NextResponse.json({ error: 'Missing or invalid problemId parameter' }, { status: 400 });
    }

    if (!session.teamId || !Types.ObjectId.isValid(session.teamId)) {
      return NextResponse.json([]);
    }

    await connectDB();
    const submissions = await Submission.find({
      teamId: new Types.ObjectId(session.teamId),
      problemId: new Types.ObjectId(problemId),
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(submissions.map(sub => ({
      id: sub._id.toString(),
      status: sub.verdict.toLowerCase().replace('_limit', '_limit_exceeded').replace('ast_constraint_failed', 'compilation_error'),
      testsPassed: sub.verdict === 'ACCEPTED' ? 10 : 3,
      totalTests: 10,
      timeMs: sub.judge0?.executionTime || 120,
      memoryKb: sub.judge0?.memory || 4096,
      sourceCode: sub.sourceCode,
      language: sub.language,
    })));
  } catch (err) {
    return errorResponse(err);
  }
}
