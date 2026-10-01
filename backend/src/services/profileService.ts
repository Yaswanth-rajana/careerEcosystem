import { db } from '../db/client';
import { hashPassword, comparePassword } from '../auth/security';
import { calculateProfileCompletion } from './profileCompletion';
import {
  ProfileCoreDTO,
  PersonalProfileDTO,
  EducationDTO,
  ExperienceDTO,
  SkillDTO,
  ProjectDTO,
  CareerGoalDTO,
  JobPreferenceDTO,
  ProfessionalLinkDTO,
  CertificationDTO,
  AchievementDTO,
} from '../types/profile';
import {
  Step1AboutYouSchema,
  EducationItemSchema,
  ExperienceItemSchema,
  UserSkillSchema,
  ProjectItemSchema,
  Step6CareerDirectionSchema,
  Step7PreferencesSchema,
  CertificationItemSchema,
  AchievementItemSchema,
  ProfessionalLinkItemSchema,
} from '../validations/onboardingSchemas';

export class ProfileService {
  /**
   * Helper: Ensures a Profile record exists for a user and returns it.
   */
  private static async getOrCreateProfile(userId: string) {
    let profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await db.profile.create({
        data: {
          userId,
          candidateType: 'STUDENT',
        },
      });
    }

    return profile;
  }

  /**
   * Fast, lightweight read of candidate core data (Header, Personal, Career, Preferences, Completion, Counts).
   * Used for initial /profile page render.
   */
  static async getCoreProfile(userId: string): Promise<ProfileCoreDTO> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        provider: true,
        googleId: true,
        passwordHash: true,
        createdAt: true,
        profile: {
          include: {
            careerGoal: true,
            jobPreference: true,
            _count: {
              select: {
                education: true,
                experience: true,
                userSkills: true,
                projects: true,
                certifications: true,
                achievements: true,
                professionalLinks: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User account not found.');
    }

    const profile = user.profile ?? ((await this.getOrCreateProfile(userId)) as any);
    if (!profile) {
      throw new Error('Profile could not be initialized.');
    }

    const counts = {
      education: profile._count?.education || 0,
      experience: profile._count?.experience || 0,
      skills: profile._count?.userSkills || 0,
      projects: profile._count?.projects || 0,
      certifications: profile._count?.certifications || 0,
      achievements: profile._count?.achievements || 0,
      links: profile._count?.professionalLinks || 0,
    };

    const personal: PersonalProfileDTO = {
      name: user.name,
      email: user.email,
      phone: profile.phone || null,
      location: profile.location || null,
      headline: profile.headline || null,
      bio: profile.bio || null,
      candidateType: (profile.candidateType as any) || 'STUDENT',
      avatarUrl: user.avatarUrl || null,
    };

    const careerDirection: CareerGoalDTO | null = profile.careerGoal
      ? {
          targetRole: profile.careerGoal.targetRole,
          careerField: profile.careerGoal.careerField || null,
          targetIndustry: profile.careerGoal.targetIndustry || null,
          careerGoalType: profile.careerGoal.careerGoalType || null,
          timeframe: profile.careerGoal.timeframe || null,
          notes: profile.careerGoal.notes || null,
        }
      : null;

    const jobPreferences: JobPreferenceDTO | null = profile.jobPreference
      ? {
          preferredJobType: profile.jobPreference.preferredJobType || null,
          preferredLocation: profile.jobPreference.preferredLocation || null,
          workEnvironment: profile.jobPreference.workEnvironment || null,
          willingToRelocate: Boolean(profile.jobPreference.willingToRelocate),
          preferredIndustries: profile.jobPreference.preferredIndustries || [],
          preferredCompanySize: profile.jobPreference.preferredCompanySize || null,
          minExpectedSalary: profile.jobPreference.minExpectedSalary || null,
          preferredSalaryRange: profile.jobPreference.preferredSalaryRange || null,
          noticePeriod: profile.jobPreference.noticePeriod || null,
          availability: profile.jobPreference.availability || null,
          learningStyle: profile.learningStyle || [],
          availableHoursPerWeek: profile.availableHoursPerWeek || null,
          mentorshipNeeds: profile.mentorshipNeeds || [],
        }
      : null;

    const completion = calculateProfileCompletion({
      personal,
      educationCount: counts.education,
      experienceCount: counts.experience,
      skillsCount: counts.skills,
      projectsCount: counts.projects,
      careerDirection,
      jobPreferences,
      linksCount: counts.links,
      certificationsCount: counts.certifications,
    });

    const account = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      provider: user.provider,
      hasPassword: Boolean(user.passwordHash),
      hasGoogleLinked: Boolean(user.googleId),
      createdAt: user.createdAt.toISOString(),
    };

    return {
      id: profile.id,
      userId: user.id,
      personal,
      careerDirection,
      jobPreferences,
      account,
      completion,
      counts,
    };
  }

  // =========================================================================
  // PERSONAL PROFILE
  // =========================================================================

  static async updatePersonal(userId: string, data: any): Promise<PersonalProfileDTO> {
    const validated = Step1AboutYouSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const [updatedUser, updatedProfile] = await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { name: validated.name },
      }),
      db.profile.update({
        where: { id: profile.id },
        data: {
          phone: validated.phone || null,
          location: validated.location || null,
          headline: validated.headline || null,
          bio: validated.bio || null,
          candidateType: validated.candidateType,
        },
      }),
    ]);

    return {
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedProfile.phone,
      location: updatedProfile.location,
      headline: updatedProfile.headline,
      bio: updatedProfile.bio,
      candidateType: updatedProfile.candidateType as any,
      avatarUrl: updatedUser.avatarUrl,
    };
  }

  // =========================================================================
  // EDUCATION
  // =========================================================================

  static async getEducation(userId: string): Promise<EducationDTO[]> {
    const profile = await this.getOrCreateProfile(userId);
    const list = await db.education.findMany({
      where: { profileId: profile.id },
      orderBy: { startYear: 'desc' },
    });

    return list.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      location: e.location,
      startYear: e.startYear,
      endYear: e.endYear,
      isCurrent: e.isCurrent,
      gpa: e.gpa,
      coursework: e.coursework,
      achievements: e.achievements,
      source: e.source,
    }));
  }

  static async createEducation(userId: string, data: any): Promise<EducationDTO> {
    const validated = EducationItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const created = await db.education.create({
      data: {
        profileId: profile.id,
        institution: validated.institution,
        degree: validated.degree,
        fieldOfStudy: validated.fieldOfStudy,
        location: validated.location || null,
        startYear: validated.startYear,
        endYear: validated.endYear ?? null,
        isCurrent: Boolean(validated.isCurrent),
        gpa: validated.gpa || null,
        coursework: validated.coursework || null,
        achievements: validated.achievements || null,
        source: validated.source || 'USER',
      },
    });

    return {
      id: created.id,
      institution: created.institution,
      degree: created.degree,
      fieldOfStudy: created.fieldOfStudy,
      location: created.location,
      startYear: created.startYear,
      endYear: created.endYear,
      isCurrent: created.isCurrent,
      gpa: created.gpa,
      coursework: created.coursework,
      achievements: created.achievements,
      source: created.source,
    };
  }

  static async updateEducation(userId: string, id: string, data: any): Promise<EducationDTO> {
    const validated = EducationItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const existing = await db.education.findUnique({ where: { id } });
    if (!existing) throw new Error('Education record not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    const updated = await db.education.update({
      where: { id },
      data: {
        institution: validated.institution,
        degree: validated.degree,
        fieldOfStudy: validated.fieldOfStudy,
        location: validated.location || null,
        startYear: validated.startYear,
        endYear: validated.endYear ?? null,
        isCurrent: Boolean(validated.isCurrent),
        gpa: validated.gpa || null,
        coursework: validated.coursework || null,
        achievements: validated.achievements || null,
      },
    });

    return {
      id: updated.id,
      institution: updated.institution,
      degree: updated.degree,
      fieldOfStudy: updated.fieldOfStudy,
      location: updated.location,
      startYear: updated.startYear,
      endYear: updated.endYear,
      isCurrent: updated.isCurrent,
      gpa: updated.gpa,
      coursework: updated.coursework,
      achievements: updated.achievements,
      source: updated.source,
    };
  }

  static async deleteEducation(userId: string, id: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    const existing = await db.education.findUnique({ where: { id } });
    if (!existing) throw new Error('Education record not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    await db.education.delete({ where: { id } });
  }

  // =========================================================================
  // EXPERIENCE
  // =========================================================================

  static async getExperience(userId: string): Promise<ExperienceDTO[]> {
    const profile = await this.getOrCreateProfile(userId);
    const list = await db.experience.findMany({
      where: { profileId: profile.id },
      orderBy: { startDate: 'desc' },
    });

    return list.map((ex) => ({
      id: ex.id,
      company: ex.company,
      roleTitle: ex.roleTitle,
      employmentType: ex.employmentType,
      location: ex.location,
      startDate: ex.startDate,
      endDate: ex.endDate,
      isCurrent: ex.isCurrent,
      description: ex.description,
      responsibilities: ex.responsibilities,
      achievements: ex.achievements,
      source: ex.source,
    }));
  }

  static async createExperience(userId: string, data: any): Promise<ExperienceDTO> {
    const validated = ExperienceItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const created = await db.experience.create({
      data: {
        profileId: profile.id,
        company: validated.company,
        roleTitle: validated.roleTitle,
        employmentType: validated.employmentType || null,
        location: validated.location || null,
        startDate: validated.startDate,
        endDate: validated.endDate ?? null,
        isCurrent: Boolean(validated.isCurrent),
        description: validated.description || null,
        responsibilities: validated.responsibilities || null,
        achievements: validated.achievements || null,
        source: validated.source || 'USER',
      },
    });

    return {
      id: created.id,
      company: created.company,
      roleTitle: created.roleTitle,
      employmentType: created.employmentType,
      location: created.location,
      startDate: created.startDate,
      endDate: created.endDate,
      isCurrent: created.isCurrent,
      description: created.description,
      responsibilities: created.responsibilities,
      achievements: created.achievements,
      source: created.source,
    };
  }

  static async updateExperience(userId: string, id: string, data: any): Promise<ExperienceDTO> {
    const validated = ExperienceItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const existing = await db.experience.findUnique({ where: { id } });
    if (!existing) throw new Error('Experience record not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    const updated = await db.experience.update({
      where: { id },
      data: {
        company: validated.company,
        roleTitle: validated.roleTitle,
        employmentType: validated.employmentType || null,
        location: validated.location || null,
        startDate: validated.startDate,
        endDate: validated.endDate ?? null,
        isCurrent: Boolean(validated.isCurrent),
        description: validated.description || null,
        responsibilities: validated.responsibilities || null,
        achievements: validated.achievements || null,
      },
    });

    return {
      id: updated.id,
      company: updated.company,
      roleTitle: updated.roleTitle,
      employmentType: updated.employmentType,
      location: updated.location,
      startDate: updated.startDate,
      endDate: updated.endDate,
      isCurrent: updated.isCurrent,
      description: updated.description,
      responsibilities: updated.responsibilities,
      achievements: updated.achievements,
      source: updated.source,
    };
  }

  static async deleteExperience(userId: string, id: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    const existing = await db.experience.findUnique({ where: { id } });
    if (!existing) throw new Error('Experience record not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    await db.experience.delete({ where: { id } });
  }

  // =========================================================================
  // SKILLS
  // =========================================================================

  static async getSkills(userId: string): Promise<SkillDTO[]> {
    const profile = await this.getOrCreateProfile(userId);
    const userSkills = await db.userSkill.findMany({
      where: { profileId: profile.id },
      include: { skill: true },
    });

    return userSkills.map((us) => ({
      id: us.id,
      name: us.skill.name,
      category: us.skill.category,
      level: us.level as any,
      source: us.source,
      verified: us.verified,
    }));
  }

  static async updateSkills(userId: string, skills: any[]): Promise<SkillDTO[]> {
    const profile = await this.getOrCreateProfile(userId);

    // Validate array
    const validatedSkills = skills.map((s) => UserSkillSchema.parse(s));

    // Resolve skills in database
    const resolvedSkills: Array<{ skillId: string; level: string; source: string; verified: boolean }> = [];
    for (const item of validatedSkills) {
      const trimmed = item.name.trim();
      if (!trimmed) continue;
      let skillEntity = await db.skill.findUnique({ where: { name: trimmed } });
      if (!skillEntity) {
        skillEntity = await db.skill.create({
          data: { name: trimmed, category: item.category || 'General' },
        });
      }
      resolvedSkills.push({
        skillId: skillEntity.id,
        level: item.level || 'INTERMEDIATE',
        source: item.source || 'USER',
        verified: Boolean(item.verified),
      });
    }

    // Atomic replacement of user skills
    await db.$transaction(async (tx) => {
      await tx.userSkill.deleteMany({ where: { profileId: profile.id } });
      for (const item of resolvedSkills) {
        await tx.userSkill.create({
          data: {
            profileId: profile.id,
            skillId: item.skillId,
            level: item.level,
            source: item.source,
            verified: item.verified,
          },
        });
      }
    });

    return await this.getSkills(userId);
  }

  // =========================================================================
  // PROJECTS
  // =========================================================================

  static async getProjects(userId: string): Promise<ProjectDTO[]> {
    const profile = await this.getOrCreateProfile(userId);
    const list = await db.project.findMany({
      where: { profileId: profile.id },
      orderBy: { startDate: 'desc' },
    });

    return list.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      role: p.role,
      technologies: p.technologies,
      projectType: p.projectType,
      startDate: p.startDate,
      endDate: p.endDate,
      projectUrl: p.projectUrl,
      githubUrl: p.githubUrl,
      demoUrl: p.demoUrl,
      achievements: p.achievements,
      source: p.source,
    }));
  }

  static async createProject(userId: string, data: any): Promise<ProjectDTO> {
    const validated = ProjectItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const created = await db.project.create({
      data: {
        profileId: profile.id,
        title: validated.title,
        description: validated.description || null,
        role: validated.role || null,
        technologies: validated.technologies || [],
        projectType: validated.projectType || null,
        startDate: validated.startDate || null,
        endDate: validated.endDate || null,
        projectUrl: validated.projectUrl || null,
        githubUrl: validated.githubUrl || null,
        demoUrl: validated.demoUrl || null,
        achievements: validated.achievements || null,
        source: validated.source || 'USER',
      },
    });

    return {
      id: created.id,
      title: created.title,
      description: created.description,
      role: created.role,
      technologies: created.technologies,
      projectType: created.projectType,
      startDate: created.startDate,
      endDate: created.endDate,
      projectUrl: created.projectUrl,
      githubUrl: created.githubUrl,
      demoUrl: created.demoUrl,
      achievements: created.achievements,
      source: created.source,
    };
  }

  static async updateProject(userId: string, id: string, data: any): Promise<ProjectDTO> {
    const validated = ProjectItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) throw new Error('Project record not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    const updated = await db.project.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description || null,
        role: validated.role || null,
        technologies: validated.technologies || [],
        projectType: validated.projectType || null,
        startDate: validated.startDate || null,
        endDate: validated.endDate || null,
        projectUrl: validated.projectUrl || null,
        githubUrl: validated.githubUrl || null,
        demoUrl: validated.demoUrl || null,
        achievements: validated.achievements || null,
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      role: updated.role,
      technologies: updated.technologies,
      projectType: updated.projectType,
      startDate: updated.startDate,
      endDate: updated.endDate,
      projectUrl: updated.projectUrl,
      githubUrl: updated.githubUrl,
      demoUrl: updated.demoUrl,
      achievements: updated.achievements,
      source: updated.source,
    };
  }

  static async deleteProject(userId: string, id: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    const existing = await db.project.findUnique({ where: { id } });
    if (!existing) throw new Error('Project record not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    await db.project.delete({ where: { id } });
  }

  // =========================================================================
  // CAREER DIRECTION
  // =========================================================================

  static async updateCareerDirection(userId: string, data: any): Promise<CareerGoalDTO> {
    const validated = Step6CareerDirectionSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const goal = await db.careerGoal.upsert({
      where: { profileId: profile.id },
      create: {
        profileId: profile.id,
        targetRole: validated.targetRole,
        careerField: validated.careerField || null,
        targetIndustry: validated.targetIndustry || null,
        careerGoalType: validated.careerGoalType || null,
        timeframe: validated.timeframe || null,
        notes: validated.notes || null,
      },
      update: {
        targetRole: validated.targetRole,
        careerField: validated.careerField || null,
        targetIndustry: validated.targetIndustry || null,
        careerGoalType: validated.careerGoalType || null,
        timeframe: validated.timeframe || null,
        notes: validated.notes || null,
      },
    });

    return {
      targetRole: goal.targetRole,
      careerField: goal.careerField,
      targetIndustry: goal.targetIndustry,
      careerGoalType: goal.careerGoalType,
      timeframe: goal.timeframe,
      notes: goal.notes,
    };
  }

  // =========================================================================
  // JOB PREFERENCES
  // =========================================================================

  static async updateJobPreferences(userId: string, data: any): Promise<JobPreferenceDTO> {
    const validated = Step7PreferencesSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const [preference, updatedProfile] = await db.$transaction([
      db.jobPreference.upsert({
        where: { profileId: profile.id },
        create: {
          profileId: profile.id,
          preferredJobType: validated.preferredJobType || null,
          preferredLocation: validated.preferredLocation || null,
          workEnvironment: validated.workEnvironment || null,
          willingToRelocate: Boolean(validated.willingToRelocate),
          preferredIndustries: validated.preferredIndustries || [],
          preferredCompanySize: validated.preferredCompanySize || null,
          minExpectedSalary: validated.minExpectedSalary || null,
          preferredSalaryRange: validated.preferredSalaryRange || null,
          noticePeriod: validated.noticePeriod || null,
          availability: validated.availability || null,
        },
        update: {
          preferredJobType: validated.preferredJobType || null,
          preferredLocation: validated.preferredLocation || null,
          workEnvironment: validated.workEnvironment || null,
          willingToRelocate: Boolean(validated.willingToRelocate),
          preferredIndustries: validated.preferredIndustries || [],
          preferredCompanySize: validated.preferredCompanySize || null,
          minExpectedSalary: validated.minExpectedSalary || null,
          preferredSalaryRange: validated.preferredSalaryRange || null,
          noticePeriod: validated.noticePeriod || null,
          availability: validated.availability || null,
        },
      }),
      db.profile.update({
        where: { id: profile.id },
        data: {
          learningStyle: validated.learningStyle || [],
          availableHoursPerWeek: validated.availableHoursPerWeek || null,
          mentorshipNeeds: validated.mentorshipNeeds || [],
        },
      }),
    ]);

    return {
      preferredJobType: preference.preferredJobType,
      preferredLocation: preference.preferredLocation,
      workEnvironment: preference.workEnvironment,
      willingToRelocate: preference.willingToRelocate,
      preferredIndustries: preference.preferredIndustries,
      preferredCompanySize: preference.preferredCompanySize,
      minExpectedSalary: preference.minExpectedSalary,
      preferredSalaryRange: preference.preferredSalaryRange,
      noticePeriod: preference.noticePeriod,
      availability: preference.availability,
      learningStyle: updatedProfile.learningStyle,
      availableHoursPerWeek: updatedProfile.availableHoursPerWeek,
      mentorshipNeeds: updatedProfile.mentorshipNeeds,
    };
  }

  // =========================================================================
  // CERTIFICATIONS
  // =========================================================================

  static async getCertifications(userId: string): Promise<CertificationDTO[]> {
    const profile = await this.getOrCreateProfile(userId);
    const list = await db.certification.findMany({
      where: { profileId: profile.id },
      orderBy: { issueDate: 'desc' },
    });

    return list.map((c) => ({
      id: c.id,
      name: c.name,
      issuingOrganization: c.issuingOrganization,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate,
      credentialId: c.credentialId,
      credentialUrl: c.credentialUrl,
      source: c.source,
    }));
  }

  static async createCertification(userId: string, data: any): Promise<CertificationDTO> {
    const validated = CertificationItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const created = await db.certification.create({
      data: {
        profileId: profile.id,
        name: validated.name,
        issuingOrganization: validated.issuingOrganization,
        issueDate: validated.issueDate || null,
        expiryDate: validated.expiryDate || null,
        credentialId: validated.credentialId || null,
        credentialUrl: validated.credentialUrl || null,
        source: validated.source || 'USER',
      },
    });

    return {
      id: created.id,
      name: created.name,
      issuingOrganization: created.issuingOrganization,
      issueDate: created.issueDate,
      expiryDate: created.expiryDate,
      credentialId: created.credentialId,
      credentialUrl: created.credentialUrl,
      source: created.source,
    };
  }

  static async updateCertification(userId: string, id: string, data: any): Promise<CertificationDTO> {
    const validated = CertificationItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const existing = await db.certification.findUnique({ where: { id } });
    if (!existing) throw new Error('Certification not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    const updated = await db.certification.update({
      where: { id },
      data: {
        name: validated.name,
        issuingOrganization: validated.issuingOrganization,
        issueDate: validated.issueDate || null,
        expiryDate: validated.expiryDate || null,
        credentialId: validated.credentialId || null,
        credentialUrl: validated.credentialUrl || null,
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      issuingOrganization: updated.issuingOrganization,
      issueDate: updated.issueDate,
      expiryDate: updated.expiryDate,
      credentialId: updated.credentialId,
      credentialUrl: updated.credentialUrl,
      source: updated.source,
    };
  }

  static async deleteCertification(userId: string, id: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    const existing = await db.certification.findUnique({ where: { id } });
    if (!existing) throw new Error('Certification not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    await db.certification.delete({ where: { id } });
  }

  // =========================================================================
  // ACHIEVEMENTS
  // =========================================================================

  static async getAchievements(userId: string): Promise<AchievementDTO[]> {
    const profile = await this.getOrCreateProfile(userId);
    const list = await db.achievement.findMany({
      where: { profileId: profile.id },
      orderBy: { date: 'desc' },
    });

    return list.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      organization: a.organization,
      date: a.date,
      url: a.url,
      source: a.source,
    }));
  }

  static async createAchievement(userId: string, data: any): Promise<AchievementDTO> {
    const validated = AchievementItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const created = await db.achievement.create({
      data: {
        profileId: profile.id,
        title: validated.title,
        description: validated.description || null,
        organization: validated.organization || null,
        date: validated.date || null,
        url: validated.url || null,
        source: validated.source || 'USER',
      },
    });

    return {
      id: created.id,
      title: created.title,
      description: created.description,
      organization: created.organization,
      date: created.date,
      url: created.url,
      source: created.source,
    };
  }

  static async updateAchievement(userId: string, id: string, data: any): Promise<AchievementDTO> {
    const validated = AchievementItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const existing = await db.achievement.findUnique({ where: { id } });
    if (!existing) throw new Error('Achievement not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    const updated = await db.achievement.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description || null,
        organization: validated.organization || null,
        date: validated.date || null,
        url: validated.url || null,
      },
    });

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      organization: updated.organization,
      date: updated.date,
      url: updated.url,
      source: updated.source,
    };
  }

  static async deleteAchievement(userId: string, id: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    const existing = await db.achievement.findUnique({ where: { id } });
    if (!existing) throw new Error('Achievement not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    await db.achievement.delete({ where: { id } });
  }

  // =========================================================================
  // PROFESSIONAL LINKS
  // =========================================================================

  static async getLinks(userId: string): Promise<ProfessionalLinkDTO[]> {
    const profile = await this.getOrCreateProfile(userId);
    const list = await db.professionalLink.findMany({
      where: { profileId: profile.id },
    });

    return list.map((l) => ({
      id: l.id,
      platform: l.platform,
      url: l.url,
    }));
  }

  static async createLink(userId: string, data: any): Promise<ProfessionalLinkDTO> {
    const validated = ProfessionalLinkItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const created = await db.professionalLink.create({
      data: {
        profileId: profile.id,
        platform: validated.platform,
        url: validated.url,
      },
    });

    return {
      id: created.id,
      platform: created.platform,
      url: created.url,
    };
  }

  static async updateLink(userId: string, id: string, data: any): Promise<ProfessionalLinkDTO> {
    const validated = ProfessionalLinkItemSchema.parse(data);
    const profile = await this.getOrCreateProfile(userId);

    const existing = await db.professionalLink.findUnique({ where: { id } });
    if (!existing) throw new Error('Link record not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    const updated = await db.professionalLink.update({
      where: { id },
      data: {
        platform: validated.platform,
        url: validated.url,
      },
    });

    return {
      id: updated.id,
      platform: updated.platform,
      url: updated.url,
    };
  }

  static async deleteLink(userId: string, id: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId);
    const existing = await db.professionalLink.findUnique({ where: { id } });
    if (!existing) throw new Error('Link record not found.');
    if (existing.profileId !== profile.id) throw new Error('Unauthorized record access.');

    await db.professionalLink.delete({ where: { id } });
  }

  // =========================================================================
  // ACCOUNT & SECURITY (PASSWORD CHANGE)
  // =========================================================================

  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new Error('User account not found.');
    }

    // If account has an existing password, verify current password
    if (user.passwordHash) {
      if (!currentPassword) {
        throw new Error('Current password is required.');
      }
      const isValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new Error('Incorrect current password.');
      }
    }

    // Hash and persist new password securely
    const newHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });
  }

  // =========================================================================
  // BACKWARDS COMPATIBILITY FOR CAREER MODULES
  // =========================================================================
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
}
