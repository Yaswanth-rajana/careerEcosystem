import React from 'react';
import { Search, X } from 'lucide-react';

interface AdminSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const AdminSearch: React.FC<AdminSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search records...',
}) => {
  return (
    <div className="relative flex-1 min-w-[220px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
