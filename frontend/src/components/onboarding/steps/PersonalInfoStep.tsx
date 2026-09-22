'use client';

import React from 'react';
import { Step1AboutYouInput, CandidateTypeEnum } from '@backend/validations/onboardingSchemas';
import { User, Phone, MapPin, Briefcase, Mail, FileText, Sparkles } from 'lucide-react';

interface PersonalInfoStepProps {
  formData: Step1AboutYouInput;
  accountEmail: string;
  onChange: (updated: Partial<Step1AboutYouInput>) => void;
  errors: Record<string, string>;
}

const CANDIDATE_TYPES = [
  { id: 'STUDENT', label: 'Student', desc: 'Currently enrolled in school, college, or university' },
  { id: 'GRADUATE', label: 'Recent Graduate', desc: 'Completed studies within the last 2 years' },
  { id: 'PROFESSIONAL', label: 'Working Professional', desc: '1–5 years of work experience' },
  { id: 'EXPERIENCED', label: 'Experienced Professional', desc: '5+ years of industry experience' },
];

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  accountEmail,
  onChange,
  errors,
}) => {
  return (
    <div className="space-y-6 text-left">
      {/* Header text */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6366F1]">
          Step 01 — Personal Overview
        </span>
        <h3 className="text-2xl font-bold font-display text-slate-900">
          Tell us about yourself
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          This forms the core foundation of your candidate profile on PATHWAY.ECO.
        </p>
      </div>

      <div className="space-y-4">
        {/* Read-only Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#6366F1]" /> Account Email Address
          </label>
          <div className="h-12 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-mono text-sm flex items-center justify-between cursor-not-allowed">
            <span>{accountEmail || 'candidate@example.com'}</span>
            <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-slate-200 text-slate-700">Read-only</span>
          </div>
        </div>

        {/* Name Input */}
        <div className="space-y-1.5">
          <label htmlFor="input-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#6366F1]" /> Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="input-name"
            type="text"
            placeholder="Alex Morgan"
            value={formData.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
          />
          {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name}</p>}
        </div>

        {/* Two column layout: Phone & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="input-phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#6366F1]" /> Phone Number (Intl format) <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-phone"
              type="tel"
              placeholder="+1 (555) 019-2834"
              value={formData.phone || ''}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
            />
            {errors.phone && <p className="text-xs text-rose-500 font-medium">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="input-location" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6366F1]" /> Current Location <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-location"
              type="text"
              placeholder="San Francisco, CA or London, UK"
              value={formData.location || ''}
              onChange={(e) => onChange({ location: e.target.value })}
              className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
            />
            {errors.location && <p className="text-xs text-rose-500 font-medium">{errors.location}</p>}
          </div>
        </div>

        {/* Candidate Type Selection Cards */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#6366F1]" /> Which describes you best? <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CANDIDATE_TYPES.map((type) => {
              const isSelected = formData.candidateType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => onChange({ candidateType: type.id as any })}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-1 ${
                    isSelected
                      ? 'bg-[#6366F1]/10 border-[#6366F1] text-slate-900 shadow-sm font-bold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <div className="font-semibold text-sm text-slate-900">{type.label}</div>
                  <div className="text-xs text-slate-500 leading-normal">{type.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
