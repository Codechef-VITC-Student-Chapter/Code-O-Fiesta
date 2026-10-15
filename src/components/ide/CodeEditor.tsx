'use client';

import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { SupportedLanguage } from '@/types/problem';
import { ConstraintViolation } from '@/types/submission';
import { usePasteBlocker } from '@/hooks/usePasteBlocker';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: SupportedLanguage;
  fontSize?: number;
  readOnly?: boolean;
  copyPasteBlocker?: boolean;
  violations?: ConstraintViolation[];
  onCursorChange?: (line: number, column: number) => void;
}

export interface CodeEditorRef {
  getValue: () => string;
  setValue: (val: string) => void;
}

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(({
  value,
  onChange,
  language,
  fontSize = 14,
  readOnly = false,
  copyPasteBlocker = false,
  violations = [],
  onCursorChange,
}, ref) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  useImperativeHandle(ref, () => ({
    getValue: () => {
      return editorRef.current ? editorRef.current.getValue() : '';
    },
    setValue: (val: string) => {
      if (editorRef.current) {
        editorRef.current.setValue(val);
      }
    },
  }));

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('fiesta-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#121210',
        'editorGutter.background': '#0d0d0b',
        'editor.lineHighlightBackground': '#1f1e1a',
        'editor.lineHighlightBorder': '#1f1e1a',
        'editor.selectionBackground': '#ff503447',
        'editor.inactiveSelectionBackground': '#ff503424',
        'editorCursor.foreground': '#ff5034',
        'editorLineNumber.foreground': '#5d5b52',
        'editorLineNumber.activeForeground': '#f5f3e9',
        'editorIndentGuide.background1': '#2a2924',
        'editorWidget.background': '#1a1916',
        'editorWidget.border': '#3a3830',
        'editorSuggestWidget.background': '#1a1916',
        'editorSuggestWidget.border': '#3a3830',
        'editorSuggestWidget.selectedBackground': '#2e2b25',
        'scrollbarSlider.background': '#f5f3e926',
        'scrollbarSlider.hoverBackground': '#f5f3e940',
        'scrollbarSlider.activeBackground': '#ff503466',
      },
    });
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track cursor position
    editor.onDidChangeCursorPosition((e: any) => {
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber, e.position.column);
      }
    });

    applyDecorations();
  };

  const applyDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    // Clear existing decorations
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);

    if (!violations || violations.length === 0) return;

    const newDecorations = violations.map((v) => ({
      range: new monaco.Range(v.line, 1, v.line, 100),
      options: {
        isWholeLine: true,
        inlineClassName: 'text-decoration-squiggly-red',
        glyphMarginClassName: 'gutter-violation-icon',
        glyphMarginHoverMessage: { value: v.message },
        hoverMessage: { value: v.message },
      },
    }));

    decorationsRef.current = editor.deltaDecorations([], newDecorations);
  };

  useEffect(() => {
    applyDecorations();
  }, [violations]);

  // Blocked pastes show a small in-page notice. A browser alert() is not used:
  // it steals focus, which the screen protection reads as leaving the window.
  const [pasteNotice, setPasteNotice] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  usePasteBlocker(
    () => editorRef.current?.getDomNode(),
    copyPasteBlocker,
    () => {
      setPasteNotice(true);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
      noticeTimer.current = setTimeout(() => setPasteNotice(false), 2500);
    },
  );

  useEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  }, []);

  const MONACO_LANGUAGE_MAP: Record<SupportedLanguage, string> = {
    c: 'c',
    cpp: 'cpp',
    java: 'java',
    python: 'python',
    go: 'go',
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      <style dangerouslySetInnerHTML={{ __html: `
        .text-decoration-squiggly-red {
          text-decoration: underline #ff5034 wavy !important;
        }
        .gutter-violation-icon {
          background: #ff5034;
          border-radius: 50%;
          width: 8px !important;
          height: 8px !important;
          margin-left: auto;
          margin-right: auto;
          margin-top: 5px;
          box-shadow: 0 0 0 2px #121210;
        }
      `}} />
      {pasteNotice && (
        <div
          role="status"
          aria-live="polite"
          className="absolute right-3 top-3 z-10 rounded border-2 border-ink bg-paper px-3 py-2 font-mono text-xs font-bold text-ink shadow-hd-sm"
        >
          Pasting code is disabled in this contest.
        </div>
      )}
      <Editor
        height="100%"
        language={MONACO_LANGUAGE_MAP[language]}
        value={value}
        onChange={(val) => onChange(val || '')}
        theme="fiesta-dark"
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        options={{
          glyphMargin: true,
          fontFamily: "var(--font-jetbrains-mono), 'JetBrains Mono', monospace",
          fontSize: fontSize,
          lineNumbers: 'on',
          minimap: { enabled: false },
          wordWrap: 'off',
          readOnly: readOnly,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          contextmenu: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';
export default CodeEditor;
