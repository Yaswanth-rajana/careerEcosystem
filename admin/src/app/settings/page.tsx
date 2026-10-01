'use client';

import React from 'react';
import { AdminShell } from '@/components/AdminShell';
import { StatusBadge } from '@/components/StatusBadge';
import { useAdminAuth } from '@/lib/adminAuthContext';
import { ROLE_PERMISSIONS } from '@backend/types/rbac';
import {
  ShieldCheck,
  Server,
  Database,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { admin } = useAdminAuth();

  return (
    <AdminShell
      title="System Configuration & Security"
      subtitle="Role-based permissions matrix, session security controls, and deployment parameters"
    >
      <div className="space-y-8 max-w-5xl">
        {/* Administrator Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
              {admin?.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 font-display text-base">{admin?.name}</span>
                <StatusBadge status={admin?.role || 'ADMIN'} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{admin?.email}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Status</span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authenticated
            </span>
          </div>
        </div>

        {/* Security & Architecture Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Lock className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Session Hardening
            </h3>
            <div className="space-y-1.5 text-xs text-slate-500">
              <p>Cookie: <span className="font-mono text-slate-800 font-medium">pathway_admin_session</span></p>
              <p>Type: <span className="text-slate-800 font-medium">HttpOnly, SameSite=Lax</span></p>
              <p>Duration: <span className="text-slate-800 font-medium">7 Days (Revocable)</span></p>
              <p>Hashing: <span className="text-slate-800 font-medium">bcrypt (Salt 12)</span></p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Server className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Deployment Boundary
            </h3>
            <div className="space-y-1.5 text-xs text-slate-500">
              <p>Candidate App: <span className="font-mono text-slate-800 font-medium">/frontend</span></p>
              <p>Admin Portal: <span className="font-mono text-slate-800 font-medium">/admin</span></p>
              <p>Domain Engine: <span className="font-mono text-slate-800 font-medium">/backend</span></p>
              <p>Architecture: <span className="text-slate-800 font-medium">Modular Monolith</span></p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Database className="w-4.5 h-4.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Database & Storage
            </h3>
            <div className="space-y-1.5 text-xs text-slate-500">
              <p>Engine: <span className="text-slate-800 font-medium">MongoDB Atlas Cluster</span></p>
              <p>ORM: <span className="text-slate-800 font-medium">Prisma Client 5.22.0</span></p>
              <p>Audit Storage: <span className="text-slate-800 font-medium">Immutable AuditLog</span></p>
              <p>Indexes: <span className="text-slate-800 font-medium">Status & Role indexed</span></p>
            </div>
          </div>
        </div>

        {/* RBAC Permissions Matrix */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Role-Based Access Control (RBAC) Permissions Matrix</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono font-medium">
              CENTRALIZED SERVER-SIDE ENFORCEMENT
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            All administrative endpoints strictly enforce server-side authorization boundaries via{' '}
            <code className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-mono text-[11px]">
              requirePermission(admin, permission)
            </code>
            . Frontend UI controls reflect backend capabilities.
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Scope Description</th>
                  <th className="py-2.5 px-3 text-right">Granted Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {Object.entries(ROLE_PERMISSIONS).map(([roleName, permissions]) => (
                  <tr key={roleName} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <StatusBadge status={roleName} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {roleName === 'SUPER_ADMIN' && 'Full administrative authority across all domains and roles.'}
                      {roleName === 'ADMIN' && 'Management of courses, mentors, jobs, candidate records, and audit logs.'}
                      {roleName === 'RECRUITER' && 'Job posting management and candidate application review.'}
                      {roleName === 'MENTOR' && 'Mentorship session configuration and calendar availability.'}
                      {roleName === 'CANDIDATE' && 'Candidate job application and learning pathway discovery.'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 font-medium">
                      {permissions.length === 0 ? 'None (Candidate Only)' : `${permissions.length} Permissions`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
