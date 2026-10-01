'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  sort: 'newest' | 'relevance';
  onChange: (sort: 'newest' | 'relevance') => void;
  className?: string;
}

const SORT_OPTIONS: { id: 'newest' | 'relevance'; label: string }[] = [
  { id: 'newest', label: 'Most Recent' },
  { id: 'relevance', label: 'Relevance' },
];

export const JobSort: React.FC<Props> = ({ sort, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = SORT_OPTIONS.find((opt) => opt.id === sort) || SORT_OPTIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={cn('relative inline-flex items-center text-xs sm:text-sm', className)}
    >
      <div className="flex items-center gap-1.5 mr-2 text-slate-500 font-medium">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">Sort:</span>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-2xs outline-none',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus-visible:outline-none',
          isOpen
            ? 'border-blue-500 text-slate-900 ring-2 ring-blue-500/10'
            : 'border-slate-200/90 text-slate-800 hover:border-slate-300 hover:bg-slate-50/60'
        )}
        style={{ outline: 'none' }}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
            isOpen ? 'rotate-180 text-blue-600' : ''
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1.5 w-40 rounded-xl bg-white border border-slate-200 shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
        >
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.id === sort;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-left font-medium transition-colors',
                  isSelected
                    ? 'text-blue-600 font-semibold bg-blue-50/60'
                    : 'text-slate-700 hover:bg-slate-50'
                )}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
