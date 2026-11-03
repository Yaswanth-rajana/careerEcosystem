import React, { useState } from 'react';
import Link from 'next/link';
import { ApplicationDTO } from '@backend/types/jobs';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { Building2, MapPin, Calendar, Clock, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { JobsApiClient } from '@/services/jobsClient';

interface Props {
  application: ApplicationDTO;
  onWithdrawn?: (applicationId: string) => void;
}

export const ApplicationCard: React.FC<Props> = ({
  application,
  onWithdrawn,
}) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState(application.status);

  const canWithdraw = status !== 'WITHDRAWN' && status !== 'REJECTED' && status !== 'OFFER';

  const handleWithdraw = async () => {
    try {
      setIsWithdrawing(true);
      const updated = await JobsApiClient.withdrawApplication(application.id);
      setStatus(updated.status);
      setShowConfirm(false);
      if (onWithdrawn) {
        onWithdrawn(application.id);
      }
    } catch (err) {
      console.error('Failed to withdraw application:', err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs transition-all hover:border-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-600">
            {application.companyLogo ? (
              <img
                src={application.companyLogo}
                alt={application.company}
                className="w-full h-full object-contain rounded-xl p-1"
              />
            ) : (
              <Building2 className="w-5 h-5 text-slate-500" />
            )}
          </div>
          <div>
            <Link
              href={`/jobs/${application.jobId}`}
              className="font-bold text-base sm:text-lg text-slate-900 hover:text-blue-600 transition-colors"
            >
              {application.jobTitle}
            </Link>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 mt-0.5 flex-wrap">
              <span className="font-semibold text-slate-800">{application.company}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{application.location}</span>
              </span>
              <span>•</span>
              <span className="text-slate-500">{application.workMode}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ApplicationStatusBadge status={status} />
        </div>
      </div>

      {/* Submitted Resume Info */}
      <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-700 min-w-0">
          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-slate-500">Submitted Resume:</span>
          {application.resumeFilename ? (
            <span className="font-semibold text-slate-800 truncate">{application.resumeFilename}</span>
          ) : (
            <span className="text-slate-400 italic">No resume attached</span>
          )}
        </div>
        {(application.resumeUrl || application.resumeId) && (
          <a
            href={application.resumeUrl || `/api/applications/${application.id}/resume`}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline shrink-0 ml-2"
          >
            View Resume
          </a>
        )}
      </div>

      {/* Scheduled Interviews if any */}
      {application.interviews && application.interviews.length > 0 && (
        <div className="mt-3.5 space-y-2">
          {application.interviews.map((inv) => (
            <div
              key={inv.id}
              className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold flex items-center gap-1.5 text-purple-950">
                  <Calendar className="w-3.5 h-3.5 text-purple-700" />
                  {inv.title} ({inv.type})
                </span>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Scheduled for {new Date(inv.scheduledAt).toLocaleString()} ({inv.durationMinutes} mins)
                </p>
              </div>
              {inv.meetingUrl && (
                <a
                  href={inv.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 self-start sm:self-auto transition"
                >
                  Join Meeting
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Official Offers if any */}
      {application.offers && application.offers.length > 0 && (
        <div className="mt-3.5 space-y-2">
          {application.offers.map((off) => (
            <div
              key={off.id}
              className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Offer Received: {off.positionTitle}
                </span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Compensation: {off.currency} {off.salaryOffered.toLocaleString()} / {off.salaryPeriod.toLowerCase()}
                  {off.startDate ? ` • Start Date: ${new Date(off.startDate).toLocaleDateString()}` : ''}
                </p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900 font-bold text-[11px] self-start sm:self-auto">
                Status: {off.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Recruiter Feedback Note if available */}
      {application.feedback && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
          <span className="font-bold text-slate-900 block mb-1">Hiring Team Feedback:</span>
          <p className="leading-relaxed">{application.feedback}</p>
        </div>
      )}

      {/* Footer Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3.5 text-xs text-slate-500">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Applied on {formatDate(application.appliedAt)}
          </span>
          {application.withdrawnAt && (
            <span className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              Withdrawn on {formatDate(application.withdrawnAt)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canWithdraw && !showConfirm && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="text-slate-500 hover:text-red-600 font-medium px-2 py-1 transition-colors"
            >
              Withdraw
            </button>
          )}

          {showConfirm && (
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 p-1.5 rounded-xl">
              <span className="text-[11px] font-semibold text-red-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Confirm withdraw?
              </span>
              <button
                type="button"
                disabled={isWithdrawing}
                onClick={handleWithdraw}
                className="px-2 py-0.5 rounded-lg bg-red-600 text-white font-bold text-[11px] hover:bg-red-700"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-2 py-0.5 rounded-lg text-slate-600 font-bold text-[11px] hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          )}

          <Link href={`/jobs/${application.jobId}`}>
            <Button variant="outline" size="sm">
              View Opportunity
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
