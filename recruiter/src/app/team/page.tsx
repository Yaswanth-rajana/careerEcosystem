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
} from 'lucide-react';
import { RecruiterShell } from '@/components/RecruiterShell';
import { EmptyState } from '@/components/EmptyState';
import { CompanyTeamMemberDTO } from '@backend/types/recruiter';

export default function TeamPage() {
  const [members, setMembers] = useState<CompanyTeamMemberDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Invite form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'COMPANY_ADMIN' | 'RECRUITER' | 'HIRING_MANAGER' | 'INTERVIEWER'>('RECRUITER');
  const [title, setTitle] = useState('Recruiter');

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    setLoading(true);
    try {
      const res = await fetch('/api/recruiter/team');
      const json = await res.json();
      if (json.success) setMembers(json.data || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setInviting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/recruiter/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          title: title.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to invite team member');

      setShowInviteModal(false);
      setName('');
      setEmail('');
      setSuccess(`Invited ${name} to your recruiting team.`);
      fetchTeam();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setInviting(false);
    }
  }

  return (
    <RecruiterShell
      title="Team Members & Roles"
      subtitle="Collaborate with recruiters, hiring managers, and interviewers in your company workspace"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Team members share access to open jobs, candidate applications, and interview logs.
          </p>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Invite Member
          </button>
        </div>

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

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading team...</div>
          ) : !members.length ? (
            <div className="p-8">
              <EmptyState
                title="No team members yet"
                description="Invite fellow recruiters or hiring managers to collaborate."
                actionText="Invite Member"
                actionClick={() => setShowInviteModal(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-medium text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Team Member</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Title</th>
                    <th className="py-3.5 px-5">Joined</th>
                    <th className="py-3.5 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {m.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{m.name}</p>
                            <p className="text-[11px] text-slate-400">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          {m.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-800">
                        {m.title || 'Recruiter'}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500">
                        {new Date(m.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Invite Team Member</h3>
              <form onSubmit={handleInvite} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="RECRUITER">Recruiter</option>
                    <option value="HIRING_MANAGER">Hiring Manager</option>
                    <option value="INTERVIEWER">Interviewer</option>
                    <option value="COMPANY_ADMIN">Company Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Designation / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Technical Recruiter"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    {inviting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RecruiterShell>
  );
}
