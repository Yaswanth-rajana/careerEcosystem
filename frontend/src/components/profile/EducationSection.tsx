'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, GraduationCap, Calendar, MapPin, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { Input } from '@/components/design-system/Input';
import { Badge } from '@/components/design-system/Badge';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { EducationDTO } from '@backend/types/profile';
import {
  fetchEducation,
  createEducation,
  updateEducation,
  deleteEducation,
} from '@/lib/profileApi';

interface EducationSectionProps {
  onCountChange?: (count: number) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ onCountChange }) => {
  const [items, setItems] = useState<EducationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EducationDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<EducationDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form inputs
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [location, setLocation] = useState('');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear() - 4);
  const [endYear, setEndYear] = useState<number | undefined>(new Date().getFullYear());
  const [isCurrent, setIsCurrent] = useState(false);
  const [gpa, setGpa] = useState('');

  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchEducation();
      setItems(data);
      if (onCountChangeRef.current) onCountChangeRef.current(data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load education.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddModal = () => {
    setEditingItem(null);
    setInstitution('');
    setDegree('');
    setFieldOfStudy('');
    setLocation('');
    setStartYear(new Date().getFullYear() - 4);
    setEndYear(new Date().getFullYear());
    setIsCurrent(false);
    setGpa('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: EducationDTO) => {
    setEditingItem(item);
    setInstitution(item.institution);
    setDegree(item.degree);
    setFieldOfStudy(item.fieldOfStudy);
    setLocation(item.location || '');
    setStartYear(item.startYear);
    setEndYear(item.endYear || undefined);
    setIsCurrent(Boolean(item.isCurrent));
    setGpa(item.gpa || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!institution.trim() || !degree.trim() || !fieldOfStudy.trim()) {
        throw new Error('Institution, Degree, and Field of Study are required.');
      }

      if (editingItem) {
        await updateEducation(editingItem.id, {
          institution: institution.trim(),
          degree: degree.trim(),
          fieldOfStudy: fieldOfStudy.trim(),
          location: location.trim() || null,
          startYear: Number(startYear),
          endYear: isCurrent ? null : (endYear ? Number(endYear) : null),
          isCurrent,
          gpa: gpa.trim() || null,
        });
      } else {
        await createEducation({
          institution: institution.trim(),
          degree: degree.trim(),
          fieldOfStudy: fieldOfStudy.trim(),
          location: location.trim() || null,
          startYear: Number(startYear),
          endYear: isCurrent ? null : (endYear ? Number(endYear) : null),
          isCurrent,
          gpa: gpa.trim() || null,
        });
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save education entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteEducation(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete education.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Education History</h2>
          <p className="text-xs text-slate-500 mt-0.5">Degrees, certifications, and academic background.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Education
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
            <GraduationCap className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No education details added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Adding your academic background helps recruiters and AI recommend relevant career paths.
            </p>
            <Button variant="outline" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Education
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
                    <h3 className="text-sm font-bold text-slate-900">{item.institution}</h3>
                    {item.source === 'RESUME' && (
                      <Badge variant="neutral" size="sm">Resume</Badge>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-blue-600">
                    {item.degree} in {item.fieldOfStudy}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {item.startYear} – {item.isCurrent ? 'Present' : (item.endYear || 'N/A')}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location}
                      </span>
                    )}
                    {item.gpa && <span>GPA/Score: <strong className="text-slate-700">{item.gpa}</strong></span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="Edit Education"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Education"
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
        title={editingItem ? 'Edit Education' : 'Add Education'}
        description="Provide details about your institution and field of study."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {formError}
            </div>
          )}

          <Input
            label="Institution / University *"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. Stanford University or IIT Madras"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Degree / Qualification *"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="e.g. Bachelor of Technology (B.Tech)"
              required
            />
            <Input
              label="Field of Study *"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              placeholder="e.g. Computer Science and Engineering"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Hyderabad, India"
            />
            <Input
              label="GPA / Percentage"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="e.g. 8.8 CGPA or 85%"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Year *"
              type="number"
              min={1960}
              max={2100}
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              required
            />
            <Input
              label="End Year"
              type="number"
              min={1960}
              max={2100}
              value={endYear || ''}
              onChange={(e) => setEndYear(e.target.value ? Number(e.target.value) : undefined)}
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
            <span className="text-xs font-semibold text-slate-700">I am currently studying here</span>
          </label>

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
        title="Delete Education Entry"
        itemName={deleteTarget ? `${deleteTarget.degree} at ${deleteTarget.institution}` : undefined}
        isDeleting={isDeleting}
      />
    </Card>
  );
};
