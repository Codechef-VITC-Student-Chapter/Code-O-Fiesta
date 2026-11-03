'use client';

import React, { useState } from 'react';
import { SubmissionResult } from '@/types/submission';
import Modal from '@/components/common/Modal';

interface SubmissionHistoryProps {
  history: SubmissionResult[];
  onRestoreCode: (code: string, language: string) => void;
}

export default function SubmissionHistory({ history, onRestoreCode }: SubmissionHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSub, setSelectedSub] = useState<SubmissionResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="hd-badge hd-badge-ok">AC</span>;
      case 'wrong_answer':
        return <span className="hd-badge hd-badge-bad">WA</span>;
      case 'time_limit_exceeded':
        return <span className="hd-badge hd-badge-warn">TLE</span>;
      case 'compilation_error':
        return <span className="hd-badge hd-badge-bad">CE</span>;
      case 'runtime_error':
        return <span className="hd-badge hd-badge-bad">RE</span>;
      case 'pending':
      case 'processing':
        return <span className="hd-badge hd-badge-lilac">PENDING</span>;
      default:
        return <span className="hd-badge hd-badge-muted">ERR</span>;
    }
  };

  const handleRowClick = (sub: SubmissionResult) => {
    if (!sub.sourceCode) return;
    setSelectedSub(sub);
    setIsOpen(true);
  };

  const handleConfirmRestore = () => {
    if (selectedSub && selectedSub.sourceCode && selectedSub.language) {
      onRestoreCode(selectedSub.sourceCode, selectedSub.language as any);
    }
    setIsOpen(false);
    setSelectedSub(null);
  };

  return (
    <div className="flex flex-col h-full hd-card-flat overflow-hidden text-xs font-mono text-ink">
      <div className="overflow-x-auto">
        <table className="hd-table text-left [&_th]:!px-3 [&_th]:!py-2.5 [&_td]:!px-3 [&_td]:!py-2.5">
          <thead>
            <tr>
              <th className="py-2.5 px-3"># Attempt</th>
              <th className="py-2.5 px-3">Language</th>
              <th className="py-2.5 px-3">Verdict</th>
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Memory</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHistory.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted font-sans text-sm select-none">
                  No submissions found.
                </td>
              </tr>
            ) : (
              paginatedHistory.map((sub, idx) => {
                const attemptNumber = history.length - ((currentPage - 1) * itemsPerPage + idx);
                const isRestoreable = !!sub.sourceCode;

                return (
                  <tr
                    key={sub.id}
                    onClick={() => isRestoreable && handleRowClick(sub)}
                    className={`transition-colors duration-150 ${
                      isRestoreable ? 'cursor-pointer' : '[&:hover]:!bg-transparent'
                    }`}
                  >
                    <td className="font-bold text-ink tabular-nums">#{attemptNumber}</td>
                    <td className="text-charcoal uppercase">{sub.language || 'cpp'}</td>
                    <td>{getStatusBadge(sub.status)}</td>
                    <td className="text-charcoal tabular-nums whitespace-nowrap">{sub.timeMs !== undefined ? `${sub.timeMs} ms` : '-'}</td>
                    <td className="text-charcoal tabular-nums whitespace-nowrap">{sub.memoryKb !== undefined ? `${sub.memoryKb} KB` : '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center gap-2 px-3 py-2 border-t-2 border-ink mt-auto bg-sand select-none">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="hd-btn hd-btn-sm hd-btn-square"
          >
            ← Prev
          </button>
          <span className="hd-label text-charcoal tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="hd-btn hd-btn-sm hd-btn-square"
          >
            Next →
          </button>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Load Solution Code?"
        description="Are you sure you want to load this code back into the editor?"
        confirmText="Load Code"
        cancelText="Cancel"
        onConfirm={handleConfirmRestore}
        variant="default"
      >
        <p className="font-mono text-xs">
          Loading this past code will replace whatever is currently in your editor. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
