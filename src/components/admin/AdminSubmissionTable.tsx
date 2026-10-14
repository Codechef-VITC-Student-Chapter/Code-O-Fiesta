import React from 'react';

interface SubmissionData {
  id: string;
  teamName: string;
  userName: string;
  problemTitle: string;
  problemDifficulty: string;
  roundNumber: number;
  roundName: string;
  verdict: string;
  language: string;
  submittedAt: string;
  executionTime?: number;
  memory?: number;
  lineCount?: number;
}

interface AdminSubmissionTableProps {
  submissions: SubmissionData[];
}

export default function AdminSubmissionTable({
  submissions,
}: AdminSubmissionTableProps) {
  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'ACCEPTED':
        return (
          <span className="hd-badge hd-badge-ok">
            ACCEPTED
          </span>
        );
      case 'PENDING':
        return (
          <span className="hd-badge hd-badge-warn">
            <span className="hd-dot hd-pulse-dot" />
            PENDING
          </span>
        );
      case 'WRONG_ANSWER':
        return (
          <span className="hd-badge hd-badge-bad">
            WRONG ANSWER
          </span>
        );
      case 'COMPILATION_ERROR':
        return (
          <span className="hd-badge hd-badge-warn">
            COMPILATION ERROR
          </span>
        );
      case 'AST_CONSTRAINT_FAILED':
        return (
          <span className="hd-badge hd-badge-lilac">
            AST CONSTRAINT FAILED
          </span>
        );
      default:
        return (
          <span className="hd-badge hd-badge-bad">
            {verdict.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  return (
    <div className="hd-card overflow-hidden mb-6 min-w-0">
      <div className="px-5 py-4 border-b-2 border-ink bg-sand flex flex-wrap justify-between items-center gap-2">
        <h3 className="hd-label text-ink">
          LIVE SUBMISSIONS WATCHDOG
        </h3>
        <span className="hd-badge hd-badge-ok">
          <span className="hd-dot hd-pulse-dot" />
          Sync active
        </span>
      </div>

      <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
        <table className="hd-table min-w-max text-left">
          <thead>
            <tr className="select-none">
              <th className="pl-5">TEAM</th>
              <th>SUBMITTER</th>
              <th>PROBLEM</th>
              <th className="text-center">STAGE</th>
              <th>VERDICT</th>
              <th>LANG</th>
              <th className="pr-5 text-right">TIME</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted">
                  No submissions recorded yet.
                </td>
              </tr>
            ) : (
              submissions.map((sub) => {
                const formattedTime = new Date(sub.submittedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                });

                return (
                  <tr key={sub.id} className="transition-colors">
                    {/* Team Name */}
                    <td className="pl-5 font-bold text-ink uppercase whitespace-nowrap">
                      {sub.teamName}
                    </td>

                    {/* Submitter */}
                    <td className="text-charcoal whitespace-nowrap">
                      {sub.userName}
                    </td>

                    {/* Problem title */}
                    <td>
                      <div className="flex flex-col gap-0.5">
                        <strong className="text-ink font-bold">{sub.problemTitle}</strong>
                        <span className="text-[10px] text-muted">
                          Diff: {sub.problemDifficulty}
                        </span>
                      </div>
                    </td>

                    {/* Stage number */}
                    <td className="text-center text-charcoal whitespace-nowrap">
                      Round 0{sub.roundNumber}
                    </td>

                    {/* Verdict */}
                    <td>
                      {getVerdictBadge(sub.verdict)}
                    </td>

                    {/* Lang */}
                    <td className="text-muted uppercase">
                      {sub.language}
                    </td>

                    {/* Submitted At */}
                    <td className="pr-5 text-right text-muted whitespace-nowrap">
                      {formattedTime}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
