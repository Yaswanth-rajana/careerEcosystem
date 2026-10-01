import { db } from '../db/client';
import { MentorApplicationSubmissionSchema } from '../validations/schemas';
import {
  MentorApplicationListDTO,
  MentorApplicationDetailDTO,
  MentorApplicationStatus,
  PaginatedAdminResult,
} from '../types/admin';
import { AuthenticatedAdmin } from './adminAuthService';
import { AuditService } from './auditService';
import { EmailService } from './email/emailService';
import { PasswordSetupTokenService } from './passwordSetupTokenService';

export interface SubmitMentorApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  location?: string | null;
  currentRole: string;
  company?: string | null;
  experienceYears: number;
  industry?: string | null;
  linkedIn?: string | null;
  gitHub?: string | null;
  portfolio?: string | null;
  domain: string;
  expertise: string[];
  additionalExpertise?: string | null;
  offerings: string[];
  preferredSessionDuration?: number;
  startingPrice?: number;
  whyMentor: string;
  whoToHelp: string;
  additionalInfo?: string | null;
  confirmAccuracy: boolean;
}

export interface ListMentorApplicationsParams {
  page?: number;
  limit?: number;
  q?: string;
  domain?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class MentorApplicationService {
  /**
   * Generates human-readable application reference ID: e.g. PM-2026-00124
   */
  static async generateReferenceId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await db.mentorApplication.count();
    let sequence = String(count + 1).padStart(5, '0');
    let referenceId = `PM-${year}-${sequence}`;

    // Ensure collision safety
    const exists = await db.mentorApplication.findUnique({
      where: { referenceId },
      select: { id: true },
    });

    if (exists) {
      const randomFive = Math.floor(10000 + Math.random() * 90000);
      referenceId = `PM-${year}-${randomFive}`;
    }

    return referenceId;
  }

  /**
   * Submits a new mentor application with duplicate protection and confirmation email.
   * Architectural Rule: NEVER creates a User or Mentor profile at submission time.
   */
  static async submitApplication(
    input: SubmitMentorApplicationInput,
    authenticatedUser?: { id: string; email: string; name: string } | null
  ) {
    // 1. Validate payload with Zod
    const validated = MentorApplicationSubmissionSchema.parse(input);
    const normalizedEmail = validated.email.toLowerCase().trim();

    // 2. Check if user is already an approved active mentor
    const existingApprovedMentor = await db.mentor.findFirst({
      where: {
        email: normalizedEmail,
        status: 'APPROVED',
      },
    });

    if (existingApprovedMentor) {
      return {
        success: false,
        alreadyApproved: true,
        message: 'A mentor profile with this email address is already approved and active. You can log in directly at the Mentor Portal.',
      };
    }

    // 3. Duplicate application check: PENDING or UNDER_REVIEW
    const existingActiveApp = await db.mentorApplication.findFirst({
      where: {
        email: normalizedEmail,
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
    });

    if (existingActiveApp) {
      return {
        success: true,
        duplicate: true,
        referenceId: existingActiveApp.referenceId,
        status: existingActiveApp.status,
        createdAt: existingActiveApp.createdAt.toISOString(),
        message: 'An active mentor application is already on file and under review for this email address.',
        application: {
          id: existingActiveApp.id,
          referenceId: existingActiveApp.referenceId,
          fullName: existingActiveApp.fullName,
          email: existingActiveApp.email,
          status: existingActiveApp.status,
          createdAt: existingActiveApp.createdAt.toISOString(),
        },
      };
    }

    // 4. Generate human-readable reference
    const referenceId = await this.generateReferenceId();

    // 5. Store application (Status strictly determined server-side: PENDING)
    const application = await db.mentorApplication.create({
      data: {
        referenceId,
        userId: authenticatedUser?.id || null,
        fullName: validated.fullName.trim(),
        email: normalizedEmail,
        phone: validated.phone.trim(),
        location: validated.location?.trim() || null,
        currentRole: validated.currentRole.trim(),
        company: validated.company?.trim() || null,
        experienceYears: validated.experienceYears,
        industry: validated.industry?.trim() || null,
        linkedIn: validated.linkedIn?.trim() || null,
        gitHub: validated.gitHub?.trim() || null,
        portfolio: validated.portfolio?.trim() || null,
        domain: validated.domain.trim(),
        expertise: validated.expertise,
        additionalExpertise: validated.additionalExpertise?.trim() || null,
        offerings: validated.offerings,
        preferredSessionDuration: validated.preferredSessionDuration || 45,
        startingPrice: validated.startingPrice || 0,
        whyMentor: validated.whyMentor.trim(),
        whoToHelp: validated.whoToHelp.trim(),
        additionalInfo: validated.additionalInfo?.trim() || null,
        status: 'PENDING',
      },
    });

    // 6. Audit activity log
    await AuditService.log({
      actorId: authenticatedUser?.id || application.id,
      actorEmail: normalizedEmail,
      actorName: validated.fullName,
      action: 'MENTOR_APPLICATION_CREATED',
      resourceType: 'MENTOR_APPLICATION',
      resourceId: application.id,
      details: {
        referenceId: application.referenceId,
        domain: application.domain,
        experienceYears: application.experienceYears,
      },
    });

    // 7. Dispatch transactional confirmation email via EmailService (ZeptoMail provider)
    await EmailService.sendMentorApplicationReceivedEmail({
      name: application.fullName,
      email: application.email,
      referenceId: application.referenceId,
      applicationId: application.id,
      submittedDate: application.createdAt,
    });

    return {
      success: true,
      duplicate: false,
      referenceId: application.referenceId,
      status: application.status,
      createdAt: application.createdAt.toISOString(),
      message: 'Thank you for your interest in becoming a PATHWAY.ECO mentor. Your application has been received.',
      application: {
        id: application.id,
        referenceId: application.referenceId,
        fullName: application.fullName,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt.toISOString(),
      },
    };
  }

  /**
   * Retrieves paginated mentor applications for admin dashboard.
   */
  static async listApplications(
    params: ListMentorApplicationsParams = {}
  ): Promise<PaginatedAdminResult<MentorApplicationListDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.domain && params.domain !== 'All') {
      where.domain = { equals: params.domain, mode: 'insensitive' };
    }

    if (params.status && params.status !== 'All') {
      where.status = params.status;
    }

    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { referenceId: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { currentRole: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
        { domain: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortDir || 'desc';

    const [total, applications] = await Promise.all([
      db.mentorApplication.count({ where }),
      db.mentorApplication.findMany({
        where,
        select: {
          id: true,
          referenceId: true,
          userId: true,
          fullName: true,
          email: true,
          phone: true,
          location: true,
          currentRole: true,
          company: true,
          experienceYears: true,
          industry: true,
          domain: true,
          status: true,
          createdAt: true,
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const items: MentorApplicationListDTO[] = applications.map((app) => ({
      id: app.id,
      referenceId: app.referenceId,
      userId: app.userId,
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      location: app.location,
      currentRole: app.currentRole,
      company: app.company,
      experienceYears: app.experienceYears,
      industry: app.industry,
      domain: app.domain,
      status: app.status as MentorApplicationStatus,
      createdAt: app.createdAt.toISOString(),
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Retrieves full application details for admin inspection.
   */
  static async getApplicationDetail(id: string): Promise<MentorApplicationDetailDTO | null> {
    if (!id) return null;

    const app = await db.mentorApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!app) return null;

    return {
      id: app.id,
      referenceId: app.referenceId,
      userId: app.userId,
      fullName: app.fullName,
      email: app.email,
      phone: app.phone,
      location: app.location,
      currentRole: app.currentRole,
      company: app.company,
      experienceYears: app.experienceYears,
      industry: app.industry,
      linkedIn: app.linkedIn,
      gitHub: app.gitHub,
      portfolio: app.portfolio,
      domain: app.domain,
      expertise: app.expertise,
      additionalExpertise: app.additionalExpertise,
      offerings: app.offerings,
      preferredSessionDuration: app.preferredSessionDuration,
      startingPrice: app.startingPrice,
      whyMentor: app.whyMentor,
      whoToHelp: app.whoToHelp,
      additionalInfo: app.additionalInfo,
      status: app.status as MentorApplicationStatus,
      decisionReason: app.decisionReason,
      internalAdminNotes: app.internalAdminNotes,
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt?.toISOString() || null,
      approvedAt: app.approvedAt?.toISOString() || null,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
      user: app.user,
    };
  }

  /**
   * Transitions application from PENDING -> UNDER_REVIEW
   */
  static async startReview(id: string, admin: AuthenticatedAdmin): Promise<MentorApplicationDetailDTO> {
    const app = await db.mentorApplication.findUnique({ where: { id } });
    if (!app) {
      throw new Error(`Mentor application with ID ${id} not found`);
    }

    if (app.status === 'PENDING') {
      await db.mentorApplication.update({
        where: { id },
        data: {
          status: 'UNDER_REVIEW',
          reviewedBy: admin.name,
          reviewedAt: new Date(),
        },
      });

      await AuditService.log({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        action: 'MENTOR_APPLICATION_REVIEW_STARTED',
        resourceType: 'MENTOR_APPLICATION',
        resourceId: id,
        details: { referenceId: app.referenceId, applicantName: app.fullName },
      });
    }

    return (await this.getApplicationDetail(id))!;
  }

  /**
   * Idempotent Mentor Application Approval Workflow:
   * 1. Validates application state.
   * 2. Finds existing User or provisions new User.
   * 3. Elevates User role to MENTOR.
   * 4. Provisions MentorProfile (Mentor record).
   * 5. Marks application APPROVED.
   * 6. Generates secure single-use 24-hr setup token.
   * 7. Audits events.
   * 8. Dispatches welcome email with password setup link.
   */
  static async approveApplication(
    id: string,
    admin: AuthenticatedAdmin,
    options: { internalNotes?: string } = {}
  ) {
    const app = await db.mentorApplication.findUnique({ where: { id } });
    if (!app) {
      throw new Error(`Mentor application with ID ${id} not found`);
    }

    const normalizedEmail = app.email.toLowerCase().trim();

    // 1. Idempotency Check: if already approved, return existing state
    if (app.status === 'APPROVED') {
      const existingMentor = await db.mentor.findFirst({
        where: { email: normalizedEmail },
      });
      return {
        alreadyApproved: true,
        message: 'This application has already been approved.',
        application: await this.getApplicationDetail(id),
        mentor: existingMentor,
      };
    }

    // 2. Resolve or provision User account
    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    let isNewUserCreated = false;

    if (!user) {
      // Create new user account with MENTOR role and temporary first-login state
      user = await db.user.create({
        data: {
          name: app.fullName,
          email: normalizedEmail,
          role: 'MENTOR',
          status: 'ACTIVE',
          mustChangePassword: true,
          isOnboarded: true,
          profile: {
            create: {
              candidateType: 'PROFESSIONAL',
              headline: `${app.currentRole}${app.company ? ' at ' + app.company : ''}`,
              currentRole: app.currentRole,
              totalExperience: `${app.experienceYears} Years`,
              location: app.location || null,
              phone: app.phone,
            },
          },
        },
      });
      isNewUserCreated = true;

      await AuditService.log({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        action: 'MENTOR_ACCOUNT_CREATED',
        resourceType: 'USER',
        resourceId: user.id,
        details: { email: user.email, name: user.name },
      });
    } else {
      // Existing User account: safely elevate role without destroying existing candidate records
      const needsPasswordSetup = !user.passwordHash;
      user = await db.user.update({
        where: { id: user.id },
        data: {
          role: 'MENTOR',
          ...(needsPasswordSetup ? { mustChangePassword: true } : {}),
        },
      });

      await AuditService.log({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        action: 'MENTOR_ACCOUNT_ACTIVATED',
        resourceType: 'USER',
        resourceId: user.id,
        details: { email: user.email, previousRole: user.role, newRole: 'MENTOR' },
      });
    }

    // 3. Resolve or provision MentorProfile (Mentor model)
    let mentor = await db.mentor.findFirst({
      where: {
        OR: [
          { userId: user.id },
          { email: normalizedEmail },
        ],
      },
    });

    const headline = `${app.currentRole}${app.company ? ' at ' + app.company : ''}`;
    const bio = `${app.whyMentor}\n\nMentorship Focus: ${app.whoToHelp}${app.additionalInfo ? '\n\n' + app.additionalInfo : ''}`;

    if (!mentor) {
      mentor = await db.mentor.create({
        data: {
          userId: user.id,
          name: app.fullName,
          email: normalizedEmail,
          headline,
          bio,
          domain: app.domain,
          company: app.company || null,
          experienceYears: app.experienceYears,
          expertise: app.expertise,
          sessionTypes: app.offerings,
          skillsList: app.expertise,
          startingPrice: app.startingPrice || 0,
          status: 'APPROVED',
          approvedAt: new Date(),
          applicationId: app.id,
          publicProfileEnabled: true,
        },
      });
    } else {
      mentor = await db.mentor.update({
        where: { id: mentor.id },
        data: {
          userId: user.id,
          name: app.fullName,
          headline,
          domain: app.domain,
          company: app.company || mentor.company,
          experienceYears: app.experienceYears,
          expertise: app.expertise.length > 0 ? app.expertise : mentor.expertise,
          sessionTypes: app.offerings.length > 0 ? app.offerings : mentor.sessionTypes,
          status: 'APPROVED',
          approvedAt: new Date(),
          applicationId: app.id,
          rejectionReason: null,
          publicProfileEnabled: true,
        },
      });
    }

    // 4. Update Application Record
    const updatedApp = await db.mentorApplication.update({
      where: { id: app.id },
      data: {
        status: 'APPROVED',
        userId: user.id,
        approvedAt: new Date(),
        reviewedBy: admin.name,
        reviewedAt: new Date(),
        internalAdminNotes: options.internalNotes || app.internalAdminNotes,
      },
    });

    // 5. Generate secure one-time password setup token (valid 24h)
    const { rawToken } = await PasswordSetupTokenService.createSetupToken(user.id);
    const portalBaseUrl = process.env.MENTOR_PORTAL_URL || 'http://localhost:3003';
    const setupUrl = `${portalBaseUrl}/setup-password?token=${rawToken}`;

    // 6. Audit application approval
    await AuditService.log({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      action: 'MENTOR_APPLICATION_APPROVED',
      resourceType: 'MENTOR_APPLICATION',
      resourceId: app.id,
      details: {
        referenceId: app.referenceId,
        applicantName: app.fullName,
        applicantEmail: app.email,
        mentorId: mentor.id,
        userId: user.id,
        isNewUserCreated,
      },
    });

    // 7. Dispatch Welcome & Setup Email via ZeptoMail (non-blocking on network failure)
    const emailResult = await EmailService.sendMentorApplicationApprovedEmail({
      name: app.fullName,
      email: app.email,
      setupUrl,
      applicationId: app.id,
      referenceId: app.referenceId,
      userId: user.id,
    });

    if (emailResult.success) {
      await AuditService.log({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        action: 'MENTOR_WELCOME_EMAIL_SENT',
        resourceType: 'MENTOR_APPLICATION',
        resourceId: app.id,
        details: { email: app.email, deliveryId: emailResult.deliveryId },
      });
    } else {
      await AuditService.log({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        action: 'MENTOR_WELCOME_EMAIL_FAILED',
        resourceType: 'MENTOR_APPLICATION',
        resourceId: app.id,
        details: { email: app.email },
      });
    }

    return {
      success: true,
      message: `Mentor application for ${app.fullName} has been approved.`,
      application: await this.getApplicationDetail(app.id),
      mentor,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      emailSent: emailResult.success,
    };
  }

  /**
   * Rejects a mentor application with mandatory public reason and optional internal notes.
   */
  static async rejectApplication(
    id: string,
    reason: string,
    admin: AuthenticatedAdmin,
    internalNotes?: string
  ) {
    if (!reason || reason.trim().length < 5) {
      throw new Error('A detailed reason (at least 5 characters) is required when rejecting an application.');
    }

    const app = await db.mentorApplication.findUnique({ where: { id } });
    if (!app) {
      throw new Error(`Mentor application with ID ${id} not found`);
    }

    const updatedApp = await db.mentorApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        decisionReason: reason.trim(),
        internalAdminNotes: internalNotes?.trim() || null,
        reviewedBy: admin.name,
        reviewedAt: new Date(),
      },
    });

    await AuditService.log({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      action: 'MENTOR_APPLICATION_REJECTED',
      resourceType: 'MENTOR_APPLICATION',
      resourceId: id,
      details: {
        referenceId: app.referenceId,
        applicantName: app.fullName,
        applicantEmail: app.email,
        reason: reason.trim(),
      },
    });

    // Send rejection email (respectful communication, NEVER exposing internal notes)
    await EmailService.sendMentorApplicationRejectedEmail({
      name: app.fullName,
      email: app.email,
      referenceId: app.referenceId,
      reason: reason.trim(),
      applicationId: app.id,
    });

    return (await this.getApplicationDetail(id))!;
  }

  /**
   * Secure admin action: Resends the welcome & password setup email.
   * Generates a brand new single-use token and invalidates any previous setup link.
   */
  static async resendWelcomeEmail(id: string, admin: AuthenticatedAdmin) {
    const app = await db.mentorApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!app) {
      throw new Error(`Mentor application with ID ${id} not found`);
    }

    if (app.status !== 'APPROVED') {
      throw new Error('Welcome emails can only be sent for approved mentor applications.');
    }

    const targetUserId = app.userId || (await db.user.findUnique({ where: { email: app.email.toLowerCase() } }))?.id;
    if (!targetUserId) {
      throw new Error('No user account found linked to this approved application.');
    }

    // Generate new token (invalidates previous ones)
    const { rawToken } = await PasswordSetupTokenService.createSetupToken(targetUserId);
    const portalBaseUrl = process.env.MENTOR_PORTAL_URL || 'http://localhost:3003';
    const setupUrl = `${portalBaseUrl}/setup-password?token=${rawToken}`;

    const emailResult = await EmailService.sendMentorApplicationApprovedEmail({
      name: app.fullName,
      email: app.email,
      setupUrl,
      applicationId: app.id,
      referenceId: app.referenceId,
      userId: targetUserId,
    });

    await AuditService.log({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      action: 'MENTOR_WELCOME_RESENT',
      resourceType: 'MENTOR_APPLICATION',
      resourceId: app.id,
      details: {
        referenceId: app.referenceId,
        applicantEmail: app.email,
        deliverySuccess: emailResult.success,
      },
    });

    return {
      success: emailResult.success,
      message: emailResult.success
        ? 'A new welcome and password setup email has been dispatched.'
        : 'Failed to dispatch email. Please check ZeptoMail service status.',
    };
  }
}
