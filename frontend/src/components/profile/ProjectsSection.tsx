'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, FolderGit2, Github, ExternalLink, Globe, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { Input, Textarea } from '@/components/design-system/Input';
import { Badge } from '@/components/design-system/Badge';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ProjectDTO } from '@backend/types/profile';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/profileApi';

interface ProjectsSectionProps {
  onCountChange?: (count: number) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onCountChange }) => {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ProjectDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('');
  const [projectType, setProjectType] = useState('Personal');
  const [technologiesText, setTechnologiesText] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [description, setDescription] = useState('');

  const onCountChangeRef = useRef(onCountChange);
  onCountChangeRef.current = onCountChange;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchProjects();
      setProjects(data);
      if (onCountChangeRef.current) onCountChangeRef.current(data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setRole('');
    setProjectType('Personal');
    setTechnologiesText('');
    setProjectUrl('');
    setGithubUrl('');
    setDemoUrl('');
    setDescription('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProjectDTO) => {
    setEditingProject(p);
    setTitle(p.title);
    setRole(p.role || '');
    setProjectType(p.projectType || 'Personal');
    setTechnologiesText(p.technologies ? p.technologies.join(', ') : '');
    setProjectUrl(p.projectUrl || '');
    setGithubUrl(p.githubUrl || '');
    setDemoUrl(p.demoUrl || '');
    setDescription(p.description || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!title.trim()) {
        throw new Error('Project title is required.');
      }

      const techArray = technologiesText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: title.trim(),
        role: role.trim() || null,
        projectType,
        technologies: techArray,
        projectUrl: projectUrl.trim() || null,
        githubUrl: githubUrl.trim() || null,
        demoUrl: demoUrl.trim() || null,
        description: description.trim() || null,
      };

      if (editingProject) {
        await updateProject(editingProject.id, payload);
      } else {
        await createProject(payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F172A]">Portfolio & Projects</h2>
          <p className="text-xs text-slate-500 mt-0.5">Showcase your technical builds, open source, and hackathons.</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Project
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 animate-pulse h-28" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
            <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No projects added yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Add your best work, repositories, and live applications to validate your capabilities.
            </p>
            <Button variant="outline" size="sm" onClick={openAddModal} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                      {p.role && <p className="text-xs text-slate-500">{p.role}</p>}
                    </div>
                    {p.projectType && (
                      <Badge variant="neutral" size="sm">{p.projectType}</Badge>
                    )}
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>
                  )}

                  {/* Technologies tags */}
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with links & actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {p.githubUrl && (
                      <a
                        href={p.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-slate-900 transition-colors p-1"
                        title="GitHub Repository"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.demoUrl && (
                      <a
                        href={p.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-blue-600 transition-colors p-1"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {p.projectUrl && (
                      <a
                        href={p.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-blue-600 transition-colors p-1"
                        title="Project Details"
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add Project'}
        description="Share links, tech stack, and what you achieved with this project."
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
              label="Project Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI Interview Simulator"
              required
            />
            <Input
              label="Your Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Lead Developer / Creator"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo/50"
              >
                <option value="Personal">Personal Project</option>
                <option value="Academic">Academic / Capstone</option>
                <option value="Open Source">Open Source</option>
                <option value="Professional">Professional</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <Input
              label="Technologies Used (comma separated)"
              value={technologiesText}
              onChange={(e) => setTechnologiesText(e.target.value)}
              placeholder="e.g. React, Next.js, Node.js, MongoDB"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Repository URL"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
            />
            <Input
              label="Live Demo / Deployment URL"
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <Textarea
            label="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does the project do, what challenges did you solve, and what was the impact?"
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
              {editingProject ? 'Save Changes' : 'Add Project'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project Entry"
        itemName={deleteTarget ? deleteTarget.title : undefined}
        isDeleting={isDeleting}
      />
    </Card>
  );
};
