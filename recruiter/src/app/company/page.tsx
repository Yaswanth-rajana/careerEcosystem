'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { CompanyProfileDTO } from '@backend/types/recruiter';

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('11-50');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [culture, setCulture] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch('/api/recruiter/company');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load company profile');
      }
      const data: CompanyProfileDTO = json.data;
      setProfile(data);
      setName(data.name || '');
      setWebsite(data.website || '');
      setLinkedIn(data.linkedIn || '');
      setIndustry(data.industry || '');
      setSize(data.size || '11-50');
      setLocation(data.location || '');
      setDescription(data.description || '');
      setCulture(data.culture || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/recruiter/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          website: website.trim(),
          linkedIn: linkedIn.trim() || undefined,
          industry: industry.trim(),
          size,
          location: location.trim(),
          description: description.trim() || undefined,
          culture: culture.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update profile');
      setProfile(json.data);
      setSuccess('Company profile updated successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <RecruiterShell
      title="Company Profile"
      subtitle="Manage your employer branding, company bio, and candidate-facing presence"
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {success}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading company profile...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Header info badge */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-xl">
                  {name ? name.slice(0, 2).toUpperCase() : <Building2 className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{profile?.name}</h2>
                    {profile?.verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Verified Employer
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {profile?.industry} • {profile?.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Brand & Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Website URL *</label>
                  <input
                    type="url"
                    required
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Company Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="500+">500+ Employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Headquarters Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">About Company</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share your mission, what problems you solve, and what candidates should know..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Workplace Culture & Values</label>
                <textarea
                  rows={3}
                  value={culture}
                  onChange={(e) => setCulture(e.target.value)}
                  placeholder="Describe your collaborative environment, engineering rituals, and values..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow hover:bg-blue-700 transition"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile Changes
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </RecruiterShell>
  );
}
