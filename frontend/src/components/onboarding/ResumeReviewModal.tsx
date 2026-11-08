'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParsedResumeData } from '@backend/services/resumeParserService';
import { FullOnboardingPayload } from '@backend/validations/onboardingSchemas';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Ban,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  FolderGit2,
  GraduationCap,
  Heart,
  Languages,
  Link2,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
  Wrench,
  X,
} from 'lucide-react';
import {
  REVIEW_SECTIONS,
  ReviewDecision,
  ReviewEntryState,
  ReviewFieldState,
  ReviewSectionKey,
  ReviewSectionState,
  PersistedReviewFieldState,
  buildApprovedResume,
  buildReviewSections,
  collectReviewStats,
  getEffectiveStatus,
  isMissingField,
  isValidFieldValue,
  restoreReviewSections,
  serializeReviewSections,
  setFieldDecision,
  setSectionDecision,
  updateEntryField,
  updateFieldValue,
} from './resume-review/reviewModel';

interface ResumeReviewModalProps {
  parsedData: ParsedResumeData;
  filename: string;
  isOpen: boolean;
  onClose: () => void;
  onApplySuggestions: (approvedData: ParsedResumeData) => void;
  existingProfile?: FullOnboardingPayload;
  accountEmail?: string;
  initialFieldStates?: Record<string, PersistedReviewFieldState> | null;
  onReviewStateChange?: (fields: Record<string, PersistedReviewFieldState>) => void;
}

type ApplyState = 'idle' | 'applying' | 'success' | 'error';

const SECTION_ICONS: Record<ReviewSectionKey, typeof User> = {
  personal: User,
  education: GraduationCap,
  experience: Briefcase,
  internships: Building2,
  projects: FolderGit2,
  certifications: Award,
  technicalSkills: Wrench,
  softSkills: Heart,
  achievements: Trophy,
  professionalLinks: Link2,
  languages: Languages,
};

const STATUS_STYLES = {
  AUTO_HIGH: {
    label: 'High confidence',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  NEEDS_REVIEW: {
    label: 'Needs review',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    bar: 'bg-amber-500',
    icon: AlertTriangle,
  },
  LOW_CONFIDENCE: {
    label: 'Low confidence',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    bar: 'bg-rose-500',
    icon: AlertCircle,
  },
  VERIFIED: {
    label: 'Verified by you',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    bar: 'bg-indigo-500',
    icon: ShieldCheck,
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
    bar: 'bg-slate-400',
    icon: Ban,
  },
} as const;

const StatusBadge: React.FC<{ field: ReviewFieldState }> = ({ field }) => {
  const status = getEffectiveStatus(field);
  const style = STATUS_STYLES[status];
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${style.className}`}
      aria-label={`Extraction status: ${style.label}`}
    >
      <Icon className="h-3 w-3" />
      {style.label}
    </span>
  );
};

const ConfidenceMeter: React.FC<{ field: ReviewFieldState }> = ({ field }) => {
  const status = getEffectiveStatus(field);
  const style = STATUS_STYLES[status];
  const percent = Math.round(field.confidence * 100);

  return (
    <div className="w-28 space-y-1" aria-label={`Extraction confidence ${percent} percent`}>
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
        <span>Confidence</span>
        <span className="font-mono text-slate-700">{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

const EvidencePanel: React.FC<{ field: ReviewFieldState }> = ({ field }) => (
  <details className="group rounded-lg border border-slate-200 bg-slate-50/80">
    <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
      <Eye className="h-3 w-3" />
      View resume evidence
    </summary>
    <div className="border-t border-slate-200 px-2.5 py-2">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Resume section: {field.section || 'Not specified'}
      </div>
      <pre className="whitespace-pre-wrap break-words font-sans text-[11px] leading-relaxed text-slate-600">
        {field.evidence || 'No verbatim evidence excerpt was retained for this field.'}
      </pre>
    </div>
  </details>
);

const FieldRow: React.FC<{
  field: ReviewFieldState;
  onDecision: (decision: ReviewDecision) => void;
  onValueChange: (value: string) => void;
}> = ({ field, onDecision, onValueChange }) => {
  const status = getEffectiveStatus(field);
  const uncertain = status === 'NEEDS_REVIEW' || status === 'LOW_CONFIDENCE';
  const rejected = field.decision === 'rejected';
  const missing = isMissingField(field);
  const invalid = Boolean(field.value.trim()) && !isValidFieldValue(field);
  const options = field.options || [];
  const hasCurrentOption = options.some((option) => option.value === field.value);
  const inputClassName =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        rejected
          ? 'border-slate-200 bg-slate-50/70'
          : field.isConflict
          ? 'border-amber-300 bg-amber-50/40'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <label
            htmlFor={field.id}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600"
          >
            {field.label}
            {field.required && <span className="text-rose-500">*</span>}
          </label>

          {field.inputType === 'textarea' ? (
            <textarea
              id={field.id}
              value={field.value}
              onChange={(event) => onValueChange(event.target.value)}
              rows={3}
              className={inputClassName}
              aria-invalid={missing || invalid}
            />
          ) : field.inputType === 'select' ? (
            <select
              id={field.id}
              value={field.value}
              onChange={(event) => onValueChange(event.target.value)}
              className={inputClassName}
              aria-invalid={missing || invalid}
            >
              {!field.value && <option value="">Not selected</option>}
              {!hasCurrentOption && field.value && <option value={field.value}>{field.value}</option>}
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.id}
              type={field.inputType === 'number' ? 'number' : field.inputType === 'url' ? 'url' : 'text'}
              value={field.value}
              onChange={(event) => onValueChange(event.target.value)}
              className={inputClassName}
              aria-invalid={missing || invalid}
            />
          )}

          {field.edited && (
            <p className="text-[10px] text-slate-400">
              Extracted value:{' '}
              <span className="line-through">{field.originalValue || 'Not detected'}</span>
            </p>
          )}

          {field.isConflict && !rejected && (
            <p className="rounded-lg border border-amber-200 bg-amber-100/60 px-2 py-1.5 text-[11px] text-amber-900">
              {field.key === 'email' ? (
                <>This resume email differs from your account email. Your account email will not be changed.</>
              ) : (
                <>
                  Existing profile value: <span className="font-semibold">{field.existingValue}</span>. Accepting
                  this suggestion will replace it.
                </>
              )}
            </p>
          )}

          {missing && (
            <p className="text-[11px] font-medium text-rose-700">
              Missing required information. Add a value or reject this field.
            </p>
          )}

          {invalid && !missing && (
            <p className="text-[11px] font-medium text-rose-700">
              This value is not valid for this field. Correct it before accepting.
            </p>
          )}

          {uncertain && !missing && !rejected && (
            <p className="text-[11px] text-amber-800">
              Please verify this information. We could not confidently extract it from your resume.
            </p>
          )}

          <EvidencePanel field={field} />
        </div>

        <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
          <StatusBadge field={field} />
          <ConfidenceMeter field={field} />
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onDecision('accepted')}
              disabled={!field.value.trim() || invalid}
              aria-pressed={field.decision === 'accepted'}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                field.decision === 'accepted' && field.confirmed
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <Check className="h-3 w-3" /> Accept
            </button>
            <button
              type="button"
              onClick={() => onDecision('rejected')}
              aria-pressed={field.decision === 'rejected'}
              className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors ${
                field.decision === 'rejected'
                  ? 'border-slate-300 bg-slate-100 text-slate-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-700'
              }`}
            >
              <Ban className="h-3 w-3" /> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EntryCard: React.FC<{
  entry: ReviewEntryState;
  onFieldDecision: (fieldId: string, decision: ReviewDecision) => void;
  onFieldValueChange: (fieldId: string, value: string) => void;
}> = ({ entry, onFieldDecision, onFieldValueChange }) => {
  const missingFields = entry.fields.filter(isMissingField);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-white/80 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-900">{entry.title}</h4>
          {entry.subtitle && <p className="text-[11px] text-slate-500">{entry.subtitle}</p>}
          {entry.duplicate && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              <CheckCircle2 className="h-3 w-3" /> Already in your profile — excluded by default
            </span>
          )}
          {missingFields.length > 0 && (
            <p className="mt-1 text-[11px] font-medium text-rose-700">
              Missing: {missingFields.map((field) => field.label).join(', ')}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-mono text-slate-500">
          {Math.round(entry.confidence * 100)}% confidence
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2">
        {entry.fields.map((field) => (
          <div key={field.id} className={field.inputType === 'textarea' ? 'sm:col-span-2' : ''}>
            <FieldRow
              field={field}
              onDecision={(decision) => onFieldDecision(field.id, decision)}
              onValueChange={(value) => onFieldValueChange(field.id, value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionNavButton: React.FC<{
  section: ReviewSectionState;
  stats: ReturnType<typeof collectReviewStats>['sections'][ReviewSectionKey];
  active: boolean;
  onClick: () => void;
}> = ({ section, stats, active, onClick }) => {
  const Icon = SECTION_ICONS[section.key];

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`flex min-w-[190px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors lg:min-w-0 ${
        active
          ? 'border-indigo-200 bg-indigo-50 text-indigo-900'
          : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span className="truncate text-xs font-semibold">{section.title}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        {stats.reviewRequired > 0 && (
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
            {stats.reviewRequired}
          </span>
        )}
        <span className="text-[10px] font-mono text-slate-400">{section.entries.length}</span>
      </span>
    </button>
  );
};

export const ResumeReviewModal: React.FC<ResumeReviewModalProps> = ({
  parsedData,
  filename,
  isOpen,
  onClose,
  onApplySuggestions,
  existingProfile,
  accountEmail,
  initialFieldStates,
  onReviewStateChange,
}) => {
  const [sections, setSections] = useState<ReviewSectionState[]>([]);
  const [activeSection, setActiveSection] = useState<ReviewSectionKey>('personal');
  const [applyState, setApplyState] = useState<ApplyState>('idle');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const initialFieldStatesRef = useRef(initialFieldStates);

  useEffect(() => {
    initialFieldStatesRef.current = initialFieldStates;
  }, [initialFieldStates]);

  useEffect(() => {
    if (!isOpen) return;

    setIsHydrating(true);
    const builtSections = buildReviewSections(parsedData, existingProfile, accountEmail);
    const initialSections = restoreReviewSections(builtSections, initialFieldStatesRef.current);
    const firstSectionWithData = initialSections.find((section) => section.entries.length > 0)?.key || 'personal';

    setSections(initialSections);
    setActiveSection(firstSectionWithData);
    setApplyState('idle');
    setApplyError(null);
    setIsHydrating(false);
  }, [isOpen, parsedData, filename, existingProfile, accountEmail]);

  useEffect(() => {
    if (!isOpen || isHydrating) return;
    onReviewStateChange?.(serializeReviewSections(sections));
  }, [sections, isOpen, isHydrating, onReviewStateChange]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (applyState !== 'success') return;

    const timer = window.setTimeout(() => onClose(), 700);
    return () => window.clearTimeout(timer);
  }, [applyState, onClose]);

  const stats = useMemo(() => collectReviewStats(sections), [sections]);
  const currentSection = sections.find((section) => section.key === activeSection) || sections[0];
  const currentStats = stats.sections[activeSection];

  const updateSection = (key: ReviewSectionKey, updater: (section: ReviewSectionState) => ReviewSectionState) => {
    setSections((previous) =>
      previous.map((section) => (section.key === key ? updater(section) : section))
    );
    setApplyState((previous) => (previous === 'error' ? 'idle' : previous));
    setApplyError(null);
  };

  const handleFieldDecision = (key: ReviewSectionKey, entryId: string, fieldId: string, decision: ReviewDecision) => {
    updateSection(key, (section) =>
      updateEntryField(section, entryId, fieldId, (field) => setFieldDecision(field, decision))
    );
  };

  const handleFieldValueChange = (key: ReviewSectionKey, entryId: string, fieldId: string, value: string) => {
    updateSection(key, (section) =>
      updateEntryField(section, entryId, fieldId, (field) => updateFieldValue(field, value))
    );
  };

  const handleSectionDecision = (key: ReviewSectionKey, decision: ReviewDecision) => {
    updateSection(key, (section) => setSectionDecision(section, decision));
  };

  const handleApply = () => {
    if (applyState === 'applying' || applyState === 'success') return;

    if (stats.approved === 0) {
      setApplyState('error');
      setApplyError('Accept at least one field before adding resume information to your profile.');
      return;
    }

    setApplyState('applying');
    setApplyError(null);

    try {
      const { data, skippedEntries } = buildApprovedResume(sections, parsedData);
      if (skippedEntries > 0) {
        setApplyState('error');
        setApplyError(
          `${skippedEntries} ${skippedEntries === 1 ? 'entry has' : 'entries have'} approved fields but is missing required information. Complete or reject ${skippedEntries === 1 ? 'it' : 'them'} before applying.`
        );
        return;
      }
      onApplySuggestions(data);
      setApplyState('success');
    } catch (error: any) {
      setApplyState('error');
      setApplyError(error?.message || 'Unable to apply the approved resume information.');
    }
  };

  if (!isOpen) return null;

  const ActiveIcon = currentSection ? SECTION_ICONS[currentSection.key] : User;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-3 backdrop-blur-md sm:p-6">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-review-title"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl sm:rounded-3xl"
        >
          <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  <Sparkles className="h-3.5 w-3.5" /> Resume extracted data review
                </div>
                <h2 id="resume-review-title" className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Review what we found in your resume
                </h2>
                <p className="truncate text-[11px] text-slate-500">
                  Source file: <span className="font-mono text-indigo-600">{filename}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                autoFocus
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label="Close resume review"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
                    {stats.approved} approved
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 font-semibold ${
                      stats.reviewRequired > 0
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {stats.reviewRequired} need review
                  </span>
                  {stats.missing > 0 && (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
                      {stats.missing} missing
                    </span>
                  )}
                </div>
                <span className="font-mono text-slate-500">{stats.progress}% reviewed</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
          </div>

          {(applyState === 'success' || applyError) && (
            <div
              className={`shrink-0 border-b px-4 py-2.5 text-xs font-semibold sm:px-5 ${
                applyState === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
              role="status"
            >
              <span className="flex items-center gap-2">
                {applyState === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                {applyState === 'success'
                  ? 'Approved fields were added to your PATHWAY profile.'
                  : applyError}
              </span>
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <nav
              aria-label="Resume review sections"
              className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50/60 p-2 lg:w-64 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-3"
            >
              <div className="hidden px-2 pb-2 lg:block">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] leading-relaxed text-amber-900">
                  <div className="mb-1 flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-3.5 w-3.5" /> Approval required
                  </div>
                  Existing profile values are preserved unless you explicitly accept a replacement.
                </div>
              </div>
              {REVIEW_SECTIONS.map((meta) => {
                const section = sections.find((candidate) => candidate.key === meta.key);
                const sectionStats = stats.sections[meta.key] || {
                  approved: 0,
                  pending: 0,
                  rejected: 0,
                  missing: 0,
                  total: 0,
                  reviewRequired: 0,
                  duplicateEntries: 0,
                };

                return (
                  <SectionNavButton
                    key={meta.key}
                    section={
                      section || {
                        key: meta.key,
                        title: meta.title,
                        description: meta.description,
                        kind: 'collection',
                        entries: [],
                      }
                    }
                    stats={sectionStats}
                    active={activeSection === meta.key}
                    onClick={() => setActiveSection(meta.key)}
                  />
                );
              })}
            </nav>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {isHydrating || !currentSection ? (
                <div className="space-y-3">
                  <div className="h-8 w-1/2 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                  <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
                          <ActiveIcon className="h-4 w-4" />
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{currentSection.title}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500">
                          {currentSection.entries.length}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{currentSection.description}</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {currentStats && (
                        <span className="text-[11px] font-medium text-slate-500">
                          {currentStats.approved} approved · {currentStats.reviewRequired} need review
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSectionDecision(currentSection.key, 'accepted')}
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        Accept all
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSectionDecision(currentSection.key, 'rejected')}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        Reject all
                      </button>
                    </div>
                  </div>

                  {currentSection.entries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-10 text-center">
                      <ActiveIcon className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">
                        No {currentSection.title.toLowerCase()} found in this resume.
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        You can add this information manually in the onboarding form.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentSection.entries.map((entry) => (
                        <EntryCard
                          key={entry.id}
                          entry={entry}
                          onFieldDecision={(fieldId, decision) =>
                            handleFieldDecision(currentSection.key, entry.id, fieldId, decision)
                          }
                          onFieldValueChange={(fieldId, value) =>
                            handleFieldValueChange(currentSection.key, entry.id, fieldId, value)
                          }
                        />
                      ))}
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-[11px] leading-relaxed text-slate-500">
                    <div className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Data protection
                    </div>
                    Rejected suggestions are never saved. Fields that need review are not imported until you accept
                    them. Duplicate entries already present in your profile are excluded by default.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[11px] leading-relaxed text-slate-500">
                <p>
                  <strong className="text-slate-700">{stats.approved}</strong> approved ·{' '}
                  <strong className="text-slate-700">{stats.reviewRequired}</strong> need review ·{' '}
                  <strong className="text-slate-700">{stats.missing}</strong> missing
                </p>
                <p>
                  {stats.reviewRequired > 0
                    ? 'Fields that still need review will not be imported.'
                    : 'All fields requiring review have been handled.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={applyState === 'applying' || applyState === 'success'}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={stats.approved === 0 || applyState === 'applying' || applyState === 'success'}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {applyState === 'applying' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Applying…
                    </>
                  ) : applyState === 'success' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Added
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" /> Add approved fields
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
