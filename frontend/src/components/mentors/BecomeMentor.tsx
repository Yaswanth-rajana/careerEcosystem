'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, UserPlus } from 'lucide-react';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';

export const BecomeMentor: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const benefits = [
    'Share what you’ve learned through real-world guidance.',
    'Build your professional reputation & mentorship record.',
    'Earn competitive compensation from your expertise.',
  ];

  return (
    <section className="py-16 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-slate-50 to-white dark:from-[#0B0F19] dark:to-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative overflow-hidden rounded-3xl border border-brand-indigo/30 bg-gradient-to-r from-brand-indigo/10 via-purple-900/10 to-brand-violet/10 p-8 sm:p-12 text-left">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-violet/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-indigo/20 text-brand-indigo dark:text-brand-indigo-light text-xs font-bold uppercase tracking-wider">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join as a Mentor</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
              Have experience worth sharing?
            </h2>

            <p className="text-base text-slate-600 dark:text-slate-300">
              Help someone take their next step while expanding your impact across the PATHWAY.ECO career ecosystem.
            </p>

            {/* 3 Benefits */}
            <div className="space-y-2.5 pt-2">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsModalOpen(true)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="bg-brand-gradient hover:opacity-95 text-white font-bold py-3 px-6 shadow-glow"
              >
                Become a Mentor
              </Button>
            </div>
          </div>

        </div>

      </div>

      {/* Mentor Application Interest Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply as a PATHWAY.ECO Mentor"
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div className="p-3.5 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-brand-indigo shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Mentor Application System</p>
              <p className="text-slate-600 dark:text-slate-300">
                PATHWAY.ECO mentor onboarding will open soon for experienced engineers, designers, product managers, and data leaders.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            When mentor registration launches, you will be able to verify your background, set your availability, and offer customized 1-on-1 sessions.
          </p>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
