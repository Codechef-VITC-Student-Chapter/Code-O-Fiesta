// Builds every index declared in the Mongoose schemas on the live database.
// Run once after deploying schema changes: `npm run db:indexes`.
// Uses createIndexes() (additive) rather than syncIndexes(), so it never
// drops an index that exists in the database but not in the schema.
import connectDB from '../src/lib/db';

import GlobalSettings from '../src/models/GlobalSettings';
import IntegrityLog from '../src/models/IntegrityLog';
import ParticipantIntegrity from '../src/models/ParticipantIntegrity';
import Problem from '../src/models/Problem';
import RateLimit from '../src/models/RateLimit';
import Round from '../src/models/Round';
import Score from '../src/models/Score';
import Submission from '../src/models/Submission';
import Team from '../src/models/Team';
import TeamRound from '../src/models/TeamRound';
import User from '../src/models/User';

const models = [
  GlobalSettings,
  IntegrityLog,
  ParticipantIntegrity,
  Problem,
  RateLimit,
  Round,
  Score,
  Submission,
  Team,
  TeamRound,
  User,
];

async function main() {
  const mongoose = await connectDB();

  for (const model of models) {
    await model.createIndexes();
    const indexes = await model.collection.indexes();
    console.log(`${model.modelName}: ${indexes.map((i) => i.name).join(', ')}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
