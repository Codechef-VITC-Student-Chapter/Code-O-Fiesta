'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ConsolePanelProps {
  activeTab: 'input' | 'output' | 'verdict';
  onTabChange: (tab: 'input' | 'output' | 'verdict') => void;
  customInputChild: React.ReactNode;
  outputChild: React.ReactNode;
  verdictChild: React.ReactNode;
}

export default function ConsolePanel({
  activeTab,
  onTabChange,
  customInputChild,
  outputChild,
  verdictChild,
}: ConsolePanelProps) {
  const [height, setHeight] = useState(240);
  const isDraggingRef = useRef(false);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const onDrag = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    
    // We want the height of the console panel to increase as we drag UP.
    // e.clientY decreases as we move UP.
    // So the height is calculated relative to the viewport height or container.
    const newHeight = window.innerHeight - e.clientY - 40; // Subtract padding/offset
    if (newHeight >= 120 && newHeight <= 500) {
      setHeight(newHeight);
    }
  };

  const stopDrag = () => {
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
  };

  useEffect(() => {
    return () => {
      // Clean up in case of unmount mid-drag
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', stopDrag);
    };
  }, []);

  return (
    <div
      style={{ height: `${height}px` }}
      className="flex flex-col bg-paper text-ink border-2 border-ink rounded-[var(--radius)] overflow-hidden relative transition-all duration-75"
    >
      {/* Resizing Handle on Top Edge */}
      <div
        onMouseDown={startDrag}
        className="group absolute top-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-brand/40 transition-colors z-20 flex justify-center"
        title="Drag to resize console"
      >
        <span className="mt-[3px] h-[3px] w-10 rounded-full bg-ink/25 group-hover:bg-ink" aria-hidden="true" />
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between px-2 sm:px-3 border-b-2 border-ink bg-sand h-11 select-none">
        <div className="flex gap-1 h-full items-end">
          {(['input', 'output', 'verdict'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
            
            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                type="button"
                className={`-mb-[2px] min-h-9 px-3 sm:px-4 py-2 border-2 border-b-0 rounded-t-[var(--radius-sm)] font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'border-ink bg-paper text-ink shadow-[inset_0_3px_0_var(--brand)]'
                    : 'border-transparent text-muted hover:text-ink hover:bg-paper/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow p-3 sm:p-4 overflow-auto font-mono text-ink">
        {activeTab === 'input' && customInputChild}
        {activeTab === 'output' && outputChild}
        {activeTab === 'verdict' && verdictChild}
      </div>
    </div>
  );
}
