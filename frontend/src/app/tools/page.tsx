import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Wrench, FileText, Layers, Image as ImageIcon, Code2, ArrowRight, Sparkles, Lock } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@backend/auth/security';

export const metadata = {
  title: 'Tools Platform | PATHWAY.ECO',
  description: 'Convert, organize, and prepare your documents without leaving PATHWAY.ECO.',
};

export default function ToolsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = !!token;

  const activeTools = [
    {
      id: 'tool-doc-converter',
      title: 'Document Converter',
      category: 'DOCUMENTS',
      description: 'Convert Word, Excel, PowerPoint, and other supported documents to PDF.',
      icon: FileText,
      badge: 'Popular',
      actionLabel: 'Open Converter →',
      href: '/tools/document-converter',
      isAvailable: true,
    },
    {
      id: 'tool-pdf-tools',
      title: 'PDF Tools',
      category: 'DOCUMENTS',
      description: 'Merge, split, rotate, compress, and manage PDF files.',
      icon: Layers,
      badge: 'PDF Engine',
      actionLabel: 'Open PDF Tools →',
      href: '/tools/pdf',
      isAvailable: true,
    },
  ];

  const comingSoonCategories = [
    {
      category: 'IMAGES',
      tools: [
        { title: 'Image Converter', description: 'Convert PNG, JPG, WEBP, and SVG formats cleanly.' },
        { title: 'Image Compressor', description: 'Reduce image file sizes without sacrificing quality.' },
        { title: 'Image Resize', description: 'Batch resize and crop images for profile & portfolio use.' },
      ],
      icon: ImageIcon,
    },
    {
      category: 'UTILITIES',
      tools: [
        { title: 'QR Generator', description: 'Generate high-res vector QR codes for portfolio & resumes.' },
        { title: 'JSON Formatter', description: 'Validate, format, and visualize complex JSON structures.' },
        { title: 'Text Formatter', description: 'Clean text, count words, fix casing, and convert Markdown.' },
      ],
      icon: Code2,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans transition-colors">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-12 text-left">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
            <Wrench className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>PATHWAY TOOLS PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display text-slate-900">
            Tools that make your work{' '}
            <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
              easier.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Convert, organize, and prepare your documents without leaving PATHWAY.ECO.
          </p>

          {/* Login Requirement Banner if Unauthenticated */}
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 px-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs sm:text-sm max-w-2xl mx-auto shadow-xs text-left">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Sign in required to convert and edit documents with our tools platform.</span>
              </div>
              <Link
                href="/login?from=/tools"
                className="font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200/80 hover:border-blue-300 px-3.5 py-1.5 rounded-xl shadow-xs shrink-0 whitespace-nowrap transition-all"
              >
                Sign In →
              </Link>
            </div>
          )}
        </div>

        {/* Featured Production Tools */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            DOCUMENTS & PROCESSING
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTools.map((tool) => {
              const IconComp = tool.icon;
              const toolHref = isAuthenticated ? tool.href : `/login?from=${encodeURIComponent(tool.href)}`;
              return (
                <div
                  key={tool.id}
                  className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-6 hover:border-[#6366F1]/60 hover:shadow-lg transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#6366F1] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                        <IconComp className="w-3.5 h-3.5" />
                        {tool.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {tool.badge}
                        </span>
                        {!isAuthenticated && (
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-600" />
                            Sign in required
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold font-display text-slate-900 group-hover:text-[#6366F1] transition-colors">
                      {tool.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Link
                      href={toolHref}
                      className="inline-flex items-center gap-2 text-sm font-bold text-white bg-blue-600 hover:bg-black px-5 py-3 rounded-xl shadow-sm transition-all w-full justify-center group-hover:translate-x-0.5"
                    >
                      {!isAuthenticated && <Lock className="w-4 h-4 text-white/90" />}
                      <span>{isAuthenticated ? tool.actionLabel : `Sign In to Use ${tool.title} →`}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coming Soon Categories */}
        <div className="space-y-6 pt-4 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
              PLANNED UTILITIES
            </h2>
            <span className="text-xs text-slate-400 font-mono">Coming Soon</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {comingSoonCategories.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.category} className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold font-mono text-slate-700">
                    <GroupIcon className="w-4 h-4 text-[#6366F1]" />
                    <span>{group.category}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {group.tools.map((item) => (
                      <div
                        key={item.title}
                        className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex items-center justify-between opacity-80"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-semibold text-slate-800">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full border border-slate-300 shrink-0">
                          Coming Soon
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
