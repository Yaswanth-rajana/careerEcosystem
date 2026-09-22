'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCcw, Check, ChevronDown, SlidersHorizontal } from 'lucide-react';
import {
  MentorExpertise,
  MentorSessionType,
  MentorExperienceRange,
  MentorPriceRange,
  MentorAvailabilityOption,
  MentorFilterParams,
} from '@/lib/mentors/mentor-types';
import { Button } from '@/components/design-system/Button';

interface MentorFiltersProps {
  filters: MentorFilterParams;
  onFilterChange: (newFilters: Partial<MentorFilterParams>) => void;
  onResetFilters: () => void;
  activeFilterCount?: number;
}

const EXPERTISE_OPTIONS: MentorExpertise[] = [
  'Software Engineering',
  'Data Science',
  'AI / ML',
  'Cybersecurity',
  'Product',
  'Design',
  'Electronics',
  'Mechanical',
  'Business',
];

const EXPERIENCE_OPTIONS: MentorExperienceRange[] = ['3–5 years', '5–10 years', '10+ years'];

const SESSION_TYPE_OPTIONS: MentorSessionType[] = [
  'Career Guidance',
  'Resume Review',
  'Mock Interview',
  'Technical Guidance',
  'Career Switch',
  'Leadership',
];

const PRICE_OPTIONS: MentorPriceRange[] = ['Any', 'Under ₹500', '₹500–₹1,000', '₹1,000–₹2,500', '₹2,500+'];

const AVAILABILITY_OPTIONS: MentorAvailabilityOption[] = ['All', 'Available this week', 'Next available tomorrow'];

export const MentorFilters: React.FC<MentorFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  activeFilterCount: externalActiveCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedExpertise = filters.expertise || [];
  const selectedExperience = filters.experience || [];
  const selectedSessionTypes = filters.sessionTypes || [];
  const selectedPrice = filters.priceRange || 'Any';
  const selectedAvailability = filters.availability || 'All';

  // Calculate active filters count for badge
  const activeCount =
    externalActiveCount !== undefined
      ? externalActiveCount
      : selectedExpertise.length +
        selectedExperience.length +
        selectedSessionTypes.length +
        (selectedPrice !== 'Any' ? 1 : 0) +
        (selectedAvailability !== 'All' ? 1 : 0);

  // Close popover on click outside or Escape key press
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleExpertise = (item: MentorExpertise) => {
    const updated = selectedExpertise.includes(item)
      ? selectedExpertise.filter((x) => x !== item)
      : [...selectedExpertise, item];
    onFilterChange({ expertise: updated, page: 1 });
  };

  const toggleExperience = (item: MentorExperienceRange) => {
    const updated = selectedExperience.includes(item)
      ? selectedExperience.filter((x) => x !== item)
      : [...selectedExperience, item];
    onFilterChange({ experience: updated, page: 1 });
  };

  const toggleSessionType = (item: MentorSessionType) => {
    const updated = selectedSessionTypes.includes(item)
      ? selectedSessionTypes.filter((x) => x !== item)
      : [...selectedSessionTypes, item];
    onFilterChange({ sessionTypes: updated, page: 1 });
  };

  return (
    <div className="relative inline-block text-left shrink-0" ref={dropdownRef}>
      {/* Filter Dropdown Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
          isOpen || activeCount > 0
            ? 'border-blue-600 bg-blue-50 text-blue-600'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
        }`}
        aria-expanded={isOpen}
      >
        <SlidersHorizontal className="w-4 h-4 text-blue-600" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold leading-none">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Filter Dropdown Popover Content */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-[560px] md:w-[640px] max-w-[92vw] rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 p-5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Reset */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 font-display text-sm uppercase tracking-wider">
                Filters
              </h3>
            </div>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>

          {/* Multi-column Filter Body */}
          <div className="max-h-[70vh] sm:max-h-[75vh] overflow-y-auto overflow-x-hidden pr-2 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left [scrollbar-gutter:stable]">
            {/* Column 1: Expertise & Session Type */}
            <div className="space-y-5">
              {/* EXPERTISE */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                  Expertise
                </h4>
                <div className="space-y-1">
                  {EXPERTISE_OPTIONS.map((item) => {
                    const isChecked = selectedExpertise.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleExpertise(item)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left ${
                          isChecked
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SESSION TYPE */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                  Session Type
                </h4>
                <div className="space-y-1">
                  {SESSION_TYPE_OPTIONS.map((item) => {
                    const isChecked = selectedSessionTypes.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleSessionType(item)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left ${
                          isChecked
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Column 2: Experience, Price & Availability */}
            <div className="space-y-5">
              {/* EXPERIENCE */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                  Experience
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {EXPERIENCE_OPTIONS.map((item) => {
                    const isChecked = selectedExperience.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleExperience(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PRICE RANGE */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                  Price Range
                </h4>
                <div className="space-y-1">
                  {PRICE_OPTIONS.map((item) => {
                    const isChecked = selectedPrice === item;
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => onFilterChange({ priceRange: item, page: 1 })}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left ${
                          isChecked
                            ? 'bg-blue-50 text-blue-600 font-bold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AVAILABILITY */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-display">
                  Availability
                </h4>
                <div className="space-y-1">
                  {AVAILABILITY_OPTIONS.map((item) => {
                    const isChecked = selectedAvailability === item;
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => onFilterChange({ availability: item, page: 1 })}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-left ${
                          isChecked
                            ? 'bg-emerald-50 text-emerald-600 font-bold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Button */}
          <div className="pt-3 mt-4 border-t border-slate-200 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

