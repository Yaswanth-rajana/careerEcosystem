import { db } from '../db/client';
import { FullOnboardingSchema } from '../validations/schemas';

export class ProfileService {
  /**
   * Retrieves full candidate profile by User ID.
   */
  static async getProfileByUserId(userId: string) {
    const profile = await db.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isOnboarded: true,
          },
        },
        education: true,
        experience: true,
        userSkills: {
          include: {
            skill: true,
          },
        },
        interests: true,
        careerGoal: true,
      },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      userId: profile.userId,
      user: profile.user,
      phone: profile.phone,
      location: profile.location,
      headline: profile.headline,
      candidateType: profile.candidateType,
      currentRole: profile.currentRole,
      totalExperience: profile.totalExperience,
      bio: profile.bio,
      education: profile.education.map((e: any) => ({
        id: e.id,
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
        startYear: e.startYear,
        endYear: e.endYear ?? undefined,
        isCurrent: e.isCurrent,
      })),
      experience: profile.experience.map((ex: any) => ({
        id: ex.id,
        company: ex.company,
        roleTitle: ex.roleTitle,
        location: ex.location ?? undefined,
        startDate: ex.startDate,
        endDate: ex.endDate ?? undefined,
        isCurrent: ex.isCurrent,
        description: ex.description ?? undefined,
      })),
      skills: profile.userSkills.map((us: any) => ({
        id: us.id,
        name: us.skill.name,
        category: us.skill.category ?? undefined,
        level: us.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
      })),
      interests: profile.interests.map((i: any) => i.topic),
      careerGoal: profile.careerGoal
        ? {
            targetRole: profile.careerGoal.targetRole,
            targetIndustry: profile.careerGoal.targetIndustry ?? undefined,
            timeframe: profile.careerGoal.timeframe ?? undefined,
            notes: profile.careerGoal.notes ?? undefined,
          }
        : undefined,
    };
  }

  /**
   * Completes candidate onboarding flow and persists complete profile.
   */
  static async completeOnboarding(userId: string, data: any) {
    const validated = FullOnboardingSchema.parse(data);

    // Ensure User profile exists or find it
    let profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await db.profile.create({
        data: { userId, candidateType: validated.step1.candidateType },
      });
    }

    const profileId = profile.id;

    // Transaction to update profile, education, experience, skills, interests, and career goal
    await db.$transaction(async (tx: any) => {
      // 1. Update basic profile info & mark user as onboarded
      await tx.profile.update({
        where: { id: profileId },
        data: {
          phone: validated.step1.phone,
          location: validated.step1.location,
          headline: validated.step1.headline,
          candidateType: validated.step1.candidateType,
          bio: validated.step1.bio,
          currentRole: validated.step2.currentRole,
          totalExperience: validated.step2.totalExperience,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { name: validated.step1.name, isOnboarded: true },
      });

      // 2. Clear & insert Education entries
      await tx.education.deleteMany({ where: { profileId } });
      if (validated.step2.education && validated.step2.education.length > 0) {
        await tx.education.createMany({
          data: validated.step2.education.map((edu) => ({
            profileId,
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            startYear: edu.startYear,
            endYear: edu.endYear,
            isCurrent: edu.isCurrent,
          })),
        });
      }

      // 3. Clear & insert Experience entries
      await tx.experience.deleteMany({ where: { profileId } });
      if (validated.step2.experience && validated.step2.experience.length > 0) {
        await tx.experience.createMany({
          data: validated.step2.experience.map((exp) => ({
            profileId,
            company: exp.company,
            roleTitle: exp.roleTitle,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.endDate,
            isCurrent: exp.isCurrent,
            description: exp.description,
          })),
        });
      }

      // 4. Upsert skills & associate with profile
      await tx.userSkill.deleteMany({ where: { profileId } });
      for (const skillItem of validated.step3.skills) {
        let skillRecord = await tx.skill.findUnique({
          where: { name: skillItem.name },
        });

        if (!skillRecord) {
          skillRecord = await tx.skill.create({
            data: { name: skillItem.name, category: 'General' },
          });
        }

        await tx.userSkill.create({
          data: {
            profileId,
            skillId: skillRecord.id,
            level: skillItem.level,
          },
        });
      }

      // 5. Clear & insert Interests
      await tx.careerInterest.deleteMany({ where: { profileId } });
      if (validated.step3.interests && validated.step3.interests.length > 0) {
        await tx.careerInterest.createMany({
          data: validated.step3.interests.map((topic) => ({
            profileId,
            topic,
          })),
        });
      }

      // 6. Upsert Career Goal
      await tx.careerGoal.upsert({
        where: { profileId },
        create: {
          profileId,
          targetRole: validated.step4.targetRole,
          targetIndustry: validated.step4.targetIndustry,
          timeframe: validated.step4.timeframe,
          notes: validated.step4.notes,
        },
        update: {
          targetRole: validated.step4.targetRole,
          targetIndustry: validated.step4.targetIndustry,
          timeframe: validated.step4.timeframe,
          notes: validated.step4.notes,
        },
      });
    });

    return await this.getProfileByUserId(userId);
  }
}
