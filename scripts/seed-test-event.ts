/**
 * Seeds a fresh database with everything needed to test the whole event:
 * 3 rounds, 12 Round 1 problems (3 per topic), 3 Round 2 problems,
 * 3 Round 3 problems, and 8 teams x 2 participants.
 *
 *   npm run db:seed-test
 *
 * Safe to re-run: rounds/problems/teams/users are upserted. Participant
 * passwords are regenerated on every run and the credentials CSV is rewritten
 * so it always matches the database. Existing admins are never touched.
 */
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import argon2 from 'argon2';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

import connectDB from '../src/lib/db';
import Problem from '../src/models/Problem';
import Round from '../src/models/Round';
import Team from '../src/models/Team';
import User from '../src/models/User';
import GlobalSettings from '../src/models/GlobalSettings';
import {
  ProblemDifficulty as D,
  ProblemTopic as T,
  Round1Path,
  RoundStatus,
  TeamMember,
  TeamStatus,
  UserRole,
} from '../src/constants/event';

const CSV_PATH = path.join(os.homedir(), 'Downloads', 'cof-test-db-credentials.local.csv');

type P = {
  title: string;
  description: string;
  difficulty: string;
  roundNumber: 1 | 2 | 3;
  topic: string;
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  cases: [string, string][]; // first 2 -> visible (also used as examples), rest hidden
  langs?: string[];
  r3?: { recursionRequired: boolean; noLoops: boolean; maxLines: number | null };
};

const BASE_LANGS = ['cpp', 'python', 'javascript'];
const R3_LANGS = ['cpp', 'python', 'javascript', 'java'];

const PROBLEMS: P[] = [
  // ---------------- Round 1: BASIC_MATH_NUMBERS ----------------
  {
    title: 'Sum of Digits', difficulty: D.EASY, roundNumber: 1, topic: T.BASIC_MATH_NUMBERS,
    description: 'Given a positive integer n, print the sum of its digits.',
    constraints: '1 <= n <= 10^9', inputFormat: 'A single integer n.', outputFormat: 'The digit sum of n.',
    cases: [['1234', '10'], ['7', '7'], ['99999', '45'], ['1000000000', '1']],
  },
  {
    title: 'Prime Check', difficulty: D.MEDIUM, roundNumber: 1, topic: T.BASIC_MATH_NUMBERS,
    description: 'Given an integer n, print YES if n is prime, otherwise print NO.',
    constraints: '1 <= n <= 10^6', inputFormat: 'A single integer n.', outputFormat: 'YES or NO.',
    cases: [['7', 'YES'], ['10', 'NO'], ['1', 'NO'], ['97', 'YES'], ['1000000', 'NO']],
  },
  {
    title: 'GCD and LCM', difficulty: D.HARD, roundNumber: 1, topic: T.BASIC_MATH_NUMBERS,
    description: 'Given two positive integers a and b, print their GCD and LCM separated by a space.',
    constraints: '1 <= a, b <= 10^9', inputFormat: 'Two integers a and b on one line.', outputFormat: 'GCD and LCM separated by a space.',
    cases: [['12 18', '6 36'], ['7 5', '1 35'], ['100 75', '25 300'], ['1000000000 1000000000', '1000000000 1000000000']],
  },
  // ---------------- Round 1: STRING_MANIPULATION ----------------
  {
    title: 'Reverse a String', difficulty: D.EASY, roundNumber: 1, topic: T.STRING_MANIPULATION,
    description: 'Given a lowercase word, print it reversed.',
    constraints: '1 <= |s| <= 10^5, lowercase letters only', inputFormat: 'A single word s.', outputFormat: 'The reversed word.',
    cases: [['hello', 'olleh'], ['abc', 'cba'], ['racecar', 'racecar'], ['programming', 'gnimmargorp']],
  },
  {
    title: 'Palindrome Word', difficulty: D.MEDIUM, roundNumber: 1, topic: T.STRING_MANIPULATION,
    description: 'Given a lowercase word, print YES if it reads the same forwards and backwards, otherwise NO.',
    constraints: '1 <= |s| <= 10^5, lowercase letters only', inputFormat: 'A single word s.', outputFormat: 'YES or NO.',
    cases: [['level', 'YES'], ['hello', 'NO'], ['a', 'YES'], ['abca', 'NO'], ['noon', 'YES']],
  },
  {
    title: 'Most Frequent Letter', difficulty: D.HARD, roundNumber: 1, topic: T.STRING_MANIPULATION,
    description: 'Given a lowercase word, print the letter that appears most often. If several letters tie, print the alphabetically smallest.',
    constraints: '1 <= |s| <= 10^5, lowercase letters only', inputFormat: 'A single word s.', outputFormat: 'A single letter.',
    cases: [['banana', 'a'], ['zzyy', 'y'], ['mississippi', 'i'], ['aabbbc', 'b'], ['programming', 'g']],
  },
  // ---------------- Round 1: ARRAYS_LOGIC ----------------
  {
    title: 'Maximum Element', difficulty: D.EASY, roundNumber: 1, topic: T.ARRAYS_LOGIC,
    description: 'Given an array of integers, print its largest element.',
    constraints: '1 <= n <= 10^5, -10^9 <= a[i] <= 10^9', inputFormat: 'First line n, second line n integers.', outputFormat: 'The maximum element.',
    cases: [['5\n3 9 2 7 1', '9'], ['3\n-5 -2 -9', '-2'], ['1\n42', '42'], ['4\n1 1 1 1', '1']],
  },
  {
    title: 'Pairs With Given Sum', difficulty: D.MEDIUM, roundNumber: 1, topic: T.ARRAYS_LOGIC,
    description: 'Count the pairs of indices i < j such that a[i] + a[j] equals the target.',
    constraints: '2 <= n <= 2000, -10^6 <= a[i] <= 10^6', inputFormat: 'First line n and target, second line n integers.', outputFormat: 'The number of pairs.',
    cases: [['4 9\n2 7 11 15', '1'], ['5 6\n1 5 3 3 3', '4'], ['3 10\n1 2 3', '0'], ['4 4\n2 2 2 2', '6']],
  },
  {
    title: 'Maximum Subarray Sum', difficulty: D.HARD, roundNumber: 1, topic: T.ARRAYS_LOGIC,
    description: 'Find the largest sum of a non-empty contiguous subarray.',
    constraints: '1 <= n <= 2 * 10^5, -10^9 <= a[i] <= 10^9', inputFormat: 'First line n, second line n integers.', outputFormat: 'The maximum subarray sum.',
    cases: [['9\n-2 1 -3 4 -1 2 1 -5 4', '6'], ['4\n1 2 3 4', '10'], ['3\n-1 -2 -3', '-1'], ['5\n5 -9 6 -2 3', '7']],
  },
  // ---------------- Round 1: LOOPS_PATTERNS ----------------
  {
    title: 'Right Triangle of Stars', difficulty: D.EASY, roundNumber: 1, topic: T.LOOPS_PATTERNS,
    description: 'Given n, print a right triangle of n rows where row i has i asterisks.',
    constraints: '1 <= n <= 50', inputFormat: 'A single integer n.', outputFormat: 'n lines of asterisks.',
    cases: [['3', '*\n**\n***'], ['1', '*'], ['4', '*\n**\n***\n****'], ['5', '*\n**\n***\n****\n*****']],
  },
  {
    title: 'FizzBuzz', difficulty: D.MEDIUM, roundNumber: 1, topic: T.LOOPS_PATTERNS,
    description: 'For each number from 1 to n print Fizz if divisible by 3, Buzz if divisible by 5, FizzBuzz if divisible by both, otherwise the number.',
    constraints: '1 <= n <= 1000', inputFormat: 'A single integer n.', outputFormat: 'n lines.',
    cases: [['5', '1\n2\nFizz\n4\nBuzz'], ['3', '1\n2\nFizz'],
      ['15', '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz']],
  },
  {
    title: 'Collatz Steps', difficulty: D.HARD, roundNumber: 1, topic: T.LOOPS_PATTERNS,
    description: 'Starting from n, repeat: if n is even divide by 2, otherwise set n = 3n + 1, until n becomes 1. Print the number of steps taken.',
    constraints: '1 <= n <= 10^6', inputFormat: 'A single integer n.', outputFormat: 'The number of steps.',
    cases: [['6', '8'], ['1', '0'], ['7', '16'], ['27', '111']],
  },
  // ---------------- Round 2 ----------------
  {
    title: 'Factorial', difficulty: D.EASY, roundNumber: 2, topic: T.BASIC_MATH_NUMBERS,
    description: 'Given n, print n! (n factorial).',
    constraints: '0 <= n <= 12', inputFormat: 'A single integer n.', outputFormat: 'The value of n!.',
    cases: [['5', '120'], ['0', '1'], ['10', '3628800'], ['12', '479001600']],
  },
  {
    title: 'Second Largest Distinct', difficulty: D.MEDIUM, roundNumber: 2, topic: T.ARRAYS_LOGIC,
    description: 'Given an array with at least two distinct values, print the second largest distinct value.',
    constraints: '2 <= n <= 10^5', inputFormat: 'First line n, second line n integers.', outputFormat: 'The second largest distinct value.',
    cases: [['5\n4 1 9 9 7', '7'], ['4\n5 5 3 1', '3'], ['3\n10 20 30', '20'], ['5\n-1 -5 -3 -1 -2', '-2']],
  },
  {
    title: 'Common Prefix Length', difficulty: D.HARD, roundNumber: 2, topic: T.STRING_MANIPULATION,
    description: 'Given two lowercase words, print the length of their longest common prefix.',
    constraints: '1 <= |a|, |b| <= 10^5', inputFormat: 'Two words a and b separated by a space.', outputFormat: 'An integer.',
    cases: [['flower flow', '4'], ['abc xyz', '0'], ['code codeforces', '4'], ['a a', '1']],
  },
  // ---------------- Round 3 (recursion, no loops, line limit) ----------------
  {
    title: 'Recursive Factorial', difficulty: D.EASY, roundNumber: 3, topic: T.BASIC_MATH_NUMBERS,
    description: 'Compute n! using recursion only. Loops are not allowed.',
    constraints: '0 <= n <= 20', inputFormat: 'A single integer n.', outputFormat: 'The value of n!.',
    cases: [['5', '120'], ['0', '1'], ['10', '3628800'], ['20', '2432902008176640000']],
    langs: R3_LANGS, r3: { recursionRequired: true, noLoops: true, maxLines: 15 },
  },
  {
    title: 'Recursive Fibonacci', difficulty: D.MEDIUM, roundNumber: 3, topic: T.ARRAYS_LOGIC,
    description: 'Print the nth Fibonacci number (F0 = 0, F1 = 1) using recursion only. Loops are not allowed.',
    constraints: '0 <= n <= 30', inputFormat: 'A single integer n.', outputFormat: 'F(n).',
    cases: [['5', '5'], ['0', '0'], ['10', '55'], ['20', '6765'], ['30', '832040']],
    langs: R3_LANGS, r3: { recursionRequired: true, noLoops: true, maxLines: 20 },
  },
  {
    title: 'Recursive Power Mod', difficulty: D.HARD, roundNumber: 3, topic: T.BASIC_MATH_NUMBERS,
    description: 'Compute a^b modulo 1000000007 using recursion only. Loops are not allowed.',
    constraints: '1 <= a <= 10^9, 0 <= b <= 10^9', inputFormat: 'Two integers a and b on one line.', outputFormat: 'a^b mod 1000000007.',
    cases: [['2 10', '1024'], ['3 4', '81'], ['7 0', '1'], ['2 30', '73741817'], ['10 9', '1000000000']],
    langs: R3_LANGS, r3: { recursionRequired: true, noLoops: true, maxLines: 20 },
  },
];

const ROUNDS = [
  {
    roundNumber: 1, name: 'The Path of Fate', durationSeconds: 3600,
    configuration: {
      problemCount: 3,
      round1: {
        paths: [
          { shape: Round1Path.TRIANGLE, topic: T.BASIC_MATH_NUMBERS },
          { shape: Round1Path.CIRCLE, topic: T.STRING_MANIPULATION },
          { shape: Round1Path.SQUARE, topic: T.ARRAYS_LOGIC },
          { shape: Round1Path.STAR, topic: T.LOOPS_PATTERNS },
        ],
      },
    },
  },
  {
    roundNumber: 2, name: 'Blind Relay', durationSeconds: 3600,
    configuration: {
      problemCount: 3,
      round2: { questionCount: 3, member1DurationSeconds: 300, handoverDurationSeconds: 60, member2DurationSeconds: 300 },
    },
  },
  {
    roundNumber: 3, name: 'Constraint Crucible', durationSeconds: 3600,
    configuration: {
      problemCount: 3,
      round3: { basePoints: 50, ouroborosPoints: 30, shortAndSweetPoints: 20, oneShotWonderPoints: 40, maxLines: 30 },
    },
  },
];

const TEAMS = [
  ['TEAM-01', 'Byte Benders', 'Aarav Menon', 'Diya Raghavan'],
  ['TEAM-02', 'Null Pointers', 'Kabir Iyer', 'Ananya Nair'],
  ['TEAM-03', 'Stack Smashers', 'Rohan Das', 'Meera Pillai'],
  ['TEAM-04', 'Heap Heroes', 'Vihaan Rao', 'Ishita Kapoor'],
  ['TEAM-05', 'Segfault Squad', 'Arjun Nambiar', 'Kavya Reddy'],
  ['TEAM-06', 'Binary Bandits', 'Siddharth Jain', 'Tara Menon'],
  ['TEAM-07', 'Lambda Legends', 'Yash Gupta', 'Nisha Verma'],
  ['TEAM-08', 'Syntax Sorcerers', 'Dev Malhotra', 'Riya Shah'],
] as const;

const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
const genPassword = () => crypto.randomBytes(15).toString('base64url');

async function main() {
  const mongoose = await connectDB();
  console.log(`Connected to database "${mongoose.connection.db!.databaseName}"`);

  for (const r of ROUNDS) {
    await Round.findOneAndUpdate(
      { roundNumber: r.roundNumber },
      { $set: { ...r, status: RoundStatus.UPCOMING, startedAt: null, endsAt: null, pausedAt: null } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }
  console.log(`Rounds: ${ROUNDS.length} upserted (UPCOMING)`);

  for (const p of PROBLEMS) {
    const visible = p.cases.slice(0, 2).map(([input, expectedOutput]) => ({ input, expectedOutput }));
    const hidden = p.cases.slice(2).map(([input, expectedOutput]) => ({ input, expectedOutput }));
    const doc = {
      title: p.title, description: p.description, difficulty: p.difficulty, roundNumber: p.roundNumber,
      topic: p.topic, constraints: p.constraints, inputFormat: p.inputFormat, outputFormat: p.outputFormat,
      examples: visible.map((c) => ({ input: c.input, output: c.expectedOutput, explanation: `For input ${JSON.stringify(c.input)} the answer is ${JSON.stringify(c.expectedOutput)}.` })),
      visibleTestCases: visible,
      hiddenTestCases: hidden,
      allowedLanguages: p.langs ?? BASE_LANGS,
      round3Constraints: p.r3 ?? { recursionRequired: false, noLoops: false, maxLines: null },
      isActive: true,
    };
    await Problem.findOneAndUpdate({ title: p.title, roundNumber: p.roundNumber }, { $set: doc }, { upsert: true, setDefaultsOnInsert: true });
  }
  const perRound = [1, 2, 3].map((n) => `R${n}=${PROBLEMS.filter((p) => p.roundNumber === n).length}`).join(' ');
  console.log(`Problems: ${PROBLEMS.length} upserted (${perRound})`);

  if (!(await GlobalSettings.findOne())) {
    await GlobalSettings.create({ strictMode: false, copyPasteBlocker: false, maxTabSwitches: 10 });
    console.log('GlobalSettings: created (strictMode off for easy testing)');
  }

  const rows = ['team_code,team_name,email,member_slot,name,password,is_captain'];
  for (const [teamCode, teamName, name1, name2] of TEAMS) {
    const team = await Team.findOneAndUpdate(
      { teamCode },
      { $set: { name: teamName, status: TeamStatus.ACTIVE } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const email = `${teamCode.toLowerCase().replace('-', '')}@test.codeofiesta.dev`;
    const memberIds = [];
    for (const [slot, name] of [[TeamMember.MEMBER_1, name1], [TeamMember.MEMBER_2, name2]] as const) {
      const password = genPassword();
      const user = await User.findOneAndUpdate(
        { teamId: team._id, teamMember: slot },
        { $set: { name, email, passwordHash: await argon2.hash(password), role: UserRole.PARTICIPANT, teamId: team._id, teamMember: slot, isActive: true, sessionId: null } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      memberIds.push(user._id);
      rows.push([teamCode, q(teamName), email, slot, q(name), password, String(slot === TeamMember.MEMBER_1)].join(','));
    }
    await Team.updateOne({ _id: team._id }, { $set: { members: memberIds, captainId: memberIds[0] } });
  }
  fs.writeFileSync(CSV_PATH, rows.join('\n') + '\n', { mode: 0o600 });
  console.log(`Teams: ${TEAMS.length}, participants: ${TEAMS.length * 2}`);
  console.log(`Credentials CSV: ${CSV_PATH}`);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { default: mongoose } = await import('mongoose');
    await mongoose.disconnect();
  });
