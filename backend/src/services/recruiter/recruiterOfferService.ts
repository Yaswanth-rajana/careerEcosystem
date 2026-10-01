import { db } from '../../db/client';
import { RecruiterOfferDTO, AuthenticatedRecruiter } from '../../types/recruiter';
import { RecruiterOfferCreateSchema } from '../../validations/recruiterSchemas';
import { AuditService } from '../auditService';
import { z } from 'zod';

export class RecruiterOfferService {
  /**
   * Lists offers for the recruiter's company.
   */
  static async listOffers(companyId: string): Promise<RecruiterOfferDTO[]> {
    const offers = await db.offer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: { select: { name: true, email: true } },
        job: { select: { title: true } },
      },
    });

    return offers.map((off) => ({
      id: off.id,
      companyId: off.companyId,
      jobId: off.jobId,
      jobTitle: off.job.title,
      applicationId: off.applicationId,
      candidateId: off.candidateId,
      candidateName: off.candidate.name,
      candidateEmail: off.candidate.email,
      positionTitle: off.positionTitle,
      salaryOffered: off.salaryOffered,
      currency: off.currency,
      salaryPeriod: off.salaryPeriod,
      startDate: off.startDate?.toISOString() || null,
      expiresAt: off.expiresAt?.toISOString() || null,
      notes: off.notes,
      status: off.status,
      createdAt: off.createdAt.toISOString(),
    }));
  }

  /**
   * Creates a formal job offer for a candidate application.
   */
  static async createOffer(data: z.infer<typeof RecruiterOfferCreateSchema>, auth: AuthenticatedRecruiter) {
    const validated = RecruiterOfferCreateSchema.parse(data);

    // Ownership check on job
    const job = await db.job.findFirst({
      where: { id: validated.jobId, companyId: auth.company.id },
    });
    if (!job) {
      throw new Error('Job not found or access denied.');
    }

    const offer = await db.offer.create({
      data: {
        companyId: auth.company.id,
        jobId: validated.jobId,
        applicationId: validated.applicationId,
        candidateId: validated.candidateId,
        positionTitle: validated.positionTitle,
        salaryOffered: validated.salaryOffered,
        currency: validated.currency,
        salaryPeriod: validated.salaryPeriod,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        notes: validated.notes || null,
        status: 'SENT',
      },
      include: {
        candidate: { select: { name: true, email: true } },
        job: { select: { title: true } },
      },
    });

    // Advance application status to OFFER
    await db.jobApplication.update({
      where: { id: validated.applicationId },
      data: { status: 'OFFER', reviewedAt: new Date() },
    }).catch(() => {});

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_OFFER_EXTENDED',
      resourceType: 'OFFER',
      resourceId: offer.id,
      details: {
        candidateName: offer.candidate.name,
        positionTitle: offer.positionTitle,
        salaryOffered: offer.salaryOffered,
      },
    });

    return {
      id: offer.id,
      companyId: offer.companyId,
      jobId: offer.jobId,
      jobTitle: offer.job.title,
      applicationId: offer.applicationId,
      candidateId: offer.candidateId,
      candidateName: offer.candidate.name,
      candidateEmail: offer.candidate.email,
      positionTitle: offer.positionTitle,
      salaryOffered: offer.salaryOffered,
      currency: offer.currency,
      salaryPeriod: offer.salaryPeriod,
      startDate: offer.startDate?.toISOString() || null,
      expiresAt: offer.expiresAt?.toISOString() || null,
      notes: offer.notes,
      status: offer.status,
      createdAt: offer.createdAt.toISOString(),
    };
  }

  /**
   * Updates an offer status (e.g. ACCEPTED, DECLINED, WITHDRAWN, or mark HIRED).
   */
  static async updateOfferStatus(
    id: string,
    companyId: string,
    newStatus: 'SENT' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN',
    auth: AuthenticatedRecruiter
  ) {
    const existing = await db.offer.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new Error('Offer not found or access denied.');
    }

    const updated = await db.offer.update({
      where: { id },
      data: { status: newStatus },
      include: {
        candidate: { select: { name: true, email: true } },
        job: { select: { title: true } },
      },
    });

    // If accepted, transition application to HIRED
    if (newStatus === 'ACCEPTED') {
      await db.jobApplication.update({
        where: { id: updated.applicationId },
        data: { status: 'HIRED', reviewedAt: new Date() },
      }).catch(() => {});
    }

    await AuditService.log({
      actorId: auth.user.id,
      actorEmail: auth.user.email,
      actorName: auth.user.name,
      action: 'RECRUITER_OFFER_STATUS_UPDATED',
      resourceType: 'OFFER',
      resourceId: updated.id,
      details: { status: newStatus },
    });

    return updated;
  }
}
