import { db } from '../../db/client';
import { MentorProfileDTO } from '../../types/mentorship';
import { MentorStatus } from '../../types/admin';
import { UpdateMentorProfileSchema } from '../../validations/mentorshipSchemas';
import { z } from 'zod';

export class MentorProfileService {
  /**
   * Retrieves full profile DTO for the logged-in mentor.
   */
  static async getProfile(mentorId: string): Promise<MentorProfileDTO | null> {
    const mentor = await db.mentor.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) return null;

    return {
      id: mentor.id,
      userId: mentor.userId,
      name: mentor.name,
      email: mentor.email,
      avatar: mentor.avatar,
      headline: mentor.headline,
      bio: mentor.bio,
      domain: mentor.domain,
      company: mentor.company,
      experienceYears: mentor.experienceYears,
      rating: mentor.rating,
      reviewCount: mentor.reviewCount,
      sessionCount: mentor.sessionCount,
      startingPrice: mentor.startingPrice,
      expertise: mentor.expertise,
      sessionTypes: mentor.sessionTypes,
      skillsList: mentor.skillsList,
      status: mentor.status as MentorStatus,
      approvedAt: mentor.approvedAt?.toISOString() || null,
      createdAt: mentor.createdAt.toISOString(),
      updatedAt: mentor.updatedAt.toISOString(),
    };
  }

  /**
   * Updates public-facing profile fields.
   * Mentor cannot modify status, rating, or reviewCount.
   */
  static async updateProfile(
    mentorId: string,
    data: z.infer<typeof UpdateMentorProfileSchema>
  ): Promise<MentorProfileDTO> {
    const validated = UpdateMentorProfileSchema.parse(data);

    const updateData: any = {};
    if (validated.headline !== undefined) updateData.headline = validated.headline;
    if (validated.bio !== undefined) updateData.bio = validated.bio;
    if (validated.company !== undefined) updateData.company = validated.company;
    if (validated.experienceYears !== undefined) updateData.experienceYears = validated.experienceYears;
    if (validated.startingPrice !== undefined) updateData.startingPrice = validated.startingPrice;
    if (validated.expertise !== undefined) updateData.expertise = validated.expertise;
    if (validated.sessionTypes !== undefined) updateData.sessionTypes = validated.sessionTypes;
    if (validated.skillsList !== undefined) updateData.skillsList = validated.skillsList;
    if (validated.avatar !== undefined) updateData.avatar = validated.avatar;

    const updated = await db.mentor.update({
      where: { id: mentorId },
      data: updateData,
    });

    return (await this.getProfile(updated.id))!;
  }
}
