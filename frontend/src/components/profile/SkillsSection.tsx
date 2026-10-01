'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Cpu, Edit2, X } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { Input } from '@/components/design-system/Input';
import { SkillDTO } from '@backend/types/profile';
import { fetchSkills, updateSkills } from '@/lib/profileApi';

interface SkillsSectionProps {
  onCountChange?: (count: number) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ onCountChange }) => {
  const [skills, setSkills] = useState<SkillDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftSkills, setDraftSkills] = useState<string[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchSkills();
      setSkills(data);
      if (onCountChangeRef.current) onCountChangeRef.current(data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load skills.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openEditModal = () => {
    setDraftSkills(skills.map((s) => s.name));
    setNewSkillName('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleAddDraftSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const input = newSkillName.trim();
    if (!input) return;

    // Support comma-separated entries (e.g. "React, TypeScript, Next.js")
    const entries = input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const updated = [...draftSkills];
    for (const entry of entries) {
      if (!updated.some((s) => s.toLowerCase() === entry.toLowerCase())) {
        updated.push(entry);
      }
    }

    setDraftSkills(updated);
    setNewSkillName('');
    setModalError(null);
  };

  const handleRemoveDraftSkill = (nameToRemove: string) => {
    setDraftSkills(draftSkills.filter((s) => s !== nameToRemove));
  };

  const handleSave = async () => {
    if (draftSkills.length === 0) {
      setModalError('Please include at least one skill.');
      return;
    }

    setIsSaving(true);
    setModalError(null);

    try {
      const payload = draftSkills.map((name) => ({
        name,
        level: 'INTERMEDIATE' as const,
      }));
      await updateSkills(payload);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to update skills.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Skills & Expertise</h2>
          <p className="text-xs text-slate-500 mt-0.5">Core technologies, frameworks, and competencies.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={openEditModal}
          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
        >
          Manage Skills
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {isLoading ? (
          <div className="flex flex-wrap gap-2 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-8 w-24 rounded-lg bg-slate-200/80" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <Cpu className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No skills added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Add your core skills to highlight what you work with best.
            </p>
            <Button variant="primary" size="sm" onClick={openEditModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Skills
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <div
                key={s.id}
                className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 shadow-xs hover:border-slate-300 transition-colors"
              >
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Manage Skills Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manage Skills"
        description="Type a skill and press Enter or click Add. Comma-separated entries are supported."
        maxWidth="md"
      >
        <div className="space-y-5">
          {modalError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {modalError}
            </div>
          )}

          {/* Quick Add Form */}
          <form onSubmit={handleAddDraftSkill} className="flex items-center gap-2">
            <Input
              placeholder="e.g. Next.js, Python, PostgreSQL, Docker"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add
            </Button>
          </form>

          {/* Current Skills Chip List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Selected Skills ({draftSkills.length})
            </span>

            {draftSkills.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                {draftSkills.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-800"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraftSkill(name)}
                      className="text-slate-400 hover:text-red-600 rounded-md p-0.5 transition-colors"
                      title="Remove skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleSave} isLoading={isSaving}>
              Save Skills
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
