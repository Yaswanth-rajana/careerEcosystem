import { db } from '../../db/client';
import { UserService } from '../userService';
import { AuthenticatedRecruiter } from '../../types/recruiter';

export class RecruiterAuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = 'RecruiterAuthError';
    this.statusCode = statusCode;
  }
}

export class RecruiterAuthService {
  /**
   * Verifies that the request comes from an authenticated recruiter.
   * Server-side authorization check:
   * 1. Validates active session token.
   * 2. Resolves linked RecruiterProfile and Company records.
   * 3. Enforces recruiter and company status checks.
   * 4. Multi-tenancy isolation boundary.
   */
  static async verifyRecruiter(token: string | null | undefined): Promise<AuthenticatedRecruiter> {
    if (!token) {
      throw new RecruiterAuthError('Authentication required. No session token provided.', 401);
    }

    const sessionUser = await UserService.getSession(token);
    if (!sessionUser) {
      throw new RecruiterAuthError('Session expired or invalid. Please sign in again.', 401);
    }

    const fullUser = await db.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatarUrl: true,
      },
    });

    if (!fullUser) {
      throw new RecruiterAuthError('User record not found.', 401);
    }

    if (fullUser.status !== 'ACTIVE') {
      throw new RecruiterAuthError(`Your account is currently ${fullUser.status.toLowerCase()}. Access denied.`, 403);
    }

    // Role check: must be RECRUITER or ADMIN/SUPER_ADMIN
    const allowedRoles = ['RECRUITER', 'ADMIN', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(fullUser.role.toUpperCase())) {
      throw new RecruiterAuthError('Forbidden. You do not have recruiter privileges.', 403);
    }

    // Resolve recruiter profile
    let recruiterProfile = await db.recruiterProfile.findUnique({
      where: { userId: fullUser.id },
      include: {
        company: true,
      },
    });

    // If no recruiter profile yet, check if there is an approved EmployerApplication for this email
    if (!recruiterProfile) {
      const approvedApp = await db.employerApplication.findFirst({
        where: {
          workEmail: fullUser.email.toLowerCase(),
          status: 'APPROVED',
          companyId: { not: null },
        },
      });

      if (approvedApp && approvedApp.companyId) {
        // Auto-provision RecruiterProfile and CompanyMember
        const company = await db.company.findUnique({
          where: { id: approvedApp.companyId },
        });

        if (company) {
          recruiterProfile = await db.recruiterProfile.create({
            data: {
              userId: fullUser.id,
              companyId: company.id,
              designation: approvedApp.designation || 'Recruiter',
              phone: approvedApp.phone,
              linkedInUrl: approvedApp.linkedInUrl,
              status: 'ACTIVE',
            },
            include: { company: true },
          });

          await db.companyMember.upsert({
            where: {
              companyId_userId: {
                companyId: company.id,
                userId: fullUser.id,
              },
            },
            update: { status: 'ACTIVE' },
            create: {
              companyId: company.id,
              userId: fullUser.id,
              role: 'COMPANY_ADMIN',
              title: approvedApp.designation || 'Recruiter',
              status: 'ACTIVE',
            },
          });
        }
      }
    }

    if (!recruiterProfile) {
      throw new RecruiterAuthError('Forbidden. No recruiter profile exists for this account. Please apply to hire on PATHWAY.ECO.', 403);
    }

    if (recruiterProfile.status !== 'ACTIVE') {
      throw new RecruiterAuthError('Your recruiter access has been suspended. Please contact support.', 403);
    }

    const company = recruiterProfile.company;
    if (!company || company.status !== 'ACTIVE') {
      throw new RecruiterAuthError('Your company workspace is currently inactive or suspended.', 403);
    }

    // Resolve company member role
    const member = await db.companyMember.findUnique({
      where: {
        companyId_userId: {
          companyId: company.id,
          userId: fullUser.id,
        },
      },
    });

    const companyRole = member?.role || 'RECRUITER';

    return {
      user: {
        id: fullUser.id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        avatarUrl: fullUser.avatarUrl,
      },
      recruiter: {
        id: recruiterProfile.id,
        designation: recruiterProfile.designation,
        phone: recruiterProfile.phone,
        linkedInUrl: recruiterProfile.linkedInUrl,
        status: recruiterProfile.status,
      },
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        website: company.website,
        industry: company.industry,
        size: company.size,
        location: company.location,
        verified: company.verified,
        status: company.status,
      },
      companyRole,
    };
  }

  /**
   * Enforces strict multi-tenant ownership check to prevent IDOR attacks.
   */
  static verifyOwnership(auth: AuthenticatedRecruiter, resourceCompanyId: string): void {
    if (auth.company.id !== resourceCompanyId) {
      throw new RecruiterAuthError('Forbidden. You do not have permission to access resources from another company.', 403);
    }
  }
}
