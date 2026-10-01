import { z } from 'zod';

export const MentorshipCategoryEnum = z.enum([
  'CAREER_GUIDANCE',
  'RESUME_REVIEW',
  'MOCK_INTERVIEW',
  'TECHNICAL_GUIDANCE',
  'CAREER_SWITCH',
  'LONG_TERM_MENTORSHIP',
]);

export const CreateServiceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  category: MentorshipCategoryEnum,
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes').max(180, 'Duration cannot exceed 180 minutes'),
  price: z.number().int().min(0, 'Price cannot be negative'),
  currency: z.string().default('INR'),
  active: z.boolean().default(true),
  bookingSettings: z.object({
    maxBookingsPerWeek: z.number().int().positive().optional(),
    bufferMinutes: z.number().int().min(0).max(60).optional(),
  }).optional(),
});

export const UpdateServiceSchema = CreateServiceSchema.partial();

export const AvailabilityRuleInputSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format'),
  timezone: z.string().min(1).default('Asia/Kolkata'),
  active: z.boolean().default(true),
}).refine(data => data.startTime < data.endTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const SetWeeklyAvailabilitySchema = z.object({
  timezone: z.string().min(1).default('Asia/Kolkata'),
  rules: z.array(AvailabilityRuleInputSchema),
});

export const AvailabilityExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  type: z.enum(['UNAVAILABLE', 'CUSTOM_HOURS']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:mm format').optional().nullable(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:mm format').optional().nullable(),
  reason: z.string().max(200).optional().nullable(),
}).refine(data => {
  if (data.type === 'CUSTOM_HOURS') {
    return data.startTime && data.endTime && data.startTime < data.endTime;
  }
  return true;
}, {
  message: 'Custom hours requires valid startTime and endTime where startTime < endTime',
  path: ['endTime'],
});

export const CreateBookingSchema = z.object({
  mentorId: z.string().min(1, 'Mentor ID is required'),
  serviceId: z.string().min(1, 'Service ID is required'),
  scheduledStart: z.string().datetime({ message: 'scheduledStart must be a valid ISO datetime' }),
  timezone: z.string().default('Asia/Kolkata'),
  studentNotes: z.string().max(1000).optional().nullable(),
});

export const UpdateBookingStatusSchema = z.object({
  status: z.enum([
    'CONFIRMED',
    'RESCHEDULE_REQUESTED',
    'CANCELLED_BY_MENTOR',
    'CANCELLED_BY_CANDIDATE',
    'COMPLETED',
    'NO_SHOW',
  ]),
  reason: z.string().max(500).optional().nullable(),
});

export const UpdateSessionNotesSchema = z.object({
  notes: z.string().max(10000).optional().nullable(),
  actionItems: z.array(z.object({
    id: z.string(),
    text: z.string().min(1).max(300),
    completed: z.boolean().default(false),
    dueDate: z.string().optional(),
  })).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  meetingUrl: z.string().url().optional().nullable(),
});

export const CreateReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  review: z.string().min(5, 'Review must be at least 5 characters').max(2000),
});

export const UpdateMentorProfileSchema = z.object({
  headline: z.string().min(3).max(150).optional(),
  bio: z.string().min(10).max(3000).optional(),
  company: z.string().max(100).optional().nullable(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  startingPrice: z.number().int().min(0).optional(),
  expertise: z.array(z.string()).optional(),
  sessionTypes: z.array(z.string()).optional(),
  skillsList: z.array(z.string()).optional(),
  avatar: z.string().url().optional().nullable(),
});
