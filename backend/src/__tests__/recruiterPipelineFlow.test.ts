import { db } from '../db/client';
import { RecruiterJobService } from '../services/recruiter/recruiterJobService';
import { RecruiterApplicationService } from '../services/recruiter/recruiterApplicationService';
import { RecruiterCandidateService } from '../services/recruiter/recruiterCandidateService';
import { JobSearchService } from '../services/jobSearchService';
import { JobService } from '../services/jobService';
import { ApplicationService } from '../services/applicationService';
import { AuthenticatedRecruiter } from '../types/recruiter';
import { ROLE_PERMISSIONS } from '../services/recruiter/recruiterRbacService';

async function runRecruiterPipelineFlowTests() {
  console.log('🚀 Starting PATHWAY.ECO Recruiter → Job → Candidate → Application → Pipeline Test Suite...\n');

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

  const testSuffix = `_${Date.now()}`;
  let recruiterUserA: any;
  let recruiterUserB: any;
  let candidateUser: any;
  let companyA: any;
  let companyB: any;
  let authRecruiterA: AuthenticatedRecruiter;
  let authRecruiterB: AuthenticatedRecruiter;

  try {
    // -------------------------------------------------------------------------
    // SETUP: Test Companies & Users
    // -------------------------------------------------------------------------
    console.log('--- Setup: Test Entities ---');
    companyA = await db.company.create({
      data: {
        name: `Acme Corp ${testSuffix}`,
        slug: `acme-corp-${testSuffix}`,
        website: 'https://acme.example.com',
        industry: 'Software',
        size: '10-50',
        location: 'Bengaluru, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    companyB = await db.company.create({
      data: {
        name: `Rival Corp ${testSuffix}`,
        slug: `rival-corp-${testSuffix}`,
        website: 'https://rival.example.com',
        industry: 'Software',
        size: '50-100',
        location: 'Mumbai, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    recruiterUserA = await db.user.create({
      data: {
        email: `recruiter_a${testSuffix}@example.com`,
        name: 'Alice Recruiter',
        role: 'EMPLOYER',
        status: 'ACTIVE',
      },
    });

    recruiterUserB = await db.user.create({
      data: {
        email: `recruiter_b${testSuffix}@example.com`,
        name: 'Bob Recruiter',
        role: 'EMPLOYER',
        status: 'ACTIVE',
      },
    });

    candidateUser = await db.user.create({
      data: {
        email: `candidate${testSuffix}@example.com`,
        name: 'Charlie Candidate',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
        profile: {
          create: {
            headline: 'Senior Full Stack Engineer',
            location: 'Bengaluru, India',
            candidateType: 'Experienced Professional',
            totalExperience: '4 years',
          },
        },
      },
      include: { profile: true },
    });

    authRecruiterA = {
      user: {
        id: recruiterUserA.id,
        email: recruiterUserA.email,
        name: recruiterUserA.name,
        role: 'EMPLOYER',
      },
      recruiter: {
        id: 'rec_a',
        designation: 'Lead Talent Partner',
        status: 'ACTIVE',
      },
      company: {
        id: companyA.id,
        name: companyA.name,
        slug: companyA.slug,
        website: companyA.website,
        industry: companyA.industry,
        size: companyA.size,
        location: companyA.location,
        verified: true,
        status: 'ACTIVE',
      },
      membership: {
        id: 'mem_a',
        role: 'COMPANY_ADMIN',
        status: 'ACTIVE',
        department: null,
        assignedJobIds: [],
        interviewTypes: [],
      },
      companyRole: 'COMPANY_ADMIN',
      permissions: ROLE_PERMISSIONS['COMPANY_ADMIN'],
    };

    authRecruiterB = {
      user: {
        id: recruiterUserB.id,
        email: recruiterUserB.email,
        name: recruiterUserB.name,
        role: 'EMPLOYER',
      },
      recruiter: {
        id: 'rec_b',
        designation: 'Recruiter',
        status: 'ACTIVE',
      },
      company: {
        id: companyB.id,
        name: companyB.name,
        slug: companyB.slug,
        website: companyB.website,
        industry: companyB.industry,
        size: companyB.size,
        location: companyB.location,
        verified: true,
        status: 'ACTIVE',
      },
      membership: {
        id: 'mem_b',
        role: 'COMPANY_ADMIN',
        status: 'ACTIVE',
        department: null,
        assignedJobIds: [],
        interviewTypes: [],
      },
      companyRole: 'COMPANY_ADMIN',
      permissions: ROLE_PERMISSIONS['COMPANY_ADMIN'],
    };

    console.log('✓ Test entities created successfully.\n');

    // -------------------------------------------------------------------------
    // FLOW 1: Recruiter creates draft
    // -------------------------------------------------------------------------
    console.log('--- FLOW 1: Recruiter creates draft ---');
    const draftJob = await RecruiterJobService.createJob(
      {
        title: `Full Stack Engineer ${testSuffix}`,
        location: 'Bengaluru, India',
        workMode: 'Remote',
        employmentType: 'Full-time',
        experienceLevel: '3-5 years',
        skills: ['TypeScript', 'React', 'Node.js'],
        salaryMin: 1200000,
        salaryMax: 1800000,
        salaryCurrency: 'INR',
        salaryPeriod: 'YEAR',
        description:
          'Join our core platform engineering team to build scalable full-stack features with high reliability and clean architecture.',
        responsibilities: ['Build APIs', 'Write tests'],
        requirements: ['3+ years experience'],
        niceToHave: ['Docker', 'AWS'],
        benefits: ['Health insurance', 'Remote allowance'],
        status: 'DRAFT',
      },
      authRecruiterA
    );

    assert(draftJob.status === 'DRAFT', 'FLOW 1: Job created in DRAFT status');
    assert(draftJob.publishedAt === null, 'FLOW 1: publishedAt is null for draft');

    const draftList = await RecruiterJobService.listJobs(companyA.id, { status: 'DRAFT' });
    assert(
      draftList.items.some((j) => j.id === draftJob.id),
      'FLOW 1: Draft job appears under recruiter Draft tab'
    );

    // -------------------------------------------------------------------------
    // FLOW 2: Recruiter publishes job
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 2: Recruiter publishes job ---');
    const publishedJob = await RecruiterJobService.updateJob(
      draftJob.id,
      { status: 'PUBLISHED' },
      authRecruiterA
    );

    assert(publishedJob.status === 'PUBLISHED', 'FLOW 2: Job status is PUBLISHED');
    assert(Boolean(publishedJob.publishedAt), 'FLOW 2: publishedAt is set by backend UTC timestamp');
    assert(Boolean(publishedJob.expiresAt), 'FLOW 2: expiresAt is calculated (30 days window)');

    // -------------------------------------------------------------------------
    // FLOW 3: Published job appears in Candidate Jobs
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 3: Candidate discovers job ---');
    const candidateSearch = await JobSearchService.searchJobs({
      q: `Full Stack Engineer ${testSuffix}`,
    });
    assert(
      candidateSearch.items.some((j) => j.id === publishedJob.id),
      'FLOW 3: Published job appears in candidate search results'
    );

    // -------------------------------------------------------------------------
    // FLOW 4: Candidate views Job Detail
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 4: Candidate views job detail ---');
    const jobDetail = await JobService.getJobById(publishedJob.id, candidateUser.id);
    assert(jobDetail !== null, 'FLOW 4: Full job detail retrieved successfully');
    assert(jobDetail?.hasApplied === false, 'FLOW 4: hasApplied is false before applying');
    assert(jobDetail?.company === companyA.name, 'FLOW 4: Company matches recruiter company');

    // -------------------------------------------------------------------------
    // FLOW 5: Candidate applies
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 5: Candidate applies ---');
    const application = await ApplicationService.applyToJob(candidateUser.id, publishedJob.id, {
      coverNote: 'Excited about this role and company mission!',
      resumeUrl: 'https://cdn.example.com/resumes/charlie.pdf',
    });

    assert(application.status === 'APPLIED', 'FLOW 5: Application created in APPLIED status');
    assert(application.jobId === publishedJob.id, 'FLOW 5: Application belongs to published job');

    // -------------------------------------------------------------------------
    // FLOW 6: Duplicate application prevention
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 6: Duplicate application prevention ---');
    let duplicatePrevented = false;
    try {
      await ApplicationService.applyToJob(candidateUser.id, publishedJob.id);
    } catch (err: any) {
      duplicatePrevented = err.message.includes('already submitted an application');
    }
    assert(duplicatePrevented, 'FLOW 6: Second apply attempt blocked with duplicate error');

    // -------------------------------------------------------------------------
    // FLOW 7: Candidate views Applications
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 7: Candidate views applications ---');
    const candidateApps = await ApplicationService.listApplications(candidateUser.id);
    assert(
      candidateApps.items.some((a) => a.id === application.id && a.status === 'APPLIED'),
      'FLOW 7: Application visible under candidate Applications'
    );

    // -------------------------------------------------------------------------
    // FLOW 8: Recruiter views Applications
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 8: Recruiter views applications ---');
    const recruiterApps = await RecruiterApplicationService.listApplications(companyA.id);
    assert(
      recruiterApps.items.some((a) => a.id === application.id),
      'FLOW 8: Recruiter sees application belonging to company'
    );

    // -------------------------------------------------------------------------
    // FLOW 9: Recruiter job counters
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 9: Recruiter job counters ---');
    const recruiterJobsList = await RecruiterJobService.listJobs(companyA.id);
    const targetJob = recruiterJobsList.items.find((j) => j.id === publishedJob.id);
    assert(targetJob?.applicationsCount === 1, 'FLOW 9: Job card displays Applied = 1');
    assert(targetJob?.shortlistedCount === 0, 'FLOW 9: Shortlisted count is 0');

    // -------------------------------------------------------------------------
    // FLOW 10: Recruiter Candidates page
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 10: Recruiter Candidates page ---');
    const recruiterCandidates = await RecruiterCandidateService.searchCandidates(companyA.id, {
      onlyApplicants: true,
    });
    const foundCandidate = recruiterCandidates.items.find((c) => c.id === candidateUser.id);
    assert(Boolean(foundCandidate), 'FLOW 10: Candidate appears in recruiter talent pool');
    assert(
      foundCandidate?.applicationStatus === 'APPLIED',
      'FLOW 10: Candidate card reflects application status'
    );
    assert(
      foundCandidate?.appliedJobTitle === publishedJob.title,
      'FLOW 10: Candidate card reflects applied job title'
    );

    // -------------------------------------------------------------------------
    // FLOW 11: Recruiter shortlists candidate
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 11: Recruiter shortlists candidate ---');
    const updatedApp = await RecruiterApplicationService.updateApplicationStatus(
      application.id,
      companyA.id,
      'SHORTLISTED',
      'Great profile and relevant experience',
      authRecruiterA
    );
    assert(updatedApp.status === 'SHORTLISTED', 'FLOW 11: Application status is now SHORTLISTED');

    // -------------------------------------------------------------------------
    // FLOW 12: Recruiter counters update
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 12: Recruiter counters update ---');
    const updatedJobsList = await RecruiterJobService.listJobs(companyA.id);
    const updatedTargetJob = updatedJobsList.items.find((j) => j.id === publishedJob.id);
    assert(updatedTargetJob?.applicationsCount === 1, 'FLOW 12: Applied remains 1');
    assert(updatedTargetJob?.shortlistedCount === 1, 'FLOW 12: Shortlisted count increased to 1');

    // -------------------------------------------------------------------------
    // FLOW 13: Candidate sees updated status
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 13: Candidate sees updated status ---');
    const candidateAppsRefreshed = await ApplicationService.listApplications(candidateUser.id);
    const candidateViewApp = candidateAppsRefreshed.items.find((a) => a.id === application.id);
    assert(
      candidateViewApp?.status === 'SHORTLISTED',
      'FLOW 13: Candidate sees SHORTLISTED status in Applications'
    );

    // -------------------------------------------------------------------------
    // FLOW 14: Unauthorized IDOR protection
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 14: Unauthorized access blocked (IDOR) ---');
    let idorBlocked = false;
    try {
      // Recruiter B from Company B tries to view Company A's application
      await RecruiterApplicationService.getApplicationDetail(application.id, companyB.id);
    } catch (err: any) {
      idorBlocked = err.message.includes('not found or access denied');
    }
    assert(idorBlocked, 'FLOW 14: Recruiter B cannot access Recruiter A application');

    // -------------------------------------------------------------------------
    // FLOW 15: Apply to expired job rejected
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 15: Apply to expired job rejected ---');
    const now = new Date();
    const expiredJob = await db.job.create({
      data: {
        title: `Expired Role ${testSuffix}`,
        company: companyA.name,
        companyId: companyA.id,
        location: 'Remote',
        workMode: 'Remote',
        employmentType: 'Full-time',
        experienceLevel: '3-5 years',
        skills: ['Python'],
        description: 'Expired test description exceeding fifty characters requirement.',
        status: 'PUBLISHED',
        publishedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
        expiresAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    let expiredApplyBlocked = false;
    try {
      await ApplicationService.applyToJob(candidateUser.id, expiredJob.id);
    } catch (err: any) {
      expiredApplyBlocked = err.message.includes('no longer accepting applications');
    }
    assert(expiredApplyBlocked, 'FLOW 15: Applying to expired job is rejected');

    // -------------------------------------------------------------------------
    // FLOW 16: Expired job hidden from candidate search
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 16: Expired job hidden from candidate search ---');
    const searchWithExpired = await JobSearchService.searchJobs({
      q: `Expired Role ${testSuffix}`,
    });
    assert(
      !searchWithExpired.items.some((j) => j.id === expiredJob.id),
      'FLOW 16: Expired job is not returned in candidate search'
    );

    // -------------------------------------------------------------------------
    // FLOW 17: Expired job visible in recruiter history
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 17: Expired job visible in recruiter history ---');
    const recruiterHistory = await RecruiterJobService.listJobs(companyA.id, {
      status: 'EXPIRED',
    });
    assert(
      recruiterHistory.items.some((j) => j.id === expiredJob.id),
      'FLOW 17: Expired job remains visible in recruiter job history'
    );

    // -------------------------------------------------------------------------
    // FLOW 18: Editing active job does NOT reset publishedAt
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 18: Editing active job preserves publishedAt ---');
    const originalPublishedAt = publishedJob.publishedAt;
    const editedJob = await RecruiterJobService.updateJob(
      publishedJob.id,
      { title: `Senior Full Stack Engineer (Updated) ${testSuffix}` },
      authRecruiterA
    );
    assert(
      editedJob.publishedAt === originalPublishedAt,
      'FLOW 18: publishedAt was NOT reset when editing published job'
    );

    // -------------------------------------------------------------------------
    // FLOW 19: Concurrent Apply idempotency
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 19: Concurrent Apply idempotency ---');
    const anotherCandidate = await db.user.create({
      data: {
        email: `candidate_race${testSuffix}@example.com`,
        name: 'Dana Doubleclick',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
      },
    });

    const results = await Promise.allSettled([
      ApplicationService.applyToJob(anotherCandidate.id, publishedJob.id),
      ApplicationService.applyToJob(anotherCandidate.id, publishedJob.id),
    ]);

    const successes = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');
    assert(
      successes.length === 1 && rejected.length === 1,
      'FLOW 19: Exactly one application succeeded under rapid simultaneous calls'
    );

    // -------------------------------------------------------------------------
    // FLOW 20: Candidate withdraw and re-apply lifecycle
    // -------------------------------------------------------------------------
    console.log('\n--- FLOW 20: Candidate withdraw and re-apply lifecycle ---');
    const withdrawn = await ApplicationService.withdrawApplication(
      candidateUser.id,
      application.id
    );
    assert(withdrawn.status === 'WITHDRAWN', 'FLOW 20: Application successfully withdrawn');

    const reapplied = await ApplicationService.applyToJob(candidateUser.id, publishedJob.id, {
      coverNote: 'Re-applying with updated portfolio',
    });
    assert(
      reapplied.status === 'APPLIED' && reapplied.id === application.id,
      'FLOW 20: Withdrawn application reactivated to APPLIED cleanly'
    );

    // Cleanup anotherCandidate application
    await db.jobApplication.deleteMany({
      where: { candidateId: anotherCandidate.id },
    });
    await db.user.delete({ where: { id: anotherCandidate.id } });
  } catch (err: any) {
    console.error('💥 Unhandled error in pipeline test suite:', err);
    failed++;
  } finally {
    // Cleanup test data
    console.log('\n--- Cleanup: Removing test data ---');
    try {
      if (candidateUser) {
        await db.jobApplication.deleteMany({ where: { candidateId: candidateUser.id } });
        await db.profile.deleteMany({ where: { userId: candidateUser.id } });
        await db.user.deleteMany({ where: { id: candidateUser.id } });
      }
      if (companyA) {
        await db.job.deleteMany({ where: { companyId: companyA.id } });
        await db.company.deleteMany({ where: { id: companyA.id } });
      }
      if (companyB) {
        await db.job.deleteMany({ where: { companyId: companyB.id } });
        await db.company.deleteMany({ where: { id: companyB.id } });
      }
      if (recruiterUserA) {
        await db.user.deleteMany({ where: { id: recruiterUserA.id } });
      }
      if (recruiterUserB) {
        await db.user.deleteMany({ where: { id: recruiterUserB.id } });
      }
      console.log('✓ Cleanup completed.');
    } catch (cleanupErr) {
      console.error('Error cleaning up test data:', cleanupErr);
    }
  }

  console.log(`\n========================================`);
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRecruiterPipelineFlowTests();
