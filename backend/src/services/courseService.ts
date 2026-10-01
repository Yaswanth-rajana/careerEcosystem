import { db } from '../db/client';
import {
  CourseListDTO,
  CourseDetailDTO,
  PaginatedAdminResult,
  CourseStatus,
} from '../types/admin';
import { AdminCourseCreateSchema, AdminCourseUpdateSchema } from '../validations/adminSchemas';
import { AuditService } from './auditService';
import { AuthenticatedAdmin } from './adminAuthService';

export interface ListCoursesParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  level?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export class CourseService {
  /**
   * Retrieves paginated courses for list view.
   * Returns compact CourseListDTO without heavy modules/lessons.
   */
  static async listCourses(params: ListCoursesParams = {}): Promise<PaginatedAdminResult<CourseListDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.category && params.category !== 'All') {
      where.category = { equals: params.category, mode: 'insensitive' };
    }
    if (params.level && params.level !== 'All') {
      where.level = params.level;
    }
    if (params.status && params.status !== 'All') {
      where.status = params.status;
    }
    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { instructorName: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortField = params.sortBy || 'createdAt';
    const sortOrder = params.sortDir || 'desc';

    const [total, courses] = await Promise.all([
      db.course.count({ where }),
      db.course.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          level: true,
          instructorName: true,
          durationHours: true,
          lessonsCount: true,
          status: true,
          isFeatured: true,
          publishedAt: true,
          updatedAt: true,
        },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    const items: CourseListDTO[] = courses.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      level: c.level,
      instructorName: c.instructorName,
      durationHours: c.durationHours,
      lessonsCount: c.lessonsCount,
      status: c.status as CourseStatus,
      isFeatured: c.isFeatured,
      publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null,
      updatedAt: c.updatedAt.toISOString(),
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
   * Retrieves full course detail including modules and lessons.
   */
  static async getCourseDetail(courseId: string): Promise<CourseDetailDTO | null> {
    if (!courseId) return null;

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!course) return null;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      category: course.category,
      level: course.level,
      instructorName: course.instructorName,
      instructorTitle: course.instructorTitle,
      instructorAvatar: course.instructorAvatar,
      durationHours: course.durationHours,
      lessonsCount: course.lessonsCount,
      skills: course.skills,
      learningObjectives: course.learningObjectives,
      status: course.status as CourseStatus,
      isFeatured: course.isFeatured,
      publishedAt: course.publishedAt?.toISOString() || null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      modules: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        order: m.order,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          durationMin: l.durationMin,
          type: l.type,
          contentUrl: l.contentUrl,
          contentBody: l.contentBody,
          order: l.order,
        })),
      })),
    };
  }

  /**
   * Creates a new Course with structured modules and lessons.
   */
  static async createCourse(input: any, actor: AuthenticatedAdmin): Promise<CourseDetailDTO> {
    const validated = AdminCourseCreateSchema.parse(input);

    const slug =
      validated.slug ||
      validated.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') + `-${Date.now().toString(36)}`;

    // Calculate total lessons
    let totalLessons = 0;
    if (validated.modules && validated.modules.length > 0) {
      for (const m of validated.modules) {
        totalLessons += m.lessons?.length || 0;
      }
    }

    const course = await db.course.create({
      data: {
        title: validated.title,
        slug,
        description: validated.description,
        shortDescription: validated.shortDescription || null,
        category: validated.category,
        level: validated.level,
        instructorName: validated.instructorName,
        instructorTitle: validated.instructorTitle || null,
        instructorAvatar: validated.instructorAvatar || null,
        durationHours: validated.durationHours || 0,
        lessonsCount: totalLessons,
        skills: validated.skills || [],
        learningObjectives: validated.learningObjectives || [],
        status: validated.status || 'DRAFT',
        isFeatured: validated.isFeatured || false,
        publishedAt: validated.status === 'PUBLISHED' ? new Date() : null,
        modules: {
          create: (validated.modules || []).map((m, mIdx) => ({
            title: m.title,
            description: m.description || null,
            order: m.order || mIdx + 1,
            lessons: {
              create: (m.lessons || []).map((l, lIdx) => ({
                title: l.title,
                durationMin: l.durationMin || 10,
                type: l.type || 'VIDEO',
                contentUrl: l.contentUrl || null,
                contentBody: l.contentBody || null,
                order: l.order || lIdx + 1,
              })),
            },
          })),
        },
      },
    });

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: 'COURSE_CREATED',
      resourceType: 'COURSE',
      resourceId: course.id,
      details: { title: course.title, category: course.category, status: course.status },
    });

    return (await this.getCourseDetail(course.id))!;
  }

  /**
   * Updates an existing course structure.
   */
  static async updateCourse(courseId: string, input: any, actor: AuthenticatedAdmin): Promise<CourseDetailDTO> {
    const validated = AdminCourseUpdateSchema.parse(input);

    const existing = await db.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    // If modules were provided, replace them cleanly
    if (validated.modules) {
      await db.courseLesson.deleteMany({
        where: { module: { courseId } },
      });
      await db.courseModule.deleteMany({
        where: { courseId },
      });

      let totalLessons = 0;
      for (const m of validated.modules) {
        totalLessons += m.lessons?.length || 0;
      }

      for (let mIdx = 0; mIdx < validated.modules.length; mIdx++) {
        const m = validated.modules[mIdx];
        await db.courseModule.create({
          data: {
            courseId,
            title: m.title,
            description: m.description || null,
            order: m.order || mIdx + 1,
            lessons: {
              create: (m.lessons || []).map((l, lIdx) => ({
                title: l.title,
                durationMin: l.durationMin || 10,
                type: l.type || 'VIDEO',
                contentUrl: l.contentUrl || null,
                contentBody: l.contentBody || null,
                order: l.order || lIdx + 1,
              })),
            },
          },
        });
      }

      await db.course.update({
        where: { id: courseId },
        data: {
          lessonsCount: totalLessons,
        },
      });
    }

    const updated = await db.course.update({
      where: { id: courseId },
      data: {
        ...(validated.title ? { title: validated.title } : {}),
        ...(validated.description ? { description: validated.description } : {}),
        ...(validated.shortDescription !== undefined ? { shortDescription: validated.shortDescription } : {}),
        ...(validated.category ? { category: validated.category } : {}),
        ...(validated.level ? { level: validated.level } : {}),
        ...(validated.instructorName ? { instructorName: validated.instructorName } : {}),
        ...(validated.instructorTitle !== undefined ? { instructorTitle: validated.instructorTitle } : {}),
        ...(validated.instructorAvatar !== undefined ? { instructorAvatar: validated.instructorAvatar } : {}),
        ...(validated.durationHours !== undefined ? { durationHours: validated.durationHours } : {}),
        ...(validated.skills ? { skills: validated.skills } : {}),
        ...(validated.learningObjectives ? { learningObjectives: validated.learningObjectives } : {}),
        ...(validated.status ? { status: validated.status } : {}),
        ...(validated.isFeatured !== undefined ? { isFeatured: validated.isFeatured } : {}),
      },
    });

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: 'COURSE_UPDATED',
      resourceType: 'COURSE',
      resourceId: updated.id,
      details: { title: updated.title, status: updated.status },
    });

    return (await this.getCourseDetail(courseId))!;
  }

  /**
   * Publishes a course after verifying all completeness requirements.
   * Requirement 21: CoursePublishingService validation.
   */
  static async publishCourse(courseId: string, actor: AuthenticatedAdmin): Promise<CourseDetailDTO> {
    const detail = await this.getCourseDetail(courseId);
    if (!detail) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    // Completeness verification
    if (!detail.title || detail.title.trim().length < 3) {
      throw new Error('Course must have a valid title of at least 3 characters before publishing.');
    }
    if (!detail.description || detail.description.trim().length < 10) {
      throw new Error('Course must have a detailed description before publishing.');
    }
    if (!detail.category) {
      throw new Error('Course category must be specified before publishing.');
    }
    if (!detail.learningObjectives || detail.learningObjectives.length === 0) {
      throw new Error('Course must have at least one learning objective defined before publishing.');
    }
    if (!detail.modules || detail.modules.length === 0) {
      throw new Error('Course must have at least one module defined before publishing.');
    }
    const hasAnyLessons = detail.modules.some((m) => m.lessons && m.lessons.length > 0);
    if (!hasAnyLessons) {
      throw new Error('Course must contain at least one lesson within its modules before publishing.');
    }

    await db.course.update({
      where: { id: courseId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: 'COURSE_PUBLISHED',
      resourceType: 'COURSE',
      resourceId: courseId,
      details: { title: detail.title },
    });

    return (await this.getCourseDetail(courseId))!;
  }

  /**
   * Archives a course (soft status transition).
   */
  static async archiveCourse(courseId: string, actor: AuthenticatedAdmin): Promise<CourseDetailDTO> {
    const existing = await db.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    await db.course.update({
      where: { id: courseId },
      data: {
        status: 'ARCHIVED',
      },
    });

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      actorName: actor.name,
      action: 'COURSE_ARCHIVED',
      resourceType: 'COURSE',
      resourceId: courseId,
      details: { title: existing.title },
    });

    return (await this.getCourseDetail(courseId))!;
  }
}
