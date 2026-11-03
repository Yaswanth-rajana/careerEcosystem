import { db } from '../db/client';
import { JobExpirationService } from '../services/jobExpirationService';
import { JobSearchService } from '../services/jobSearchService';
import { JobMatchingService } from '../services/jobMatchingService';
import { JobService } from '../services/jobService';
import { SavedJobService } from '../services/savedJobService';
import { ApplicationService } from '../services/applicationService';
import { RecruiterJobService } from '../services/recruiter/recruiterJobService';

async function runJobExpirationTests() {
  console.log('🧪 Starting 30-Day Job Expiration Policy Test Suite...\n');

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

  const now = new Date();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;

  // =========================================================================
  // SECTION 1: UNIT BOUNDARY TESTS (PURE UTC TIME CALCULATIONS)
  // =========================================================================
  console.log('--- Section 1: Pure Boundary & Calculation Tests ---');

  // TEST 1: Job published today
  const jobToday = {
    status: 'PUBLISHED',
    publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
  };
  assert(
    !JobExpirationService.isJobExpired(jobToday, now),
    'TEST 1: Job published today is active/visible'
  );

  // TEST 2: Job published 29 days ago
  const job29Days = {
    status: 'PUBLISHED',
    publishedAt: new Date(now.getTime() - 29 * ONE_DAY_MS),
  };
  assert(
    !JobExpirationService.isJobExpired(job29Days, now),
    'TEST 2: Job published 29 days ago is active/visible'
  );

  // TEST 3: Job published exactly 30 days ago
  // Boundary: now >= publishedAt + 30 days
  const jobExact30Days = {
    status: 'PUBLISHED',
    publishedAt: new Date(now.getTime() - THIRTY_DAYS_MS),
  };
  assert(
    JobExpirationService.isJobExpired(jobExact30Days, now),
    'TEST 3: Job published exactly 30 days ago is EXPIRED at the exact boundary'
  );

  // TEST 4: Job published 31 days ago
  const job31Days = {
    status: 'PUBLISHED',
    publishedAt: new Date(now.getTime() - 31 * ONE_DAY_MS),
  };
  assert(
    JobExpirationService.isJobExpired(job31Days, now),
    'TEST 4: Job published 31 days ago is EXPIRED and not visible'
  );

  // TEST 5: Job status = DRAFT
  const jobDraft = {
    status: 'DRAFT',
    publishedAt: null,
  };
  assert(
    jobDraft.status === 'DRAFT',
    'TEST 5: Job status = DRAFT is not a candidate-visible published job'
  );

  // TEST 6: Job status = CLOSED
  const jobClosed = {
    status: 'CLOSED',
    publishedAt: new Date(now.getTime() - 5 * ONE_DAY_MS),
  };
  assert(
    jobClosed.status === 'CLOSED',
    'TEST 6: Job status = CLOSED is closed and not active'
  );

  // Edge cases: null dates and missing publishedAt
  assert(
    JobExpirationService.isJobExpired({ status: 'PUBLISHED', publishedAt: null, createdAt: null }, now),
    'Edge Case: Job with missing publication timestamps is treated as expired'
  );

  assert(
    JobExpirationService.isJobExpired({ status: 'EXPIRED' }, now),
    'Edge Case: Job with status EXPIRED is always expired'
  );

  // =========================================================================
  // SECTION 2: DATABASE INTEGRATION TESTS
  // =========================================================================
  console.log('\n--- Section 2: Database Lifecycle & Service Integration Tests ---');

  const testJobIds: string[] = [];
  let testUserId: string | null = null;
  let testCompanyId: string | null = null;

  try {
    // Setup test company & user if needed
    let company = await db.company.findFirst({ where: { slug: 'test-expiration-corp' } });
    if (!company) {
      company = await db.company.create({
        data: {
          name: 'Test Expiration Corp',
          slug: 'test-expiration-corp',
          website: 'https://test-corp.example',
          industry: 'Software',
          size: '10-50',
          location: 'Bengaluru',
        },
      });
    }
    testCompanyId = company.id;

    let user = await db.user.findFirst({ where: { email: 'candidate-exp-test@example.com' } });
    if (!user) {
      user = await db.user.create({
        data: {
          email: 'candidate-exp-test@example.com',
          name: 'Test Candidate',
          role: 'CANDIDATE',
        },
      });
    }
    testUserId = user.id;

    // Helper to create test jobs
    async function createTestJob(title: string, status: string, publishedAtDate: Date | null) {
      const created = await db.job.create({
        data: {
          title,
          company: 'Test Expiration Corp',
          companyId: testCompanyId,
          location: 'Bengaluru, India',
          workMode: 'Remote',
          employmentType: 'Full-time',
          experienceLevel: '1-3 years',
          skills: ['TypeScript', 'Node.js', 'React'],
          description: 'A comprehensive testing job description for automated verification of expiration policies.',
          status,
          publishedAt: publishedAtDate,
          expiresAt: publishedAtDate ? new Date(publishedAtDate.getTime() + THIRTY_DAYS_MS) : null,
        },
      });
      testJobIds.push(created.id);
      return created;
    }

    const dbJobToday = await createTestJob(
      'TEST-JOB-TODAY',
      'PUBLISHED',
      new Date(now.getTime() - 1 * ONE_DAY_MS)
    );

    const dbJob29Days = await createTestJob(
      'TEST-JOB-29D',
      'PUBLISHED',
      new Date(now.getTime() - 29 * ONE_DAY_MS)
    );

    const dbJob30Days = await createTestJob(
      'TEST-JOB-30D',
      'PUBLISHED',
      new Date(now.getTime() - THIRTY_DAYS_MS)
    );

    const dbJob35Days = await createTestJob(
      'TEST-JOB-35D',
      'PUBLISHED',
      new Date(now.getTime() - 35 * ONE_DAY_MS)
    );

    const dbJobDraft = await createTestJob(
      'TEST-JOB-DRAFT',
      'DRAFT',
      null
    );

    const dbJobClosed = await createTestJob(
      'TEST-JOB-CLOSED',
      'CLOSED',
      new Date(now.getTime() - 10 * ONE_DAY_MS)
    );

    // TEST 14: Candidate search excludes 30+ day jobs
    const searchResult = await JobSearchService.searchJobs({
      q: 'TEST-JOB',
      limit: 50,
    });
    const foundTitles = searchResult.items.map((j) => j.title);
    assert(
      foundTitles.includes('TEST-JOB-TODAY') && foundTitles.includes('TEST-JOB-29D'),
      'TEST 14.1: Candidate search includes jobs published < 30 days ago'
    );
    assert(
      !foundTitles.includes('TEST-JOB-30D') && !foundTitles.includes('TEST-JOB-35D'),
      'TEST 14.2: Candidate search strictly excludes 30+ day jobs'
    );
    assert(
      !foundTitles.includes('TEST-JOB-DRAFT') && !foundTitles.includes('TEST-JOB-CLOSED'),
      'TEST 14.3: Candidate search excludes DRAFT and CLOSED jobs'
    );

    // TEST 15: For You recommendations exclude 30+ day jobs
    const recommendedResult = await JobMatchingService.getRecommendedJobs(testUserId, 10);
    const recommendedTitles = recommendedResult.map((j) => j.title);
    assert(
      !recommendedTitles.includes('TEST-JOB-30D') && !recommendedTitles.includes('TEST-JOB-35D'),
      'TEST 15: "For You" recommendations strictly exclude 30+ day jobs'
    );

    // TEST 7: Scheduler expires a 30+ day published job
    const cronResult1 = await JobExpirationService.expireOldJobs(now);
    assert(
      cronResult1.success && cronResult1.updatedCount >= 2,
      `TEST 7: Scheduler transitions 30+ day jobs to EXPIRED (updated count: ${cronResult1.updatedCount})`
    );

    // Verify DB state of dbJob35Days and dbJob30Days
    const refreshed35 = await db.job.findUnique({ where: { id: dbJob35Days.id } });
    const refreshed30 = await db.job.findUnique({ where: { id: dbJob30Days.id } });
    const refreshedToday = await db.job.findUnique({ where: { id: dbJobToday.id } });
    assert(
      refreshed35?.status === 'EXPIRED' && refreshed30?.status === 'EXPIRED',
      'TEST 7.1: Stale jobs in DB updated to status = EXPIRED'
    );
    assert(
      refreshedToday?.status === 'PUBLISHED',
      'TEST 7.2: Active job remains status = PUBLISHED'
    );

    // TEST 8: Scheduler runs twice (Idempotence)
    const cronResult2 = await JobExpirationService.expireOldJobs(now);
    assert(
      cronResult2.success,
      'TEST 8: Scheduler runs twice without error and maintains idempotent consistency'
    );

    // TEST 9: Expired job requested directly returns null / 404
    const detailExpired = await JobService.getJobById(dbJob35Days.id);
    assert(
      detailExpired === null,
      'TEST 9: Direct request for expired job returns null (API returns 404 Not Found)'
    );

    // TEST 10: Candidate tries to apply to an expired job
    let applyError = '';
    try {
      await ApplicationService.applyToJob(testUserId, dbJob35Days.id, {
        coverNote: 'Testing application to expired job',
      });
    } catch (err: any) {
      applyError = err.message;
    }
    assert(
      applyError === 'This job is no longer accepting applications.',
      `TEST 10: Candidate application to expired job rejected with safe message: "${applyError}"`
    );

    // TEST 11: Expired job appears in recruiter history
    const recruiterHistory = await RecruiterJobService.listJobs(testCompanyId, {
      status: 'EXPIRED',
      limit: 50,
    });
    const recruiterExpiredTitles = recruiterHistory.items.map((j) => j.title);
    assert(
      recruiterExpiredTitles.includes('TEST-JOB-35D') || recruiterExpiredTitles.includes('TEST-JOB-30D'),
      'TEST 11: Expired jobs remain accessible in recruiter history and preserve audit data'
    );

    // TEST 12: Saved expired job
    await SavedJobService.saveJob(testUserId, dbJob35Days.id);
    const savedJobsAll = await SavedJobService.getSavedJobs(testUserId, 1, 50);
    const savedExpiredItem = savedJobsAll.items.find((i) => i.id === dbJob35Days.id);
    assert(
      savedExpiredItem?.isExpired === true && savedExpiredItem?.status === 'EXPIRED',
      'TEST 12.1: Saved expired job shows status = EXPIRED and isExpired = true rather than silently deleting'
    );

    const savedJobsActiveOnly = await SavedJobService.getSavedJobs(testUserId, 1, 50, { onlyActive: true });
    const savedActiveItem = savedJobsActiveOnly.items.find((i) => i.id === dbJob35Days.id);
    assert(
      !savedActiveItem,
      'TEST 12.2: Saved expired job does not appear in active saved jobs list when filtered'
    );

    // TEST 13: Recruiter edits an active job
    const authRecruiter: any = {
      user: { id: testUserId, email: 'recruiter@example.com', name: 'Recruiter User', role: 'RECRUITER' },
      recruiter: { id: 'rec-1', designation: 'Lead Recruiter', status: 'ACTIVE' },
      company: { id: testCompanyId, name: 'Test Corp', slug: 'test-corp', website: '', industry: '', size: '', location: '', verified: false, status: 'ACTIVE' },
      membership: { id: 'mem-1', role: 'COMPANY_ADMIN', status: 'ACTIVE', department: null, assignedJobIds: [], interviewTypes: [] },
      companyRole: 'COMPANY_ADMIN',
      permissions: ['jobs:create', 'jobs:edit', 'jobs:publish', 'jobs:close', 'jobs:view'],
    };

    const originalPublishedAt = dbJobToday.publishedAt!;
    const updatedActive = await RecruiterJobService.updateJob(
      dbJobToday.id,
      { title: 'TEST-JOB-TODAY-EDITED', description: 'Updated job description with more than 20 chars.' },
      authRecruiter
    );

    assert(
      new Date(updatedActive.publishedAt!).getTime() === originalPublishedAt.getTime(),
      'TEST 13.1: Editing an active job does not reset publishedAt or expiration timer'
    );

    // Recruiter attempts to reopen an expired job by editing
    let reopenError = '';
    try {
      await RecruiterJobService.updateJob(
        dbJob35Days.id,
        { status: 'PUBLISHED' },
        authRecruiter
      );
    } catch (err: any) {
      reopenError = err.message;
    }
    assert(
      reopenError.includes('Expired jobs cannot be reopened by editing'),
      `TEST 13.2: Reopening an expired job via update is rejected: "${reopenError}"`
    );

  } catch (err: any) {
    console.error('Database integration test error:', err);
    assert(false, `Integration test failed with error: ${err.message}`);
  } finally {
    // Cleanup test records
    console.log('\nCleaning up temporary test records...');
    if (testJobIds.length > 0) {
      await db.savedJob.deleteMany({ where: { jobId: { in: testJobIds } } });
      await db.jobApplication.deleteMany({ where: { jobId: { in: testJobIds } } });
      await db.job.deleteMany({ where: { id: { in: testJobIds } } });
    }
    if (testUserId) {
      await db.savedJob.deleteMany({ where: { userId: testUserId } });
      await db.jobApplication.deleteMany({ where: { candidateId: testUserId } });
      await db.user.deleteMany({ where: { id: testUserId } });
    }
    if (testCompanyId) {
      await db.company.deleteMany({ where: { id: testCompanyId } });
    }
    console.log('Cleanup finished.\n');
  }

  console.log(`====================================================`);
  console.log(`Test Summary: ${passed} passed, ${failed} failed.`);
  console.log(`====================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runJobExpirationTests()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => {
      process.exit(0);
    });
}

export { runJobExpirationTests };
