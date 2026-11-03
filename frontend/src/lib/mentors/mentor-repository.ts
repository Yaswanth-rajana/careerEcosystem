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
 * Migrated to real database API endpoint (GET /api/mentors),
 * backed by MentorshipService matching logic.
 */

export async function getMentors(params: MentorFilterParams = {}): Promise<MentorPaginatedResult> {
  const query = new URLSearchParams();

  if (params.preference) query.set('preference', params.preference);
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.priceRange && params.priceRange !== 'Any') query.set('priceRange', params.priceRange);
  if (params.availability && params.availability !== 'All') query.set('availability', params.availability);
  if (params.sort) query.set('sort', params.sort);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  (params.expertise || []).forEach((e) => query.append('expertise', e));
  (params.experience || []).forEach((e) => query.append('experience', e));
  (params.sessionTypes || []).forEach((s) => query.append('sessionTypes', s));

  try {
    const res = await fetch(`/api/mentors?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch mentors: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.success) {
      return {
        mentors: data.mentors || [],
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || params.limit || 6,
        totalPages: data.totalPages || 1,
        hasMore: !!data.hasMore,
        selectedPreference: data.selectedPreference,
      };
    }
    throw new Error(data.error || 'Failed to load mentors');
  } catch (err) {
    console.warn('API error fetching mentors:', err);
    return {
      mentors: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 6,
      totalPages: 1,
      hasMore: false,
      selectedPreference: params.preference,
    };
  }
}

export async function getMentorById(id: string): Promise<Mentor | null> {
  try {
    const res = await fetch(`/api/mentors/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.mentor) {
        return data.mentor;
      }
    }
  } catch (err) {
    console.warn('API error fetching mentor by id:', err);
  }
  const found = DEMO_MENTORS.find((m) => m.id === id);
  return found || null;
}

export async function getRecommendedMentors(
  candidateContext?: CandidateContext | null,
  limit: number = 3
): Promise<Mentor[]> {
  try {
    const res = await getMentors({ limit: 12 });
    if (res.mentors && res.mentors.length > 0) {
      const sorted = [...res.mentors].sort((a, b) => {
        const matchA = matchMentor(candidateContext, a);
        const matchB = matchMentor(candidateContext, b);
        return matchB.score - matchA.score;
      });
      return sorted.slice(0, limit);
    }
  } catch {
    // fallback
  }

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
