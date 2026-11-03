import { NextRequest, NextResponse } from 'next/server';
import { AvailabilityService } from '@backend/services/mentorship/availabilityService';

export const dynamic = 'force-dynamic';

// In-memory sliding rate limiter: 60 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 60) {
    return false;
  }
  entry.count++;
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const mentorId = params.id;
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const timezone = searchParams.get('timezone');
    const bufferMinutesParam = searchParams.get('bufferMinutes');
    const bufferMinutes = bufferMinutesParam !== null ? parseInt(bufferMinutesParam, 10) : undefined;

    if (!mentorId || !/^[0-9a-fA-F]{24}$/.test(mentorId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mentor ID format' },
        { status: 400 }
      );
    }

    if (!serviceId) {
      return NextResponse.json(
        { success: false, error: 'serviceId query parameter is required' },
        { status: 400 }
      );
    }

    if (!/^[0-9a-fA-F]{24}$/.test(serviceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid service ID format' },
        { status: 400 }
      );
    }

    const result = await AvailabilityService.getCandidateSlots({
      mentorId,
      serviceId,
      date: date || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      timezone: timezone || undefined,
      bufferMinutes,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    const message = error.message || 'Failed to retrieve available slots';
    const isNotFound =
      message.includes('not available for bookings') ||
      message.includes('Mentor not found');

    const status = isNotFound ? 404 : 400;

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}
