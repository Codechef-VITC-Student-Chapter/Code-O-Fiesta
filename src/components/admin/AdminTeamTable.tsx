import React, { useState } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  teamMember: string;
}

interface RoundProgress {
  roundNumber: number;
  roundName: string;
  status: string;
  score: number;
  completedAt: string | null;
}

interface TeamData {
  id: string;
  name: string;
  status: string;
  members: Member[];
  totalScore: number;
  roundProgress: RoundProgress[];
  captainId?: string;
}

interface AdminTeamTableProps {
  teams: TeamData[];
  onUpdateStatus: (teamId: string, status: string) => void;
  onOverrideScore: (teamId: string, roundNumber: number, score: number) => void;
}

export default function AdminTeamTable({
  teams,
  onUpdateStatus,
  onOverrideScore,
}: AdminTeamTableProps) {
  const [scoreOverrideModal, setScoreOverrideModal] = useState<{
    teamId: string;
    teamName: string;
    roundNumber: number;
    currentScore: number;
  } | null>(null);

  const [overrideValue, setOverrideValue] = useState<string>('');

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreOverrideModal) {
      const score = parseInt(overrideValue, 10);
      if (!isNaN(score) && score >= 0) {
        onOverrideScore(scoreOverrideModal.teamId, scoreOverrideModal.roundNumber, score);
        setScoreOverrideModal(null);
        setOverrideValue('');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="hd-badge hd-badge-ok">
            ACTIVE
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="hd-badge hd-badge-lilac">
            COMPLETED
          </span>
        );
      case 'DISQUALIFIED':
        return (
          <span className="hd-badge hd-badge-bad">
            DISQUALIFIED
          </span>
        );
      default:
        return (
          <span className="hd-badge hd-badge-muted">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="hd-card overflow-hidden mb-6 min-w-0">
      {/* Header section */}
      <div className="px-5 py-4 border-b-2 border-ink bg-sand flex flex-wrap justify-between items-center gap-2">
        <h3 className="hd-label text-ink">
          TEAMS MANAGEMENT DIRECTORY
        </h3>
        <span className="hd-badge hd-badge-ink">
          Total Registered: {teams.length}
        </span>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="hd-table min-w-max text-left">
          <thead>
            <tr className="select-none">
              <th className="pl-5">TEAM NAME</th>
              <th>CAPTAIN</th>
              <th>STATUS</th>
              <th className="text-center">R1 SCORE</th>
              <th className="text-center">R2 SCORE</th>
              <th className="text-center">R3 SCORE</th>
              <th className="text-right">TOTAL SCORE</th>
              <th className="pr-5 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {teams.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted">
                  No teams found in database.
                </td>
              </tr>
            ) : (
              teams.map((team) => {
                const r1 = team.roundProgress.find((r) => r.roundNumber === 1);
                const r2 = team.roundProgress.find((r) => r.roundNumber === 2);
                const r3 = team.roundProgress.find((r) => r.roundNumber === 3);

                const captain = team.members.find((m) => m.role === 'PARTICIPANT' && m.teamMember === 'MEMBER_1');

                return (
                  <tr key={team.id} className="transition-colors">
                    {/* Team Name & Members list */}
                    <td className="pl-5">
                      <div className="flex flex-col gap-0.5">
                        <strong className="text-ink font-bold uppercase tracking-wide">
                          {team.name}
                        </strong>
                        <span className="text-[10px] text-muted lowercase max-w-[16rem] truncate">
                          {team.members.map((m) => m.name).join(', ')}
                        </span>
                      </div>
                    </td>

                    {/* Captain */}
                    <td className="text-charcoal whitespace-nowrap">
                      {captain ? captain.name : 'Not set'}
                    </td>

                    {/* Status badge */}
                    <td>
                      {getStatusBadge(team.status)}
                    </td>

                    {/* Round 1 Score */}
                    <td className="text-center">
                      <button
                        onClick={() =>
                          setScoreOverrideModal({
                            teamId: team.id,
                            teamName: team.name,
                            roundNumber: 1,
                            currentScore: r1?.score || 0,
                          })
                        }
                        className="inline-flex items-center justify-center min-w-[2.75rem] min-h-[2.25rem] px-2.5 rounded-md bg-paper border-2 border-ink font-bold text-ink hover:bg-lilac hover:shadow-hd-sm transition-colors cursor-pointer"
                      >
                        {r1 ? r1.score : 0}
                      </button>
                    </td>

                    {/* Round 2 Score */}
                    <td className="text-center">
                      <button
                        onClick={() =>
                          setScoreOverrideModal({
                            teamId: team.id,
                            teamName: team.name,
                            roundNumber: 2,
                            currentScore: r2?.score || 0,
                          })
                        }
                        className="inline-flex items-center justify-center min-w-[2.75rem] min-h-[2.25rem] px-2.5 rounded-md bg-paper border-2 border-ink font-bold text-ink hover:bg-lilac hover:shadow-hd-sm transition-colors cursor-pointer"
                      >
                        {r2 ? r2.score : 0}
                      </button>
                    </td>

                    {/* Round 3 Score */}
                    <td className="text-center">
                      <button
                        onClick={() =>
                          setScoreOverrideModal({
                            teamId: team.id,
                            teamName: team.name,
                            roundNumber: 3,
                            currentScore: r3?.score || 0,
                          })
                        }
                        className="inline-flex items-center justify-center min-w-[2.75rem] min-h-[2.25rem] px-2.5 rounded-md bg-paper border-2 border-ink font-bold text-ink hover:bg-lilac hover:shadow-hd-sm transition-colors cursor-pointer"
                      >
                        {r3 ? r3.score : 0}
                      </button>
                    </td>

                    {/* Total Score */}
                    <td className="text-right font-display text-ink text-base">
                      {team.totalScore}
                    </td>

                    {/* Action buttons */}
                    <td className="pr-5 text-right">
                      {team.status === 'DISQUALIFIED' ? (
                        <button
                          onClick={() => onUpdateStatus(team.id, 'ACTIVE')}
                          className="hd-btn hd-btn-ok hd-btn-sm"
                        >
                          REINSTATE
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(team.id, 'DISQUALIFIED')}
                          className="hd-btn hd-btn-danger hd-btn-sm"
                        >
                          DISQUALIFY
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. SCORE OVERRIDE MODAL */}
      {scoreOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 px-4">
          <div className="hd-card shadow-hd-lg w-full max-w-sm p-6 relative hd-pop">
            <h4 className="hd-h3 text-ink mb-3 border-b-2 border-ink pb-3 break-words">
              Override score: {scoreOverrideModal.teamName}
            </h4>
            <p className="text-xs font-mono text-charcoal mb-4 leading-relaxed">
              Stage: Round 0{scoreOverrideModal.roundNumber} score override. Current registered score: <strong>{scoreOverrideModal.currentScore} PTS</strong>.
            </p>

            <form onSubmit={handleOverrideSubmit} className="flex flex-col gap-4">
              <div>
                <label className="hd-field-label">
                  New Score Value (Points)
                </label>
                <input
                  type="number"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  placeholder={`e.g. ${scoreOverrideModal.currentScore + 20}`}
                  required
                  className="hd-input font-mono"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScoreOverrideModal(null);
                    setOverrideValue('');
                  }}
                  className="hd-btn hd-btn-sm"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="hd-btn hd-btn-primary hd-btn-sm"
                >
                  APPLY OVERRIDE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
