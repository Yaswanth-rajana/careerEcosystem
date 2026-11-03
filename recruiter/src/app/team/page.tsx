'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  MoreVertical,
  Clock,
  RotateCw,
  XCircle,
  ShieldAlert,
  UserCheck,
  Briefcase,
  Building,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { EmptyState } from '@/components/EmptyState';
import { useRecruiterAuth } from '@/lib/recruiterAuthContext';
import {
  CompanyTeamMemberDTO,
  CompanyInvitationDTO,
  RecruiterRole,
} from '@backend/types/recruiter';

const ROLES_CONFIG: Record<
  RecruiterRole,
  { label: string; badgeClass: string; desc: string }
> = {
  COMPANY_ADMIN: {
    label: 'Company Admin',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    desc: 'Full workspace administration, role assignments, company settings, and recruitment.',
  },
  RECRUITER: {
    label: 'Recruiter',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
    desc: 'Manages jobs, candidates, pipelines, assessments, and schedules interviews.',
  },
  TECHNICAL_INTERVIEWER: {
    label: 'Technical Interviewer',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    desc: 'Evaluates assigned technical interviews and submits technical feedback.',
  },
  HR_INTERVIEWER: {
    label: 'HR Interviewer',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    desc: 'Conducts assigned HR & behavioral interviews and submits evaluation feedback.',
  },
  INTERVIEW_COORDINATOR: {
    label: 'Interview Coordinator',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    desc: 'Coordinates schedules, calendar logistics, and assigns interviewers.',
  },
  HIRING_MANAGER: {
    label: 'Hiring Manager',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    desc: 'Oversees assigned job requisitions, reviews candidates, and handles offer decisions.',
  },
};

export default function TeamPage() {
  const { recruiterData } = useRecruiterAuth();
  const [members, setMembers] = useState<CompanyTeamMemberDTO[]>([]);
  const [invitations, setInvitations] = useState<CompanyInvitationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState<CompanyTeamMemberDTO | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<RecruiterRole>('RECRUITER');
  const [inviteTitle, setInviteTitle] = useState('Recruiter');
  const [inviteDepartment, setInviteDepartment] = useState('');
  const [inviteInterviewTypes, setInviteInterviewTypes] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');

  // Role Edit Form
  const [editRole, setEditRole] = useState<RecruiterRole>('RECRUITER');
  const [editTitle, setEditTitle] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  // Permissions
  const isCompanyAdmin = recruiterData?.companyRole === 'COMPANY_ADMIN';
  const canInvite = isCompanyAdmin || (recruiterData?.permissions ? recruiterData.permissions.includes('team:invite') : true);
  const canManageRoles = isCompanyAdmin || (recruiterData?.permissions ? recruiterData.permissions.includes('team:manage_roles') : true);
  const canRemoveMember = isCompanyAdmin || (recruiterData?.permissions ? recruiterData.permissions.includes('team:remove_member') : true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch('/api/recruiter/team'),
        fetch('/api/recruiter/team/invitations'),
      ]);

      const membersJson = await membersRes.json();
      const invitesJson = await invitesRes.json();

      if (membersJson.success) setMembers(membersJson.data || []);
      if (invitesJson.success) setInvitations(invitesJson.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/recruiter/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          name: inviteName.trim() || undefined,
          role: inviteRole,
          title: inviteTitle.trim() || undefined,
          department: inviteDepartment.trim() || undefined,
          interviewTypes: inviteInterviewTypes,
          message: inviteMessage.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to send invitation');

      setShowInviteModal(false);
      resetInviteForm();
      setSuccess(`Invitation successfully sent to ${inviteEmail}.`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMember) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/recruiter/team/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          title: editTitle.trim() || undefined,
          department: editDepartment.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update member role');

      setEditingMember(null);
      setSuccess(`Updated role for ${editingMember.name} to ${ROLES_CONFIG[editRole]?.label || editRole}.`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeactivateMember(member: CompanyTeamMemberDTO) {
    if (!confirm(`Are you sure you want to suspend access for ${member.name}?`)) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/recruiter/team/${member.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to suspend member');

      setSuccess(`Suspended access for ${member.name}.`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResendInvite(invitationId: string, email: string) {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/recruiter/team/invitations/${invitationId}/resend`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to resend invitation');

      setSuccess(`Invitation resent to ${email}.`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevokeInvite(invitationId: string, email: string) {
    if (!confirm(`Revoke invitation for ${email}?`)) return;

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/recruiter/team/invitations/${invitationId}/revoke`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to revoke invitation');

      setSuccess(`Revoked invitation for ${email}.`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  function resetInviteForm() {
    setInviteEmail('');
    setInviteName('');
    setInviteRole('RECRUITER');
    setInviteTitle('Recruiter');
    setInviteDepartment('');
    setInviteInterviewTypes([]);
    setInviteMessage('');
  }

  function openEditModal(m: CompanyTeamMemberDTO) {
    setEditingMember(m);
    setEditRole(m.role);
    setEditTitle(m.title || '');
    setEditDepartment(m.department || '');
  }

  // Filtered members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered invitations
  const filteredInvitations = invitations.filter((inv) => {
    const matchesSearch =
      inv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.name && inv.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || inv.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <RecruiterShell
      title="Team Members & Roles"
      subtitle="Role-Based Access Control and member management for your company workspace"
    >
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              Configure least-privilege roles, manage interview assignments, and invite colleagues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canInvite && (
              <button
                type="button"
                onClick={() => {
                  resetInviteForm();
                  setShowInviteModal(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Invite Member
              </button>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 font-bold">✕</button>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-800 font-bold">✕</button>
          </div>
        )}

        {/* Tab & Filters Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'members'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Active Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('invitations')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'invitations'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Pending & Past Invites ({invitations.length})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 w-48 sm:w-56 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none bg-white pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs hover:border-slate-300 transition"
              >
                <option value="ALL">All Roles</option>
                {Object.keys(ROLES_CONFIG).map((r) => (
                  <option key={r} value={r}>
                    {ROLES_CONFIG[r as RecruiterRole].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs hover:border-slate-300 transition"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
                <option value="EXPIRED">Expired</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading team members and permissions...</span>
          </div>
        ) : activeTab === 'members' ? (
          /* Members Table */
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            {filteredMembers.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No team members found"
                  description="No members match your current filters. Try resetting the filters or invite a colleague."
                  actionText={canInvite ? 'Invite Member' : undefined}
                  actionClick={canInvite ? () => setShowInviteModal(true) : undefined}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Team Member</th>
                      <th className="py-3.5 px-5">Role & Responsibilities</th>
                      <th className="py-3.5 px-5">Department & Scope</th>
                      <th className="py-3.5 px-5">Joined</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredMembers.map((m) => {
                      const roleConfig = ROLES_CONFIG[m.role] || ROLES_CONFIG.RECRUITER;
                      const isCurrentUser = recruiterData?.user?.id === m.userId;

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700 shrink-0">
                                {m.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-semibold text-slate-900 truncate">{m.name}</p>
                                  {isCurrentUser && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                      You
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 truncate">{m.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-5">
                            <div className="space-y-1">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleConfig.badgeClass}`}
                                title={roleConfig.desc}
                              >
                                {roleConfig.label}
                              </span>
                              <p className="text-[11px] text-slate-500 truncate">{m.title || 'Team Member'}</p>
                            </div>
                          </td>

                          <td className="py-3.5 px-5">
                            <div className="space-y-0.5">
                              <span className="text-slate-800 font-medium">
                                {m.department || 'All Departments'}
                              </span>
                              {m.assignedJobIds && m.assignedJobIds.length > 0 ? (
                                <p className="text-[10px] text-blue-600 font-semibold">
                                  Scoped to {m.assignedJobIds.length} requisitions
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-400">Workspace Wide</p>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-5 text-slate-500">
                            {new Date(m.joinedAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="py-3.5 px-5">
                            {m.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {canManageRoles && (
                                <button
                                  type="button"
                                  onClick={() => openEditModal(m)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                  Change Role
                                </button>
                              )}

                              {canRemoveMember && !isCurrentUser && m.status === 'ACTIVE' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeactivateMember(m)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                >
                                  Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Pending & Past Invitations Table */
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            {filteredInvitations.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No pending invitations"
                  description="There are currently no active or pending invitations sent for this workspace."
                  actionText={canInvite ? 'Invite Member' : undefined}
                  actionClick={canInvite ? () => setShowInviteModal(true) : undefined}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Invitee</th>
                      <th className="py-3.5 px-5">Role Offered</th>
                      <th className="py-3.5 px-5">Invited By</th>
                      <th className="py-3.5 px-5">Expires</th>
                      <th className="py-3.5 px-5">Invitation Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredInvitations.map((inv) => {
                      const roleConfig = ROLES_CONFIG[inv.role] || ROLES_CONFIG.RECRUITER;
                      const isExpired = inv.status === 'EXPIRED';

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-5">
                            <div>
                              <p className="font-semibold text-slate-900">{inv.name || 'Invited Teammate'}</p>
                              <p className="text-[11px] text-slate-400">{inv.email}</p>
                            </div>
                          </td>

                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleConfig.badgeClass}`}
                            >
                              {roleConfig.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-5 text-slate-600">
                            {inv.invitedByName}
                          </td>

                          <td className="py-3.5 px-5 text-slate-500">
                            {new Date(inv.expiresAt).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          <td className="py-3.5 px-5">
                            {inv.status === 'ACCEPTED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                Accepted
                              </span>
                            ) : inv.status === 'REVOKED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                Revoked
                              </span>
                            ) : inv.status === 'FAILED' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                Delivery Failed
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {canInvite && inv.status !== 'ACCEPTED' && inv.status !== 'REVOKED' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleResendInvite(inv.id, inv.email)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  >
                                    Resend
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRevokeInvite(inv.id, inv.email)}
                                    className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  >
                                    Revoke
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Invite Team Member</h3>
                    <p className="text-xs text-slate-500">Send an expiring invitation link via email</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@yourcompany.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700">Designation / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Tech Recruiter"
                      value={inviteTitle}
                      onChange={(e) => setInviteTitle(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Role *</label>
                  <div className="relative">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as RecruiterRole)}
                      className="appearance-none w-full rounded-xl border border-slate-200 pl-3 pr-9 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                    >
                      {Object.keys(ROLES_CONFIG).map((r) => {
                        // Disallow assigning Company Admin if current user is not admin
                        const isCompanyAdminOption = r === 'COMPANY_ADMIN';
                        const isCurrentUserAdmin = recruiterData?.companyRole === 'COMPANY_ADMIN';
                        if (isCompanyAdminOption && !isCurrentUserAdmin) return null;

                        return (
                          <option key={r} value={r}>
                            {ROLES_CONFIG[r as RecruiterRole].label}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 italic">
                    {ROLES_CONFIG[inviteRole]?.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Engineering, Product"
                      value={inviteDepartment}
                      onChange={(e) => setInviteDepartment(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Interview Focus</label>
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !inviteInterviewTypes.includes(val)) {
                            setInviteInterviewTypes([...inviteInterviewTypes, val]);
                          }
                        }}
                        className="appearance-none w-full rounded-xl border border-slate-200 pl-3 pr-9 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                      >
                        <option value="">Select Interview Scope...</option>
                        <option value="TECHNICAL">Technical Round</option>
                        <option value="HR">HR / Culture Round</option>
                        <option value="MANAGERIAL">Managerial Round</option>
                        <option value="BEHAVIORAL">Behavioral Round</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {inviteInterviewTypes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {inviteInterviewTypes.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => setInviteInterviewTypes(inviteInterviewTypes.filter((x) => x !== t))}
                          className="hover:text-blue-900 ml-0.5 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700">Personal Invitation Note (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Add an optional welcome message to include in their invitation email..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Role Modal */}
        {editingMember && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Member Role</h3>
                  <p className="text-xs text-slate-500">Update role & permissions for {editingMember.name}</p>
                </div>
                <button
                  onClick={() => setEditingMember(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateRole} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role</label>
                  <div className="relative">
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as RecruiterRole)}
                      className="appearance-none w-full rounded-xl border border-slate-200 pl-3 pr-9 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                    >
                      {Object.keys(ROLES_CONFIG).map((r) => (
                        <option key={r} value={r}>
                          {ROLES_CONFIG[r as RecruiterRole].label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 italic">
                    {ROLES_CONFIG[editRole]?.desc}
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </RecruiterShell>
  );
}
