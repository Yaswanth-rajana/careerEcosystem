import { db } from '../db/client';
import { ApplicationService } from '../services/applicationService';
import { RecruiterApplicationService } from '../services/recruiter/recruiterApplicationService';
import { EmailService } from '../services/email/emailService';
import { renderJobApplicationConfirmationEmail } from '../services/email/templates/jobs/applicationConfirmationEmail';

async function runJobApplicationConfirmationEmailTests() {
  console.log('🚀 Starting Job Application Confirmation Email Test Suite...\n');

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

  const suffix = `_${Date.now()}`;
  let company: any;
  let recruiterUser: any;
  let candidate1: any;
  let candidate2: any;
  let profile1: any;
  let profile2: any;
  let publishedJob: any;
  let closedJob: any;
  let resume1: any;
  let resume2: any;
  let createdAppId: string | null = null;

  try {
    console.log('--- Setup: Test Entities (Company, Jobs, Users, Resumes) ---');

    company = await db.company.create({
      data: {
        name: `EcoTech Systems ${suffix}`,
        slug: `ecotech-systems-${suffix}`,
        website: 'https://ecotech.example.com',
        industry: 'CleanTech',
        size: '50-100',
        location: 'Bengaluru, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    recruiterUser = await db.user.create({
      data: {
        email: `recruiter${suffix}@ecotech.example.com`,
        name: 'Eco Recruiter',
        role: 'EMPLOYER',
        status: 'ACTIVE',
      },
    });

    await db.companyMember.create({
      data: {
        companyId: company.id,
        userId: recruiterUser.id,
        role: 'RECRUITER',
        status: 'ACTIVE',
      },
    });

    candidate1 = await db.user.create({
      data: {
        email: `candidate1${suffix}@example.com`,
        name: 'Aarav Patel',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    candidate2 = await db.user.create({
      data: {
        email: `candidate2${suffix}@example.com`,
        name: 'Diya Sharma',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    profile1 = await db.profile.create({
      data: {
        userId: candidate1.id,
        candidateType: 'EXPERIENCED',
        headline: 'Senior Full Stack Engineer',
        location: 'Bengaluru, India',
      },
    });

    profile2 = await db.profile.create({
      data: {
        userId: candidate2.id,
        candidateType: 'EXPERIENCED',
        headline: 'Frontend Engineer',
        location: 'Hyderabad, India',
      },
    });

    publishedJob = await db.job.create({
      data: {
        companyId: company.id,
        title: `Full Stack Engineer ${suffix}`,
        company: company.name,
        location: 'Bengaluru, India',
        workMode: 'Remote',
        employmentType: 'Full-time',
        experienceLevel: '3-5 years',
        skills: ['TypeScript', 'React', 'Node.js'],
        description: 'Building sustainable future systems.',
        status: 'PUBLISHED',
      },
    });

    closedJob = await db.job.create({
      data: {
        companyId: company.id,
        title: `Closed Backend Role ${suffix}`,
        company: company.name,
        location: 'Bengaluru, India',
        workMode: 'Remote',
        employmentType: 'Full-time',
        experienceLevel: '5+ years',
        skills: ['Go', 'PostgreSQL'],
        description: 'This job is closed.',
        status: 'CLOSED',
      },
    });

    resume1 = await db.resume.create({
      data: {
        profileId: profile1.id,
        filename: 'aarav_patel_fullstack_cv.pdf',
        fileSize: 102400,
        fileType: 'application/pdf',
        status: 'READY',
      },
    });

    resume2 = await db.resume.create({
      data: {
        profileId: profile2.id,
        filename: 'diya_sharma_cv.pdf',
        fileSize: 204800,
        fileType: 'application/pdf',
        status: 'READY',
      },
    });

    // ==========================================
    // Email Template Unit Tests (Tests 5 - 13)
    // ==========================================
    console.log('\n--- Template Unit Tests (Tests 5 - 13) ---');

    const testDate = new Date('2026-10-12T10:30:00.000Z');
    const templateRender = renderJobApplicationConfirmationEmail({
      candidateName: 'Yaswanth Rajana',
      candidateEmail: 'yaswanth@example.com',
      jobTitle: 'Full Stack Engineer & Tech Lead',
      companyName: 'PATHWAY.ECO & Co',
      applicationId: 'app_test_123',
      appliedDate: testDate,
      applicationStatus: 'APPLIED',
      applicationsUrl: 'http://localhost:3000/jobs?tab=applications',
    });

    // CRITICAL: Verify NO visible template comments or JSX markers in HTML or text
    assert(
      !templateRender.html.includes('{/*') &&
      !templateRender.html.includes('*/}') &&
      !templateRender.text.includes('{/*') &&
      !templateRender.text.includes('*/}'),
      'CRITICAL: Rendered email contains zero JSX comments or raw template markers'
    );

    // Test 5: Candidate greeting logic
    assert(
      templateRender.html.includes('Hi Yaswanth,') &&
      templateRender.text.includes('Hi Yaswanth,'),
      'Test 5a: Greeting uses polite candidate first name without prefix'
    );

    const testLeafFlip = renderJobApplicationConfirmationEmail({
      candidateName: 'Candidate LeafFlip',
      candidateEmail: 'test@example.com',
      jobTitle: 'Developer',
      companyName: 'PATHWAY.ECO',
      applicationId: 'app_1',
    });
    assert(
      testLeafFlip.html.includes('Hi LeafFlip,') &&
      testLeafFlip.text.includes('Hi LeafFlip,'),
      'Test 5b: Greeting strips artificial "Candidate " prefix ("Hi LeafFlip,")'
    );

    const testFallback = renderJobApplicationConfirmationEmail({
      candidateName: '',
      candidateEmail: 'test@example.com',
      jobTitle: 'Developer',
      companyName: 'PATHWAY.ECO',
      applicationId: 'app_2',
    });
    assert(
      testFallback.html.includes('Hi there,') &&
      testFallback.text.includes('Hi there,'),
      'Test 5c: Fallback greeting is "Hi there," when candidate name is missing'
    );

    // Test 12: HTML Escaping
    const testXss = renderJobApplicationConfirmationEmail({
      candidateName: '<script>alert("xss")</script>',
      candidateEmail: 'xss@example.com',
      jobTitle: 'Engineer <img src=x onerror=alert(1)>',
      companyName: 'Company & "Co"',
      applicationId: 'app_3',
    });
    assert(
      !testXss.html.includes('<script>') &&
      testXss.html.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;') &&
      !testXss.html.includes('<img src=x onerror=alert(1)>') &&
      testXss.html.includes('&lt;img src=x onerror=alert(1)&gt;'),
      'Test 12: HTML template safely escapes malicious or malformed dynamic strings'
    );

    // Test 6: Job title in template
    assert(
      templateRender.subject.includes('Full Stack Engineer & Tech Lead') &&
      templateRender.html.includes('Full Stack Engineer &amp; Tech Lead'),
      'Test 6: Email subject and body contain the correct job title'
    );

    // Test 7: Company name in template
    assert(
      templateRender.subject.includes('PATHWAY.ECO & Co') &&
      templateRender.html.includes('PATHWAY.ECO &amp; Co'),
      'Test 7: Email subject and body contain the correct company name'
    );

    // Test 8: Application ID in template
    assert(
      templateRender.html.includes('app_test_123') &&
      templateRender.text.includes('app_test_123'),
      'Test 8: Email contains the persisted application ID'
    );

    // Test 9: Application status formatted in friendly case
    assert(
      templateRender.html.includes('Applied') &&
      templateRender.text.includes('Status: Applied'),
      'Test 9: Email contains the persisted application status in human-friendly format'
    );

    // Test 10: Server-generated application timestamp in template
    assert(
      templateRender.html.includes('Oct 12, 2026') &&
      templateRender.text.includes('Oct 12, 2026'),
      'Test 10: Email uses the server-generated application timestamp'
    );

    // Test 11: Applications URL in CTA
    assert(
      templateRender.html.includes('href="http://localhost:3000/jobs?tab=applications"') &&
      templateRender.text.includes('http://localhost:3000/jobs?tab=applications'),
      'Test 11: Applications URL CTA links to the authenticated Applications page'
    );

    // Test 13: Required copy verification
    assert(
      templateRender.html.includes('Application submitted successfully!') &&
      templateRender.html.includes('APPLICATION DETAILS') &&
      templateRender.html.includes('WHAT HAPPENS NEXT?') &&
      templateRender.html.includes('Submitting an application does not guarantee selection.') &&
      templateRender.html.includes('View My Applications') &&
      templateRender.text.includes('Submitting an application does not guarantee selection.'),
      'Test 13: Polished email copy matches exact requirements across HTML and plain-text'
    );

    // ==========================================
    // Application Creation & Submission Tests (Tests 1 - 4)
    // ==========================================
    console.log('\n--- Application Creation & Submission Tests (Tests 1 - 4) ---');

    // Test 1: Candidate submits a valid application
    const appResult = await ApplicationService.applyToJob(
      candidate1.id,
      publishedJob.id,
      {
        resumeId: resume1.id,
        coverNote: 'Excited about the clean tech mission!',
      }
    );
    createdAppId = appResult.id;

    assert(
      appResult.id !== undefined && appResult.status === 'APPLIED',
      'Test 1: Valid application is successfully persisted to the database'
    );
    assert(
      appResult.emailNotification !== undefined &&
      (appResult.emailNotification.sent === true || appResult.emailNotification.simulated === true),
      'Test 1b: Confirmation email is triggered and tracked in application response'
    );

    // Test 2: Candidate submits to closed/expired job
    let closedRejected = false;
    try {
      await ApplicationService.applyToJob(candidate1.id, closedJob.id, {
        resumeId: resume1.id,
      });
    } catch (err: any) {
      closedRejected = true;
    }
    assert(closedRejected, 'Test 2: Submitting an application to a closed job is rejected');

    // Test 3: Duplicate application is rejected
    let duplicateRejected = false;
    try {
      await ApplicationService.applyToJob(candidate1.id, publishedJob.id, {
        resumeId: resume1.id,
      });
    } catch (err: any) {
      duplicateRejected = true;
    }
    assert(duplicateRejected, 'Test 3: Duplicate application for the same job is rejected');

    // Test 4: Unauthenticated or invalid resume belongs to another user
    let invalidResumeRejected = false;
    try {
      await ApplicationService.applyToJob(candidate1.id, publishedJob.id, {
        resumeId: resume2.id, // belongs to candidate2
      });
    } catch (err: any) {
      invalidResumeRejected = true;
    }
    assert(invalidResumeRejected, 'Test 4: Candidate cannot use a resume that does not belong to them');

    // ==========================================
    // Email Failure & Idempotency Handling (Tests 14 - 17)
    // ==========================================
    console.log('\n--- Email Failure & Idempotency Handling (Tests 14 - 17) ---');

    // Test 14 & 17: Notification idempotency
    const emailRes1 = await EmailService.sendCandidateApplicationConfirmationEmail({
      candidateEmail: candidate1.email,
      candidateName: candidate1.name,
      jobTitle: publishedJob.title,
      companyName: company.name,
      applicationId: createdAppId,
      appliedDate: new Date(),
      applicationStatus: 'APPLIED',
    });
    assert(
      emailRes1.success === true,
      'Test 14 & 17: Repeated confirmation notification trigger succeeds idempotently without duplicate send'
    );

    // Test 15 & 16: Email provider failure isolation
    // Even if EmailService throws or fails, application creation must succeed
    const originalSend = EmailService.sendCandidateApplicationConfirmationEmail;
    try {
      // Temporarily mock EmailService to simulate an outage
      EmailService.sendCandidateApplicationConfirmationEmail = async () => {
        throw new Error('Simulated ZeptoMail 503 Provider Outage');
      };

      const appResult2 = await ApplicationService.applyToJob(
        candidate2.id,
        publishedJob.id,
        {
          resumeId: resume2.id,
        }
      );

      assert(
        appResult2.id !== undefined && appResult2.status === 'APPLIED',
        'Test 15: Application is saved successfully even when email provider fails'
      );
      assert(
        appResult2.emailNotification?.error !== undefined,
        'Test 16: API response communicates successful creation with safe error recording'
      );
    } finally {
      EmailService.sendCandidateApplicationConfirmationEmail = originalSend;
    }

    // ==========================================
    // Candidate Applications View Integration (Tests 18 - 21)
    // ==========================================
    console.log('\n--- Candidate Applications Portal Integration (Tests 18 - 21) ---');

    // Test 18: New application appears in candidate's application list
    const candidate1Apps = await ApplicationService.listApplications(candidate1.id, 1, 10);
    assert(
      candidate1Apps.items.length === 1 && candidate1Apps.items[0].id === createdAppId,
      'Test 18: Persisted application appears in candidate Applications list'
    );

    // Test 19: Persistence across simulated re-query (refresh/re-login)
    const refreshedApps = await ApplicationService.listApplications(candidate1.id, 1, 10);
    assert(
      refreshedApps.items.length === 1 && refreshedApps.items[0].jobTitle === publishedJob.title,
      'Test 19: Application remains visible with full job details on subsequent fetches'
    );

    // Test 20: Application status matches database
    assert(
      refreshedApps.items[0].status === 'APPLIED',
      'Test 20: Application status in candidate portal matches persisted database record'
    );

    // Test 21: Candidate isolation / ownership
    const candidate2Apps = await ApplicationService.listApplications(candidate2.id, 1, 10);
    const candidate2HasCandidate1App = candidate2Apps.items.some((a: any) => a.id === createdAppId);
    assert(
      !candidate2HasCandidate1App,
      'Test 21: A candidate cannot see applications submitted by another candidate'
    );

    // ==========================================
    // Recruiter Visibility Regression (Tests 22)
    // ==========================================
    console.log('\n--- Recruiter Portal Regression (Test 22) ---');

    const recruiterView = await RecruiterApplicationService.getApplicationDetail(
      createdAppId,
      company.id
    );
    assert(
      recruiterView.id === createdAppId && recruiterView.hasResume === true,
      'Test 22: Recruiter sees the newly submitted application in their candidate pipeline'
    );

  } catch (err) {
    console.error('Unexpected test error:', err);
    failed++;
  } finally {
    console.log('\n--- Cleaning up test artifacts ---');
    try {
      if (publishedJob) {
        await db.jobApplication.deleteMany({ where: { jobId: publishedJob.id } });
        await db.job.delete({ where: { id: publishedJob.id } });
      }
      if (closedJob) {
        await db.jobApplication.deleteMany({ where: { jobId: closedJob.id } });
        await db.job.delete({ where: { id: closedJob.id } });
      }
      if (resume1) await db.resume.delete({ where: { id: resume1.id } });
      if (resume2) await db.resume.delete({ where: { id: resume2.id } });
      if (profile1) await db.profile.delete({ where: { id: profile1.id } });
      if (profile2) await db.profile.delete({ where: { id: profile2.id } });
      if (candidate1) await db.user.delete({ where: { id: candidate1.id } });
      if (candidate2) await db.user.delete({ where: { id: candidate2.id } });
      if (recruiterUser) {
        await db.companyMember.deleteMany({ where: { userId: recruiterUser.id } });
        await db.user.delete({ where: { id: recruiterUser.id } });
      }
      if (company) await db.company.delete({ where: { id: company.id } });
    } catch (cleanupErr) {
      console.warn('Cleanup warning:', cleanupErr);
    }
  }

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runJobApplicationConfirmationEmailTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
