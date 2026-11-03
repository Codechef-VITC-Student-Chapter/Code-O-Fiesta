import argon2 from 'argon2';
import crypto from 'crypto';
import type { Types } from 'mongoose';

import { TeamMember, TeamStatus, UserRole } from '@/constants/event';
import connectDB from '@/lib/db';
import IntegrityLog from '@/models/IntegrityLog';
import ParticipantIntegrity from '@/models/ParticipantIntegrity';
import Score from '@/models/Score';
import Submission from '@/models/Submission';
import Team from '@/models/Team';
import TeamRound from '@/models/TeamRound';
import User from '@/models/User';

import { BadRequestError, ConflictError, NotFoundError } from '../_lib/errors';
import { escapeHtml, isMailConfigured, sendMail } from '../_lib/mailer';

import type { RegistrationInput } from '../_validators/registration';

export type EmailStatus = 'SENT' | 'FAILED' | 'NOT_CONFIGURED';

export type RegisteredMember = {
  teamMember: TeamMember;
  name: string;
  email: string;
  emailStatus?: EmailStatus;
  emailError?: string;
};

export type RegisteredTeam = {
  id: string;
  teamCode: string;
  name: string;
  status: string;
  createdAt: string | null;
  members: RegisteredMember[];
};

const MEMBER_LABEL: Record<TeamMember, string> = {
  [TeamMember.MEMBER_1]: 'Member 1',
  [TeamMember.MEMBER_2]: 'Member 2',
};

// No look-alike characters (0/O, 1/l/I) — credentials get read off an email
// and typed by hand on event day.
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const TEAM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomString(alphabet: string, length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[crypto.randomInt(alphabet.length)];
  }
  return out;
}

export function generatePassword(): string {
  for (;;) {
    const candidate = randomString(PASSWORD_ALPHABET, 12);
    if (/[A-Z]/.test(candidate) && /[a-z]/.test(candidate) && /[0-9]/.test(candidate)) {
      return candidate;
    }
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return (error as { code?: number })?.code === 11000;
}

function credentialsEmail(args: {
  name: string;
  teamName: string;
  teamMember: TeamMember;
  email: string;
  password: string;
  loginUrl: string;
}) {
  const { name, teamName, teamMember, email, password, loginUrl } = args;
  const slot = MEMBER_LABEL[teamMember];

  const text = [
    `Hi ${name},`,
    '',
    `You are registered for Hackday as ${slot} of team "${teamName}".`,
    '',
    'Your login credentials:',
    `  Login page: ${loginUrl}`,
    `  Email:      ${email}`,
    `  Password:   ${password}`,
    `  Role:       ${slot}  (choose this on the login page)`,
    '',
    'Please keep these credentials private and do not share them. Your session',
    'is limited to one device at a time.',
    '',
    '— Hackday organizers',
  ].join('\n');

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f1e7;font-family:Arial,Helvetica,sans-serif;color:#15120d;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:2px solid #15120d;border-radius:12px;">
      <tr><td style="padding:24px 28px;">
        <h1 style="margin:0 0 12px;font-size:20px;">You're registered for Hackday</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.5;">Hi ${escapeHtml(name)}, you are <strong>${slot}</strong> of team <strong>${escapeHtml(teamName)}</strong>.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f6f1e7;border-radius:8px;font-size:14px;">
          <tr><td style="padding:10px 14px;color:#6b6558;width:90px;">Email</td><td style="padding:10px 14px;font-family:Consolas,monospace;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:10px 14px;color:#6b6558;">Password</td><td style="padding:10px 14px;font-family:Consolas,monospace;font-weight:bold;">${escapeHtml(password)}</td></tr>
          <tr><td style="padding:10px 14px;color:#6b6558;">Role</td><td style="padding:10px 14px;">${slot} <span style="color:#6b6558;">(choose this on the login page)</span></td></tr>
        </table>
        <p style="margin:20px 0;"><a href="${escapeHtml(loginUrl)}" style="display:inline-block;background:#15120d;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;font-size:14px;">Go to login</a></p>
        <p style="margin:0;font-size:12px;color:#6b6558;line-height:1.5;">Keep these credentials private. Your session is limited to one device at a time.</p>
      </td></tr>
    </table>
  </body>
</html>`;

  return {
    to: email,
    subject: `Your Hackday login credentials — ${teamName}`,
    text,
    html,
  };
}

async function deliverCredentials(args: {
  name: string;
  teamName: string;
  teamMember: TeamMember;
  email: string;
  password: string;
  loginUrl: string;
}): Promise<{ emailStatus: EmailStatus; emailError?: string }> {
  if (!isMailConfigured()) {
    return { emailStatus: 'NOT_CONFIGURED' };
  }

  try {
    await sendMail(credentialsEmail(args));
    return { emailStatus: 'SENT' };
  } catch (error) {
    console.error('Failed to send credentials email', {
      to: args.email,
      error: error instanceof Error ? error.message : error,
    });
    return {
      emailStatus: 'FAILED',
      emailError: error instanceof Error ? error.message.slice(0, 200) : 'Unknown error',
    };
  }
}

async function createTeamWithUniqueCode(name: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      return await Team.create({
        teamCode: `COF-${randomString(TEAM_CODE_ALPHABET, 5)}`,
        name,
        members: [],
        captainId: null,
        status: TeamStatus.ACTIVE,
      });
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
    }
  }

  throw new Error('Could not allocate a unique team code');
}

export async function registerTeam(
  input: RegistrationInput,
  loginUrl: string,
): Promise<RegisteredTeam> {
  await connectDB();

  const emails = [input.members.MEMBER_1.email, input.members.MEMBER_2.email];

  const takenEmail = await User.findOne({ email: { $in: emails } })
    .select('email')
    .lean();

  if (takenEmail) {
    throw new ConflictError(`${takenEmail.email} is already registered`);
  }

  const takenName = await Team.findOne({ name: input.teamName })
    .collation({ locale: 'en', strength: 2 })
    .select('_id')
    .lean();

  if (takenName) {
    throw new ConflictError(`Team name "${input.teamName}" is already taken`);
  }

  const passwords: Record<TeamMember, string> = {
    [TeamMember.MEMBER_1]: generatePassword(),
    [TeamMember.MEMBER_2]: generatePassword(),
  };

  const team = await createTeamWithUniqueCode(input.teamName);

  const created: { _id: Types.ObjectId; teamMember: TeamMember }[] = [];

  try {
    for (const slot of [TeamMember.MEMBER_1, TeamMember.MEMBER_2]) {
      const member = input.members[slot];
      const user = await User.create({
        name: member.name,
        email: member.email,
        passwordHash: await argon2.hash(passwords[slot]),
        role: UserRole.PARTICIPANT,
        teamId: team._id,
        teamMember: slot,
        isActive: true,
      });
      created.push({ _id: user._id, teamMember: slot });
    }

    team.members = created.map((c) => c._id);
    team.captainId = created[0]._id;
    await team.save();
  } catch (error) {
    // Don't leave a half-registered team behind.
    await User.deleteMany({ teamId: team._id });
    await Team.deleteOne({ _id: team._id });
    throw error;
  }

  const results = await Promise.all(
    ([TeamMember.MEMBER_1, TeamMember.MEMBER_2] as const).map(async (slot) => {
      const member = input.members[slot];
      const delivery = await deliverCredentials({
        name: member.name,
        teamName: team.name,
        teamMember: slot,
        email: member.email,
        password: passwords[slot],
        loginUrl,
      });
      return { teamMember: slot, name: member.name, email: member.email, ...delivery };
    }),
  );

  return {
    id: String(team._id),
    teamCode: team.teamCode,
    name: team.name,
    status: team.status ?? TeamStatus.ACTIVE,
    createdAt: team.get('createdAt')?.toISOString?.() ?? null,
    members: results,
  };
}

export async function listRegistrations(): Promise<RegisteredTeam[]> {
  await connectDB();

  const teams = await Team.find({}).sort({ createdAt: -1 }).limit(2000).lean();
  const users = await User.find({
    role: UserRole.PARTICIPANT,
    teamId: { $in: teams.map((t) => t._id) },
  })
    .select('name email teamMember teamId')
    .lean();

  const byTeam = new Map<string, RegisteredMember[]>();
  for (const user of users) {
    const key = String(user.teamId);
    const list = byTeam.get(key) ?? [];
    list.push({
      teamMember: user.teamMember as TeamMember,
      name: user.name,
      email: user.email,
    });
    byTeam.set(key, list);
  }

  return teams.map((team) => ({
    id: String(team._id),
    teamCode: team.teamCode,
    name: team.name,
    status: team.status ?? TeamStatus.ACTIVE,
    createdAt: (team as { createdAt?: Date }).createdAt?.toISOString() ?? null,
    members: (byTeam.get(String(team._id)) ?? []).sort((a, b) =>
      a.teamMember.localeCompare(b.teamMember),
    ),
  }));
}

/**
 * Issues a fresh password to one or both members of a team and emails it.
 * Passwords are stored hashed, so an existing one can never be re-sent — this
 * rotates it instead (and signs the member out of any active session).
 */
export async function resendCredentials(
  teamId: string,
  teamMember: TeamMember | null,
  loginUrl: string,
): Promise<RegisteredMember[]> {
  if (!isMailConfigured()) {
    throw new BadRequestError('Mail is not configured on the server (SMTP_* env vars missing)');
  }

  await connectDB();

  const team = await Team.findById(teamId).lean();
  if (!team) throw new NotFoundError('Team not found');

  const users = await User.find({
    teamId: team._id,
    role: UserRole.PARTICIPANT,
    ...(teamMember ? { teamMember } : {}),
  });

  if (users.length === 0) throw new NotFoundError('No matching team member found');

  return Promise.all(
    users.map(async (user) => {
      const password = generatePassword();
      user.passwordHash = await argon2.hash(password);
      user.sessionId = null;
      await user.save();

      const delivery = await deliverCredentials({
        name: user.name,
        teamName: team.name,
        teamMember: user.teamMember as TeamMember,
        email: user.email,
        password,
        loginUrl,
      });

      return {
        teamMember: user.teamMember as TeamMember,
        name: user.name,
        email: user.email,
        ...delivery,
      };
    }),
  );
}

/** Removes a registration made by mistake — only while the team has no activity. */
export async function deleteRegistration(teamId: string): Promise<void> {
  await connectDB();

  const team = await Team.findById(teamId).select('_id').lean();
  if (!team) throw new NotFoundError('Team not found');

  const [rounds, submissions, scores] = await Promise.all([
    TeamRound.exists({ teamId: team._id }),
    Submission.exists({ teamId: team._id }),
    Score.exists({ teamId: team._id }),
  ]);

  if (rounds || submissions || scores) {
    throw new ConflictError('This team already has event activity and cannot be removed');
  }

  const userIds = (await User.find({ teamId: team._id }).select('_id').lean()).map((u) => u._id);

  await Promise.all([
    ParticipantIntegrity.deleteMany({ userId: { $in: userIds } }),
    IntegrityLog.deleteMany({ userId: { $in: userIds } }),
  ]);
  await User.deleteMany({ _id: { $in: userIds }, role: UserRole.PARTICIPANT });
  await Team.deleteOne({ _id: team._id });
}
