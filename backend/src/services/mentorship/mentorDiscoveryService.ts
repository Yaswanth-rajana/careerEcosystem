import { db } from '../../db/client';
import {
  MentorDiscoveryItemDTO,
  MentorDiscoveryResultDTO,
  MatchingServiceDTO,
  normalizeMentorshipCategory,
  getCategoryLabel,
} from '../../types/mentorship';
import { AvailabilityService } from './availabilityService';

export interface MentorDiscoveryParams {
  preference?: string;
  search?: string;
  expertise?: string | string[];
  experience?: string | string[];
  sessionTypes?: string | string[];
  priceRange?: string;
  availability?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export class MentorDiscoveryService {
  /**
   * Discovers eligible mentors backed by active mentorship services matching candidate preference.
   * Core rule: Mentorship Service is the source of truth for discovery matching.
   */
  static async discoverMentors(params: MentorDiscoveryParams = {}): Promise<MentorDiscoveryResultDTO> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(params.limit) || 6));
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'APPROVED',
      publicProfileEnabled: { not: false },
    };

    // 1. Service Matching & Preference Filter
    let canonicalCategories: string[] = [];
    if (params.preference && params.preference.trim()) {
      canonicalCategories = normalizeMentorshipCategory(params.preference);
      if (canonicalCategories.length === 0) {
        // If an explicit invalid preference is requested, return empty result
        return {
          mentors: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasMore: false,
          selectedPreference: params.preference,
        };
      }

      where.services = {
        some: {
          active: true,
          category: { in: canonicalCategories },
        },
      };
    } else {
      // Default state: mentors must have at least one active mentorship service
      where.services = {
        some: {
          active: true,
        },
      };
    }

    // 2. Text Search Filter (name, headline, bio, domain, skills, or service title)
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      const searchConditions: any[] = [
        { name: { contains: q, mode: 'insensitive' } },
        { headline: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { domain: { contains: q, mode: 'insensitive' } },
        { skillsList: { has: q } },
        {
          services: {
            some: {
              active: true,
              ...(canonicalCategories.length > 0 ? { category: { in: canonicalCategories } } : {}),
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];

      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    // 3. Expertise Filter
    if (params.expertise) {
      const expArr = Array.isArray(params.expertise)
        ? params.expertise
        : [params.expertise];
      const validExp = expArr.filter(Boolean);
      if (validExp.length > 0) {
        where.expertise = { hasSome: validExp };
      }
    }

    // 4. Experience Filter
    if (params.experience) {
      const expArr = Array.isArray(params.experience)
        ? params.experience
        : [params.experience];
      const conditions: any[] = [];
      for (const range of expArr) {
        if (range === '3–5 years' || range === '3-5 years') {
          conditions.push({ experienceYears: { gte: 3, lte: 5 } });
        } else if (range === '5–10 years' || range === '5-10 years') {
          conditions.push({ experienceYears: { gte: 5, lte: 10 } });
        } else if (range === '10+ years') {
          conditions.push({ experienceYears: { gte: 10 } });
        }
      }
      if (conditions.length > 0) {
        if (where.OR) {
          where.AND = (where.AND || []).concat([{ OR: conditions }]);
        } else {
          where.OR = conditions;
        }
      }
    }

    // 5. Price Filter
    if (params.priceRange && params.priceRange !== 'Any') {
      if (params.priceRange === 'Under ₹500') {
        where.startingPrice = { lt: 500 };
      } else if (params.priceRange === '₹500–₹1,000' || params.priceRange === '₹500-₹1,000') {
        where.startingPrice = { gte: 500, lte: 1000 };
      } else if (params.priceRange === '₹1,000–₹2,500' || params.priceRange === '₹1,000-₹2,500') {
        where.startingPrice = { gte: 1000, lte: 2500 };
      } else if (params.priceRange === '₹2,500+') {
        where.startingPrice = { gte: 2500 };
      }
    }

    // 6. Sorting
    const sortField = params.sort || 'recommended';
    let orderBy: any = { rating: 'desc' };
    if (sortField === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortField === 'experience') {
      orderBy = { experienceYears: 'desc' };
    } else if (sortField === 'price_low') {
      orderBy = { startingPrice: 'asc' };
    } else if (sortField === 'price_high') {
      orderBy = { startingPrice: 'desc' };
    } else {
      // recommended: order by reviewCount desc, then rating desc
      orderBy = [{ reviewCount: 'desc' }, { rating: 'desc' }];
    }

    // Execute database queries
    const [total, mentors] = await Promise.all([
      db.mentor.count({ where }),
      db.mentor.findMany({
        where,
        include: {
          services: {
            where: { active: true },
            orderBy: { price: 'asc' },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    // Map mentors and attach matching service info
    const mappedMentors: MentorDiscoveryItemDTO[] = mentors.map((m) => {
      const activeServices = m.services || [];

      // Find the specific matching service that satisfied the preference
      let matchingServiceRaw = null;
      if (canonicalCategories.length > 0) {
        matchingServiceRaw = activeServices.find((s) => canonicalCategories.includes(s.category)) || null;
      }
      if (!matchingServiceRaw && activeServices.length > 0) {
        matchingServiceRaw = activeServices[0];
      }

      const matchingService: MatchingServiceDTO | null = matchingServiceRaw
        ? {
            id: matchingServiceRaw.id,
            title: matchingServiceRaw.title,
            description: matchingServiceRaw.description,
            category: matchingServiceRaw.category as any,
            categoryLabel: getCategoryLabel(matchingServiceRaw.category),
            duration: matchingServiceRaw.duration,
            price: matchingServiceRaw.price,
            currency: matchingServiceRaw.currency,
            active: matchingServiceRaw.active,
          }
        : null;

      // Transform active services into session options for booking
      const sessionOptions = activeServices.map((s) => ({
        id: s.id,
        title: s.title,
        durationMin: s.duration,
        price: s.price,
        description: s.description,
        type: getCategoryLabel(s.category),
        category: s.category,
      }));

      // Calculate availability display
      const availabilityStatus = m.status === 'APPROVED' ? 'Available this week' : 'Limited slots';

      return {
        id: m.id,
        name: m.name,
        avatar:
          m.avatar ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400`,
        badgeLabel: 'PATHWAY.ECO Mentor',
        role: m.headline || 'Industry Expert',
        domain: m.domain,
        company: m.company,
        experienceYears: m.experienceYears,
        rating: m.rating || 5.0,
        reviewCount: m.reviewCount || 0,
        sessionCount: m.sessionCount || 0,
        expertise: m.expertise || [],
        sessionTypes: m.sessionTypes || [],
        startingPrice: matchingService ? matchingService.price : m.startingPrice,
        availabilityStatus,
        nextAvailableAt: 'Tomorrow, 5:00 PM',
        bio: m.bio || '',
        about: [m.bio || 'Experienced engineering and technical mentor.'],
        skillsList: m.skillsList || [],
        helpTopics: activeServices.map((s) => s.title),
        workHistory: [
          {
            role: m.headline || 'Senior Mentor',
            organizationType: m.company || m.domain,
            period: `${m.experienceYears} Years Exp`,
          },
        ],
        matchingService,
        sessionOptions,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      mentors: mappedMentors,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      selectedPreference: params.preference || null,
    };
  }

  /**
   * Retrieves single public mentor profile with active services for /mentors/[id] or mentor preview modal.
   */
  static async getMentorPublicDetail(
    mentorId: string,
    options?: { allowUnapproved?: boolean }
  ): Promise<MentorDiscoveryItemDTO | null> {
    if (!mentorId) return null;

    const mentor = await db.mentor.findUnique({
      where: { id: mentorId },
      include: {
        services: {
          where: { active: true },
          orderBy: { price: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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
        },
      },
    });

    if (!mentor || (!options?.allowUnapproved && mentor.status !== 'APPROVED')) {
      return null;
    }

    const activeServices = mentor.services || [];
    const firstService = activeServices[0] || null;

    // Clean public biography: strip raw onboarding question labels if present
    let cleanBio = (mentor.bio || '').trim();
    cleanBio = cleanBio
      .replace(/^why\s+do\s+you\s+want\s+to\s+become\s+a\s+(pathway\.eco\s+)?mentor\??\s*/i, '')
      .replace(/^why\s+do\s+you\s+want\s+to\s+mentor\??\s*/i, '')
      .trim();

    const aboutParagraphs = cleanBio
      ? cleanBio
          .split(/\n{2,}|\r\n\r\n/)
          .map((p) => p.trim())
          .filter(Boolean)
      : [];

    // Calculate real availability slot instead of hardcoding
    let nextAvailableAt: string | null = null;
    let availabilityStatus = 'No upcoming slots';

    try {
      const today = new Date();
      const in14Days = new Date();
      in14Days.setDate(today.getDate() + 14);

      const startDateStr = today.toISOString().split('T')[0];
      const endDateStr = in14Days.toISOString().split('T')[0];

      const durationMinutes = firstService?.duration || 30;
      const slots = await AvailabilityService.getAvailableSlots({
        mentorId: mentor.id,
        startDate: startDateStr,
        endDate: endDateStr,
        durationMinutes,
      });

      if (slots && slots.length > 0) {
        const firstSlot = slots[0];
        const slotDate = new Date(firstSlot.start);
        const isToday = slotDate.toDateString() === today.toDateString();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const isTomorrow = slotDate.toDateString() === tomorrow.toDateString();

        const timeStr =
          firstSlot.displayTime ||
          slotDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        if (isToday) {
          nextAvailableAt = `Today, ${timeStr}`;
          availabilityStatus = 'Available today';
        } else if (isTomorrow) {
          nextAvailableAt = `Tomorrow, ${timeStr}`;
          availabilityStatus = 'Next available tomorrow';
        } else {
          const dateStr = slotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          nextAvailableAt = `${dateStr}, ${timeStr}`;
          availabilityStatus = 'Available this week';
        }
      }
    } catch {
      nextAvailableAt = null;
      availabilityStatus = 'Check availability';
    }

    const isVerified = mentor.status === 'APPROVED';
    const reviewCount = mentor.reviewCount || 0;
    const rating = reviewCount > 0 ? Number(mentor.rating.toFixed(1)) : 0;

    const reviews = (mentor.reviews || []).map((r: any) => ({
      id: r.id,
      bookingId: r.bookingId,
      rating: r.rating,
      review: r.review,
      createdAt: r.createdAt.toISOString(),
      serviceTitle: r.booking?.service?.title || 'Mentorship Session',
      candidateName: r.candidate?.name || 'Verified Mentee',
      candidateAvatar: r.candidate?.avatarUrl || null,
    }));

    return {
      id: mentor.id,
      name: mentor.name,
      avatar:
        mentor.avatar ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400`,
      badgeLabel: isVerified ? 'Verified Mentor' : 'PATHWAY.ECO Mentor',
      isVerified,
      role: mentor.headline,
      headline: mentor.headline,
      domain: mentor.domain,
      company: mentor.company,
      experienceYears: mentor.experienceYears,
      rating,
      reviewCount,
      sessionCount: mentor.sessionCount || 0,
      expertise: mentor.expertise || [],
      sessionTypes: mentor.sessionTypes || [],
      startingPrice: firstService ? firstService.price : mentor.startingPrice,
      availabilityStatus,
      nextAvailableAt,
      bio: cleanBio,
      about: aboutParagraphs,
      skillsList: mentor.skillsList || [],
      helpTopics: activeServices.map((s) => s.title),
      workHistory: [
        {
          role: mentor.headline,
          organizationType: mentor.company || mentor.domain,
          period: `${mentor.experienceYears} Years Exp`,
        },
      ],
      matchingService: firstService
        ? {
            id: firstService.id,
            title: firstService.title,
            description: firstService.description,
            category: firstService.category as any,
            categoryLabel: getCategoryLabel(firstService.category),
            duration: firstService.duration,
            price: firstService.price,
            currency: firstService.currency,
            active: firstService.active,
          }
        : null,
      sessionOptions: activeServices.map((s) => ({
        id: s.id,
        title: s.title,
        durationMin: s.duration,
        price: s.price,
        description: s.description,
        type: getCategoryLabel(s.category),
        category: s.category,
      })),
      reviews,
    };
  }
}
