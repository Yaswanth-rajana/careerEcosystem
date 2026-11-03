import { NextRequest, NextResponse } from 'next/server';
import { MentorDiscoveryService } from '@backend/services/mentorship/mentorDiscoveryService';
import { MentorDiscoveryQuerySchema } from '@backend/validations/mentorshipSchemas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract search parameters into a plain object supporting arrays
    const rawParams: Record<string, any> = {};
    searchParams.forEach((val, key) => {
      if (rawParams[key]) {
        if (Array.isArray(rawParams[key])) {
          rawParams[key].push(val);
        } else {
          rawParams[key] = [rawParams[key], val];
        }
      } else {
        rawParams[key] = val;
      }
    });

    const parsedParams = MentorDiscoveryQuerySchema.parse(rawParams);

    const result = await MentorDiscoveryService.discoverMentors({
      preference: parsedParams.preference,
      search: parsedParams.search,
      expertise: parsedParams.expertise,
      experience: parsedParams.experience,
      sessionTypes: parsedParams.sessionTypes,
      priceRange: parsedParams.priceRange,
      availability: parsedParams.availability,
      sort: parsedParams.sort,
      page: parsedParams.page,
      limit: parsedParams.limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Mentor discovery API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to discover mentors' },
      { status: 400 }
    );
  }
}
