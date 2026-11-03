import { TeamMember } from '@/constants/event';

import { BadRequestError } from '../_lib/errors';

export type RegistrationMemberInput = {
  name: string;
  email: string;
};

export type RegistrationInput = {
  teamName: string;
  members: Record<TeamMember, RegistrationMemberInput>;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireString(value: unknown, label: string, min: number, max: number): string {
  if (typeof value !== 'string') {
    throw new BadRequestError(`${label} is required`);
  }

  // Collapse internal whitespace and strip control characters.
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();

  if (cleaned.length < min) {
    throw new BadRequestError(
      min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`,
    );
  }

  if (cleaned.length > max) {
    throw new BadRequestError(`${label} must be at most ${max} characters`);
  }

  return cleaned;
}

function parseMember(raw: unknown, label: string): RegistrationMemberInput {
  if (!raw || typeof raw !== 'object') {
    throw new BadRequestError(`${label} details are required`);
  }

  const { name, email } = raw as Record<string, unknown>;

  const cleanName = requireString(name, `${label} name`, 2, 80);
  const cleanEmail = requireString(email, `${label} email`, 1, 254).toLowerCase();

  if (!EMAIL_PATTERN.test(cleanEmail)) {
    throw new BadRequestError(`${label} email is not a valid email address`);
  }

  return { name: cleanName, email: cleanEmail };
}

export function validateRegistrationInput(body: unknown): RegistrationInput {
  if (!body || typeof body !== 'object') {
    throw new BadRequestError('Invalid request body');
  }

  const { teamName, member1, member2 } = body as Record<string, unknown>;

  const members = {
    [TeamMember.MEMBER_1]: parseMember(member1, 'Member 1'),
    [TeamMember.MEMBER_2]: parseMember(member2, 'Member 2'),
  };

  if (members.MEMBER_1.email === members.MEMBER_2.email) {
    throw new BadRequestError(
      'Member 1 and Member 2 must use different email addresses so each gets their own credentials',
    );
  }

  return {
    teamName: requireString(teamName, 'Team name', 2, 60),
    members,
  };
}

export function validateTeamMemberParam(value: unknown): TeamMember | null {
  if (value === undefined || value === null || value === '') return null;

  if (
    typeof value !== 'string' ||
    !Object.values(TeamMember).includes(value as TeamMember)
  ) {
    throw new BadRequestError('Invalid team member');
  }

  return value as TeamMember;
}
