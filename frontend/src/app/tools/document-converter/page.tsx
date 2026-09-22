'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FileDropzone } from '@/components/tools/FileDropzone';
import { ConversionProgress, ConversionStepState } from '@/components/tools/ConversionProgress';
import { ConversionResult } from '@/components/tools/ConversionResult';
import { Button } from '@/components/design-system/Button';
import { FileText, ArrowRight, ShieldCheck, Lock, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DocumentConverterPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'pdf'>('pdf');
  const [conversionState, setConversionState] = useState<ConversionStepState>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<{
    jobId: string;
    guestToken?: string;
    outputFilename: string;
    outputSize?: number;
  } | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setConversionState('FILE_SELECTED');
  };

  const handleStartConversion = async () => {
    if (!selectedFile) return;

    setConversionState('UPLOADING');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('targetFormat', targetFormat);

    try {
      setConversionState('VALIDATING');
      
      const response = await fetch('/api/tools/conversions', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        setConversionState('FAILED');
        setErrorMessage(json.error?.message || 'We couldn’t convert this document. Please try again.');
        return;
      }

      setConversionState('PROCESSING');

      // Poll status if needed, or if API responds directly with completed job
      const data = json.data;
      if (data.status === 'COMPLETED') {
        setConversionState('COMPLETED');
        setJobResult({
          jobId: data.jobId,
          guestToken: data.guestToken,
          outputFilename: data.outputFilename,
          outputSize: data.outputSize,
        });
      } else {
        // Poll status loop
        await pollStatus(data.jobId, data.guestToken);
      }
    } catch (err: any) {
      setConversionState('FAILED');
      setErrorMessage(err.message || 'Network error occurred during conversion.');
    }
  };

  const pollStatus = async (jobId: string, guestToken?: string) => {
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const url = `/api/tools/conversions/${jobId}${guestToken ? `?guestToken=${encodeURIComponent(guestToken)}` : ''}`;
        const res = await fetch(url);
        const json = await res.json();

        if (json.success && json.data) {
          const status = json.data.status;

          if (status === 'COMPLETED') {
            clearInterval(interval);
            setConversionState('COMPLETED');
            setJobResult({
              jobId,
              guestToken,
              outputFilename: json.data.outputFilename || `${selectedFile?.name}.pdf`,
              outputSize: json.data.outputSize,
            });
            return;
          }

          if (status === 'FAILED') {
            clearInterval(interval);
            setConversionState('FAILED');
            setErrorMessage(json.data.errorMessage || 'We couldn’t convert this document.');
            return;
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setConversionState('FAILED');
          setErrorMessage('Conversion timed out. Please try again with a smaller document.');
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setConversionState('FAILED');
          setErrorMessage('Failed to fetch conversion status.');
        }
      }
    }, 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setConversionState('IDLE');
    setErrorMessage(null);
    setJobResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (name: string) => {
    return name.split('.').pop()?.toUpperCase() || 'DOC';
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-10 text-left">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-500">
          <Link href="/tools" className="hover:text-[#6366F1] transition-colors">
            Tools
          </Link>
          <span>/</span>
          <span className="text-slate-800">Document Converter</span>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[#6366F1] text-xs font-bold font-mono">
            <FileText className="w-3.5 h-3.5" />
            <span>DOCUMENT CONVERTER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-900">
            Convert your documents quickly and securely.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Upload a supported document and choose PDF as the output format.
          </p>
        </div>

        {/* Main Interface Area */}
        <div className="w-full">
          {conversionState === 'IDLE' && (
            <FileDropzone onFileSelect={handleFileSelect} />
          )}

          {conversionState === 'FILE_SELECTED' && selectedFile && (
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#6366F1] border border-indigo-200/60 flex items-center justify-center font-bold font-mono text-sm shrink-0">
                    {getFileExtension(selectedFile.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display text-slate-900 truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {getFileExtension(selectedFile.name)} • {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs"
                >
                  Change File
                </Button>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Convert to:
                </label>
                <div className="flex items-center gap-3">
                  <div className="px-5 py-3 rounded-xl bg-slate-100 border border-slate-200 font-bold font-mono text-sm text-[#6366F1] flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={handleStartConversion}
                  className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-full font-bold text-sm sm:text-base text-white bg-blue-600 hover:bg-black shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer"
                >
                  <span>Convert to PDF</span>
                  <ArrowRight className="w-4.5 h-4.5 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {['UPLOADING', 'VALIDATING', 'QUEUED', 'PROCESSING', 'FINALIZING', 'FAILED'].includes(conversionState) &&
            !jobResult &&
            selectedFile && (
              <ConversionProgress
                state={conversionState}
                filename={selectedFile.name}
                errorMessage={errorMessage || undefined}
              />
            )}

          {conversionState === 'COMPLETED' && jobResult && (
            <ConversionResult
              jobId={jobResult.jobId}
              guestToken={jobResult.guestToken}
              outputFilename={jobResult.outputFilename}
              outputSizeBytes={jobResult.outputSize}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Security & Privacy Statement */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/70">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 border border-slate-200/50">
            <Lock className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-slate-800">Secure Processing</h5>
              <p className="text-[11px] text-slate-500">Transferred over HTTPS with isolated document engine parsing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 border border-slate-200/50">
            <Clock className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-slate-800">Temporary Storage</h5>
              <p className="text-[11px] text-slate-500">Files are processed temporarily and automatically removed after 60 minutes.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 border border-slate-200/50">
            <ShieldCheck className="w-4 h-4 text-[#6366F1] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-slate-800">No Content Logging</h5>
              <p className="text-[11px] text-slate-500">Document contents are never read, indexed, or stored permanently.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
