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
    <section className="py-16 border-b border-slate-200/60 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative overflow-hidden rounded-3xl border border-blue-200 bg-blue-50/50 p-8 sm:p-12 text-left">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join as a Mentor</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
              Have experience worth sharing?
            </h2>

            <p className="text-base text-slate-600">
              Help someone take their next step while expanding your impact across the PATHWAY.ECO career ecosystem.
            </p>

            {/* 3 Benefits */}
            <div className="space-y-2.5 pt-2">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 shadow-md"
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
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900">Mentor Application System</p>
              <p className="text-slate-600">
                PATHWAY.ECO mentor onboarding will open soon for experienced engineers, designers, product managers, and data leaders.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            When mentor registration launches, you will be able to verify your background, set your availability, and offer customized 1-on-1 sessions.
          </p>

          <div className="pt-3 border-t border-slate-200 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};
