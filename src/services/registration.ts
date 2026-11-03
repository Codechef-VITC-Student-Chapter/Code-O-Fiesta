import { apiCall } from '@/lib/api';

export type TeamMemberSlot = 'MEMBER_1' | 'MEMBER_2';
export type EmailStatus = 'SENT' | 'FAILED' | 'NOT_CONFIGURED';

export interface RegisteredMember {
  teamMember: TeamMemberSlot;
  name: string;
  email: string;
  emailStatus?: EmailStatus;
  emailError?: string;
}

export interface RegisteredTeam {
  id: string;
  teamCode: string;
  name: string;
  status: string;
  createdAt: string | null;
  members: RegisteredMember[];
}

export interface RegistrationPayload {
  teamName: string;
  member1: { name: string; email: string };
  member2: { name: string; email: string };
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const registrationService = {
  list(): Promise<{ teams: RegisteredTeam[]; mailConfigured: boolean }> {
    return apiCall('/api/admin/registrations', { credentials: 'include', cache: 'no-store' });
  },

  register(payload: RegistrationPayload): Promise<{ team: RegisteredTeam }> {
    return apiCall('/api/admin/registrations', {
      method: 'POST',
      credentials: 'include',
      headers: JSON_HEADERS,
      body: JSON.stringify(payload),
    });
  },

  resend(teamId: string, teamMember?: TeamMemberSlot): Promise<{ members: RegisteredMember[] }> {
    return apiCall(`/api/admin/registrations/${teamId}/resend`, {
      method: 'POST',
      credentials: 'include',
      headers: JSON_HEADERS,
      body: JSON.stringify(teamMember ? { teamMember } : {}),
    });
  },

  remove(teamId: string): Promise<{ success: true }> {
    return apiCall(`/api/admin/registrations/${teamId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
};
