import React from 'react';
import { RotateCcw, ChevronDown } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}

interface AdminFiltersProps {
  filters: FilterConfig[];
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export const AdminFilters: React.FC<AdminFiltersProps> = ({
  filters,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <div key={f.key} className="relative inline-flex items-center">
          <select
            value={f.value}
            onChange={(e) => f.onChange(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm transition-colors cursor-pointer"
          >
            <option value="All">{f.label}: All</option>
            {f.options
              .filter((opt) => opt.value !== 'All')
              .map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
        </div>
      ))}

      {hasActiveFilters && onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
