import connectDB from '@/lib/db';
import Team from '@/models/Team';
import TeamRound from '@/models/TeamRound';
import Round from '@/models/Round';
import Score from '@/models/Score';
import { TeamStatus, RoundStatus, TeamRoundStatus } from '@/constants/event';

const LEADERBOARD_CACHE_TTL_MS = 5000;

type LeaderboardEntry = Awaited<ReturnType<typeof computeLeaderboard>>[number];

const leaderboardCache = new Map<
  boolean,
  { value?: LeaderboardEntry[]; expiresAt: number; inflight?: Promise<LeaderboardEntry[]> }
>();

/**
 * Standings for every non-disqualified team, ranked by total score.
 *
 * Cached for a few seconds per view and shared between concurrent callers, so
 * any number of admin refreshes cost one computation per window.
 */
export async function getLeaderboard(adminView = false) {
  const entry = leaderboardCache.get(adminView);

  if (entry?.value && entry.expiresAt > Date.now()) return entry.value;
  if (entry?.inflight) return entry.inflight;

  const inflight = computeLeaderboard(adminView)
    .then((value) => {
      leaderboardCache.set(adminView, {
        value,
        expiresAt: Date.now() + LEADERBOARD_CACHE_TTL_MS,
      });
      return value;
    })
    .catch((err) => {
      leaderboardCache.delete(adminView);
      throw err;
    });

  leaderboardCache.set(adminView, { expiresAt: 0, inflight });
  return inflight;
}

// Three bulk queries joined in memory, instead of two queries per team.
async function computeLeaderboard(adminView: boolean) {
  await connectDB();

  const teams = await Team.find({ status: { $ne: TeamStatus.DISQUALIFIED } }).lean();
  const teamIds = teams.map((t) => t._id);

  const [rounds, teamRounds, scores] = await Promise.all([
    Round.find().select('roundNumber').lean(),
    TeamRound.find({ teamId: { $in: teamIds } }).lean(),
    Score.find({ teamId: { $in: teamIds } }).lean(),
  ]);

  const roundNumberById = new Map(rounds.map((r) => [r._id.toString(), r.roundNumber]));

  const teamRoundsByTeam = new Map<string, typeof teamRounds>();
  for (const tr of teamRounds) {
    const key = tr.teamId.toString();
    const list = teamRoundsByTeam.get(key);
    if (list) list.push(tr);
    else teamRoundsByTeam.set(key, [tr]);
  }

  const scoreByTeamRound = new Map<string, (typeof scores)[number]>();
  for (const s of scores) {
    const key = `${s.teamId.toString()}:${s.roundId.toString()}`;
    if (!scoreByTeamRound.has(key)) scoreByTeamRound.set(key, s);
  }

  const leaderboard = teams.map((team) => {
    const teamKey = team._id.toString();

    let totalScore = 0;
    const roundScores: Record<number, number> = {};
    const roundStatus: Record<number, string> = {};

    for (const tr of teamRoundsByTeam.get(teamKey) ?? []) {
      const roundNumber = roundNumberById.get(tr.roundId.toString());
      if (!roundNumber) continue;

      // A detailed Score document (Round 3 and synced Round 1/2) wins over
      // the TeamRound's own running score.
      const detailedScore = scoreByTeamRound.get(`${teamKey}:${tr.roundId.toString()}`);
      const finalRoundScore = detailedScore ? detailedScore.totalScore : tr.score || 0;

      roundScores[roundNumber] = finalRoundScore;
      roundStatus[roundNumber] = tr.status;
      totalScore += finalRoundScore;
    }

    return {
      teamId: team._id,
      teamName: team.name,
      totalScore,
      roundScores,
      completionInfo: roundStatus,
      ...(adminView ? { teamCode: team.teamCode, status: team.status } : {}),
    };
  });

  // Sort by total score descending (stable, so ties keep team order)
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);

  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
}

export async function getTeamResults(teamId: string) {
  await connectDB();

  const team = await Team.findById(teamId).lean();
  if (!team) throw new Error('Team not found');

  const teamRounds = await TeamRound.find({ teamId }).populate('roundId').lean();
  const scores = await Score.find({ teamId }).lean();

  let totalScore = 0;
  const roundDetails = teamRounds.map(tr => {
    const round = tr.roundId as any;
    const detailedScore = scores.find(s => s.roundId.toString() === round._id.toString());
    const finalRoundScore = detailedScore ? detailedScore.totalScore : (tr.score || 0);
    totalScore += finalRoundScore;

    return {
      roundNumber: round?.roundNumber,
      status: tr.status,
      score: finalRoundScore,
      achievements: detailedScore ? {
        baseSolve: (detailedScore.breakdown?.baseSolve || 0) > 0,
        ouroboros: (detailedScore.breakdown?.ouroboros || 0) > 0,
        shortAndSweet: (detailedScore.breakdown?.shortAndSweet || 0) > 0,
        oneShotWonder: (detailedScore.breakdown?.oneShotWonder || 0) > 0,
      } : null,
      completedAt: tr.completedAt
    };
  });

  // Participants never see standings, so rank is not computed here. Doing so
  // required building the full leaderboard on every results poll.
  const rank: number | null = null;

  return {
    teamName: team.name,
    totalScore,
    rank,
    rounds: roundDetails,
    status: team.status
  };
}
