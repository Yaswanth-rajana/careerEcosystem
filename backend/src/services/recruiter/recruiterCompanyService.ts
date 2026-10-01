import { db } from '../../db/client';
import { CompanyProfileDTO, AuthenticatedRecruiter } from '../../types/recruiter';
import { CompanyProfileUpdateSchema } from '../../validations/recruiterSchemas';
import { AuditService } from '../auditService';
import { z } from 'zod';

export class RecruiterCompanyService {
  /**
   * Retrieves company profile data for the authenticated recruiter's company.
   */
  static async getCompanyProfile(companyId: string): Promise<CompanyProfileDTO> {
    const company = await db.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Company not found.');
    }

    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logoUrl: company.logoUrl,
      website: company.website,
      linkedIn: company.linkedIn,
      industry: company.industry,
      size: company.size,
      location: company.location,
      description: company.description,
      culture: company.culture,
      benefits: company.benefits,
      verified: company.verified,
      status: company.status,
    };
  }

  /**
   * Updates company profile information with permission checking.
   */
  static async updateCompanyProfile(
    companyId: string,
    data: z.infer<typeof CompanyProfileUpdateSchema>,
    auth: AuthenticatedRecruiter
  ): Promise<CompanyProfileDTO> {
    const validated = CompanyProfileUpdateSchema.parse(data);

    const updated = await db.company.update({
      where: { id: companyId },
      data: {
        ...(validated.name !== undefined ? { name: validated.name } : {}),
        ...(validated.website !== undefined ? { website: validated.website } : {}),
        ...(validated.linkedIn !== undefined ? { linkedIn: validated.linkedIn } : {}),
        ...(validated.industry !== undefined ? { industry: validated.industry } : {}),
        ...(validated.size !== undefined ? { size: validated.size } : {}),
        ...(validated.location !== undefined ? { location: validated.location } : {}),
        ...(validated.description !== undefined ? { description: validated.description } : {}),
        ...(validated.culture !== undefined ? { culture: validated.culture } : {}),
        ...(validated.benefits !== undefined ? { benefits: validated.benefits } : {}),
        ...(validated.logoUrl !== undefined ? { logoUrl: validated.logoUrl } : {}),
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_COMPANY_PROFILE_UPDATED',
      resourceType: 'SYSTEM',
      resourceId: updated.id,
      details: { companyName: updated.name },
    });

    return this.getCompanyProfile(updated.id);
  }
}
