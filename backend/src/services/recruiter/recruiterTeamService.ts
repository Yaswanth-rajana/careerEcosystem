import crypto from 'crypto';
import { db } from '../../db/client';
import {
  CompanyTeamMemberDTO,
  CompanyInvitationDTO,
  AuthenticatedRecruiter,
  RecruiterRole,
} from '../../types/recruiter';
import {
  TeamMemberInviteSchema,
  TeamMemberUpdateRoleSchema,
} from '../../validations/recruiterSchemas';
import { AuditService } from '../auditService';
import { EmailService } from '../email/emailService';
import { resolveRecruiterPortalUrl } from '../email/templates/urlHelper';
import { RecruiterRbacService } from './recruiterRbacService';
import { RecruiterAuthError } from './recruiterAuthService';
import { z } from 'zod';

export class RecruiterTeamService {
  /**
   * Lists all active and registered members of the company team.
   */
  static async listTeamMembers(
    companyId: string,
    auth: AuthenticatedRecruiter
  ): Promise<CompanyTeamMemberDTO[]> {
    RecruiterRbacService.assertPermission(auth, 'team:view');

    const members = await db.companyMember.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: RecruiterRbacService.normalizeRole(m.role),
      title: m.title,
      department: m.department,
      assignedJobIds: m.assignedJobIds || [],
      interviewTypes: m.interviewTypes || [],
      status: m.status,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  /**
   * Lists pending and past invitations for the company.
   */
  static async listInvitations(
    companyId: string,
    auth: AuthenticatedRecruiter
  ): Promise<CompanyInvitationDTO[]> {
    RecruiterRbacService.assertPermission(auth, 'team:view');

    const invitations = await db.companyInvitation.findMany({
      where: { companyId },
      include: {
        invitedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    return invitations.map((inv) => {
      let currentStatus = inv.status;
      if (currentStatus === 'PENDING' && inv.expiresAt < now) {
        currentStatus = 'EXPIRED';
      }

      return {
        id: inv.id,
        companyId: inv.companyId,
        email: inv.email,
        name: inv.name,
        role: RecruiterRbacService.normalizeRole(inv.role),
        title: inv.title,
        department: inv.department,
        assignedJobIds: inv.assignedJobIds || [],
        interviewTypes: inv.interviewTypes || [],
        message: inv.message,
        status: currentStatus as any,
        invitedById: inv.invitedById,
        invitedByName: inv.invitedBy.name,
        invitedByEmail: inv.invitedBy.email,
        expiresAt: inv.expiresAt.toISOString(),
        acceptedAt: inv.acceptedAt ? inv.acceptedAt.toISOString() : null,
        revokedAt: inv.revokedAt ? inv.revokedAt.toISOString() : null,
        lastSentAt: inv.lastSentAt.toISOString(),
        createdAt: inv.createdAt.toISOString(),
      };
    });
  }

  /**
   * Invites a new team member with secure expiring token and role scoping.
   */
  static async inviteMember(
    companyId: string,
    data: z.input<typeof TeamMemberInviteSchema>,
    auth: AuthenticatedRecruiter,
    options?: { baseUrl?: string }
  ) {
    RecruiterRbacService.assertPermission(auth, 'team:invite');

    const validated = TeamMemberInviteSchema.parse(data);
    const email = validated.email.toLowerCase().trim();

    // Prevent non-admins from assigning COMPANY_ADMIN role
    if (validated.role === 'COMPANY_ADMIN' && auth.companyRole !== 'COMPANY_ADMIN') {
      throw new RecruiterAuthError(
        'Forbidden. Only a Company Admin can invite another Company Admin.',
        403
      );
    }

    // Check if an active membership already exists with this email for this company
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMember = await db.companyMember.findUnique({
        where: {
          companyId_userId: {
            companyId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember && existingMember.status === 'ACTIVE') {
        throw new RecruiterAuthError(
          `A team member with email ${email} is already active in ${auth.company.name}.`,
          400
        );
      }
    }

    // Check for conflicting pending invitation
    const existingPending = await db.companyInvitation.findFirst({
      where: {
        companyId,
        email,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    if (existingPending) {
      throw new RecruiterAuthError(
        `A pending invitation for ${email} already exists. You can resend or revoke the pending invitation.`,
        400
      );
    }

    // Generate secure expiring token (32 random bytes)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresInDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invitation = await db.companyInvitation.create({
      data: {
        companyId,
        email,
        name: validated.name || null,
        role: validated.role,
        title: validated.title || null,
        department: validated.department || null,
        assignedJobIds: validated.assignedJobIds || [],
        interviewTypes: validated.interviewTypes || [],
        message: validated.message || null,
        tokenHash,
        status: 'PENDING',
        invitedById: auth.user.id,
        expiresAt,
        lastSentAt: new Date(),
      },
      include: {
        company: true,
      },
    });

    // Send invitation email
    const baseUrl = resolveRecruiterPortalUrl(options?.baseUrl);
    const acceptUrl = `${baseUrl}/team/accept-invite?token=${rawToken}`;

    const emailResult = await EmailService.sendRecruiterInvitationEmail({
      to: email,
      toName: validated.name,
      companyName: auth.company.name,
      invitedByName: auth.user.name,
      role: validated.role,
      acceptUrl,
      expiresInDays,
      message: validated.message,
    });

    if (!emailResult.success) {
      // Mark as FAILED so user and admin can see and retry
      await db.companyInvitation.update({
        where: { id: invitation.id },
        data: { status: 'FAILED' },
      });
    }

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_INVITATION_CREATED',
      resourceType: 'COMPANY_INVITATION',
      resourceId: invitation.id,
      details: {
        email,
        role: validated.role,
        emailSent: emailResult.success,
      },
    });

    return {
      invitation: {
        id: invitation.id,
        companyId: invitation.companyId,
        email: invitation.email,
        name: invitation.name,
        role: RecruiterRbacService.normalizeRole(invitation.role),
        title: invitation.title,
        status: emailResult.success ? 'PENDING' : 'FAILED',
        expiresAt: invitation.expiresAt.toISOString(),
      },
      rawToken, // Provided for direct verification / link generation in tests
    };
  }

  /**
   * Resends a pending or failed invitation with a fresh expiration and token.
   */
  static async resendInvitation(
    companyId: string,
    invitationId: string,
    auth: AuthenticatedRecruiter,
    options?: { baseUrl?: string }
  ) {
    RecruiterRbacService.assertPermission(auth, 'team:invite');

    const invitation = await db.companyInvitation.findFirst({
      where: { id: invitationId, companyId },
    });

    if (!invitation) {
      throw new RecruiterAuthError('Invitation not found or access denied.', 404);
    }

    if (invitation.status === 'ACCEPTED') {
      throw new RecruiterAuthError('This invitation has already been accepted.', 400);
    }

    // Refresh token and expiration
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresInDays = 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const baseUrl = resolveRecruiterPortalUrl(options?.baseUrl);
    const acceptUrl = `${baseUrl}/team/accept-invite?token=${rawToken}`;

    const emailResult = await EmailService.sendRecruiterInvitationEmail({
      to: invitation.email,
      toName: invitation.name,
      companyName: auth.company.name,
      invitedByName: auth.user.name,
      role: invitation.role,
      acceptUrl,
      expiresInDays,
      message: invitation.message,
    });

    const existingPrevious = Array.isArray((invitation as any).previousTokenHashes)
      ? (invitation as any).previousTokenHashes
      : [];
    const previousTokenHashes = Array.from(new Set([...existingPrevious, invitation.tokenHash]));

    await db.companyInvitation.update({
      where: { id: invitation.id },
      data: {
        tokenHash,
        previousTokenHashes,
        expiresAt,
        lastSentAt: new Date(),
        status: emailResult.success ? 'PENDING' : 'FAILED',
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_INVITATION_RESENT',
      resourceType: 'COMPANY_INVITATION',
      resourceId: invitation.id,
      details: { email: invitation.email, emailSent: emailResult.success },
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Failed to deliver invitation email via ZeptoMail');
    }

    return { success: true, emailSent: true, rawToken };
  }

  /**
   * Revokes an existing invitation.
   */
  static async revokeInvitation(
    companyId: string,
    invitationId: string,
    auth: AuthenticatedRecruiter
  ) {
    RecruiterRbacService.assertPermission(auth, 'team:invite');

    const invitation = await db.companyInvitation.findFirst({
      where: { id: invitationId, companyId },
    });

    if (!invitation) {
      throw new RecruiterAuthError('Invitation not found or access denied.', 404);
    }

    if (invitation.status === 'ACCEPTED') {
      throw new RecruiterAuthError('Cannot revoke an invitation that was already accepted.', 400);
    }

    await db.companyInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_INVITATION_REVOKED',
      resourceType: 'COMPANY_INVITATION',
      resourceId: invitation.id,
      details: { email: invitation.email },
    });

    return { success: true };
  }

  /**
   * Accepts an invitation via secure token. Safe to retry (idempotent).
   */
  static async acceptInvitation(token: string) {
    if (!token || typeof token !== 'string') {
      throw new RecruiterAuthError('Invalid or missing invitation token.', 400);
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const invitation = await db.companyInvitation.findFirst({
      where: {
        OR: [
          { tokenHash },
          { previousTokenHashes: { has: tokenHash } },
        ],
      },
      include: { company: true },
    });

    if (!invitation) {
      throw new RecruiterAuthError('Invitation link is invalid or has expired.', 400);
    }

    if (invitation.status === 'REVOKED') {
      throw new RecruiterAuthError('This invitation has been revoked by the company administrator.', 403);
    }

    // Idempotent retry: if already accepted, return existing active membership safely
    if (invitation.status === 'ACCEPTED') {
      const existingUser = await db.user.findUnique({ where: { email: invitation.email } });
      if (existingUser) {
        const member = await db.companyMember.findUnique({
          where: {
            companyId_userId: {
              companyId: invitation.companyId,
              userId: existingUser.id,
            },
          },
        });
        if (member && member.status === 'ACTIVE') {
          return {
            success: true,
            alreadyAccepted: true,
            companyName: invitation.company.name,
            role: invitation.role,
            userId: existingUser.id,
            memberId: member.id,
            member: {
              id: member.id,
              companyId: member.companyId,
              userId: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              role: member.role,
              title: member.title,
              department: member.department,
              status: member.status,
              companyName: invitation.company.name,
            },
            isNewUser: false,
          };
        }
      }
    }

    // Expiration check
    if (invitation.expiresAt < new Date()) {
      await db.companyInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw new RecruiterAuthError('This invitation link has expired. Please ask your administrator to resend.', 400);
    }

    // Resolve or provision user without duplicate creation
    let user = await db.user.findUnique({ where: { email: invitation.email } });
    if (!user) {
      user = await db.user.create({
        data: {
          name: invitation.name || invitation.email.split('@')[0],
          email: invitation.email,
          role: 'RECRUITER',
          status: 'ACTIVE',
          mustChangePassword: true,
          isOnboarded: true,
        },
      });
    }

    // Upsert RecruiterProfile
    await db.recruiterProfile.upsert({
      where: { userId: user.id },
      update: {
        companyId: invitation.companyId,
        designation: invitation.title || 'Team Member',
        status: 'ACTIVE',
      },
      create: {
        userId: user.id,
        companyId: invitation.companyId,
        designation: invitation.title || 'Team Member',
        status: 'ACTIVE',
      },
    });

    // Create or activate CompanyMember
    const member = await db.companyMember.upsert({
      where: {
        companyId_userId: {
          companyId: invitation.companyId,
          userId: user.id,
        },
      },
      update: {
        role: invitation.role,
        title: invitation.title || null,
        department: invitation.department || null,
        assignedJobIds: invitation.assignedJobIds || [],
        interviewTypes: invitation.interviewTypes || [],
        status: 'ACTIVE',
      },
      create: {
        companyId: invitation.companyId,
        userId: user.id,
        role: invitation.role,
        title: invitation.title || null,
        department: invitation.department || null,
        assignedJobIds: invitation.assignedJobIds || [],
        interviewTypes: invitation.interviewTypes || [],
        status: 'ACTIVE',
      },
    });

    // Mark invitation accepted
    await db.companyInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    await AuditService.log({
      actorId: user.id,
      actorEmail: user.email,
      actorName: user.name,
      action: 'RECRUITER_INVITATION_ACCEPTED',
      resourceType: 'COMPANY_MEMBER',
      resourceId: member.id,
      details: {
        companyId: invitation.companyId,
        role: invitation.role,
      },
    });

    const memberData = {
      id: member.id,
      companyId: member.companyId,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: member.role,
      title: member.title,
      department: member.department,
      status: member.status,
      companyName: invitation.company.name,
    };

    return {
      success: true,
      companyName: invitation.company.name,
      role: invitation.role,
      userId: user.id,
      memberId: member.id,
      member: memberData,
      isNewUser: user.mustChangePassword ?? false,
    };
  }

  /**
   * Updates an existing team member's role or scopes.
   */
  static async updateMemberRole(
    companyId: string,
    memberId: string,
    data: z.input<typeof TeamMemberUpdateRoleSchema>,
    auth: AuthenticatedRecruiter
  ) {
    RecruiterRbacService.assertPermission(auth, 'team:manage_roles');

    const validated = TeamMemberUpdateRoleSchema.parse(data);

    // If demoting or changing role from COMPANY_ADMIN to another role, ensure last admin is preserved
    if (validated.role && validated.role !== 'COMPANY_ADMIN') {
      await RecruiterRbacService.assertCanDemoteOrRemoveAdmin(companyId, memberId);
    }

    const member = await db.companyMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member || member.companyId !== companyId) {
      throw new RecruiterAuthError('Team member not found in this company.', 404);
    }

    const updated = await db.companyMember.update({
      where: { id: memberId },
      data: {
        ...(validated.role ? { role: validated.role } : {}),
        ...(validated.title !== undefined ? { title: validated.title } : {}),
        ...(validated.department !== undefined ? { department: validated.department } : {}),
        ...(validated.assignedJobIds !== undefined ? { assignedJobIds: validated.assignedJobIds } : {}),
        ...(validated.interviewTypes !== undefined ? { interviewTypes: validated.interviewTypes } : {}),
        ...(validated.status ? { status: validated.status } : {}),
      },
      include: { user: true },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_ROLE_UPDATED',
      resourceType: 'COMPANY_MEMBER',
      resourceId: member.id,
      details: {
        targetUserEmail: member.user.email,
        oldRole: member.role,
        newRole: updated.role,
      },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      name: updated.user.name,
      email: updated.user.email,
      role: RecruiterRbacService.normalizeRole(updated.role),
      title: updated.title,
      department: updated.department,
      assignedJobIds: updated.assignedJobIds,
      interviewTypes: updated.interviewTypes,
      status: updated.status,
      joinedAt: updated.joinedAt.toISOString(),
    };
  }

  /**
   * Removes or deactivates a team member.
   */
  static async removeMember(
    companyId: string,
    memberId: string,
    auth: AuthenticatedRecruiter
  ) {
    RecruiterRbacService.assertPermission(auth, 'team:remove_member');

    // Protect last active COMPANY_ADMIN
    await RecruiterRbacService.assertCanDemoteOrRemoveAdmin(companyId, memberId);

    const member = await db.companyMember.findUnique({
      where: { id: memberId },
      include: { user: true },
    });

    if (!member || member.companyId !== companyId) {
      throw new RecruiterAuthError('Team member not found in this company.', 404);
    }

    // Set membership to SUSPENDED or delete
    await db.companyMember.update({
      where: { id: memberId },
      data: { status: 'SUSPENDED' },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_MEMBER_DEACTIVATED',
      resourceType: 'COMPANY_MEMBER',
      resourceId: member.id,
      details: { targetEmail: member.user.email },
    });

    return { success: true };
  }
}
