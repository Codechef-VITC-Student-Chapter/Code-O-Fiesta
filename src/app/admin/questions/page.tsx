'use client';
import AuthGuard from '@/app/guards/AuthGuard';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminNav from '@/components/admin/AdminNav';
import LoadingState from '@/components/common/LoadingState';
import ErrorState from '@/components/common/ErrorState';

import { ProblemDifficulty, ProblemTopic } from '@/constants/event';

// Basic interfaces for the UI
interface TestCase {
  input: string;
  expectedOutput: string;
}

interface Example {
  input: string;
  output: string;
  explanation: string;
}

interface ProblemData {
  _id?: string;
  title: string;
  description: string;
  difficulty: string;
  roundNumber: number;
  topic: string;
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  examples: Example[];
  visibleTestCases: TestCase[];
  hiddenTestCases: TestCase[];
  allowedLanguages: string[];
  round3Constraints: {
    recursionRequired: boolean;
    noLoops: boolean;
    maxLines: number | null;
  };
  cpuTimeLimit: number;
  memoryLimit: number;
  isActive: boolean;
}

const defaultProblem: ProblemData = {
  title: '',
  description: '',
  difficulty: ProblemDifficulty.EASY,
  roundNumber: 1,
  topic: ProblemTopic.BASIC_MATH_NUMBERS,
  constraints: '',
  inputFormat: '',
  outputFormat: '',
  examples: [],
  visibleTestCases: [],
  hiddenTestCases: [],
  allowedLanguages: ['cpp', 'c', 'java', 'python', 'javascript', 'go'],
  round3Constraints: {
    recursionRequired: false,
    noLoops: false,
    maxLines: null,
  },
  cpuTimeLimit: 2.0,
  memoryLimit: 128000,
  isActive: true,
};

function AdminQuestionsContent() {
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<ProblemData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filters
  const [roundFilter, setRoundFilter] = useState<string>('all');

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const url = roundFilter === 'all' 
        ? '/api/admin/problems' 
        : `/api/admin/problems?roundNumber=${roundFilter}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch problems');
      }
      
      const data = await res.json();
      setProblems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [roundFilter]);

  const handleOpenModal = (problem?: ProblemData) => {
    if (problem) {
      setEditingProblem({ ...problem });
    } else {
      setEditingProblem({ ...defaultProblem });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProblem(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem) return;
    
    setIsSaving(true);
    try {
      const isNew = !editingProblem._id;
      const url = isNew 
        ? '/api/admin/problems' 
        : `/api/admin/problems/${editingProblem._id}`;
      
      const method = isNew ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProblem),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save problem');
      }
      
      await fetchProblems();
      handleCloseModal();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;
    
    try {
      const res = await fetch(`/api/admin/problems/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete problem');
      
      await fetchProblems();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Helper to handle nested state changes
  const updateEditingProblem = (field: keyof ProblemData, value: any) => {
    setEditingProblem(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateRound3Constraints = (field: keyof ProblemData['round3Constraints'], value: any) => {
    setEditingProblem(prev => {
      if (!prev) return null;
      return {
        ...prev,
        round3Constraints: {
          ...prev.round3Constraints,
          [field]: value
        }
      };
    });
  };

  const updateArrayItem = (arrayField: 'examples' | 'visibleTestCases' | 'hiddenTestCases', index: number, field: string, value: any) => {
    setEditingProblem(prev => {
      if (!prev) return null;
      const newArray = [...prev[arrayField]] as any[];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayField]: newArray };
    });
  };

  const addArrayItem = (arrayField: 'examples' | 'visibleTestCases' | 'hiddenTestCases') => {
    setEditingProblem(prev => {
      if (!prev) return null;
      const newItem = arrayField === 'examples' 
        ? { input: '', output: '', explanation: '' }
        : { input: '', expectedOutput: '' };
      
      return { ...prev, [arrayField]: [...prev[arrayField], newItem] as any };
    });
  };

  const removeArrayItem = (arrayField: 'examples' | 'visibleTestCases' | 'hiddenTestCases', index: number) => {
    setEditingProblem(prev => {
      if (!prev) return null;
      const newArray = [...prev[arrayField]];
      newArray.splice(index, 1);
      return { ...prev, [arrayField]: newArray };
    });
  };

  if (loading && problems.length === 0) {
    return (
      <AdminLayout title="Question Manager" nav={<AdminNav />}>
        <LoadingState message="Loading problems..." mode="full-page" />
      </AdminLayout>
    );
  }

  if (error && problems.length === 0) {
    return (
      <AdminLayout title="Question Manager" nav={<AdminNav />}>
        <ErrorState
          title="Failed to load problems"
          message={error}
          onRetry={fetchProblems}
          variant="connection"
        />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Question Manager" 
      subtitle="Manage contest problems, test cases, and constraints"
      nav={<AdminNav />}
      actions={
        <button
          onClick={() => handleOpenModal()}
          className="hd-btn hd-btn-primary hd-btn-sm"
        >
          + Create Problem
        </button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <div className="hd-card-flat flex flex-wrap gap-3 sm:gap-4 items-center p-4">
          <span className="hd-label text-ink">Filter by Round:</span>
          <select 
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value)}
            aria-label="Filter by Round" className="hd-input w-auto min-w-[10rem] text-sm"
          >
            <option value="all">All Rounds</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3</option>
          </select>
        </div>

        {/* Problems List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map((problem) => (
            <div key={problem._id} className="hd-card hd-card-interactive p-5 pl-6 flex flex-col gap-3 relative overflow-hidden group min-w-0">
              <div className={`absolute top-0 left-0 w-1.5 h-full border-r-2 border-ink ${problem.isActive ? 'bg-ok' : 'bg-sand'}`} />
              
              <div className="flex justify-between items-start gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="hd-badge hd-badge-ink">
                    R{problem.roundNumber}
                  </span>
                  <span className={`hd-badge ${
                    problem.difficulty === 'EASY' ? 'hd-badge-ok' :
                    problem.difficulty === 'MEDIUM' ? 'hd-badge-warn' :
                    'hd-badge-bad'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(problem)} aria-label="Edit problem" className="hd-icon-btn">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(problem._id!)} aria-label="Delete problem" className="hd-icon-btn hover:!bg-bad-soft hover:text-bad">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <h3 className="hd-h3 mt-1 break-words">{problem.title}</h3>
              <p className="text-sm text-charcoal line-clamp-2">{problem.description}</p>
              
              <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-1.5 text-xs font-mono text-charcoal">
                  <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  {problem.visibleTestCases.length + problem.hiddenTestCases.length} Tests
                </div>
                {problem.roundNumber === 3 && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-charcoal">
                    <svg className="w-3.5 h-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    AST Modifiers
                  </div>
                )}
              </div>
            </div>
          ))}
          {problems.length === 0 && (
            <div className="col-span-full py-12 px-4 text-center text-charcoal hd-card-flat hd-dots">
              No problems found. Create one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-ink/60">
          <div className="bg-paper border-2 border-ink rounded-[var(--radius-lg)] w-full max-w-5xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden shadow-hd-lg hd-pop">
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b-2 border-ink bg-sand">
              <h2 className="hd-h2 text-ink">
                {editingProblem._id ? 'Edit Problem' : 'Create Problem'}
              </h2>
              <button onClick={handleCloseModal} aria-label="Close" className="hd-icon-btn shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form id="problem-form" onSubmit={handleSave} className="flex flex-col gap-8">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="hd-h3 border-b-2 border-ink pb-2">Basic info</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="hd-field-label mb-0">Title</label>
                      <input 
                        required
                        type="text" 
                        value={editingProblem.title} 
                        onChange={(e) => updateEditingProblem('title', e.target.value)}
                        className="hd-input"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="hd-field-label mb-0">Topic</label>
                      <select 
                        value={editingProblem.topic} 
                        onChange={(e) => updateEditingProblem('topic', e.target.value)}
                        className="hd-input"
                      >
                        <option value="BASIC_MATH_NUMBERS">BASIC_MATH_NUMBERS (△ Triangle)</option>
                        <option value="STRING_MANIPULATION">STRING_MANIPULATION (○ Circle)</option>
                        <option value="ARRAYS_LOGIC">ARRAYS_LOGIC (□ Square)</option>
                        <option value="LOOPS_PATTERNS">LOOPS_PATTERNS (☆ Star)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="hd-field-label mb-0">Difficulty</label>
                      <select 
                        value={editingProblem.difficulty} 
                        onChange={(e) => updateEditingProblem('difficulty', e.target.value)}
                        className="hd-input"
                      >
                        {Object.values(ProblemDifficulty).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="hd-field-label mb-0">Round Number</label>
                      <select 
                        value={editingProblem.roundNumber} 
                        onChange={(e) => updateEditingProblem('roundNumber', parseInt(e.target.value, 10))}
                        className="hd-input"
                      >
                        <option value={1}>Round 1</option>
                        <option value={2}>Round 2</option>
                        <option value={3}>Round 3</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      id="isActive"
                      checked={editingProblem.isActive}
                      onChange={(e) => updateEditingProblem('isActive', e.target.checked)}
                      className="w-5 h-5 shrink-0 accent-[var(--brand)] cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-ink cursor-pointer">Active (Visible in contest)</label>
                  </div>
                </div>

                {/* Resource Limits */}
                <div className="space-y-4">
                  <h3 className="hd-h3 border-b-2 border-ink pb-2">Resource limits (Judge0)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="hd-field-label mb-0">CPU Time Limit (Seconds)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        value={editingProblem.cpuTimeLimit ?? 2.0} 
                        onChange={(e) => updateEditingProblem('cpuTimeLimit', e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="hd-input"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="hd-field-label mb-0">Memory Limit (KB)</label>
                      <input 
                        type="number"
                        required
                        value={editingProblem.memoryLimit ?? 128000} 
                        onChange={(e) => updateEditingProblem('memoryLimit', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        className="hd-input"
                      />
                      <span className="text-xs font-mono text-muted">Default: 128000 KB (128 MB)</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="hd-h3 border-b-2 border-ink pb-2">Problem statement</h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="hd-field-label mb-0">Description (Markdown)</label>
                    <textarea 
                      required
                      value={editingProblem.description} 
                      onChange={(e) => updateEditingProblem('description', e.target.value)}
                      rows={6}
                      className="hd-input font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="hd-field-label mb-0">Input Format</label>
                      <textarea 
                        required
                        value={editingProblem.inputFormat} 
                        onChange={(e) => updateEditingProblem('inputFormat', e.target.value)}
                        rows={3}
                        className="hd-input font-mono text-sm"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="hd-field-label mb-0">Output Format</label>
                      <textarea 
                        required
                        value={editingProblem.outputFormat} 
                        onChange={(e) => updateEditingProblem('outputFormat', e.target.value)}
                        rows={3}
                        className="hd-input font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="hd-field-label mb-0">Constraints</label>
                    <textarea 
                      required
                      value={editingProblem.constraints} 
                      onChange={(e) => updateEditingProblem('constraints', e.target.value)}
                      rows={2}
                      className="hd-input font-mono text-sm"
                    />
                  </div>
                </div>

                {/* Round 3 Constraints (Conditional) */}
                {editingProblem.roundNumber === 3 && (
                  <div className="space-y-4 p-4 bg-lilac-soft border-2 border-ink rounded-xl">
                    <h3 className="hd-h3 border-b-2 border-ink pb-2">Round 3 AST constraints</h3>
                    
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={editingProblem.round3Constraints.recursionRequired}
                          onChange={(e) => updateRound3Constraints('recursionRequired', e.target.checked)}
                          className="w-5 h-5 shrink-0 accent-[var(--brand)] cursor-pointer"
                        />
                        <span className="text-sm font-bold text-ink">Require Recursion (Ouroboros)</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={editingProblem.round3Constraints.noLoops}
                          onChange={(e) => updateRound3Constraints('noLoops', e.target.checked)}
                          className="w-5 h-5 shrink-0 accent-[var(--brand)] cursor-pointer"
                        />
                        <span className="text-sm font-bold text-ink">Disallow Loops (for, while, do-while)</span>
                      </label>

                      <div className="flex flex-col gap-1.5 mt-2 max-w-xs">
                        <label className="hd-field-label mb-0">Max Line Limit (Short & Sweet)</label>
                        <input 
                          type="number"
                          placeholder="e.g. 50" 
                          value={editingProblem.round3Constraints.maxLines || ''} 
                          onChange={(e) => updateRound3Constraints('maxLines', e.target.value ? parseInt(e.target.value, 10) : null)}
                          className="hd-input"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Examples */}
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b-2 border-ink pb-2">
                    <h3 className="hd-h3">Examples (visible to user)</h3>
                    <button type="button" onClick={() => addArrayItem('examples')} className="hd-btn hd-btn-lilac hd-btn-sm">
                      + Add Example
                    </button>
                  </div>
                  
                  {editingProblem.examples.map((ex, idx) => (
                    <div key={idx} className="p-4 bg-sand border-2 border-[var(--border-subtle)] rounded-xl flex flex-col gap-3 relative group">
                      <button type="button" onClick={() => removeArrayItem('examples', idx)} aria-label="Remove example" className="hd-icon-btn absolute top-2 right-2 hover:text-bad">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div className="flex flex-col gap-1.5">
                          <label className="hd-label text-muted">Input</label>
                          <textarea value={ex.input} onChange={(e) => updateArrayItem('examples', idx, 'input', e.target.value)} rows={2} required className="hd-input min-h-0 px-2.5 py-2 text-sm font-mono" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="hd-label text-muted">Output</label>
                          <textarea value={ex.output} onChange={(e) => updateArrayItem('examples', idx, 'output', e.target.value)} rows={2} required className="hd-input min-h-0 px-2.5 py-2 text-sm font-mono" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="hd-label text-muted">Explanation</label>
                        <textarea value={ex.explanation} onChange={(e) => updateArrayItem('examples', idx, 'explanation', e.target.value)} rows={1} required className="hd-input min-h-0 px-2.5 py-2 text-sm font-mono" />
                      </div>
                    </div>
                  ))}
                  {editingProblem.examples.length === 0 && <p className="text-sm text-muted italic">No examples added.</p>}
                </div>

                {/* Visible Test Cases */}
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b-2 border-ink pb-2">
                    <h3 className="hd-h3">Visible test cases (run before submit)</h3>
                    <button type="button" onClick={() => addArrayItem('visibleTestCases')} className="hd-btn hd-btn-lilac hd-btn-sm">
                      + Add Visible Test Case
                    </button>
                  </div>
                  
                  {editingProblem.visibleTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-sand border-2 border-[var(--border-subtle)] rounded-xl flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start relative group pr-12">
                      <button type="button" onClick={() => removeArrayItem('visibleTestCases', idx)} aria-label="Remove visible test case" className="hd-icon-btn absolute top-2 right-2 hover:text-bad">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <label className="hd-label text-muted">Input</label>
                        <textarea value={tc.input} onChange={(e) => updateArrayItem('visibleTestCases', idx, 'input', e.target.value)} rows={2} required className="hd-input min-h-0 px-2.5 py-2 text-sm font-mono" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <label className="hd-label text-muted">Expected Output</label>
                        <textarea value={tc.expectedOutput} onChange={(e) => updateArrayItem('visibleTestCases', idx, 'expectedOutput', e.target.value)} rows={2} required className="hd-input min-h-0 px-2.5 py-2 text-sm font-mono" />
                      </div>
                    </div>
                  ))}
                  {editingProblem.visibleTestCases.length === 0 && <p className="text-sm text-muted italic">No visible test cases added.</p>}
                </div>

                {/* Hidden Test Cases */}
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b-2 border-ink pb-2">
                    <h3 className="hd-h3">Hidden test cases (used for grading)</h3>
                    <button type="button" onClick={() => addArrayItem('hiddenTestCases')} className="hd-btn hd-btn-lilac hd-btn-sm">
                      + Add Hidden Test Case
                    </button>
                  </div>
                  
                  {editingProblem.hiddenTestCases.map((tc, idx) => (
                    <div key={idx} className="p-3 bg-sand border-2 border-[var(--border-subtle)] rounded-xl flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start relative group pr-12">
                      <button type="button" onClick={() => removeArrayItem('hiddenTestCases', idx)} aria-label="Remove hidden test case" className="hd-icon-btn absolute top-2 right-2 hover:text-bad">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <label className="hd-label text-muted">Input</label>
                        <textarea value={tc.input} onChange={(e) => updateArrayItem('hiddenTestCases', idx, 'input', e.target.value)} rows={2} required className="hd-input min-h-0 px-2.5 py-2 text-sm font-mono" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                        <label className="hd-label text-muted">Expected Output</label>
                        <textarea value={tc.expectedOutput} onChange={(e) => updateArrayItem('hiddenTestCases', idx, 'expectedOutput', e.target.value)} rows={2} required className="hd-input min-h-0 px-2.5 py-2 text-sm font-mono" />
                      </div>
                    </div>
                  ))}
                  {editingProblem.hiddenTestCases.length === 0 && <p className="text-sm text-muted italic">No hidden test cases added.</p>}
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-4 border-t-2 border-ink bg-sand flex flex-wrap justify-end gap-3">
              <button 
                type="button"
                onClick={handleCloseModal}
                disabled={isSaving}
                className="hd-btn hd-btn-ghost"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="problem-form"
                disabled={isSaving}
                className="hd-btn hd-btn-primary"
              >
                {isSaving ? 'Saving...' : 'Save Problem'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function AdminQuestionsPage() {
  return (
    <AuthGuard requiredRole="ADMIN">
      <AdminQuestionsContent />
    </AuthGuard>
  );
}
