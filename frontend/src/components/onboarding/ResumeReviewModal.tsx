'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParsedResumeData } from '@backend/services/resumeParserService';
import { CheckCircle2, AlertTriangle, X, Sparkles, User, GraduationCap, Briefcase, Wrench, FolderGit2, Award, Link as LinkIcon, Plus } from 'lucide-react';

interface ResumeReviewModalProps {
  parsedData: ParsedResumeData;
  filename: string;
  isOpen: boolean;
  onClose: () => void;
  onApplySuggestions: (approvedData: ParsedResumeData) => void;
}

export const ResumeReviewModal: React.FC<ResumeReviewModalProps> = ({
  parsedData,
  filename,
  isOpen,
  onClose,
  onApplySuggestions,
}) => {
  const [data, setData] = useState<ParsedResumeData>(parsedData);
  const [selectedSections, setSelectedSections] = useState({
    personalInfo: true,
    education: true,
    experience: true,
    skills: true,
    projects: true,
    certifications: true,
    professionalLinks: true,
  });

  if (!isOpen) return null;

  const handleApply = () => {
    const approved: ParsedResumeData = {
      rawText: data.rawText,
      personalInfo: selectedSections.personalInfo ? data.personalInfo : {},
      education: selectedSections.education ? data.education : [],
      experience: selectedSections.experience ? data.experience : [],
      skills: selectedSections.skills ? data.skills : [],
      projects: selectedSections.projects ? data.projects : [],
      certifications: selectedSections.certifications ? data.certifications : [],
      professionalLinks: selectedSections.professionalLinks ? data.professionalLinks : [],
    };
    onApplySuggestions(approved);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900"
        >
          {/* Modal Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6366F1]/10 text-[#6366F1] text-[11px] font-bold uppercase">
                <Sparkles className="w-3.5 h-3.5" /> Resume Extracted Data Review
              </div>
              <h2 className="text-2xl font-bold font-display text-slate-900">
                We found information from your resume
              </h2>
              <p className="text-xs text-slate-500">
                Source file: <span className="font-mono text-[#6366F1]">{filename}</span>. Review and confirm suggestions below.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-left">
            {/* Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong className="text-amber-950 font-semibold">User Approval Required:</strong> Resume data will not overwrite your existing entered information unless you explicitly accept it.
              </span>
            </div>

            {/* Section 1: Personal Info */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <User className="w-4 h-4 text-[#6366F1]" />
                  <span>Personal Information</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Imported
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#6366F1]">Name</span>
                  <span className="text-slate-900 font-medium">{data.personalInfo.name || 'Not detected'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#6366F1]">Email</span>
                  <span className="text-slate-900 font-medium">{data.personalInfo.email || 'Not detected'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#6366F1]">Phone</span>
                  <span className="text-slate-900 font-medium">{data.personalInfo.phone || 'Not detected'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-[#6366F1]">Location</span>
                  <span className="text-slate-900 font-medium">{data.personalInfo.location || 'Not detected'}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Education */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <GraduationCap className="w-4 h-4 text-[#6366F1]" />
                  <span>Education ({data.education.length})</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                  <AlertTriangle className="w-3 h-3" /> Review & Confirm
                </span>
              </div>

              {data.education.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No education entries automatically detected.</p>
              ) : (
                <div className="space-y-2">
                  {data.education.map((edu, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900">{edu.institution}</div>
                        <div className="text-slate-600">{edu.degree} in {edu.fieldOfStudy}</div>
                        <div className="text-[11px] text-[#6366F1]">{edu.startYear} – {edu.endYear || 'Present'}</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1]">
                        Source: RESUME
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Experience */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <Briefcase className="w-4 h-4 text-[#6366F1]" />
                  <span>Work Experience ({data.experience.length})</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                  <AlertTriangle className="w-3 h-3" /> Review & Confirm
                </span>
              </div>

              {data.experience.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No work experience automatically detected.</p>
              ) : (
                <div className="space-y-2">
                  {data.experience.map((exp, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-slate-900">{exp.roleTitle}</span> @ <span className="text-[#6366F1]">{exp.company}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1]">
                          Source: RESUME
                        </span>
                      </div>
                      <p className="text-slate-600 line-clamp-2 text-[11px]">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 4: Skills */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <Wrench className="w-4 h-4 text-[#6366F1]" />
                  <span>Detected Skills ({data.skills.length})</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Imported
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 text-slate-800 text-xs flex items-center gap-1.5"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 uppercase font-mono">
                      Resume
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Section 5: Projects & Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/80 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-[#6366F1]" />
                  <span>Projects ({data.projects.length})</span>
                </div>
                {data.projects.map((p, i) => (
                  <div key={i} className="p-2 rounded bg-white border border-slate-200 text-slate-700 font-medium">{p.title}</div>
                ))}
              </div>

              <div className="space-y-2 p-4 rounded-2xl bg-slate-50/50 border border-slate-200/80 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#6366F1]" />
                  <span>Professional Links ({data.professionalLinks.length})</span>
                </div>
                {data.professionalLinks.map((l, i) => (
                  <div key={i} className="p-2 rounded bg-white border border-slate-200 text-indigo-600 font-mono text-[11px] truncate">{l.platform}: {l.url}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-5 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:text-slate-900 hover:border-slate-400 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add to my PATHWAY profile</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
