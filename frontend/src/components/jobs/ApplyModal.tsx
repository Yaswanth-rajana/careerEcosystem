import React, { useState } from 'react';
import { X, CheckCircle2, User, FileText, Send, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { useAuth } from '@/lib/AuthContext';
import { JobsApiClient } from '@/services/jobsClient';
import { JobDetailDTO } from '@backend/types/jobs';
import Link from 'next/link';

interface Props {
  job: JobDetailDTO;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (application: any) => void;
}

export const ApplyModal: React.FC<Props> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Review Profile, 2: Note, 3: Confirm, 4: Done
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const app = await JobsApiClient.applyToJob(job.id, {
        coverNote: coverNote.trim() || undefined,
      });

      setStep(4);
      onSuccess(app);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={step === 4 ? onClose : undefined}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 line-clamp-1">{job.title}</h3>
              <p className="text-xs text-slate-500">{job.company}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression (Steps 1-3) */}
        {step < 4 && (
          <div className="py-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span className={step >= 1 ? 'text-blue-600' : ''}>1. Candidate Profile</span>
              <span className={step >= 2 ? 'text-blue-600' : ''}>2. Note (Optional)</span>
              <span className={step >= 3 ? 'text-blue-600' : ''}>3. Review & Submit</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Candidate Profile Review */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{user?.name}</h4>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-200/60 leading-relaxed">
                Your verified PATHWAY.ECO profile and portfolio will be submitted to{' '}
                <span className="font-semibold text-slate-800">{job.company}</span>.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setStep(2)}>
                Next: Add Note
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Note to Recruiter */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Note for the Hiring Team <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                maxLength={2000}
                placeholder="Highlight your relevant experience, project links, or why this opportunity excites you..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
              />
              <div className="text-[11px] text-slate-400 text-right mt-1">
                {coverNote.length} / 2000 characters
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep(3)}>
                  Skip
                </Button>
                <Button variant="primary" size="sm" onClick={() => setStep(3)}>
                  Next: Review
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm & Submit */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Ready to submit your application</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-6 list-disc">
                <li>
                  Role: <strong className="text-slate-800">{job.title}</strong> at{' '}
                  <strong className="text-slate-800">{job.company}</strong>
                </li>
                <li>Candidate: {user?.name} ({user?.email})</li>
                {coverNote.trim() && <li>Cover note attached ({coverNote.length} chars)</li>}
              </ul>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              By submitting, you agree to share your profile credentials and career information with the hiring team.
            </p>

            <div className="flex justify-between gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                onClick={handleSubmit}
                rightIcon={<Send className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Application
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Application Submitted ✓ */}
        {step === 4 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-bounce-short">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Your application for <span className="font-semibold text-slate-800">{job.title}</span> at{' '}
                <span className="font-semibold text-slate-800">{job.company}</span> has been received.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/jobs?tab=applications" className="w-full sm:w-auto">
                <Button variant="primary" size="md" className="w-full">
                  View in Applications
                </Button>
              </Link>
              <Button variant="outline" size="md" onClick={onClose} className="w-full sm:w-auto">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
