'use client';

import React, { useState } from 'react';
import { Edit3, Compass, Target, Clock, Building2, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { Input, Textarea } from '@/components/design-system/Input';
import { CareerGoalDTO } from '@backend/types/profile';
import { updateCareerDirection } from '@/lib/profileApi';

interface CareerDirectionSectionProps {
  careerDirection: CareerGoalDTO | null;
  onUpdate: (updated: CareerGoalDTO) => void;
}

export const CareerDirectionSection: React.FC<CareerDirectionSectionProps> = ({
  careerDirection,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [targetRole, setTargetRole] = useState(careerDirection?.targetRole || '');
  const [targetIndustry, setTargetIndustry] = useState(careerDirection?.targetIndustry || '');
  const [careerField, setCareerField] = useState(careerDirection?.careerField || '');
  const [careerGoalType, setCareerGoalType] = useState(careerDirection?.careerGoalType || 'Get full-time job');
  const [timeframe, setTimeframe] = useState(careerDirection?.timeframe || 'Immediate');
  const [notes, setNotes] = useState(careerDirection?.notes || '');

  const openEdit = () => {
    setTargetRole(careerDirection?.targetRole || '');
    setTargetIndustry(careerDirection?.targetIndustry || '');
    setCareerField(careerDirection?.careerField || '');
    setCareerGoalType(careerDirection?.careerGoalType || 'Get full-time job');
    setTimeframe(careerDirection?.timeframe || 'Immediate');
    setNotes(careerDirection?.notes || '');
    setError(null);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (!targetRole.trim()) {
        throw new Error('Target job role is required.');
      }

      const updated = await updateCareerDirection({
        targetRole: targetRole.trim(),
        targetIndustry: targetIndustry.trim() || null,
        careerField: careerField.trim() || null,
        careerGoalType,
        timeframe,
        notes: notes.trim() || null,
      });

      onUpdate(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update career direction.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Career Direction & Goals</h2>
          <p className="text-xs text-slate-500 mt-0.5">Defines your target job role and path for the AI Career Copilot.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openEdit}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Edit
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Target Role */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" /> Target Job Role
            </span>
            <p className="text-sm font-bold text-slate-900">
              {careerDirection?.targetRole || <span className="text-slate-400 italic font-normal">Not specified</span>}
            </p>
          </div>

          {/* Goal Type */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-400" /> Career Objective
            </span>
            <p className="text-sm font-medium text-slate-800">
              {careerDirection?.careerGoalType || <span className="text-slate-400 italic">Not specified</span>}
            </p>
          </div>

          {/* Target Industry */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Target Industry
            </span>
            <p className="text-sm font-medium text-slate-800">
              {careerDirection?.targetIndustry || <span className="text-slate-400 italic">Open to any industry</span>}
            </p>
          </div>

          {/* Timeframe */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Goal Timeframe
            </span>
            <p className="text-sm font-medium text-slate-800">
              {careerDirection?.timeframe || <span className="text-slate-400 italic">Not set</span>}
            </p>
          </div>

          {/* Notes */}
          {careerDirection?.notes && (
            <div className="space-y-1 sm:col-span-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Additional Career Notes
              </span>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {careerDirection.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Career Direction"
        description="Set your aspirations to help our AI recommend the right roadmap and opportunities."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Target Job Role *"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Full Stack Engineer, Cloud Architect, Data Scientist"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Industry"
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              placeholder="e.g. FinTech, SaaS, AI, HealthTech"
            />

            <Input
              label="Career Field"
              value={careerField}
              onChange={(e) => setCareerField(e.target.value)}
              placeholder="e.g. Software Engineering"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Primary Goal
              </label>
              <select
                value={careerGoalType}
                onChange={(e) => setCareerGoalType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                <option value="Get first job">Get my first full-time job</option>
                <option value="Get internship">Secure an internship</option>
                <option value="Switch careers">Switch career tracks</option>
                <option value="Get promoted">Level up / Promotion</option>
                <option value="Freelancing">Transition to Freelance / Contract</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Target Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                <option value="Immediate">Immediate (1-3 months)</option>
                <option value="3-6 months">3 to 6 months</option>
                <option value="6-12 months">6 to 12 months</option>
                <option value="1+ year">1+ year</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Personal Career Goals & Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share specific dream companies, technologies you want to master, or target salary milestones..."
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
