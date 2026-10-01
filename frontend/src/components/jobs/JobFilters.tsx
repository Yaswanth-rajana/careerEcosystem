import React, { useState } from 'react';
import { Filter, X, RotateCcw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { cn } from '@/lib/utils';

export interface FilterState {
  workMode: string[];
  employmentType: string[];
  experienceLevel: string[];
  postedWithin?: string;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];
const EXPERIENCE_LEVELS = ['Fresher', '0-1 years', '1-3 years', '3-5 years', '5+ years'];
const POSTED_DATES = [
  { label: 'Past 24 hours', value: '24h' },
  { label: 'Past 3 days', value: '3d' },
  { label: 'Past 7 days', value: '7d' },
  { label: 'Past 30 days', value: '30d' },
];

export const JobFilters: React.FC<Props> = ({
  filters,
  onChange,
  onClear,
  isOpenMobile = false,
  onCloseMobile,
  className,
}) => {
  // Collapsible dropdown state for each filter section
  const [openSections, setOpenSections] = useState<{
    workMode: boolean;
    experience: boolean;
    employment: boolean;
    date: boolean;
  }>({
    workMode: true,
    experience: false,
    employment: false,
    date: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleToggleArray = (
    key: 'workMode' | 'employmentType' | 'experienceLevel',
    value: string
  ) => {
    const current = filters[key] || [];
    const exists = current.includes(value);
    const updated = exists ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: updated });
  };

  const handlePostedDate = (value: string) => {
    const updated = filters.postedWithin === value ? undefined : value;
    onChange({ ...filters, postedWithin: updated });
  };

  const hasActiveFilters =
    filters.workMode.length > 0 ||
    filters.employmentType.length > 0 ||
    filters.experienceLevel.length > 0 ||
    Boolean(filters.postedWithin);

  const allCollapsed =
    !openSections.workMode &&
    !openSections.experience &&
    !openSections.employment &&
    !openSections.date;

  const toggleAll = () => {
    const targetState = allCollapsed;
    setOpenSections({
      workMode: targetState,
      experience: targetState,
      employment: targetState,
      date: targetState,
    });
  };

  const filterContent = (
    <div className="space-y-2.5">
      {/* Filter Header with Clear and Collapse All */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-sm text-slate-900">Filters</h3>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleAll}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            {allCollapsed ? 'Expand All' : 'Collapse'}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* 1. Work Mode Accordion Dropdown */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50 transition-colors">
        <button
          type="button"
          onClick={() => toggleSection('workMode')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Work Mode</span>
            {filters.workMode.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                {filters.workMode.length}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform duration-200',
              openSections.workMode ? 'rotate-180 text-blue-600' : ''
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-all duration-200 ease-in-out',
            openSections.workMode ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-slate-200/60 bg-white">
              {WORK_MODES.map((mode) => {
                const isChecked = filters.workMode.includes(mode);
                return (
                  <label
                    key={mode}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleArray('workMode', mode)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{mode}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Experience Level Accordion Dropdown */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50 transition-colors">
        <button
          type="button"
          onClick={() => toggleSection('experience')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Experience Level</span>
            {filters.experienceLevel.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                {filters.experienceLevel.length}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform duration-200',
              openSections.experience ? 'rotate-180 text-blue-600' : ''
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-all duration-200 ease-in-out',
            openSections.experience ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-slate-200/60 bg-white">
              {EXPERIENCE_LEVELS.map((exp) => {
                const isChecked = filters.experienceLevel.includes(exp);
                return (
                  <label
                    key={exp}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleArray('experienceLevel', exp)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{exp}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Employment Type Accordion Dropdown */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50 transition-colors">
        <button
          type="button"
          onClick={() => toggleSection('employment')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Employment Type</span>
            {filters.employmentType.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                {filters.employmentType.length}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform duration-200',
              openSections.employment ? 'rotate-180 text-blue-600' : ''
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-all duration-200 ease-in-out',
            openSections.employment ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-slate-200/60 bg-white">
              {EMPLOYMENT_TYPES.map((type) => {
                const isChecked = filters.employmentType.includes(type);
                return (
                  <label
                    key={type}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleArray('employmentType', type)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{type}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Date Posted Accordion Dropdown */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-slate-50/50 transition-colors">
        <button
          type="button"
          onClick={() => toggleSection('date')}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">Date Posted</span>
            {filters.postedWithin && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                1
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-400 transition-transform duration-200',
              openSections.date ? 'rotate-180 text-blue-600' : ''
            )}
          />
        </button>

        <div
          className={cn(
            'grid transition-all duration-200 ease-in-out',
            openSections.date ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-slate-200/60 bg-white">
              {POSTED_DATES.map((date) => {
                const isSelected = filters.postedWithin === date.value;
                return (
                  <label
                    key={date.value}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none py-1"
                  >
                    <input
                      type="radio"
                      name="postedWithin"
                      checked={isSelected}
                      onChange={() => handlePostedDate(date.value)}
                      className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{date.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={cn(
          'hidden lg:block w-64 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs sticky top-24 self-start',
          className
        )}
      >
        {filterContent}
      </aside>

      {/* Mobile Drawer Sheet */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs h-full bg-white shadow-2xl p-5 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <span className="font-bold text-base text-slate-900">Filters</span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </div>

            <div className="pt-4 border-t border-slate-200 mt-4 flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={onClear} className="w-1/2">
                  Clear
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={onCloseMobile}
                className={hasActiveFilters ? 'w-1/2' : 'w-full'}
              >
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
