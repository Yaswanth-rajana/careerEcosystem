'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Link2,
  ExternalLink,
  Award,
  Trophy,
  Edit2,
  Trash2,
  Linkedin,
  Github,
  Globe,
  Code2,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Modal } from '@/components/design-system/Modal';
import { Input, Textarea } from '@/components/design-system/Input';
import { Badge } from '@/components/design-system/Badge';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ProfessionalLinkDTO, CertificationDTO, AchievementDTO } from '@backend/types/profile';
import {
  fetchLinks,
  createLink,
  updateLink,
  deleteLink,
  fetchCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  fetchAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '@/lib/profileApi';

export const LinksAndCertsSection: React.FC = () => {
  const [links, setLinks] = useState<ProfessionalLinkDTO[]>([]);
  const [certifications, setCertifications] = useState<CertificationDTO[]>([]);
  const [achievements, setAchievements] = useState<AchievementDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Link Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ProfessionalLinkDTO | null>(null);
  const [linkPlatform, setLinkPlatform] = useState('LinkedIn');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSavingLink, setIsSavingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Certification Modal
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationDTO | null>(null);
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certIssueDate, setCertIssueDate] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [isSavingCert, setIsSavingCert] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  // Achievement Modal
  const [isAchModalOpen, setIsAchModalOpen] = useState(false);
  const [editingAch, setEditingAch] = useState<AchievementDTO | null>(null);
  const [achTitle, setAchTitle] = useState('');
  const [achOrg, setAchOrg] = useState('');
  const [achDate, setAchDate] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [isSavingAch, setIsSavingAch] = useState(false);
  const [achError, setAchError] = useState<string | null>(null);

  // Generic Delete Target
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'link' | 'cert' | 'ach';
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [l, c, a] = await Promise.all([
        fetchLinks(),
        fetchCertifications(),
        fetchAchievements(),
      ]);
      setLinks(l);
      setCertifications(c);
      setAchievements(a);
    } catch {
      // Graceful error handling
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Handlers for Links
  const handleOpenLinkModal = (item?: ProfessionalLinkDTO) => {
    if (item) {
      setEditingLink(item);
      setLinkPlatform(item.platform);
      setLinkUrl(item.url);
    } else {
      setEditingLink(null);
      setLinkPlatform('LinkedIn');
      setLinkUrl('');
    }
    setLinkError(null);
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLink(true);
    setLinkError(null);
    try {
      if (!linkUrl.trim()) throw new Error('URL is required.');
      if (editingLink) {
        await updateLink(editingLink.id, { platform: linkPlatform, url: linkUrl.trim() });
      } else {
        await createLink({ platform: linkPlatform, url: linkUrl.trim() });
      }
      setIsLinkModalOpen(false);
      const updated = await fetchLinks();
      setLinks(updated);
    } catch (err: any) {
      setLinkError(err.message || 'Failed to save link.');
    } finally {
      setIsSavingLink(false);
    }
  };

  // Handlers for Certifications
  const handleOpenCertModal = (c?: CertificationDTO) => {
    if (c) {
      setEditingCert(c);
      setCertName(c.name);
      setCertOrg(c.issuingOrganization);
      setCertIssueDate(c.issueDate || '');
      setCertUrl(c.credentialUrl || '');
    } else {
      setEditingCert(null);
      setCertName('');
      setCertOrg('');
      setCertIssueDate('');
      setCertUrl('');
    }
    setCertError(null);
    setIsCertModalOpen(true);
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCert(true);
    setCertError(null);
    try {
      if (!certName.trim() || !certOrg.trim()) {
        throw new Error('Certification name and issuing organization are required.');
      }
      if (editingCert) {
        await updateCertification(editingCert.id, {
          name: certName.trim(),
          issuingOrganization: certOrg.trim(),
          issueDate: certIssueDate.trim() || null,
          credentialUrl: certUrl.trim() || null,
        });
      } else {
        await createCertification({
          name: certName.trim(),
          issuingOrganization: certOrg.trim(),
          issueDate: certIssueDate.trim() || null,
          credentialUrl: certUrl.trim() || null,
        });
      }
      setIsCertModalOpen(false);
      const updated = await fetchCertifications();
      setCertifications(updated);
    } catch (err: any) {
      setCertError(err.message || 'Failed to save certification.');
    } finally {
      setIsSavingCert(false);
    }
  };

  // Handlers for Achievements
  const handleOpenAchModal = (a?: AchievementDTO) => {
    if (a) {
      setEditingAch(a);
      setAchTitle(a.title);
      setAchOrg(a.organization || '');
      setAchDate(a.date || '');
      setAchDesc(a.description || '');
    } else {
      setEditingAch(null);
      setAchTitle('');
      setAchOrg('');
      setAchDate('');
      setAchDesc('');
    }
    setAchError(null);
    setIsAchModalOpen(true);
  };

  const handleSaveAch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAch(true);
    setAchError(null);
    try {
      if (!achTitle.trim()) throw new Error('Achievement title is required.');
      if (editingAch) {
        await updateAchievement(editingAch.id, {
          title: achTitle.trim(),
          organization: achOrg.trim() || null,
          date: achDate.trim() || null,
          description: achDesc.trim() || null,
        });
      } else {
        await createAchievement({
          title: achTitle.trim(),
          organization: achOrg.trim() || null,
          date: achDate.trim() || null,
          description: achDesc.trim() || null,
        });
      }
      setIsAchModalOpen(false);
      const updated = await fetchAchievements();
      setAchievements(updated);
    } catch (err: any) {
      setAchError(err.message || 'Failed to save achievement.');
    } finally {
      setIsSavingAch(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'link') {
        await deleteLink(deleteTarget.id);
        setLinks(await fetchLinks());
      } else if (deleteTarget.type === 'cert') {
        await deleteCertification(deleteTarget.id);
        setCertifications(await fetchCertifications());
      } else if (deleteTarget.type === 'ach') {
        await deleteAchievement(deleteTarget.id);
        setAchievements(await fetchAchievements());
      }
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4 text-blue-600" />;
    if (p.includes('github')) return <Github className="w-4 h-4 text-slate-800" />;
    if (p.includes('leetcode') || p.includes('kaggle')) return <Code2 className="w-4 h-4 text-amber-600" />;
    return <Globe className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-6">
      {/* 1. Professional Links */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" /> Professional Links
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">LinkedIn, GitHub, Portfolio, and coding profiles.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenLinkModal()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Link
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {isLoading ? (
            <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ) : links.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No professional links added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      {getPlatformIcon(link.platform)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900">{link.platform}</p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline truncate block"
                      >
                        {link.url}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => handleOpenLinkModal(link)}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'link', id: link.id, title: link.platform })}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Certifications */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> Certifications & Licenses
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Industry certifications, cloud credentials, and course certificates.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenCertModal()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Certificate
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {isLoading ? (
            <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ) : certifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No certifications added yet.</p>
          ) : (
            <div className="space-y-2.5">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-slate-900">{cert.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {cert.issuingOrganization} {cert.issueDate ? `• Issued ${cert.issueDate}` : ''}
                    </p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 pt-0.5"
                      >
                        <span>View Credential</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenCertModal(cert)}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'cert', id: cert.id, title: cert.name })}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Honors & Achievements */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Honors & Achievements
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Awards, hackathon wins, scholarships, and recognitions.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenAchModal()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Achievement
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {isLoading ? (
            <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />
          ) : achievements.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No achievements added yet.</p>
          ) : (
            <div className="space-y-2.5">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-start justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900">{ach.title}</h3>
                    {ach.organization && (
                      <p className="text-[11px] font-semibold text-slate-600">
                        {ach.organization} {ach.date ? `• ${ach.date}` : ''}
                      </p>
                    )}
                    {ach.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{ach.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenAchModal(ach)}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-50"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ type: 'ach', id: ach.id, title: ach.title })}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title={editingLink ? 'Edit Link' : 'Add Professional Link'}
        maxWidth="sm"
      >
        <form onSubmit={handleSaveLink} className="space-y-4">
          {linkError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {linkError}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Platform</label>
            <select
              value={linkPlatform}
              onChange={(e) => setLinkPlatform(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white"
            >
              <option value="LinkedIn">LinkedIn</option>
              <option value="GitHub">GitHub</option>
              <option value="Portfolio">Portfolio Website</option>
              <option value="LeetCode">LeetCode</option>
              <option value="Kaggle">Kaggle</option>
              <option value="Twitter">Twitter / X</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <Input
            label="URL *"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            required
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingLink}>
              Save Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cert Modal */}
      <Modal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        title={editingCert ? 'Edit Certification' : 'Add Certification'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCert} className="space-y-4">
          {certError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {certError}
            </div>
          )}
          <Input
            label="Certification Name *"
            value={certName}
            onChange={(e) => setCertName(e.target.value)}
            placeholder="e.g. AWS Certified Solutions Architect"
            required
          />
          <Input
            label="Issuing Organization *"
            value={certOrg}
            onChange={(e) => setCertOrg(e.target.value)}
            placeholder="e.g. Amazon Web Services"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Issue Date"
              value={certIssueDate}
              onChange={(e) => setCertIssueDate(e.target.value)}
              placeholder="MM/YYYY or YYYY"
            />
            <Input
              label="Credential URL"
              type="url"
              value={certUrl}
              onChange={(e) => setCertUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCertModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingCert}>
              Save Certificate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Achievement Modal */}
      <Modal
        isOpen={isAchModalOpen}
        onClose={() => setIsAchModalOpen(false)}
        title={editingAch ? 'Edit Achievement' : 'Add Achievement'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAch} className="space-y-4">
          {achError && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {achError}
            </div>
          )}
          <Input
            label="Achievement Title *"
            value={achTitle}
            onChange={(e) => setAchTitle(e.target.value)}
            placeholder="e.g. 1st Place at National Hackathon"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Organization / Host"
              value={achOrg}
              onChange={(e) => setAchOrg(e.target.value)}
              placeholder="e.g. MLH or University"
            />
            <Input
              label="Date"
              value={achDate}
              onChange={(e) => setAchDate(e.target.value)}
              placeholder="MM/YYYY or YYYY"
            />
          </div>
          <Textarea
            label="Description"
            value={achDesc}
            onChange={(e) => setAchDesc(e.target.value)}
            placeholder="Describe the recognition and achievements..."
            rows={2}
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAchModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSavingAch}>
              Save Achievement
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Record"
        itemName={deleteTarget?.title}
        isDeleting={isDeleting}
      />
    </div>
  );
};
