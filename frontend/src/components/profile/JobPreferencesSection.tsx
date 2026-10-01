'use client';

import React, { useState } from 'react';
import { Edit3, SlidersHorizontal, MapPin, Briefcase, DollarSign, Clock, BookOpen, Users } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { Input } from '@/components/design-system/Input';
import { Badge } from '@/components/design-system/Badge';
import { JobPreferenceDTO } from '@backend/types/profile';
import { updateJobPreferences } from '@/lib/profileApi';

interface JobPreferencesSectionProps {
  jobPreferences: JobPreferenceDTO | null;
  onUpdate: (updated: JobPreferenceDTO) => void;
}

export const JobPreferencesSection: React.FC<JobPreferencesSectionProps> = ({
  jobPreferences,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [preferredJobType, setPreferredJobType] = useState(jobPreferences?.preferredJobType || 'Full-time');
  const [preferredLocation, setPreferredLocation] = useState(jobPreferences?.preferredLocation || '');
  const [workEnvironment, setWorkEnvironment] = useState(jobPreferences?.workEnvironment || 'Remote');
  const [willingToRelocate, setWillingToRelocate] = useState(Boolean(jobPreferences?.willingToRelocate));
  const [preferredIndustriesText, setPreferredIndustriesText] = useState(
    jobPreferences?.preferredIndustries ? jobPreferences.preferredIndustries.join(', ') : ''
  );
  const [minExpectedSalary, setMinExpectedSalary] = useState(jobPreferences?.minExpectedSalary || '');
  const [noticePeriod, setNoticePeriod] = useState(jobPreferences?.noticePeriod || 'Immediate');
  const [availableHoursPerWeek, setAvailableHoursPerWeek] = useState(jobPreferences?.availableHoursPerWeek || '20-40 hrs');

  const openEdit = () => {
    setPreferredJobType(jobPreferences?.preferredJobType || 'Full-time');
    setPreferredLocation(jobPreferences?.preferredLocation || '');
    setWorkEnvironment(jobPreferences?.workEnvironment || 'Remote');
    setWillingToRelocate(Boolean(jobPreferences?.willingToRelocate));
    setPreferredIndustriesText(
      jobPreferences?.preferredIndustries ? jobPreferences.preferredIndustries.join(', ') : ''
    );
    setMinExpectedSalary(jobPreferences?.minExpectedSalary || '');
    setNoticePeriod(jobPreferences?.noticePeriod || 'Immediate');
    setAvailableHoursPerWeek(jobPreferences?.availableHoursPerWeek || '20-40 hrs');
    setError(null);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const industriesArray = preferredIndustriesText
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const updated = await updateJobPreferences({
        preferredJobType,
        preferredLocation: preferredLocation.trim() || null,
        workEnvironment,
        willingToRelocate,
        preferredIndustries: industriesArray,
        minExpectedSalary: minExpectedSalary.trim() || null,
        noticePeriod,
        availableHoursPerWeek,
      });

      onUpdate(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Job & Learning Preferences</h2>
          <p className="text-xs text-slate-500 mt-0.5">Control work style, relocation, salary expectations, and learning availability.</p>
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
          {/* Work Environment */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /> Work Environment
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="md">
                {jobPreferences?.workEnvironment || 'Remote'}
              </Badge>
              {jobPreferences?.willingToRelocate && (
                <Badge variant="success" size="sm">Open to Relocation</Badge>
              )}
            </div>
          </div>

          {/* Preferred Job Type */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Preferred Employment Type
            </span>
            <p className="text-sm font-semibold text-slate-900">
              {jobPreferences?.preferredJobType || 'Full-time'}
            </p>
          </div>

          {/* Preferred Location */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Preferred Location
            </span>
            <p className="text-sm font-medium text-slate-800">
              {jobPreferences?.preferredLocation || <span className="text-slate-400 italic">Any location</span>}
            </p>
          </div>

          {/* Salary Expectations */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Expected Compensation
            </span>
            <p className="text-sm font-medium text-slate-800">
              {jobPreferences?.minExpectedSalary || <span className="text-slate-400 italic">Negotiable</span>}
            </p>
          </div>

          {/* Notice Period / Availability */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> Notice Period / Availability
            </span>
            <p className="text-sm font-medium text-slate-800">
              {jobPreferences?.noticePeriod || 'Immediate'}
            </p>
          </div>

          {/* Learning Hours per Week */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Weekly Learning Commitment
            </span>
            <p className="text-sm font-medium text-slate-800">
              {jobPreferences?.availableHoursPerWeek || '10-20 hrs/week'}
            </p>
          </div>

          {/* Preferred Industries */}
          {jobPreferences?.preferredIndustries && jobPreferences.preferredIndustries.length > 0 && (
            <div className="space-y-1 sm:col-span-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Preferred Industries
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {jobPreferences.preferredIndustries.map((ind) => (
                  <Badge key={ind} variant="neutral" size="sm">
                    {ind}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Job & Learning Preferences"
        description="Help companies and mentors find you with the right fit."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Work Mode
              </label>
              <select
                value={workEnvironment}
                onChange={(e) => setWorkEnvironment(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
                <option value="Any">Any / Flexible</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Preferred Job Type
              </label>
              <select
                value={preferredJobType}
                onChange={(e) => setPreferredJobType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract / Freelance</option>
                <option value="Both">Both Full-time and Internship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred Locations"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              placeholder="e.g. Bangalore, Hyderabad, Remote"
            />

            <Input
              label="Expected Salary / Compensation"
              value={minExpectedSalary}
              onChange={(e) => setMinExpectedSalary(e.target.value)}
              placeholder="e.g. ₹12 LPA or $90,000/yr"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Notice Period
              </label>
              <select
                value={noticePeriod}
                onChange={(e) => setNoticePeriod(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                <option value="Immediate">Immediate</option>
                <option value="15 days">15 days</option>
                <option value="30 days">30 days</option>
                <option value="60 days">60 days</option>
                <option value="90 days">90 days</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Weekly Learning Availability
              </label>
              <select
                value={availableHoursPerWeek}
                onChange={(e) => setAvailableHoursPerWeek(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                <option value="5-10 hrs">5 - 10 hours/week</option>
                <option value="10-20 hrs">10 - 20 hours/week</option>
                <option value="20-40 hrs">20 - 40 hours/week</option>
                <option value="40+ hrs">Full-time (40+ hours/week)</option>
              </select>
            </div>
          </div>

          <Input
            label="Preferred Industries (comma separated)"
            value={preferredIndustriesText}
            onChange={(e) => setPreferredIndustriesText(e.target.value)}
            placeholder="e.g. EdTech, Cloud Computing, Healthcare"
          />

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={willingToRelocate}
              onChange={(e) => setWillingToRelocate(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-700">I am open to relocating for the right opportunity</span>
          </label>

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
              Save Preferences
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
