'use client';

import React from 'react';

interface CustomInputProps {
  value: string;
  onChange: (value: string) => void;
  exampleInput?: string;
}

export default function CustomInput({ value, onChange, exampleInput }: CustomInputProps) {
  const handleUseExample = () => {
    if (exampleInput) {
      onChange(exampleInput);
    }
  };

  return (
    <div className="flex flex-col h-full gap-2 relative">
      <div className="flex justify-between items-center px-1">
        <span className="hd-label text-muted">
          Custom test input
        </span>
        {exampleInput && (
          <button
            onClick={handleUseExample}
            type="button"
            className="font-mono text-[11px] font-bold text-ink underline underline-offset-2 decoration-brand decoration-2 hover:bg-brand-soft px-1.5 py-1 rounded cursor-pointer"
          >
            Use example input
          </button>
        )}
      </div>

      <div className="relative flex-grow">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter custom input here..."
          className="w-full h-full min-h-[100px] resize-none font-code text-[13px] leading-relaxed p-3 rounded-[var(--radius-sm)] bg-[#121210] text-cream placeholder:text-faint border-2 border-ink outline-none focus:shadow-[3px_3px_0_var(--brand)] transition-shadow"
        />
        <div className="absolute bottom-2 right-2.5 text-[10px] font-mono text-faint select-none">
          {value.length} chars
        </div>
      </div>
    </div>
  );
}
