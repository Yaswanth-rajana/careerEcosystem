'use client';

import React, { useState, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/design-system/Button';
import { PdfToolCard } from '@/components/tools/PdfToolCard';
import {
  Layers,
  Scissors,
  RotateCw,
  Zap,
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

type PdfToolType = 'merge' | 'split' | 'rotate' | 'compress';

export default function PdfToolsPage() {
  const [activeTool, setActiveTool] = useState<PdfToolType>('merge');
  
  // Merge state
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [mergeProcessing, setMergeProcessing] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);

  // Split state
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [pageRanges, setPageRanges] = useState<string>('1-2');
  const [splitProcessing, setSplitProcessing] = useState(false);
  const [splitError, setSplitError] = useState<string | null>(null);

  // Rotate state
  const [rotateFile, setRotateFile] = useState<File | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState<90 | 180 | 270>(90);
  const [rotateProcessing, setRotateProcessing] = useState(false);
  const [rotateError, setRotateError] = useState<string | null>(null);

  // Compress state
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressLevel, setCompressLevel] = useState<'basic' | 'balanced' | 'strong'>('balanced');
  const [compressProcessing, setCompressProcessing] = useState(false);
  const [compressError, setCompressError] = useState<string | null>(null);
  const [compressStats, setCompressStats] = useState<{
    originalSize: number;
    compressedSize: number;
    savedPercentage: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Merge Handlers
  const handleMergeAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const added = Array.from(e.target.files).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      setMergeFiles((prev) => [...prev, ...added]);
      setMergeError(null);
    }
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecuteMerge = async () => {
    if (mergeFiles.length < 2) {
      setMergeError('Please select at least 2 PDF files to merge.');
      return;
    }

    setMergeProcessing(true);
    setMergeError(null);

    const formData = new FormData();
    mergeFiles.forEach((f) => formData.append('files', f));

    try {
      const res = await fetch('/api/tools/pdf/merge', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error?.message || 'Failed to merge PDF files.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-document.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setMergeError(err.message || 'Error occurred while merging PDFs.');
    } finally {
      setMergeProcessing(false);
    }
  };

  // Split Handler
  const handleExecuteSplit = async () => {
    if (!splitFile) {
      setSplitError('Please select a PDF file to split.');
      return;
    }

    setSplitProcessing(true);
    setSplitError(null);

    const formData = new FormData();
    formData.append('file', splitFile);
    formData.append('pageRanges', pageRanges);

    try {
      const res = await fetch('/api/tools/pdf/split', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error?.message || 'Failed to split PDF file.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${splitFile.name.replace(/\.pdf$/i, '')}-split.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setSplitError(err.message || 'Error occurred while splitting PDF.');
    } finally {
      setSplitProcessing(false);
    }
  };

  // Rotate Handler
  const handleExecuteRotate = async () => {
    if (!rotateFile) {
      setRotateError('Please select a PDF file to rotate.');
      return;
    }

    setRotateProcessing(true);
    setRotateError(null);

    const formData = new FormData();
    formData.append('file', rotateFile);
    formData.append('rotationDegrees', rotationDegrees.toString());

    try {
      const res = await fetch('/api/tools/pdf/rotate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error?.message || 'Failed to rotate PDF.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rotateFile.name.replace(/\.pdf$/i, '')}-rotated.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setRotateError(err.message || 'Error occurred while rotating PDF.');
    } finally {
      setRotateProcessing(false);
    }
  };

  // Compress Handler
  const handleExecuteCompress = async () => {
    if (!compressFile) {
      setCompressError('Please select a PDF file to compress.');
      return;
    }

    setCompressProcessing(true);
    setCompressError(null);
    setCompressStats(null);

    const formData = new FormData();
    formData.append('file', compressFile);
    formData.append('level', compressLevel);

    try {
      const res = await fetch('/api/tools/pdf/compress', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error?.message || 'Failed to compress PDF.');
      }

      const originalSize = parseInt(res.headers.get('X-Original-Size') || compressFile.size.toString(), 10);
      const compressedSize = parseInt(res.headers.get('X-Compressed-Size') || compressFile.size.toString(), 10);
      const savedPercentage = parseFloat(res.headers.get('X-Saved-Percentage') || '0');

      setCompressStats({
        originalSize,
        compressedSize,
        savedPercentage,
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${compressFile.name.replace(/\.pdf$/i, '')}-optimized.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setCompressError(err.message || 'Error occurred while compressing PDF.');
    } finally {
      setCompressProcessing(false);
    }
  };

  const formatMb = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-10 text-left">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-500">
          <Link href="/tools" className="hover:text-[#6366F1] transition-colors">
            Tools
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200">PDF Tools</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[#6366F1] text-xs font-bold font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>PATHWAY PDF SUITE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">
            PDF Tools
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            Merge, split, rotate, compress, and manage PDF files quickly and securely.
          </p>
        </div>

        {/* Tools Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PdfToolCard
            title="Merge PDF"
            description="Combine multiple PDF files into one ordered document."
            icon={Layers}
            badge="Popular"
            actionLabel="Select Merge"
            onClick={() => setActiveTool('merge')}
            isActive={activeTool === 'merge'}
          />

          <PdfToolCard
            title="Split PDF"
            description="Extract specific page ranges or single pages from a PDF."
            icon={Scissors}
            actionLabel="Select Split"
            onClick={() => setActiveTool('split')}
            isActive={activeTool === 'split'}
          />

          <PdfToolCard
            title="Rotate PDF"
            description="Rotate all or selected PDF pages by 90°, 180°, or 270°."
            icon={RotateCw}
            actionLabel="Select Rotate"
            onClick={() => setActiveTool('rotate')}
            isActive={activeTool === 'rotate'}
          />

          <PdfToolCard
            title="Compress PDF"
            description="Optimize PDF file size while retaining document quality."
            icon={Zap}
            badge="Fast"
            actionLabel="Select Compress"
            onClick={() => setActiveTool('compress')}
            isActive={activeTool === 'compress'}
          />
        </div>

        {/* Active Tool Workspace */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
          {/* MERGE PDF WORKSPACE */}
          {activeTool === 'merge' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#6366F1]" />
                  Merge PDF files
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">Combine multiple PDF documents into a single file.</p>
              </div>

              {/* Upload list */}
              <div className="space-y-3">
                {mergeFiles.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center cursor-pointer hover:border-[#6366F1]/60 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-[#6366F1] mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Click to choose PDF files to merge
                    </p>
                    <p className="text-xs text-slate-400">Select 2 or more PDF documents</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mergeFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950 text-[#6366F1] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-400 font-mono shrink-0">({formatMb(file.size)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMergeFile(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 font-semibold text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add More PDFs
                      </Button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={handleMergeAddFiles}
                />
              </div>

              {mergeError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{mergeError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  disabled={mergeFiles.length < 2 || mergeProcessing}
                  onClick={handleExecuteMerge}
                  className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer"
                >
                  <span>{mergeProcessing ? 'Merging PDFs...' : 'Merge PDFs'}</span>
                  <ArrowRight className="w-4.5 h-4.5 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* SPLIT PDF WORKSPACE */}
          {activeTool === 'split' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-[#6366F1]" />
                  Split PDF
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">Extract specific pages or custom page ranges.</p>
              </div>

              {!splitFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center cursor-pointer hover:border-[#6366F1]/60 transition-colors"
                >
                  <Upload className="w-8 h-8 text-[#6366F1] mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Choose a PDF file to split
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-6 h-6 text-[#6366F1] shrink-0" />
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {splitFile.name}
                      </span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setSplitFile(null)}>
                      Change
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Extract Pages (e.g. 1-3, 5, 8-10):
                    </label>
                    <input
                      type="text"
                      value={pageRanges}
                      onChange={(e) => setPageRanges(e.target.value)}
                      placeholder="1-3, 5"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    />
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSplitFile(e.target.files[0]);
                    setSplitError(null);
                  }
                }}
              />

              {splitError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{splitError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  disabled={!splitFile || splitProcessing}
                  onClick={handleExecuteSplit}
                  className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer"
                >
                  <span>{splitProcessing ? 'Splitting PDF...' : 'Split PDF'}</span>
                  <ArrowRight className="w-4.5 h-4.5 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* ROTATE PDF WORKSPACE */}
          {activeTool === 'rotate' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <RotateCw className="w-5 h-5 text-[#6366F1]" />
                  Rotate PDF
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">Rotate all pages by 90°, 180°, or 270°.</p>
              </div>

              {!rotateFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center cursor-pointer hover:border-[#6366F1]/60 transition-colors"
                >
                  <Upload className="w-8 h-8 text-[#6366F1] mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Choose a PDF file to rotate
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-6 h-6 text-[#6366F1] shrink-0" />
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {rotateFile.name}
                      </span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setRotateFile(null)}>
                      Change
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Rotation Degree:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {([90, 180, 270] as const).map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => setRotationDegrees(deg)}
                          className={`py-3 rounded-xl border text-sm font-mono font-bold transition-all ${
                            rotationDegrees === deg
                              ? 'bg-indigo-50 dark:bg-indigo-950 border-[#6366F1] text-[#6366F1]'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {deg}° Clockwise
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setRotateFile(e.target.files[0]);
                    setRotateError(null);
                  }
                }}
              />

              {rotateError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{rotateError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  disabled={!rotateFile || rotateProcessing}
                  onClick={handleExecuteRotate}
                  className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer"
                >
                  <span>{rotateProcessing ? 'Rotating PDF...' : 'Rotate PDF'}</span>
                  <ArrowRight className="w-4.5 h-4.5 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {/* COMPRESS PDF WORKSPACE */}
          {activeTool === 'compress' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#6366F1]" />
                  Compress PDF
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">Optimize PDF streams to reduce file size.</p>
              </div>

              {!compressFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center cursor-pointer hover:border-[#6366F1]/60 transition-colors"
                >
                  <Upload className="w-8 h-8 text-[#6366F1] mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Choose a PDF file to compress
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3 truncate">
                      <FileText className="w-6 h-6 text-[#6366F1] shrink-0" />
                      <div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {compressFile.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">Original: {formatMb(compressFile.size)}</span>
                      </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setCompressFile(null)}>
                      Change
                    </Button>
                  </div>

                  {compressStats && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Compression Complete</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        Original: <span className="font-mono">{formatMb(compressStats.originalSize)}</span> → Optimized:{' '}
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatMb(compressStats.compressedSize)}
                        </span>{' '}
                        ({compressStats.savedPercentage > 0 ? `Saved ${compressStats.savedPercentage}%` : 'Already optimized'})
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Optimization Level:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['basic', 'balanced', 'strong'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setCompressLevel(lvl)}
                          className={`py-3 rounded-xl border text-xs font-mono font-bold capitalize transition-all ${
                            compressLevel === lvl
                              ? 'bg-indigo-50 dark:bg-indigo-950 border-[#6366F1] text-[#6366F1]'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setCompressFile(e.target.files[0]);
                    setCompressError(null);
                    setCompressStats(null);
                  }
                }}
              />

              {compressError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{compressError}</span>
                </div>
              )}

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  disabled={!compressFile || compressProcessing}
                  onClick={handleExecuteCompress}
                  className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-95 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer"
                >
                  <span>{compressProcessing ? 'Compressing PDF...' : 'Compress PDF'}</span>
                  <ArrowRight className="w-4.5 h-4.5 shrink-0" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
