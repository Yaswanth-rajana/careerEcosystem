'use client';

import React, { useState, useEffect } from 'react';
import { MentorShell } from '@/components/MentorShell';
import { CardSkeleton } from '@/components/Skeleton';
import { StatusBadge } from '@/components/StatusBadge';
import { MentorProfileDTO } from '@backend/types/mentorship';
import {
  User,
  Shield,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Tag,
} from 'lucide-react';

export default function MentorProfilePage() {
  const [profile, setProfile] = useState<MentorProfileDTO | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [startingPrice, setStartingPrice] = useState(999);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/mentor/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      const p: MentorProfileDTO = data.profile;
      setProfile(p);
      setHeadline(p.headline || '');
      setBio(p.bio || '');
      setCompany(p.company || '');
      setExperienceYears(p.experienceYears || 0);
      setStartingPrice(p.startingPrice || 0);
      setExpertiseInput(p.expertise?.join(', ') || '');
      setSkillsInput(p.skillsList?.join(', ') || '');
    } catch (err: any) {
      setError(err.message || 'Error fetching profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSavePublicProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const expertise = expertiseInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const skillsList = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/mentor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          bio,
          company: company || null,
          experienceYears: Number(experienceYears),
          startingPrice: Number(startingPrice),
          expertise,
          skillsList,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to update profile');
      }

      setSuccessMsg('Public profile updated successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
      await fetchProfile();
    } catch (err: any) {
      setError(err.message || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MentorShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
              Mentor Profile & Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage your public mentor presence and confidential account preferences
            </p>
          </div>

          {profile && (
            <a
              href={`http://localhost:3000/mentors/${profile.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
            >
              <span>View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'public'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Public Mentor Profile
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'private'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Private Account & Status
          </button>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <CardSkeleton />
        ) : profile ? (
          activeTab === 'public' ? (
            /* Public Profile Editor */
            <form onSubmit={handleSavePublicProfile} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center border border-blue-200">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-slate-500">{profile.domain}</p>
                  <div className="mt-1">
                    <StatusBadge status={profile.status} size="sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Staff Architect at HyperScale Labs | Ex-Google"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Company / Organization
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. HyperScale Labs"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mentor Biography & Background
                </label>
                <textarea
                  rows={5}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your career journey, what candidates can learn from your experience, and your mentorship philosophy..."
                  className="w-full p-3.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Areas of Expertise (Comma-separated)
                </label>
                <input
                  type="text"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  placeholder="Distributed Systems, Cloud Architecture, System Design, Career Transition"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Skills & Technologies Mentored (Comma-separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Go, Kubernetes, Python, AWS, PostgreSQL, Kafka"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Public Profile'}
                </button>
              </div>
            </form>
          ) : (
            /* Private Account Settings */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Shield className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    Private Account Credentials & Governance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Confidential administrative data not exposed on your public mentor card
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl gap-2">
                  <div>
                    <span className="font-semibold text-slate-800 block">Registered Email</span>
                    <span className="text-slate-500">{profile.email}</span>
                  </div>
                  <span className="text-xs text-slate-400">Primary Contact</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl gap-2">
                  <div>
                    <span className="font-semibold text-slate-800 block">Mentor Application Status</span>
                    <span className="text-slate-500">
                      Approved mentors are visible to candidate searches and bookable.
                    </span>
                  </div>
                  <StatusBadge status={profile.status} size="sm" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl gap-2">
                  <div>
                    <span className="font-semibold text-slate-800 block">Member Since</span>
                    <span className="text-slate-500">
                      {new Date(profile.createdAt).toLocaleDateString([], {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        ) : null}
      </div>
    </MentorShell>
  );
}
