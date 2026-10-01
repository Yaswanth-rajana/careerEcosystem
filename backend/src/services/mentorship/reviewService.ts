import { db } from '../../db/client';
import { ReviewDTO, PaginatedResult } from '../../types/mentorship';
import { CreateReviewSchema } from '../../validations/mentorshipSchemas';
import { z } from 'zod';

export class ReviewService {
  /**
   * Lists paginated reviews received by a mentor.
   */
  static async listReviewsByMentor(params: {
    mentorId: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<ReviewDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const where = { mentorId: params.mentorId };

    const [total, reviews] = await Promise.all([
      db.mentorshipReview.count({ where }),
      db.mentorshipReview.findMany({
        where,
        include: {
          candidate: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          booking: {
            select: {
              service: {
                select: { title: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items: ReviewDTO[] = reviews.map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      rating: r.rating,
      review: r.review,
      createdAt: r.createdAt.toISOString(),
      serviceTitle: r.booking.service.title,
      candidateName: r.candidate.name,
      candidateAvatar: r.candidate.avatarUrl,
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
   * Creates a review for a completed booking.
   * Requirement 22: Must be connected to a completed booking; prevents duplicates.
   */
  static async createReview(
    candidateId: string,
    data: z.infer<typeof CreateReviewSchema>
  ): Promise<ReviewDTO> {
    const validated = CreateReviewSchema.parse(data);

    const booking = await db.booking.findUnique({
      where: { id: validated.bookingId },
      include: { service: true },
    });

    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.candidateId !== candidateId) {
      throw new Error('Unauthorized. You can only review your own sessions.');
    }

    if (booking.status !== 'COMPLETED') {
      throw new Error('Reviews can only be submitted for completed mentorship sessions.');
    }

    // Check if review already exists
    const existing = await db.mentorshipReview.findUnique({
      where: { bookingId: validated.bookingId },
    });

    if (existing) {
      throw new Error('A review has already been submitted for this session.');
    }

    const review = await db.mentorshipReview.create({
      data: {
        bookingId: validated.bookingId,
        mentorId: booking.mentorId,
        candidateId,
        rating: validated.rating,
        review: validated.review,
      },
      include: {
        candidate: {
          select: { name: true, avatarUrl: true },
        },
        booking: {
          select: {
            service: { select: { title: true } },
          },
        },
      },
    });

    // Recompute mentor's aggregate rating & reviewCount
    const allReviews = await db.mentorshipReview.findMany({
      where: { mentorId: booking.mentorId },
      select: { rating: true },
    });

    const totalRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = allReviews.length > 0 ? totalRatings / allReviews.length : 5.0;

    await db.mentor.update({
      where: { id: booking.mentorId },
      data: {
        reviewCount: allReviews.length,
        rating: Math.round(avgRating * 10) / 10,
      },
    });

    return {
      id: review.id,
      bookingId: review.bookingId,
      rating: review.rating,
      review: review.review,
      createdAt: review.createdAt.toISOString(),
      serviceTitle: review.booking.service.title,
      candidateName: review.candidate.name,
      candidateAvatar: review.candidate.avatarUrl,
    };
  }
}
