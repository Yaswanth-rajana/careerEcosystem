'use client';

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface MentorSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const MentorSearch: React.FC<MentorSearchProps> = ({ searchQuery, onSearchChange }) => {
  const [localInput, setLocalInput] = useState(searchQuery);

  useEffect(() => {
    setLocalInput(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalInput(val);
    onSearchChange(val);
  };

  const handleClear = () => {
    setLocalInput('');
    onSearchChange('');
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={localInput}
        onChange={handleInputChange}
        placeholder="Search by skill, role, domain, or session topic..."
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
      />
      {localInput && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

