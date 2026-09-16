import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0B0F19] text-slate-100 font-sans">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-indigo/10 border border-brand-indigo/30 text-brand-indigo text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Dashboard
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-white">
            Your Personal Career Hub
          </h1>
          <p className="text-slate-400 text-lg">
            Track your milestone progress, view recommended skills, and manage your mentorship sessions.
          </p>
          <div className="pt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-gradient text-white font-bold hover:opacity-95 transition-opacity"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
