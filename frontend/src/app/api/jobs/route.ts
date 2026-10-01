import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { JobSearchService } from '@backend/services/jobSearchService';
import { JobSearchQuerySchema } from '@backend/validations/jobSchemas';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);

    // Extract search parameters into a plain object
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

    const parsedParams = JobSearchQuerySchema.parse(rawParams);
    const result = await JobSearchService.searchJobs(parsedParams, user?.id || null);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Job search API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search jobs' },
      { status: 400 }
    );
  }
}
