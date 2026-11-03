'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Hooks
import { useProblemState } from '@/hooks/useProblemState';
import { useCodingIDE } from '@/hooks/useCodingIDE';
import { useIntegrityMonitoring } from '@/hooks/useIntegrityMonitoring';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Types
import { RoundIDEConfig } from '@/types/problem';

// Services
import { problemsService } from '@/services/problems';

// Subcomponents
import ProblemPanel from '@/components/problems/ProblemPanel';
import EditorToolbar from './EditorToolbar';
import EditorStatus from './EditorStatus';
import EditorLockOverlay from './EditorLockOverlay';
import ConsolePanel from './ConsolePanel';
import CustomInput from './CustomInput';
import OutputPanel from './OutputPanel';
import VerdictPanel from '@/components/submissions/VerdictPanel';
import RunButton from './RunButton';
import SubmitButton from './SubmitButton';
import SubmissionController from '@/components/submissions/SubmissionController';
import SubmissionResult from '@/components/submissions/SubmissionResult';
import SubmissionHistory from '@/components/submissions/SubmissionHistory';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

// Round 2 Overlays
import ActiveMemberIndicator from '@/components/round2/ActiveMemberIndicator';
import RelayStatus from '@/components/round2/RelayStatus';
import StrictModeProtection from './StrictModeProtection';


const CodeEditor = dynamic(() => import('./CodeEditor'), { ssr: false });

interface CodingIDEProps {
  problemId: string;
  roundNumber: 1 | 2 | 3;
  mode: 'standard' | 'relay' | 'constraint';
  roundConfig?: RoundIDEConfig;
  onSolve?: (submissionId: string) => void;
  onError?: (error: string) => void;
  readOnly?: boolean;
  hideProblemStatement?: boolean;
  // Separate from readOnly: lets a member keep editing code while being
  // barred from submitting it (e.g. Round 2's Member 1, who writes code but
  // never submits — only Member 2 does).
  canSubmit?: boolean;
}

export default function CodingIDE({
  problemId,
  roundNumber,
  mode,
  roundConfig,
  onSolve,
  onError,
  readOnly = false,
  hideProblemStatement = false,
  canSubmit = true,
}: CodingIDEProps) {
  // 1. Fetch Problem State
  const {
    problem,
    isLoading: isProblemLoading,
    error: problemError,
    examples,
    constraints,
    isSolved,
    nextProblemId,
    prevProblemId,
    round3Status,
  } = useProblemState(problemId, roundNumber, !hideProblemStatement);

  // Round 1 (standard) and Round 3 (constraint) both allow editing/resubmitting
  // a solved problem — Round 1 to keep refining a solution, Round 3 to chase
  // the Short & Sweet / Recursion bonuses. Only relay mode (Round 2) locks
  // once solved; it primarily gates on turn/phase via the readOnly prop.
  const lockAfterSolve = mode === 'relay' && isSolved;

  // 2. Fetch IDE state
  const {
    code,
    setCode,
    language,
    setLanguage,
    customInput,
    setCustomInput,
    isRunning,
    isSubmitting,
    runResult,
    submitResult,
    submissionHistory,
    isLocked,
    errorMsg,
    run,
    submit,
    resetCode,
    fetchHistory,
  } = useCodingIDE(problemId, mode, roundNumber, roundConfig, readOnly || lockAfterSolve);

  // 3. UI and layout states
  const [splitWidth, setSplitWidth] = useState(40); // left panel width %
  const [isLgScreen, setIsLgScreen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'problem' | 'code'>('problem');
  const [consoleTab, setConsoleTab] = useState<'input' | 'output' | 'verdict'>('input');
  const [showFullVerdict, setShowFullVerdict] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);

  // 4. Integrity Monitoring
  useIntegrityMonitoring(true, problem?.id as string | undefined || null);
  const { strictMode, copyPasteBlocker, maxTabSwitches } = useGlobalSettings();

  const { data: integrityData, mutate: mutateIntegrity } = useSWR('/api/integrity/status', fetcher, {
    refreshInterval: 5000,
  });
  const isSubmissionsLocked = integrityData?.isSubmissionsLocked || false;
  const awaySessionCount = integrityData?.awaySessionCount || 0;
  const remainingSwitches = Math.max(0, maxTabSwitches - awaySessionCount);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    setIsBrowserFullscreen(!!document.fullscreenElement);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
    } catch (e) {
      console.error('Failed to enter fullscreen', e);
    }
  };

  // Relay time is display-only. The Round 2 page refreshes authoritative
  // server timestamps; this component never changes competition state.
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const isDraggingSplit = useRef(false);

  // Sync isLgScreen on mount and resize
  useEffect(() => {
    const handleResize = () => {
      setIsLgScreen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync the latest server-calculated remaining duration for display.
  useEffect(() => {
    if (mode === 'relay') {
      const initialMs = roundConfig?.forceSwitchAfterMs || 600_000;
      setTimeLeft(Math.floor(initialMs / 1000));
    }
  }, [mode, roundConfig?.forceSwitchAfterMs, roundConfig?.activeTeamMember]);


  // Auto-switch tabs when actions complete
  useEffect(() => {
    if (runResult) {
      setConsoleTab('output');
      setIsConsoleExpanded(true);
    }
  }, [runResult]);

  useEffect(() => {
    if (submitResult) {
      setConsoleTab('verdict');
      setShowFullVerdict(true);
      setIsConsoleExpanded(true);
    }
  }, [submitResult]);

  useEffect(() => {
    if (isRunning || isSubmitting) {
      setIsConsoleExpanded(true);
    }
  }, [isRunning, isSubmitting]);

  // Error logging prop trigger
  useEffect(() => {
    if (errorMsg && onError) {
      onError(errorMsg);
    }
  }, [errorMsg, onError]);

  // Resizing split panels
  const startSplitDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingSplit.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onSplitDrag);
    document.addEventListener('mouseup', stopSplitDrag);
  };

  const onSplitDrag = (e: MouseEvent) => {
    if (!isDraggingSplit.current) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    if (newWidth >= 20 && newWidth <= 80) {
      setSplitWidth(newWidth);
    }
  };

  const stopSplitDrag = () => {
    isDraggingSplit.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onSplitDrag);
    document.removeEventListener('mouseup', stopSplitDrag);
  };

  if (isProblemLoading) {
    return <LoadingState message="Loading problems details..." />;
  }

  if (problemError || !problem) {
    return <ErrorState message={problemError || 'Problem details could not be loaded.'} />;
  }

  if (strictMode && !isBrowserFullscreen) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-cream hd-dots text-ink p-4 sm:p-6 text-center z-50 fixed inset-0 overflow-y-auto">
        <div className="hd-card w-full max-w-lg px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center">
        <div className="mb-6 bg-warn-soft p-4 rounded-[var(--radius)] border-2 border-ink shadow-hd-sm">
          <svg className="w-10 h-10 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="hd-h2 mb-4">Fullscreen mode required</h1>
        <p className="text-charcoal leading-relaxed max-w-md mb-8">
          This contest requires you to remain in fullscreen mode. Exiting fullscreen, switching tabs, or minimizing the window will be recorded as suspicious activity.
        </p>
        <button
          onClick={requestFullscreen}
          className="hd-btn hd-btn-primary hd-btn-lg"
        >
          Enter Fullscreen to Continue
        </button>
        </div>
      </div>
    );
  }

  // Handle restoring code callback from history
  const handleRestoreCode = (restoredCode: string, restoredLang: string) => {
    setCode(restoredCode);
    setLanguage(restoredLang as any);
  };

  // Submission controller values bundle
  const controllerValue = {
    runResult,
    submitResult,
    isRunning,
    isSubmitting,
    submissionHistory,
    isLocked,
    errorMsg,
    run,
    submit: () => submit(onSolve),
    resetCode,
    fetchHistory,
  };

  if (integrityData?.isDisqualified) {
    return (
      <div className="fixed inset-0 z-[9999] bg-ink text-ink flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div className="bg-paper border-2 border-ink rounded-[var(--radius-lg)] p-6 sm:p-10 max-w-lg w-full text-center shadow-[7px_7px_0_var(--bad)]">
          <svg className="w-16 h-16 sm:w-20 sm:h-20 text-bad mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="hd-h1 text-ink mb-4">Team <span className="bg-bad text-paper px-[0.12em]">disqualified</span></h2>
          <p className="text-charcoal text-base sm:text-lg leading-relaxed">
            Your team has been disqualified from the competition by the administrators due to a violation of the event guidelines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SubmissionController value={controllerValue}>
      <StrictModeProtection
        strictMode={strictMode}
        isSubmissionsLocked={isSubmissionsLocked}
        remainingSwitches={remainingSwitches}
        onCheckStatus={async () => { await mutateIntegrity(); }}
      >
        {/* Main Page Layout Wrapper */}
        <div className={`flex flex-col h-screen lg:h-screen bg-cream select-none text-ink font-sans ${isFullscreen ? 'fixed inset-0 z-50 h-screen' : ''}`}>

        {/* Relay Round Info Header */}
        {mode === 'relay' && roundConfig && (
          <div className="flex flex-wrap justify-between items-center gap-2 px-3 sm:px-5 py-2 bg-paper border-b-2 border-ink">
            <ActiveMemberIndicator activeTeamMember={roundConfig.activeTeamMember} />
            <div className="hd-badge hd-badge-lilac">
              <span className="hd-dot hd-pulse-dot !w-1.5 !h-1.5" aria-hidden="true" />
              BLIND RELAY ACTIVE
            </div>
          </div>
        )}

        {/* Tab Switch Warning Banner */}
        {strictMode && remainingSwitches <= 2 && !isSubmissionsLocked && (
          <div className="bg-bad-soft border-b-2 border-ink px-3 sm:px-6 py-2 flex items-center justify-center gap-2 text-ink text-xs sm:text-sm font-medium text-center">
            <svg className="w-5 h-5 text-bad flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            WARNING: You have {remainingSwitches} tab switch{remainingSwitches === 1 ? '' : 'es'} remaining before your IDE is automatically locked.
          </div>
        )}

        <div className="flex flex-col lg:flex-row flex-grow overflow-hidden relative">
          {/* Left panel: Problem description */}
          <div
            style={{ width: isLgScreen ? `${splitWidth}%` : '100%' }}
            className={`${mobileTab === 'problem' ? 'flex' : 'hidden'} lg:flex flex-col h-full overflow-hidden`}
          >
            <ProblemPanel
              problem={problem}
              mode={mode}
              activeConstraints={roundConfig?.activeConstraints}
              hideProblemStatement={hideProblemStatement}
              prevProblemId={prevProblemId}
              nextProblemId={nextProblemId}
              submitResult={submitResult}
              submissionCount={submissionHistory.length}
              isSolved={isSolved}
              round3Status={round3Status}
              onNavigate={(id) => {
                // Navigate to next/prev problem using dynamic round path
                window.location.href = `/round-${roundNumber}/problem/${id}`;
              }}
              onUseAsInput={(text) => {
                setCustomInput(text);
                setConsoleTab('input');
              }}
              submissionHistoryChild={
                <SubmissionHistory
                  history={submissionHistory}
                  onRestoreCode={handleRestoreCode}
                />
              }
            />
          </div>

          {/* Separator Line */}
          <div
            onMouseDown={startSplitDrag}
            className="group hidden lg:flex items-center justify-center w-2 h-full cursor-col-resize bg-ink hover:bg-brand transition-colors z-20"
            title="Drag to resize panels"
          >
            <span className="h-10 w-[2px] rounded-full bg-cream/50 group-hover:bg-ink" aria-hidden="true" />
          </div>

          {/* Right panel: Editor & Output console */}
          <div
            style={{ width: isLgScreen ? `${100 - splitWidth}%` : '100%' }}
            className={`${mobileTab === 'code' ? 'flex' : 'hidden'} lg:flex flex-col h-full overflow-hidden bg-cream p-2 sm:p-3 gap-2 sm:gap-3`}
          >
            <div className="flex flex-col flex-grow relative overflow-hidden min-h-[220px] bg-[#121210] border-2 border-ink rounded-[var(--radius)] shadow-hd">
              <EditorToolbar
                language={language}
                onLanguageChange={setLanguage}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                onResetCode={() => { resetCode(); setEditorResetKey(k => k + 1); }}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(f => !f)}
                mode={mode}
              />

              {/* CodeEditor Wrapper with absolute overlay support */}
              <div className="flex-grow relative overflow-hidden bg-[#121210]">
                <CodeEditor
                  key={editorResetKey}
                  value={code}
                  onChange={setCode}
                  language={language}
                  fontSize={fontSize}
                  readOnly={isLocked}
                  copyPasteBlocker={copyPasteBlocker}
                  violations={submitResult?.constraintViolations}
                  onCursorChange={(line, col) => setCursorPosition({ line, column: col })}
                />

                {/* Lock Overlay */}
                <EditorLockOverlay
                  locked={isLocked}
                  mode={mode}
                  activeTeamMemberName={roundConfig?.activeTeamMember === 'member1' ? 'Member 1' : 'Member 2'}
                  readOnly={readOnly || lockAfterSolve}
                />
              </div>

              <EditorStatus
                language={language}
                cursorPosition={cursorPosition}
                submissionCount={submissionHistory.length}
                timerSeconds={mode === 'relay' ? timeLeft : undefined}
              />
            </div>

            {/* Bottom Console Panel */}
            {isConsoleExpanded && (
              <div className="flex-shrink-0">
                <ConsolePanel
                  activeTab={consoleTab}
                  onTabChange={setConsoleTab}
                  customInputChild={
                    <CustomInput
                      value={customInput}
                      onChange={setCustomInput}
                      exampleInput={examples[0]?.input || ''}
                    />
                  }
                  outputChild={
                    <OutputPanel runResult={runResult} isRunning={isRunning} errorMsg={errorMsg} />
                  }
                  verdictChild={
                    showFullVerdict ? (
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-2 px-1">
                          <span className="hd-label text-muted">Verdict Details</span>
                          <button
                            onClick={() => setShowFullVerdict(false)}
                            type="button"
                            className="font-mono text-[11px] font-bold text-ink underline underline-offset-2 decoration-brand decoration-2 hover:bg-brand-soft px-1.5 py-1 rounded cursor-pointer"
                          >
                            Back to Summary
                          </button>
                        </div>
                        <div className="flex-grow overflow-auto">
                          <VerdictPanel
                            submitResult={submitResult}
                            submissionCount={submissionHistory.length}
                            mode={mode}
                          />
                        </div>
                      </div>
                    ) : (
                      <SubmissionResult
                        submitResult={submitResult}
                        isSubmitting={isSubmitting}
                        onViewFullVerdict={() => setShowFullVerdict(true)}
                        mode={mode}
                        submissionCount={submissionHistory.length}
                      />
                    )
                  }
                />
              </div>
            )}

            {/* Bottom Action buttons bar (Run / Submit) */}
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 bg-paper border-2 border-ink rounded-[var(--radius)] select-none flex-shrink-0">
              <button
                onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                type="button"
                className="hd-btn hd-btn-sm hd-btn-square !min-h-10"
                aria-expanded={isConsoleExpanded}
              >
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isConsoleExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
                Console
              </button>

              {mode === 'relay' && (
                <div className="mx-auto">
                  <RelayStatus
                    activeTeamMember={roundConfig?.activeTeamMember || 'member1'}
                    timeLeftSeconds={timeLeft}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                <RunButton
                  onClick={run}
                  disabled={isRunning || isSubmitting || isLocked}
                  isRunning={isRunning}
                />
                <SubmitButton
                  onClick={() => submit(onSolve)}
                  disabled={isRunning || isSubmitting || isLocked || isSubmissionsLocked || (mode === 'relay' && !canSubmit)}
                  isSubmitting={isSubmitting}
                  isLocked={isLocked || isSubmissionsLocked || (mode === 'relay' && !canSubmit)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Switcher Footer */}
        <div className="flex lg:hidden bg-paper border-t-2 border-ink h-12 select-none">
          <button
            onClick={() => setMobileTab('problem')}
            className={`flex-1 flex items-center justify-center font-mono text-xs font-bold uppercase tracking-[0.14em] transition-colors border-r-2 border-ink ${
              mobileTab === 'problem' ? 'text-ink bg-brand' : 'text-muted hover:text-ink hover:bg-sand'
            }`}
          >
            Problem
          </button>
          <button
            onClick={() => setMobileTab('code')}
            className={`flex-1 flex items-center justify-center font-mono text-xs font-bold uppercase tracking-[0.14em] transition-colors ${
              mobileTab === 'code' ? 'text-ink bg-brand' : 'text-muted hover:text-ink hover:bg-sand'
            }`}
          >
            Code
          </button>
        </div>
      </div>
      </StrictModeProtection>
    </SubmissionController>
  );
}
