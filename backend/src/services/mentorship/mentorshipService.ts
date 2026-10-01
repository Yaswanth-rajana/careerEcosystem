import { db } from '../../db/client';
import { MentorServiceDTO, MentorshipCategory } from '../../types/mentorship';
import { CreateServiceSchema, UpdateServiceSchema } from '../../validations/mentorshipSchemas';
import { z } from 'zod';

export class MentorshipServiceManager {
  /**
   * Lists all services created by a mentor.
   */
  static async listServicesByMentor(mentorId: string, onlyActive: boolean = false): Promise<MentorServiceDTO[]> {
    const where: any = { mentorId };
    if (onlyActive) {
      where.active = true;
    }

    const services = await db.mentorshipService.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return services.map(this.toDTO);
  }

  /**
   * Retrieves single service by ID.
   */
  static async getServiceById(serviceId: string): Promise<MentorServiceDTO | null> {
    const service = await db.mentorshipService.findUnique({
      where: { id: serviceId },
    });
    if (!service) return null;
    return this.toDTO(service);
  }

  /**
   * Creates a new mentorship service offering.
   */
  static async createService(
    mentorId: string,
    data: z.infer<typeof CreateServiceSchema>
  ): Promise<MentorServiceDTO> {
    const validated = CreateServiceSchema.parse(data);

    const service = await db.mentorshipService.create({
      data: {
        mentorId,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        duration: validated.duration,
        price: validated.price,
        currency: validated.currency || 'INR',
        active: validated.active !== undefined ? validated.active : true,
        bookingSettings: validated.bookingSettings ? JSON.stringify(validated.bookingSettings) : null,
      },
    });

    return this.toDTO(service);
  }

  /**
   * Updates an existing service.
   */
  static async updateService(
    serviceId: string,
    mentorId: string,
    data: z.infer<typeof UpdateServiceSchema>
  ): Promise<MentorServiceDTO> {
    const validated = UpdateServiceSchema.parse(data);

    // Verify ownership
    const existing = await db.mentorshipService.findUnique({ where: { id: serviceId } });
    if (!existing || existing.mentorId !== mentorId) {
      throw new Error('Service not found or unauthorized');
    }

    const updateData: any = {};
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.category !== undefined) updateData.category = validated.category;
    if (validated.duration !== undefined) updateData.duration = validated.duration;
    if (validated.price !== undefined) updateData.price = validated.price;
    if (validated.currency !== undefined) updateData.currency = validated.currency;
    if (validated.active !== undefined) updateData.active = validated.active;
    if (validated.bookingSettings !== undefined) {
      updateData.bookingSettings = JSON.stringify(validated.bookingSettings);
    }

    const updated = await db.mentorshipService.update({
      where: { id: serviceId },
      data: updateData,
    });

    return this.toDTO(updated);
  }

  /**
   * Soft-deactivates or deletes a service.
   * If historical bookings exist, enforce active = false instead of hard-deleting.
   */
  static async deactivateOrDeleteService(
    serviceId: string,
    mentorId: string
  ): Promise<{ action: 'DEACTIVATED' | 'DELETED'; service: MentorServiceDTO }> {
    const existing = await db.mentorshipService.findUnique({
      where: { id: serviceId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!existing || existing.mentorId !== mentorId) {
      throw new Error('Service not found or unauthorized');
    }

    if (existing._count.bookings > 0) {
      // Historical bookings exist: safely soft-deactivate
      const deactivated = await db.mentorshipService.update({
        where: { id: serviceId },
        data: { active: false },
      });
      return {
        action: 'DEACTIVATED',
        service: this.toDTO(deactivated),
      };
    } else {
      // No bookings: safe to delete
      const deleted = await db.mentorshipService.delete({
        where: { id: serviceId },
      });
      return {
        action: 'DELETED',
        service: this.toDTO(deleted),
      };
    }
  }

  private static toDTO(service: any): MentorServiceDTO {
    let bookingSettings = null;
    if (service.bookingSettings) {
      try {
        bookingSettings = JSON.parse(service.bookingSettings);
      } catch {
        bookingSettings = null;
      }
    }

    return {
      id: service.id,
      mentorId: service.mentorId,
      title: service.title,
      description: service.description,
      category: service.category as MentorshipCategory,
      duration: service.duration,
      price: service.price,
      currency: service.currency,
      active: service.active,
      bookingSettings,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }
}
