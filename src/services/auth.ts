import { apiCall } from '@/lib/api';
import type { Team } from '@/types/team';

export interface LoginCredentials {
  teamId: string;
  pin: string;
}

export interface LoginResult {
  success: boolean;
  team?: Team;
  error?: string;
}

function buildMockTeam(teamId: string): Team {
  const name = teamId.trim() ? teamId.trim().toUpperCase() : 'CODEWARRIORS';
  return {
    id: name,
    name,
    status: 'ACTIVE',
    score: 0,
    members: [
      { id: 'MEMBER_1', name: 'Member 1', isActive: true, isConnected: true },
      { id: 'MEMBER_2', name: 'Member 2', isActive: false, isConnected: true },
    ],
  };
}

// Backend auth isn't wired up yet — used only when /api/auth/login is unreachable,
// so the wrong-credentials flow has something real to test against.
const DEMO_TEAM_ID = 'CODEWARRIORS';
const DEMO_PIN = '1234';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (data?.team) return { success: true, team: data.team as Team };
      throw new Error('Empty login response');
    } catch {
      const teamIdMatches = credentials.teamId.trim().toUpperCase() === DEMO_TEAM_ID;
      const pinMatches = credentials.pin.trim() === DEMO_PIN;

      if (teamIdMatches && pinMatches) {
        return { success: true, team: buildMockTeam(credentials.teamId) };
      }

      return {
        success: false,
        error: 'Invalid Team ID or PIN. Please check your credentials and try again.',
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await apiCall('/api/auth/logout', { method: 'POST' });
    } catch {
      // No-op — nothing to clean up against a stub backend.
    }
  },

  async me(): Promise<Team | null> {
    try {
      const data = await apiCall('/api/auth/me');
      return (data?.team as Team) ?? null;
    } catch {
      return null;
    }
  },
};
