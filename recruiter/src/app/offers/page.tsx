'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { RecruiterOfferDTO } from '@backend/types/recruiter';

export default function OffersPage() {
  const [offers, setOffers] = useState<RecruiterOfferDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  async function fetchOffers() {
    setLoading(true);
    try {
      const res = await fetch('/api/recruiter/offers');
      const json = await res.json();
      if (json.success) setOffers(json.data || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    if (!confirm(`Mark this offer as ${newStatus}?`)) return;
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/recruiter/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update offer');
      fetchOffers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <RecruiterShell
      title="Offers & Hires"
      subtitle="Track formal job offers, candidate acceptances, and confirmed hires"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading job offers...</div>
          ) : !offers.length ? (
            <div className="p-8">
              <EmptyState
                title="No offers extended yet"
                description="When candidates reach the final interview round, extend formal offers from the candidate evaluation screen."
                actionText="View Pipeline"
                actionHref="/applications?status=INTERVIEW"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Candidate</th>
                    <th className="py-3.5 px-5">Position</th>
                    <th className="py-3.5 px-5">Offered Compensation</th>
                    <th className="py-3.5 px-5">Start Date</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {offers.map((off) => (
                    <tr key={off.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5">
                        <Link
                          href={`/applications/${off.applicationId}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block"
                        >
                          {off.candidateName}
                        </Link>
                        <p className="text-[11px] text-slate-400">{off.candidateEmail}</p>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {off.positionTitle}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {off.currency} {Number(off.salaryOffered).toLocaleString()} / {off.salaryPeriod.toLowerCase()}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500">
                        {off.startDate ? new Date(off.startDate).toLocaleDateString() : 'Immediate'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                            off.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : off.status === 'DECLINED' || off.status === 'WITHDRAWN'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {off.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {off.status === 'SENT' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={actionLoadingId === off.id}
                              onClick={() => handleStatusChange(off.id, 'ACCEPTED')}
                              className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                            >
                              Mark Accepted
                            </button>
                            <button
                              type="button"
                              disabled={actionLoadingId === off.id}
                              onClick={() => handleStatusChange(off.id, 'WITHDRAWN')}
                              className="rounded bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 transition"
                            >
                              Withdraw
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RecruiterShell>
  );
}
