import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

interface AICopilotCardProps {
  targetRole: string | null;
}

export const AICopilotCard: React.FC<AICopilotCardProps> = ({ targetRole }) => {
  const samplePrompts = [
    targetRole ? `Identify my skill gaps for ${targetRole}` : 'Help me pick the best software engineering path',
    'How can I prepare for technical system design interviews?',
    'Review my resume highlights for modern tech roles',
  ];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white border border-indigo-200/70 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-3 max-w-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-indigo-700 tracking-wide uppercase font-display">
            AI Career Copilot
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
            Need help deciding your next career move?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Get personalized career guidance, clarify skill gaps, and explore real interview scenarios with your dedicated AI mentor.
          </p>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {samplePrompts.map((prompt) => (
            <Link
              key={prompt}
              href={`/guidance?q=${encodeURIComponent(prompt)}`}
              className="text-xs font-medium text-slate-600 bg-white/90 border border-slate-200/80 hover:border-indigo-300 hover:text-indigo-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <MessageSquare className="w-3 h-3 text-indigo-500" />
              <span>&ldquo;{prompt}&rdquo;</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="shrink-0">
        <Link href="/guidance">
          <Button
            variant="primary"
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Ask Career Copilot
          </Button>
        </Link>
      </div>
    </div>
  );
};
