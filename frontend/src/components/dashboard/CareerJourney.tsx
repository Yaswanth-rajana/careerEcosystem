import React from 'react';
import { Check, Compass, Info } from 'lucide-react';
import { CareerJourneyDTO } from '@backend/types/dashboard';

interface CareerJourneyProps {
  journey: CareerJourneyDTO;
}

export const CareerJourney: React.FC<CareerJourneyProps> = ({ journey }) => {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold tracking-wider uppercase text-slate-500 font-display">
            Your Career Journey
          </h2>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Stage: <strong className="text-[#0F172A]">{journey.currentStageLabel}</strong></span>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
        {/* Horizontal Timeline (Scrollable on mobile) */}
        <div className="overflow-x-auto py-2.5 scrollbar-thin">
          <div className="relative min-w-[720px] pt-3 pb-1">
            {/* Continuous Connecting Track Line (Dead center at y=30px: 12px pt + 18px half circle) */}
            <div className="absolute top-[30px] left-[6.25%] right-[6.25%] -translate-y-1/2 h-0.5 bg-slate-200 z-0">
              <div
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{
                  width: `${
                    (Math.max(
                      0,
                      journey.stages.findIndex((s) => s.status === 'CURRENT')
                    ) /
                      (journey.stages.length - 1)) *
                    100
                  }%`,
                }}
              />
            </div>

            {/* 8 Uniform Stage Columns */}
            <div className="grid grid-cols-8 relative z-10">
              {journey.stages.map((stage, index) => {
                const isCompleted = stage.status === 'COMPLETED';
                const isCurrent = stage.status === 'CURRENT';

                return (
                  <div
                    key={stage.key}
                    className="flex flex-col items-center text-center group cursor-default"
                  >
                    {/* Circle Node */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                        isCompleted
                          ? 'bg-blue-600 text-white shadow-sm ring-4 ring-white'
                          : isCurrent
                          ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-sm ring-4 ring-blue-100 ring-offset-2 ring-offset-white scale-105'
                          : 'bg-slate-100 border border-slate-200/80 text-slate-400 ring-4 ring-white'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : isCurrent ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    {/* Step Label */}
                    <span
                      className={`mt-2.5 text-xs font-semibold text-center px-1 truncate w-full transition-colors ${
                        isCurrent
                          ? 'text-blue-600 font-bold'
                          : isCompleted
                          ? 'text-[#0F172A]'
                          : 'text-slate-400'
                      }`}
                      title={stage.label}
                    >
                      {stage.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Stage Context Explanation */}
        <div className="pt-3 border-t border-slate-100 flex items-start gap-3 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#0F172A]">
              You are currently at the <span className="text-blue-600 font-bold">{journey.currentStageLabel}</span> stage
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {journey.currentStageDescription}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
