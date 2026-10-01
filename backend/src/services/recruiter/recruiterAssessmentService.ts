import { db } from '../../db/client';
import { RecruiterAssessmentDTO, AuthenticatedRecruiter } from '../../types/recruiter';
import { RecruiterAssessmentCreateSchema } from '../../validations/recruiterSchemas';
import { AuditService } from '../auditService';
import { z } from 'zod';

export class RecruiterAssessmentService {
  /**
   * Lists all assessments for the recruiter's company.
   */
  static async listAssessments(companyId: string): Promise<RecruiterAssessmentDTO[]> {
    const assessments = await db.assessment.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: { select: { title: true } },
        questions: { select: { id: true } },
        submissions: { select: { id: true } },
      },
    });

    return assessments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      type: a.type,
      timeLimitMinutes: a.timeLimitMinutes,
      passingScore: a.passingScore,
      status: a.status,
      jobId: a.jobId,
      jobTitle: a.job?.title || null,
      questionsCount: (a.questions || []).length,
      submissionsCount: (a.submissions || []).length,
      createdAt: a.createdAt.toISOString(),
    }));
  }

  /**
   * Creates a new assessment with embedded questions.
   */
  static async createAssessment(data: z.infer<typeof RecruiterAssessmentCreateSchema>, auth: AuthenticatedRecruiter) {
    const validated = RecruiterAssessmentCreateSchema.parse(data);

    const assessment = await db.assessment.create({
      data: {
        companyId: auth.company.id,
        jobId: validated.jobId || null,
        title: validated.title,
        description: validated.description || null,
        type: validated.type,
        timeLimitMinutes: validated.timeLimitMinutes,
        passingScore: validated.passingScore,
        status: 'ACTIVE',
        questions: {
          create: validated.questions.map((q, idx) => ({
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
            order: idx + 1,
          })),
        },
      },
      include: {
        questions: true,
        job: { select: { title: true } },
      },
    });

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_ASSESSMENT_CREATED',
      resourceType: 'ASSESSMENT',
      resourceId: assessment.id,
      details: { title: assessment.title, questionsCount: assessment.questions.length },
    });

    return {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      timeLimitMinutes: assessment.timeLimitMinutes,
      passingScore: assessment.passingScore,
      status: assessment.status,
      jobId: assessment.jobId,
      jobTitle: assessment.job?.title || null,
      questionsCount: assessment.questions.length,
      submissionsCount: 0,
      createdAt: assessment.createdAt.toISOString(),
    };
  }

  /**
   * Retrieves an assessment with questions.
   */
  static async getAssessmentDetail(id: string, companyId: string) {
    const assessment = await db.assessment.findFirst({
      where: { id, companyId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        job: { select: { id: true, title: true } },
        submissions: {
          include: {
            candidate: { select: { name: true, email: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!assessment) {
      throw new Error('Assessment not found or access denied.');
    }

    return assessment;
  }
}
