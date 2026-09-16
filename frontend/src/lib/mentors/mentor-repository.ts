import { DEMO_MENTORS } from './mentor-data';
import {
  Mentor,
  MentorFilterParams,
  MentorPaginatedResult,
  MentorSessionOption,
  MentorReview,
  CandidateContext,
} from './mentor-types';
import { matchMentor } from './mentor-matching';

/**
 * Data Repository Abstraction for Mentors.
 * Current implementation consumes demo data.
 * Future transition: replace function body internals with GET /api/mentors or Prisma database calls
 * WITHOUT breaking frontend components.
 */

export async function getMentors(params: MentorFilterParams = {}): Promise<MentorPaginatedResult> {
  const {
    search = '',
    expertise = [],
    experience = [],
    sessionTypes = [],
    priceRange = 'Any',
    availability = 'All',
    sort = 'recommended',
    page = 1,
    limit = 6,
  } = params;

  // Artificial small delay to simulate network call during client testing
  await new Promise((resolve) => setTimeout(resolve, 80));

  let filtered = [...DEMO_MENTORS];

  // 1. Text Search Filter
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.domain.toLowerCase().includes(q) ||
        m.expertise.some((e) => e.toLowerCase().includes(q)) ||
        m.skillsList.some((s) => s.toLowerCase().includes(q)) ||
        m.sessionTypes.some((st) => st.toLowerCase().includes(q))
    );
  }

  // 2. Expertise Filter
  if (expertise.length > 0) {
    filtered = filtered.filter((m) => m.expertise.some((exp) => expertise.includes(exp)));
  }

  // 3. Experience Filter
  if (experience.length > 0) {
    filtered = filtered.filter((m) => {
      const yrs = m.experienceYears;
      return experience.some((expRange) => {
        if (expRange === '3–5 years') return yrs >= 3 && yrs <= 5;
        if (expRange === '5–10 years') return yrs >= 5 && yrs <= 10;
        if (expRange === '10+ years') return yrs >= 10;
        return true;
      });
    });
  }

  // 4. Session Type Filter
  if (sessionTypes.length > 0) {
    filtered = filtered.filter((m) => m.sessionTypes.some((st) => sessionTypes.includes(st)));
  }

  // 5. Price Filter
  if (priceRange && priceRange !== 'Any') {
    filtered = filtered.filter((m) => {
      const price = m.startingPrice;
      if (priceRange === 'Under ₹500') return price < 500;
      if (priceRange === '₹500–₹1,000') return price >= 500 && price <= 1000;
      if (priceRange === '₹1,000–₹2,500') return price >= 1000 && price <= 2500;
      if (priceRange === '₹2,500+') return price >= 2500;
      return true;
    });
  }

  // 6. Availability Filter
  if (availability && availability !== 'All') {
    filtered = filtered.filter((m) => m.availabilityStatus === availability);
  }

  // 7. Sorting
  filtered.sort((a, b) => {
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'experience') return b.experienceYears - a.experienceYears;
    if (sort === 'price_low') return a.startingPrice - b.startingPrice;
    if (sort === 'price_high') return b.startingPrice - a.startingPrice;
    // Default 'recommended'
    return b.rating * b.reviewCount - a.rating * a.reviewCount;
  });

  // 8. Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const paginatedMentors = filtered.slice(startIndex, startIndex + limit);

  return {
    mentors: paginatedMentors,
    total,
    page: currentPage,
    limit,
    totalPages,
    hasMore: currentPage < totalPages,
  };
}

export async function getMentorById(id: string): Promise<Mentor | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const found = DEMO_MENTORS.find((m) => m.id === id);
  return found || null;
}

export async function getRecommendedMentors(
  candidateContext?: CandidateContext | null,
  limit: number = 3
): Promise<Mentor[]> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const sorted = [...DEMO_MENTORS].sort((a, b) => {
    const matchA = matchMentor(candidateContext, a);
    const matchB = matchMentor(candidateContext, b);
    return matchB.score - matchA.score;
  });
  return sorted.slice(0, limit);
}

export async function getMentorAvailability(
  id: string
): Promise<{ status: string; nextAvailable: string; slots: string[] }> {
  const mentor = await getMentorById(id);
  if (!mentor) {
    return {
      status: 'Unavailable',
      nextAvailable: 'No slots available',
      slots: [],
    };
  }
  return {
    status: mentor.availabilityStatus,
    nextAvailable: mentor.nextAvailableAt,
    slots: ['Tomorrow at 5:00 PM', 'Tomorrow at 7:30 PM', 'Friday at 4:00 PM', 'Saturday at 11:00 AM'],
  };
}

export async function getMentorSessionOptions(id: string): Promise<MentorSessionOption[]> {
  const mentor = await getMentorById(id);
  return mentor?.sessionOptions || [];
}

export async function getMentorReviews(id: string): Promise<MentorReview[]> {
  const mentor = await getMentorById(id);
  return mentor?.reviews || [];
}
