'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Briefcase, Calendar, MapPin, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { Input, Textarea } from '@/components/design-system/Input';
import { Badge } from '@/components/design-system/Badge';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ExperienceDTO } from '@backend/types/profile';
import {
  fetchExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} from '@/lib/profileApi';

interface ExperienceSectionProps {
  onCountChange?: (count: number) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ onCountChange }) => {
  const [items, setItems] = useState<ExperienceDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<ExperienceDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form inputs
  const [company, setCompany] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');

  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchExperience();
      setItems(data);
      if (onCountChangeRef.current) onCountChangeRef.current(data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load experience.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddModal = () => {
    setEditingItem(null);
    setCompany('');
    setRoleTitle('');
    setEmploymentType('Full-time');
    setLocation('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExperienceDTO) => {
    setEditingItem(item);
    setCompany(item.company);
    setRoleTitle(item.roleTitle);
    setEmploymentType(item.employmentType || 'Full-time');
    setLocation(item.location || '');
    setStartDate(item.startDate);
    setEndDate(item.endDate || '');
    setIsCurrent(Boolean(item.isCurrent));
    setDescription(item.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!company.trim() || !roleTitle.trim() || !startDate.trim()) {
        throw new Error('Company name, Role title, and Start date are required.');
      }

      if (editingItem) {
        await updateExperience(editingItem.id, {
          company: company.trim(),
          roleTitle: roleTitle.trim(),
          employmentType,
          location: location.trim() || null,
          startDate: startDate.trim(),
          endDate: isCurrent ? null : (endDate.trim() || null),
          isCurrent,
          description: description.trim() || null,
        });
      } else {
        await createExperience({
          company: company.trim(),
          roleTitle: roleTitle.trim(),
          employmentType,
          location: location.trim() || null,
          startDate: startDate.trim(),
          endDate: isCurrent ? null : (endDate.trim() || null),
          isCurrent,
          description: description.trim() || null,
        });
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save experience entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteExperience(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete experience.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Work Experience</h2>
          <p className="text-xs text-slate-500 mt-0.5">Internships, full-time employment, and freelance roles.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Experience
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 animate-pulse h-24" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No work experience added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Include past roles, internships, or freelance work to highlight your practical skills.
            </p>
            <Button variant="outline" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Experience
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900">{item.roleTitle}</h3>
                    <span className="text-xs text-slate-400 font-medium">•</span>
                    <span className="text-xs font-semibold text-slate-800">{item.company}</span>
                    {item.employmentType && (
                      <Badge variant="neutral" size="sm">{item.employmentType}</Badge>
                    )}
                    {item.source === 'RESUME' && (
                      <Badge variant="neutral" size="sm">Resume</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.startDate} – {item.isCurrent ? 'Present' : (item.endDate || 'N/A')}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 pt-1">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Edit Experience"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Work Experience' : 'Add Work Experience'}
        description="Share details about your responsibilities and achievements."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name *"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google or TechCorp"
              required
            />
            <Input
              label="Job / Role Title *"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Self-employed">Self-employed</option>
              </select>
            </div>

            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru, India or Remote"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="text"
              placeholder="MM/YYYY or YYYY"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="text"
              placeholder="MM/YYYY or YYYY"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isCurrent}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-700">I currently work here</span>
          </label>

          <Textarea
            label="Role Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key responsibilities, team impact, and technologies utilized..."
            rows={3}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingItem ? 'Save Changes' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Experience Entry"
        itemName={deleteTarget ? `${deleteTarget.roleTitle} at ${deleteTarget.company}` : undefined}
        isDeleting={isDeleting}
      />
    </Card>
  );
};
