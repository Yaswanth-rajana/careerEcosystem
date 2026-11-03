import { AsyncLocalStorage } from 'async_hooks';
(global as any).AsyncLocalStorage = AsyncLocalStorage;

import { db } from '../db/client';
import { UserService } from '../services/userService';
import { ApplicationService } from '../services/applicationService';
import { StorageFactory } from '../services/tools/storage-provider';

async function runRecruiterResumeImmutabilityTests() {
  console.log('🚀 Starting Recruiter Resume Immutability & Security Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // Dynamically import Next.js requestAsyncStorage and route handler
  const { requestAsyncStorage } = require('next/dist/client/components/request-async-storage.external.js');
  const { NextRequest } = require('next/server');
  const routeModule = await import('@/app/api/recruiter/applications/[id]/resume/route');
  const GET = (routeModule as any).GET || (routeModule as any).default.GET;

  async function invokeResumeRoute(applicationId: string, sessionToken?: string) {
    const store = {
      cookies: {
        get: (name: string) => (sessionToken && name === 'career_recruiter_session' ? { value: sessionToken } : undefined),
      },
    };

    return requestAsyncStorage.run(store, async () => {
      const req = new NextRequest(`http://localhost:3004/api/recruiter/applications/${applicationId}/resume`);
      return GET(req, { params: { id: applicationId } });
    });
  }

  const suffix = `_${Date.now()}`;
  let companyA: any;
  let companyB: any;
  let recruiterUserA: any;
  let recruiterUserB: any;
  let recruiterProfileA: any;
  let recruiterProfileB: any;
  let tokenA: string;
  let tokenB: string;

  let candidate1: any;
  let profile1: any;
  let resume1_original: any;
  let resume3_newer: any;

  let candidate2: any;
  let profile2: any;
  let resume2_missing_file: any;

  let candidate3: any;
  let profile3: any;

  let jobA: any;
  let jobB: any;
  let app1_withResume: any;
  let app2_missingFile: any;
  let app3_noResume: any;

  const storage = StorageFactory.getProvider();
  const originalPdfBuffer = Buffer.from('%PDF-1.4 Original Resume 2025 Alex Johnson', 'utf-8');
  const newerPdfBuffer = Buffer.from('%PDF-1.4 Newer Resume 2026 Alex Johnson Senior Dev', 'utf-8');

  try {
    console.log('--- 1. Setup Test Companies, Recruiters, Candidates & Jobs ---');

    companyA = await db.company.create({
      data: {
        name: `Acme Immutability Corp ${suffix}`,
        slug: `acme-immutability-${suffix}`,
        website: 'https://acme-immutability.example.com',
        industry: 'Software',
        size: '50-100',
        location: 'Bengaluru, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    companyB = await db.company.create({
      data: {
        name: `Beta Rival Ltd ${suffix}`,
        slug: `beta-rival-${suffix}`,
        website: 'https://beta-rival.example.com',
        industry: 'Security',
        size: '20-50',
        location: 'Mumbai, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    recruiterUserA = await db.user.create({
      data: {
        email: `recruiter_a${suffix}@acme-immutability.com`,
        name: 'Alice Recruiter',
        role: 'RECRUITER',
        status: 'ACTIVE',
      },
    });

    recruiterProfileA = await db.recruiterProfile.create({
      data: {
        userId: recruiterUserA.id,
        companyId: companyA.id,
        designation: 'Talent Acquisition Lead',
        status: 'ACTIVE',
      },
    });

    await db.companyMember.create({
      data: {
        companyId: companyA.id,
        userId: recruiterUserA.id,
        role: 'COMPANY_ADMIN',
        status: 'ACTIVE',
      },
    });

    tokenA = await UserService.createSession(recruiterUserA.id);

    recruiterUserB = await db.user.create({
      data: {
        email: `recruiter_b${suffix}@beta-rival.com`,
        name: 'Bob Recruiter',
        role: 'RECRUITER',
        status: 'ACTIVE',
      },
    });

    recruiterProfileB = await db.recruiterProfile.create({
      data: {
        userId: recruiterUserB.id,
        companyId: companyB.id,
        designation: 'Recruiter',
        status: 'ACTIVE',
      },
    });

    await db.companyMember.create({
      data: {
        companyId: companyB.id,
        userId: recruiterUserB.id,
        role: 'RECRUITER',
        status: 'ACTIVE',
      },
    });

    tokenB = await UserService.createSession(recruiterUserB.id);

    // Candidate 1: Has original resume, later updates profile with newer resume
    candidate1 = await db.user.create({
      data: {
        email: `candidate1${suffix}@example.com`,
        name: 'Alex Johnson',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    profile1 = await db.profile.create({
      data: {
        userId: candidate1.id,
        headline: 'Frontend Engineer',
        location: 'Bengaluru, India',
        phone: '+91 9876543210',
      },
    });

    resume1_original = await db.resume.create({
      data: {
        profileId: profile1.id,
        filename: 'Alex_Johnson_Original_2025.pdf',
        fileType: 'application/pdf',
        fileSize: originalPdfBuffer.length,
        status: 'READY',
      },
    });

    // Upload original resume to storage
    await storage.upload(`resumes/${resume1_original.id}/${resume1_original.filename}`, originalPdfBuffer, 'application/pdf');

    // Candidate 2: Application references resume2, but file is missing from storage
    candidate2 = await db.user.create({
      data: {
        email: `candidate2${suffix}@example.com`,
        name: 'Samantha Ray',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    profile2 = await db.profile.create({
      data: {
        userId: candidate2.id,
        headline: 'Data Scientist',
        location: 'Hyderabad, India',
        phone: '+91 9123456789',
      },
    });

    resume2_missing_file = await db.resume.create({
      data: {
        profileId: profile2.id,
        filename: 'Samantha_Ray_Missing_File.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        status: 'READY',
        extractedData: JSON.stringify({ rawText: 'Extracted raw text for Samantha' }),
      },
    });
    // Deliberately do NOT upload resume2 to storage (or simulate missing file)

    // Candidate 3: Candidate with no resume
    candidate3 = await db.user.create({
      data: {
        email: `candidate3${suffix}@example.com`,
        name: 'David NoResume',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    profile3 = await db.profile.create({
      data: {
        userId: candidate3.id,
        headline: 'Junior Developer',
      },
    });

    // Jobs for Company A and Company B
    jobA = await db.job.create({
      data: {
        companyId: companyA.id,
        company: companyA.name,
        title: 'Full Stack Engineer (Company A)',
        description: 'Building modern web applications.',
        location: 'Bengaluru, India',
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        experienceLevel: 'MID',
        status: 'PUBLISHED',
      },
    });

    jobB = await db.job.create({
      data: {
        companyId: companyB.id,
        company: companyB.name,
        title: 'Security Analyst (Company B)',
        description: 'Monitoring security posture.',
        location: 'Mumbai, India',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        experienceLevel: 'MID',
        status: 'PUBLISHED',
      },
    });

    // Create applications:
    // Application 1: Candidate 1 applies to Job A with resume1_original
    app1_withResume = await ApplicationService.applyToJob(candidate1.id, jobA.id, {
      resumeId: resume1_original.id,
      coverNote: 'Excited about Company A!',
    });

    // Application 2: Candidate 2 applies to Job A with resume2 (missing file in storage)
    app2_missingFile = await ApplicationService.applyToJob(candidate2.id, jobA.id, {
      resumeId: resume2_missing_file.id,
      coverNote: 'Applying with un-uploaded resume file',
    });

    // Application 3: Directly create legacy application with no resume attached
    app3_noResume = await db.jobApplication.create({
      data: {
        candidateId: candidate3.id,
        jobId: jobA.id,
        status: 'APPLIED',
        coverNote: 'Legacy application with no resume',
      },
    });

    console.log('--- 2. Test Recruiter Authentication & Authorization ---');

    // 1. Unauthenticated request rejected with 401
    const unauthRes = await invokeResumeRoute(app1_withResume.id, undefined);
    assert(unauthRes.status === 401, 'Unauthenticated recruiter request returns 401');
    const unauthBody = await unauthRes.json();
    assert(
      unauthBody.success === false && unauthBody.error.includes('Authentication required'),
      'Unauthenticated request returns clear authentication error message'
    );

    // 2. Company-Tenant Isolation: Recruiter B (Beta Rival) cannot access application for Job A (Acme Corp)
    const crossTenantRes = await invokeResumeRoute(app1_withResume.id, tokenB);
    assert(crossTenantRes.status === 404, 'Recruiter from another company receives 404 (multi-tenant boundary)');
    const crossTenantBody = await crossTenantRes.json();
    assert(
      crossTenantBody.success === false && crossTenantBody.error.includes('not found or access denied'),
      'Cross-tenant request returns access denied without leaking data'
    );

    console.log('--- 3. Test Serving Correct Original Submitted Resume ---');

    // 3. Recruiter A accesses Application 1's submitted resume
    const app1Res = await invokeResumeRoute(app1_withResume.id, tokenA);
    assert(app1Res.status === 200, 'Authorized Recruiter A receives 200 for application resume');

    // Verify secure streaming response headers
    const contentType = app1Res.headers.get('content-type');
    const contentDisposition = app1Res.headers.get('content-disposition');
    const cacheControl = app1Res.headers.get('cache-control');

    assert(contentType === 'application/pdf', 'Response Content-Type header matches application/pdf');
    assert(
      contentDisposition?.includes('inline; filename="Alex_Johnson_Original_2025.pdf"') === true,
      `Response Content-Disposition contains sanitized original filename (${contentDisposition})`
    );
    assert(
      cacheControl === 'private, no-cache, no-store, must-revalidate',
      'Response Cache-Control enforces private, no-store immutability'
    );

    // Verify stream body content matches original PDF bytes
    const app1ArrayBuffer = await app1Res.arrayBuffer();
    const app1Buffer = Buffer.from(app1ArrayBuffer);
    assert(
      app1Buffer.equals(originalPdfBuffer),
      'Response body buffer strictly matches original submitted resume content'
    );

    // 4. Verify Audit Log entry was generated
    const auditLog = await db.auditLog.findFirst({
      where: {
        action: 'RECRUITER_RESUME_ACCESSED',
        resourceId: app1_withResume.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    assert(!!auditLog, 'Audit log entry created for RECRUITER_RESUME_ACCESSED');
    assert(auditLog?.actorId === recruiterUserA.id, 'Audit log records correct recruiter actor ID');
    assert(auditLog?.actorEmail === recruiterUserA.email, 'Audit log records correct recruiter actor email');
    if (auditLog?.details) {
      const parsedDetails = JSON.parse(auditLog.details);
      assert(parsedDetails.resumeFilename === 'Alex_Johnson_Original_2025.pdf', 'Audit log records exact submitted resume filename');
      assert(parsedDetails.companyId === companyA.id, 'Audit log records correct companyId');
    }

    console.log('--- 4. Test Historical Resume Immutability (Candidate updates profile resume) ---');

    // 5. Candidate 1 uploads a brand-new, newer resume to profile
    resume3_newer = await db.resume.create({
      data: {
        profileId: profile1.id,
        filename: 'Alex_Johnson_Updated_2026.pdf',
        fileType: 'application/pdf',
        fileSize: newerPdfBuffer.length,
        status: 'READY',
      },
    });
    await storage.upload(`resumes/${resume3_newer.id}/${resume3_newer.filename}`, newerPdfBuffer, 'application/pdf');

    // Recruiter A fetches Application 1's resume again
    const app1ResAfterProfileUpdate = await invokeResumeRoute(app1_withResume.id, tokenA);
    assert(app1ResAfterProfileUpdate.status === 200, 'Recruiter A still receives 200 after candidate profile resume update');

    const dispositionAfter = app1ResAfterProfileUpdate.headers.get('content-disposition');
    assert(
      dispositionAfter?.includes('Alex_Johnson_Original_2025.pdf') === true,
      'Content-Disposition STILL serves original submitted filename (not 2026 update)'
    );
    assert(
      !dispositionAfter?.includes('Alex_Johnson_Updated_2026.pdf'),
      'Content-Disposition does NOT serve candidate latest profile resume'
    );

    const bodyAfter = Buffer.from(await app1ResAfterProfileUpdate.arrayBuffer());
    assert(
      bodyAfter.equals(originalPdfBuffer),
      'Body buffer STILL strictly matches original 2025 resume content'
    );
    assert(
      !bodyAfter.equals(newerPdfBuffer),
      'Body buffer does NOT return candidate updated profile resume content'
    );

    console.log('--- 5. Test Missing File & No Profile / Synthetic Document Fallback ---');

    // 6. Application 2: Resume record exists in DB snapshot, but file is missing in storage
    // Under previous implementation, this fell through to synthesize a PDF or use candidate profile
    const app2Res = await invokeResumeRoute(app2_missingFile.id, tokenA);
    assert(app2Res.status === 404, 'Missing storage file returns 404 response');
    const app2Body = await app2Res.json();
    assert(
      app2Body.success === false && app2Body.error.includes('unavailable'),
      'Missing storage file returns clear unavailable error without serving fallback document'
    );

    // 7. Application 3: Legacy application with no resume attached
    const app3Res = await invokeResumeRoute(app3_noResume.id, tokenA);
    assert(app3Res.status === 404, 'Application with no resume returns 404 response');
    const app3Body = await app3Res.json();
    assert(
      app3Body.success === false && app3Body.error.includes('No resume submitted'),
      'Application with no resume returns clear "No resume submitted" error'
    );

    console.log('--- 6. Test Non-Existent Application ID ---');

    // 8. Non-existent application returns 404
    const notFoundRes = await invokeResumeRoute('640000000000000000000000', tokenA);
    assert(notFoundRes.status === 404, 'Non-existent application ID returns 404');

    console.log('\n--- Verification Completed Successfully ---');
  } catch (err: any) {
    console.error('Test execution error:', err);
    assert(false, `Test suite execution failed: ${err.message}`);
  } finally {
    console.log('\n--- Teardown: Clean up test fixtures ---');
    try {
      if (resume1_original) {
        await storage.delete(`resumes/${resume1_original.id}/${resume1_original.filename}`);
      }
      if (resume3_newer) {
        await storage.delete(`resumes/${resume3_newer.id}/${resume3_newer.filename}`);
      }
      if (app1_withResume) {
        await db.jobApplication.deleteMany({ where: { id: app1_withResume.id } });
      }
      if (app2_missingFile) {
        await db.jobApplication.deleteMany({ where: { id: app2_missingFile.id } });
      }
      if (app3_noResume) {
        await db.jobApplication.deleteMany({ where: { id: app3_noResume.id } });
      }
      if (resume1_original) {
        await db.resume.deleteMany({ where: { id: resume1_original.id } });
      }
      if (resume2_missing_file) {
        await db.resume.deleteMany({ where: { id: resume2_missing_file.id } });
      }
      if (resume3_newer) {
        await db.resume.deleteMany({ where: { id: resume3_newer.id } });
      }
      if (profile1) {
        await db.profile.deleteMany({ where: { id: profile1.id } });
      }
      if (profile2) {
        await db.profile.deleteMany({ where: { id: profile2.id } });
      }
      if (profile3) {
        await db.profile.deleteMany({ where: { id: profile3.id } });
      }
      if (jobA) {
        await db.job.deleteMany({ where: { id: jobA.id } });
      }
      if (jobB) {
        await db.job.deleteMany({ where: { id: jobB.id } });
      }
      if (recruiterProfileA) {
        await db.recruiterProfile.deleteMany({ where: { id: recruiterProfileA.id } });
      }
      if (recruiterProfileB) {
        await db.recruiterProfile.deleteMany({ where: { id: recruiterProfileB.id } });
      }
      if (companyA) {
        await db.companyMember.deleteMany({ where: { companyId: companyA.id } });
        await db.company.deleteMany({ where: { id: companyA.id } });
      }
      if (companyB) {
        await db.companyMember.deleteMany({ where: { companyId: companyB.id } });
        await db.company.deleteMany({ where: { id: companyB.id } });
      }
      if (recruiterUserA) {
        await db.user.deleteMany({ where: { id: recruiterUserA.id } });
      }
      if (recruiterUserB) {
        await db.user.deleteMany({ where: { id: recruiterUserB.id } });
      }
      if (candidate1) {
        await db.user.deleteMany({ where: { id: candidate1.id } });
      }
      if (candidate2) {
        await db.user.deleteMany({ where: { id: candidate2.id } });
      }
      if (candidate3) {
        await db.user.deleteMany({ where: { id: candidate3.id } });
      }
      console.log('✓ Teardown complete.');
    } catch (cleanupErr: any) {
      console.warn('Teardown cleanup error:', cleanupErr.message);
    }
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runRecruiterResumeImmutabilityTests();
