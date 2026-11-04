import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const OnboardingShell = dynamic(
  () => import('@/components/onboarding/OnboardingShell').then((mod) => mod.OnboardingShell),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8FC] text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading your PATHWAY profile…</span>
        </div>
      </div>
    ),
  }
);

export const metadata = {
  title: 'Build Your PATHWAY | Candidate Onboarding',
  description: 'Complete your mandatory candidate profile foundation on PATHWAY.ECO for skill-gap analysis, course recommendations, mentor matching, and AI career guidance.',
};

export default function OnboardingPage() {
  return <OnboardingShell />;
}
