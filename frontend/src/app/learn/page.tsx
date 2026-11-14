import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getAllSmvenCourses, SMVEN_IT_INFRASTRUCTURE_URL } from '@/lib/careers/smven-courses';
import {
  Sparkles,
  ExternalLink,
  ArrowRight,
  Cloud,
  Terminal,
  Layers,
  Server,
  HardDrive,
  ShieldCheck,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'IT Infrastructure Training Programs | PATHWAY.ECO & SMVEN',
  description:
    'Explore verified IT Infrastructure training courses by SMVEN. Direct registration for Cloud Computing, DevOps, Virtualization, Server, Storage, and Backup Engineering.',
};

const COURSE_ICONS: Record<string, React.ReactNode> = {
  'cloud-computing': <Cloud className="w-5 h-5 text-blue-600" />,
  'devops-engineering': <Terminal className="w-5 h-5 text-indigo-600" />,
  'virtualization-engineering': <Layers className="w-5 h-5 text-cyan-600" />,
  'server-engineering': <Server className="w-5 h-5 text-emerald-600" />,
  'storage-engineering': <HardDrive className="w-5 h-5 text-amber-600" />,
  'backup-engineering': <ShieldCheck className="w-5 h-5 text-purple-600" />,
};

const CAREER_TITLES: Record<string, string> = {
  'cloud-engineer': 'Cloud Engineer',
  'devops-engineer': 'DevOps Engineer',
  'site-reliability-engineer': 'Site Reliability Engineer',
  'virtualization-engineer': 'Virtualization Engineer',
  'server-engineer': 'Server Engineer',
  'backup-storage-engineer': 'Backup & Storage Engineer',
  'it-infrastructure-engineer': 'IT Infrastructure Engineer',
  'microsoft-administrator': 'Microsoft Administrator',
};

export default function LearnPage() {
  const courses = getAllSmvenCourses();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Official Training Partner Integration
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900">
            SMVEN Training Programs
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            PATHWAY.ECO directs candidates to verified enterprise IT Infrastructure courses delivered by{' '}
            <a
              href={SMVEN_IT_INFRASTRUCTURE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-900 underline hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
            >
              <span>SMVEN</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
            . Select a program below to explore curriculum, schedules, and inquiries directly on the official SMVEN website.
          </p>

          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              All external course links open in a new tab, keeping your PATHWAY.ECO roadmap intact.
            </span>
          </div>
        </div>

        {/* 6 Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const icon = COURSE_ICONS[course.slug] || <Server className="w-5 h-5 text-blue-600" />;

            return (
              <div
                key={course.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all flex flex-col justify-between gap-6 text-left group"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 shrink-0">
                      {icon}
                    </div>
                    <div className="flex items-center h-7">
                      <Image
                        src="/smvenLogo.png"
                        alt="SMVEN Logo"
                        width={96}
                        height={24}
                        className="h-6 w-auto object-contain"
                      />
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold font-display text-slate-900 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {course.tagline}
                    </p>
                  </div>

                  {/* Skills Covered */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                      Core Skills Covered:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {course.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Careers */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                      Recommended for Careers:
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {course.targetCareers.map((slug) => (
                        <Link
                          key={slug}
                          href={`/careers/${slug}`}
                          className="text-[10.5px] px-2 py-0.5 rounded-md bg-blue-50/70 border border-blue-200/60 text-blue-800 font-semibold hover:bg-blue-100 transition-colors"
                        >
                          {CAREER_TITLES[slug] || slug}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Direct External Redirection Button */}
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all group-hover:bg-blue-700"
                  >
                    <span>View Course & Inquire</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Guidance Callout */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white border border-blue-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-left">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                Not sure which training program fits your profile?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Use PATHWAY.ECO’s career exploration tools to evaluate your current technical competencies,
              measure your skill gap, and discover the exact role roadmap for your experience level.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
            >
              <span>Explore 10 Career Paths</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
