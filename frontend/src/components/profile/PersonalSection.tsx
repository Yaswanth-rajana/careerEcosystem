'use client';

import React, { useState } from 'react';
import { Edit3, User, Mail, Phone, MapPin, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { Input, Textarea } from '@/components/design-system/Input';
import { Badge } from '@/components/design-system/Badge';
import { PersonalProfileDTO, CandidateType } from '@backend/types/profile';
import { updatePersonalProfile } from '@/lib/profileApi';
import { useAuth } from '@/lib/AuthContext';

interface PersonalSectionProps {
  personal: PersonalProfileDTO;
  onUpdate: (updated: PersonalProfileDTO) => void;
}

export const PersonalSection: React.FC<PersonalSectionProps> = ({ personal, onUpdate }) => {
  const { refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(personal.name || '');
  const [phone, setPhone] = useState(personal.phone || '');
  const [location, setLocation] = useState(personal.location || '');
  const [candidateType, setCandidateType] = useState<CandidateType>(personal.candidateType || 'STUDENT');
  const [headline, setHeadline] = useState(personal.headline || '');
  const [bio, setBio] = useState(personal.bio || '');

  const handleOpenEdit = () => {
    setName(personal.name || '');
    setPhone(personal.phone || '');
    setLocation(personal.location || '');
    setCandidateType(personal.candidateType || 'STUDENT');
    setHeadline(personal.headline || '');
    setBio(personal.bio || '');
    setError(null);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      if (!name || name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long.');
      }
      if (!phone || phone.trim().length < 5) {
        throw new Error('Phone number is required (at least 5 characters).');
      }
      if (!location || location.trim().length < 2) {
        throw new Error('Location is required.');
      }

      const updated = await updatePersonalProfile({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        candidateType,
        headline: headline.trim() || null,
        bio: bio.trim() || null,
      });

      onUpdate(updated);
      await refreshUser(); // updates global navbar name
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Personal Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your identity and contact information.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenEdit}
          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
        >
          Edit
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
            </span>
            <p className="text-sm font-semibold text-slate-900">{personal.name}</p>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
            </span>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{personal.email}</p>
              <Badge variant="success" size="sm" className="gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </Badge>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
            </span>
            <p className="text-sm font-medium text-slate-800">
              {personal.phone || <span className="text-slate-400 italic">Not provided</span>}
            </p>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
            </span>
            <p className="text-sm font-medium text-slate-800">
              {personal.location || <span className="text-slate-400 italic">Not provided</span>}
            </p>
          </div>

          {/* Candidate Type */}
          <div className="space-y-1 sm:col-span-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" /> Candidate Status
            </span>
            <div>
              <Badge variant="neutral" size="md">
                {personal.candidateType || 'STUDENT'}
              </Badge>
            </div>
          </div>

          {/* Professional Headline */}
          <div className="space-y-1 sm:col-span-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Headline
            </span>
            <p className="text-sm text-slate-800">
              {personal.headline || <span className="text-slate-400 italic">No headline set</span>}
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-1 sm:col-span-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Professional Bio
            </span>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {personal.bio || <span className="text-slate-400 italic">No bio provided</span>}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Edit Personal Information Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Personal Information"
        description="Update your contact information and headline."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Yaswanth Rajana"
              required
            />

            <Input
              label="Phone Number *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 9876543210"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Current Location *"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Rajahmundry, Andhra Pradesh"
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Candidate Type
              </label>
              <select
                value={candidateType}
                onChange={(e) => setCandidateType(e.target.value as CandidateType)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                <option value="STUDENT">Student</option>
                <option value="GRADUATE">Recent Graduate</option>
                <option value="PROFESSIONAL">Working Professional</option>
                <option value="EXPERIENCED">Experienced Professional</option>
              </select>
            </div>
          </div>

          <Input
            label="Professional Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Full Stack Developer | React, Node.js & Cloud"
          />

          <Textarea
            label="Professional Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief summary of your background, interests, and aspirations..."
            rows={4}
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
