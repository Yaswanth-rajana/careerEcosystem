import { db } from '../../db/client';
import { CompanyTeamMemberDTO, AuthenticatedRecruiter } from '../../types/recruiter';
import { TeamMemberInviteSchema } from '../../validations/recruiterSchemas';
import { AuditService } from '../auditService';
import { z } from 'zod';

export class RecruiterTeamService {
  /**
   * Lists all active members of the company team.
   */
  static async listTeamMembers(companyId: string): Promise<CompanyTeamMemberDTO[]> {
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
      role: m.role,
      title: m.title,
      status: m.status,
      joinedAt: m.joinedAt.toISOString(),
    }));
  }

  /**
   * Invites or associates a team member with the company.
   */
  static async inviteMember(
    companyId: string,
    data: z.infer<typeof TeamMemberInviteSchema>,
    auth: AuthenticatedRecruiter
  ) {
    const validated = TeamMemberInviteSchema.parse(data);
    const email = validated.email.toLowerCase().trim();

    // Check if user exists
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      user = await db.user.create({
        data: {
          name: validated.name,
          email,
          role: 'RECRUITER',
          status: 'ACTIVE',
          mustChangePassword: true,
          isOnboarded: true,
        },
      });
    }

    const member = await db.companyMember.upsert({
      where: {
        companyId_userId: {
          companyId,
          userId: user.id,
        },
      },
      update: {
        role: validated.role,
        title: validated.title || null,
        status: 'ACTIVE',
      },
      create: {
        companyId,
        userId: user.id,
        role: validated.role,
        title: validated.title || null,
        status: 'ACTIVE',
      },
    });

    // Create RecruiterProfile if not present
    await db.recruiterProfile.upsert({
      where: { userId: user.id },
      update: {
        companyId,
        designation: validated.title || 'Team Member',
      },
      create: {
        userId: user.id,
        companyId,
        designation: validated.title || 'Team Member',
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_TEAM_MEMBER_INVITED',
      resourceType: 'USER',
      resourceId: user.id,
      details: { email: user.email, role: validated.role },
    });

    return {
      id: member.id,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: member.role,
      title: member.title,
      status: member.status,
      joinedAt: member.joinedAt.toISOString(),
    };
  }
}
