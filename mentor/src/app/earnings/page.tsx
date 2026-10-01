'use client';

import React from 'react';
import { MentorShell } from '@/components/MentorShell';
import { DollarSign, Shield, ArrowRight, Wallet, Clock, Lock } from 'lucide-react';

export default function MentorEarningsPage() {
  return (
    <MentorShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="pb-2 border-b border-slate-200/80">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Mentor Earnings & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Financial ledger, revenue distribution, and future payout settings
          </p>
        </div>

        {/* Future Payments Architecture Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-xs">
            <Wallet className="w-7 h-7" />
          </div>

          <h2 className="text-lg font-bold text-slate-900 font-display mb-2">
            Payment Processing Integration In Progress
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-6">
            Direct payment processing and automated bank payouts are being connected. In accordance with platform policy, no simulated or placeholder earnings are displayed until live gateway transactions occur.
          </p>

          {/* Architecture Pipeline Visual */}
          <div className="max-w-2xl mx-auto p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">
              Planned Financial Settlement Pipeline
            </span>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-center w-full sm:w-auto">
                <span className="font-bold text-slate-800 block">Candidate Booking</span>
                <span className="text-[10px] text-slate-400">Escrow Hold</span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-center w-full sm:w-auto">
                <span className="font-bold text-slate-800 block">Completed Session</span>
                <span className="text-[10px] text-slate-400">Verification</span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-center w-full sm:w-auto">
                <span className="font-bold text-slate-800 block">MentorEarning</span>
                <span className="text-[10px] text-slate-400">Net Ledger Credit</span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />

              <div className="p-3 bg-white rounded-xl border border-blue-200 bg-blue-50/50 shadow-xs text-center w-full sm:w-auto">
                <span className="font-bold text-blue-900 block">Direct Bank Payout</span>
                <span className="text-[10px] text-blue-600">Weekly Cycle</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MentorShell>
  );
}
