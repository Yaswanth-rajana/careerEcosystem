import { db } from '../../db/client';
import {
  EmployerApplicationSubmissionDTO,
  EmployerApplicationListDTO,
  EmployerApplicationDetailDTO,
  EmployerApplicationStatus,
} from '../../types/employerApplication';
import { FullEmployerApplicationSchema, EmployerApplicationDecisionSchema } from '../../validations/employerApplicationSchemas';
import { AuditService } from '../auditService';
import { EmailService } from '../email/emailService';
import { PasswordSetupTokenService } from '../passwordSetupTokenService';
import { AuthenticatedAdmin } from '../adminAuthService';

export interface ListEmployerApplicationsParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class EmployerApplicationService {
  /**
   * Generates next human-readable reference ID: EMP-2026-00001
   */
  private static async generateReferenceId(): Promise<string> {
    const year = new Date().getFullYear();
    let refId = '';
    let exists = true;
    while (exists) {
      const rand = Math.floor(10000 + Math.random() * 90000);
      refId = `EMP-${year}-${rand}`;
      const found = await db.employerApplication.findUnique({ where: { referenceId: refId } });
      if (!found) exists = false;
    }
    return refId;
  }

  /**
   * Helper to slugify company name.
   */
  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Submits a new employer/recruiter application.
   */
  static async submitApplication(
    data: EmployerApplicationSubmissionDTO,
    authenticatedUser?: { id: string; email: string } | null
  ) {
    const validated = FullEmployerApplicationSchema.parse(data);
    const normalizedEmail = validated.workEmail.toLowerCase().trim();

    // 1. Check if an active application already exists for this email
    const existingActiveApp = await db.employerApplication.findFirst({
      where: {
        workEmail: normalizedEmail,
        status: { in: ['PENDING', 'UNDER_REVIEW', 'APPROVED'] },
      },
    });

    if (existingActiveApp) {
      if (existingActiveApp.status === 'APPROVED') {
        return {
          alreadyApproved: true,
          message: 'An employer account for this email is already approved. You can sign in directly to the Employer Portal.',
          applicationId: existingActiveApp.id,
          referenceId: existingActiveApp.referenceId,
        };
      }
      return {
        alreadySubmitted: true,
        message: 'An active application with this work email is already under review.',
        applicationId: existingActiveApp.id,
        referenceId: existingActiveApp.referenceId,
      };
    }

    const referenceId = await this.generateReferenceId();

    const application = await db.employerApplication.create({
      data: {
        referenceId,
        userId: authenticatedUser?.id || null,
        fullName: validated.fullName,
        workEmail: normalizedEmail,
        phone: validated.phone,
        designation: validated.designation,
        linkedInUrl: validated.linkedInUrl || null,
        companyName: validated.companyName,
        companyWebsite: validated.companyWebsite,
        companyLinkedIn: validated.companyLinkedIn || null,
        industry: validated.industry,
        companySize: validated.companySize,
        headquartersLocation: validated.headquartersLocation,
        rolesHired: validated.rolesHired,
        hiringVolume: validated.hiringVolume || null,
        preferredExperienceLevels: validated.preferredExperienceLevels,
        hiringLocations: validated.hiringLocations,
        workModes: validated.workModes,
        verificationNotes: validated.verificationNotes || null,
        status: 'PENDING',
      },
    });

    // Send confirmation email
    await EmailService.sendEmployerApplicationReceivedEmail({
      name: application.fullName,
      companyName: application.companyName,
      email: application.workEmail,
      referenceId: application.referenceId,
      applicationId: application.id,
      userId: application.userId,
    }).catch((err) => console.error('[EmployerApplication] Email dispatch error:', err));

    return {
      success: true,
      message: 'Your employer application has been received and is pending review.',
      applicationId: application.id,
      referenceId: application.referenceId,
    };
  }

  /**
   * Retrieves paginated applications for Admin review.
   */
  static async listApplications(params: ListEmployerApplicationsParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status && params.status !== 'All') {
      where.status = params.status;
    }
    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { companyName: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { workEmail: { contains: q, mode: 'insensitive' } },
        { referenceId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortDir || 'desc';

    const [total, applications] = await Promise.all([
      db.employerApplication.count({ where }),
      db.employerApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
        select: {
          id: true,
          referenceId: true,
          fullName: true,
          workEmail: true,
          phone: true,
          designation: true,
          companyName: true,
          companyWebsite: true,
          industry: true,
          companySize: true,
          status: true,
          reviewedBy: true,
          reviewedAt: true,
          approvedAt: true,
          createdAt: true,
        },
      }),
    ]);

    const items: EmployerApplicationListDTO[] = applications.map((app) => ({
      id: app.id,
      referenceId: app.referenceId,
      fullName: app.fullName,
      workEmail: app.workEmail,
      phone: app.phone,
      designation: app.designation,
      companyName: app.companyName,
      companyWebsite: app.companyWebsite,
      industry: app.industry,
      companySize: app.companySize,
      status: app.status as EmployerApplicationStatus,
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt?.toISOString() || null,
      approvedAt: app.approvedAt?.toISOString() || null,
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
   * Retrieves full application details by ID.
   */
  static async getApplicationDetail(id: string): Promise<EmployerApplicationDetailDTO> {
    const app = await db.employerApplication.findUnique({ where: { id } });
    if (!app) {
      throw new Error(`Employer application with ID ${id} not found.`);
    }

    return {
      id: app.id,
      referenceId: app.referenceId,
      fullName: app.fullName,
      workEmail: app.workEmail,
      phone: app.phone,
      designation: app.designation,
      linkedInUrl: app.linkedInUrl,
      companyName: app.companyName,
      companyWebsite: app.companyWebsite,
      companyLinkedIn: app.companyLinkedIn,
      industry: app.industry,
      companySize: app.companySize,
      headquartersLocation: app.headquartersLocation,
      rolesHired: app.rolesHired,
      hiringVolume: app.hiringVolume,
      preferredExperienceLevels: app.preferredExperienceLevels,
      hiringLocations: app.hiringLocations,
      workModes: app.workModes,
      verificationNotes: app.verificationNotes,
      status: app.status as EmployerApplicationStatus,
      decisionReason: app.decisionReason,
      internalAdminNotes: app.internalAdminNotes,
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt?.toISOString() || null,
      approvedAt: app.approvedAt?.toISOString() || null,
      userId: app.userId,
      companyId: app.companyId,
      createdAt: app.createdAt.toISOString(),
    };
  }

  /**
   * Transitions application from PENDING to UNDER_REVIEW.
   */
  static async startReview(id: string, admin: AuthenticatedAdmin) {
    const app = await db.employerApplication.findUnique({ where: { id } });
    if (!app) {
      throw new Error(`Employer application with ID ${id} not found.`);
    }

    if (app.status !== 'PENDING') {
      return this.getApplicationDetail(id);
    }

    const updated = await db.employerApplication.update({
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
      action: 'EMPLOYER_APPLICATION_REVIEW_STARTED',
      resourceType: 'EMPLOYER_APPLICATION',
      resourceId: app.id,
      details: { referenceId: app.referenceId, companyName: app.companyName },
    });

    return this.getApplicationDetail(updated.id);
  }

  /**
   * Approves an employer application:
   * 1. Idempotency Check.
   * 2. Provision or resolve User account (preserves candidate profile).
   * 3. Create or resolve Company.
   * 4. Create CompanyMember (COMPANY_ADMIN).
   * 5. Create RecruiterProfile.
   * 6. Generate 24-hr single-use PasswordSetupToken.
   * 7. Audit log & dispatch setup email.
   */
  static async approveApplication(
    id: string,
    admin: AuthenticatedAdmin,
    options: { internalNotes?: string } = {}
  ) {
    const app = await db.employerApplication.findUnique({ where: { id } });
    if (!app) {
      throw new Error(`Employer application with ID ${id} not found.`);
    }

    const normalizedEmail = app.workEmail.toLowerCase().trim();

    // 1. Idempotency check: if already approved, return existing state
    if (app.status === 'APPROVED' && app.companyId) {
      return {
        alreadyApproved: true,
        message: 'This employer application has already been approved.',
        application: await this.getApplicationDetail(id),
      };
    }

    // 2. Resolve or provision User
    let user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    let isNewUserCreated = false;

    if (!user) {
      user = await db.user.create({
        data: {
          name: app.fullName,
          email: normalizedEmail,
          role: 'RECRUITER',
          status: 'ACTIVE',
          mustChangePassword: true,
          isOnboarded: true,
          profile: {
            create: {
              candidateType: 'PROFESSIONAL',
              headline: `${app.designation} at ${app.companyName}`,
              currentRole: app.designation,
              phone: app.phone,
              location: app.headquartersLocation,
            },
          },
        },
      });
      isNewUserCreated = true;

      await AuditService.log({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        action: 'RECRUITER_ACCOUNT_CREATED',
        resourceType: 'USER',
        resourceId: user.id,
        details: { email: user.email, name: user.name },
      });
    } else {
      // Existing User account: safely elevate to RECRUITER without deleting candidate data
      const needsPasswordSetup = !user.passwordHash;
      user = await db.user.update({
        where: { id: user.id },
        data: {
          role: 'RECRUITER',
          ...(needsPasswordSetup ? { mustChangePassword: true } : {}),
        },
      });

      await AuditService.log({
        actorId: admin.id,
        actorEmail: admin.email,
        actorName: admin.name,
        action: 'RECRUITER_ACCOUNT_ACTIVATED',
        resourceType: 'USER',
        resourceId: user.id,
        details: { email: user.email, previousRole: user.role, newRole: 'RECRUITER' },
      });
    }

    // 3. Resolve or create Company
    let baseSlug = this.slugify(app.companyName);
    let finalSlug = baseSlug;
    let counter = 1;

    let existingCompany = await db.company.findFirst({
      where: {
        OR: [
          { website: app.companyWebsite },
          { name: { equals: app.companyName, mode: 'insensitive' } },
        ],
      },
    });

    let company = existingCompany;

    if (!company) {
      // Ensure unique slug
      while (await db.company.findUnique({ where: { slug: finalSlug } })) {
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }

      company = await db.company.create({
        data: {
          name: app.companyName,
          slug: finalSlug,
          website: app.companyWebsite,
          linkedIn: app.companyLinkedIn || null,
          industry: app.industry,
          size: app.companySize,
          location: app.headquartersLocation,
          verified: true,
          status: 'ACTIVE',
        },
      });
    }

    // 4. Create or update CompanyMember (COMPANY_ADMIN)
    await db.companyMember.upsert({
      where: {
        companyId_userId: {
          companyId: company.id,
          userId: user.id,
        },
      },
      update: {
        status: 'ACTIVE',
        role: 'COMPANY_ADMIN',
        title: app.designation,
      },
      create: {
        companyId: company.id,
        userId: user.id,
        role: 'COMPANY_ADMIN',
        title: app.designation,
        status: 'ACTIVE',
      },
    });

    // 5. Create or update RecruiterProfile
    await db.recruiterProfile.upsert({
      where: { userId: user.id },
      update: {
        companyId: company.id,
        designation: app.designation,
        phone: app.phone,
        linkedInUrl: app.linkedInUrl,
        status: 'ACTIVE',
      },
      create: {
        userId: user.id,
        companyId: company.id,
        designation: app.designation,
        phone: app.phone,
        linkedInUrl: app.linkedInUrl,
        status: 'ACTIVE',
      },
    });

    // 6. Update Application Record
    const updatedApp = await db.employerApplication.update({
      where: { id: app.id },
      data: {
        status: 'APPROVED',
        userId: user.id,
        companyId: company.id,
        approvedAt: new Date(),
        reviewedBy: admin.name,
        reviewedAt: new Date(),
        internalAdminNotes: options.internalNotes || app.internalAdminNotes,
      },
    });

    // 7. Generate secure one-time password setup token (valid 24h)
    const { rawToken } = await PasswordSetupTokenService.createSetupToken(user.id);
    const portalBaseUrl = process.env.RECRUITER_PORTAL_URL || 'http://localhost:3004';
    const setupUrl = `${portalBaseUrl}/setup-password?token=${rawToken}`;

    // 8. Audit log approval
    await AuditService.log({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      action: 'EMPLOYER_APPLICATION_APPROVED',
      resourceType: 'EMPLOYER_APPLICATION',
      resourceId: app.id,
      details: {
        referenceId: app.referenceId,
        companyName: app.companyName,
        companyId: company.id,
        recruiterEmail: app.workEmail,
        userId: user.id,
        isNewUserCreated,
      },
    });

    // 9. Dispatch Welcome & Setup Email via ZeptoMail
    await EmailService.sendEmployerApplicationApprovedEmail({
      name: app.fullName,
      companyName: app.companyName,
      email: app.workEmail,
      setupUrl,
      applicationId: app.id,
      referenceId: app.referenceId,
      userId: user.id,
    }).catch((err) => console.error('[EmployerApplication] Welcome email dispatch error:', err));

    return {
      success: true,
      message: `Employer application for ${app.companyName} has been approved.`,
      application: await this.getApplicationDetail(updatedApp.id),
      company,
    };
  }

  /**
   * Rejects an employer application with review reason.
   */
  static async rejectApplication(
    id: string,
    admin: AuthenticatedAdmin,
    options: { decisionReason?: string; internalNotes?: string } = {}
  ) {
    const validated = EmployerApplicationDecisionSchema.parse(options);
    const app = await db.employerApplication.findUnique({ where: { id } });
    if (!app) {
      throw new Error(`Employer application with ID ${id} not found.`);
    }

    if (app.status === 'APPROVED') {
      throw new Error('Approved employer applications cannot be rejected. Please suspend the company instead.');
    }

    const updated = await db.employerApplication.update({
      where: { id },
      data: {
        status: 'REJECTED',
        decisionReason: validated.decisionReason || 'Does not currently meet employer verification criteria.',
        internalAdminNotes: validated.internalNotes || app.internalAdminNotes,
        reviewedBy: admin.name,
        reviewedAt: new Date(),
      },
    });

    await AuditService.log({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      action: 'EMPLOYER_APPLICATION_REJECTED',
      resourceType: 'EMPLOYER_APPLICATION',
      resourceId: app.id,
      details: {
        referenceId: app.referenceId,
        companyName: app.companyName,
        reason: validated.decisionReason,
      },
    });

    await EmailService.sendEmployerApplicationRejectedEmail({
      name: app.fullName,
      companyName: app.companyName,
      email: app.workEmail,
      referenceId: app.referenceId,
      applicationId: app.id,
      reason: validated.decisionReason,
    }).catch((err) => console.error('[EmployerApplication] Rejection email dispatch error:', err));

    return this.getApplicationDetail(updated.id);
  }

  /**
   * Resends password setup email to an approved employer.
   */
  static async resendWelcomeEmail(id: string, admin: AuthenticatedAdmin) {
    const app = await db.employerApplication.findUnique({ where: { id } });
    if (!app) {
      throw new Error(`Employer application with ID ${id} not found.`);
    }

    if (app.status !== 'APPROVED') {
      throw new Error('Setup emails can only be sent for approved employer applications.');
    }

    const user = await db.user.findUnique({
      where: { email: app.workEmail.toLowerCase().trim() },
    });

    if (!user) {
      throw new Error('No user account found linked to this approved application.');
    }

    const { rawToken } = await PasswordSetupTokenService.createSetupToken(user.id);
    const portalBaseUrl = process.env.RECRUITER_PORTAL_URL || 'http://localhost:3004';
    const setupUrl = `${portalBaseUrl}/setup-password?token=${rawToken}`;

    await EmailService.sendEmployerApplicationApprovedEmail({
      name: app.fullName,
      companyName: app.companyName,
      email: app.workEmail,
      setupUrl,
      applicationId: app.id,
      referenceId: app.referenceId,
      userId: user.id,
    });

    await AuditService.log({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      action: 'RECRUITER_WELCOME_RESENT',
      resourceType: 'EMPLOYER_APPLICATION',
      resourceId: app.id,
      details: { email: user.email, companyName: app.companyName },
    });

    return {
      success: true,
      message: `Setup email resent to ${app.workEmail}.`,
    };
  }
}
