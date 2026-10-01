import { db } from '../db/client';
import { EmployerApplicationService } from '../services/recruiter/employerApplicationService';
import { RecruiterAuthService } from '../services/recruiter/recruiterAuthService';
import { RecruiterJobService } from '../services/recruiter/recruiterJobService';
import { RecruiterApplicationService } from '../services/recruiter/recruiterApplicationService';
import { RecruiterInterviewService } from '../services/recruiter/recruiterInterviewService';
import { RecruiterAssessmentService } from '../services/recruiter/recruiterAssessmentService';
import { RecruiterOfferService } from '../services/recruiter/recruiterOfferService';
import { RecruiterDashboardService } from '../services/recruiter/recruiterDashboardService';
import { PasswordSetupTokenService } from '../services/passwordSetupTokenService';
import { UserService } from '../services/userService';

async function runTests() {
  console.log('\n=============================================================');
  console.log('🧪 PATHWAY.ECO RECRUITER & EMPLOYER PORTAL INTEGRATION SUITE');
  console.log('=============================================================\n');

  const timestamp = Date.now();
  const testEmailA = `recruiter_a_${timestamp}@acme-corp.test`;
  const testEmailB = `recruiter_b_${timestamp}@beta-corp.test`;
  const candidateEmail = `candidate_${timestamp}@student.test`;

  let appAId = '';
  let companyAId = '';
  let userAId = '';
  let tokenA = '';

  let companyBId = '';
  let userBId = '';
  let tokenB = '';

  let candidateId = '';
  let jobId = '';
  let applicationRecordId = '';

  try {
    // -------------------------------------------------------------
    // Step 1: Employer Application Submission
    // -------------------------------------------------------------
    console.log('▶ [Test 1] Submitting Employer Application for Acme Corp...');
    const submissionResult = await EmployerApplicationService.submitApplication({
      fullName: 'Alice Recruiter',
      workEmail: testEmailA,
      phone: '+91 9876543210',
      designation: 'Head of Talent',
      linkedInUrl: 'https://linkedin.com/in/alicerecruiter',
      companyName: `Acme Engineering ${timestamp}`,
      companyWebsite: 'https://acme-corp.test',
      industry: 'Software & Technology',
      companySize: '51-200',
      headquartersLocation: 'Bengaluru, India',
      rolesHired: ['Full-stack Developers', 'Cloud Architects'],
      preferredExperienceLevels: ['Mid-level (2-5 years)', 'Senior (5+ years)'],
      hiringLocations: ['Bengaluru', 'Remote'],
      workModes: ['Remote', 'Hybrid'],
      verificationNotes: 'Acme is expanding its core engineering team in India.',
    });

    appAId = submissionResult.applicationId;
    const appDetailA = await EmployerApplicationService.getApplicationDetail(appAId);
    if (appDetailA.status !== 'PENDING') throw new Error(`Expected status PENDING, got ${appDetailA.status}`);
    console.log(`  ✅ Application submitted successfully. ID: ${appAId}, Reference: ${submissionResult.referenceId}`);

    // -------------------------------------------------------------
    // Step 2: Admin Application Review & Approval
    // -------------------------------------------------------------
    console.log('\n▶ [Test 2] Admin Review & Approval Flow...');
    const adminActor = { id: '000000000000000000000001', email: 'admin@pathway.eco', name: 'Super Admin', role: 'ADMIN', status: 'ACTIVE' };
    await EmployerApplicationService.startReview(appAId, adminActor);

    const reviewingApp = await EmployerApplicationService.getApplicationDetail(appAId);
    if (reviewingApp.status !== 'UNDER_REVIEW') throw new Error('Failed to set application to UNDER_REVIEW');
    console.log('  ✅ Application successfully transitioned to UNDER_REVIEW by admin.');

    const approvalResult = await EmployerApplicationService.approveApplication(appAId, adminActor);
    companyAId = approvalResult.application.companyId!;
    userAId = approvalResult.application.userId!;

    console.log(`  ✅ Application approved. Created Company: ${companyAId}, User: ${userAId}`);

    // Test Idempotency: approving again must return existing state without duplicate creation
    const secondApproval = await EmployerApplicationService.approveApplication(appAId, adminActor);
    if (!secondApproval.alreadyApproved) {
      throw new Error('Approval is not idempotent: did not return alreadyApproved flag!');
    }
    console.log('  ✅ Approval idempotency verified: repeated calls return existing entities without duplicates.');

    // -------------------------------------------------------------
    // Step 3: Password Setup & Recruiter Authentication
    // -------------------------------------------------------------
    console.log('\n▶ [Test 3] Recruiter Password Setup & Authentication...');
    // Create setup token for user
    const { rawToken } = await PasswordSetupTokenService.createSetupToken(userAId);
    const consumeResult = await PasswordSetupTokenService.consumeSetupToken(rawToken, 'SecurePassword123!');
    tokenA = consumeResult.sessionToken;

    // Verify session via RecruiterAuthService
    const authA = await RecruiterAuthService.verifyRecruiter(tokenA);
    if (authA.user.email !== testEmailA || authA.company.id !== companyAId) {
      throw new Error('Recruiter session verification failed or returned mismatched company');
    }
    console.log(`  ✅ Recruiter authenticated. Email: ${authA.user.email}, Role: ${authA.companyRole}`);

    // -------------------------------------------------------------
    // Step 4: Multi-Tenant Boundary & IDOR Defense Check
    // -------------------------------------------------------------
    console.log('\n▶ [Test 4] Multi-Tenant Isolation & IDOR Protection Check...');
    // Provision Company B
    const subB = await EmployerApplicationService.submitApplication({
      fullName: 'Bob Recruiter',
      workEmail: testEmailB,
      phone: '+91 9123456789',
      designation: 'Talent Acquisition',
      companyName: `Beta Industries ${timestamp}`,
      companyWebsite: 'https://beta-corp.test',
      industry: 'FinTech',
      companySize: '11-50',
      headquartersLocation: 'Mumbai, India',
      rolesHired: ['Frontend Engineers'],
      preferredExperienceLevels: ['Mid-level (2-5 years)'],
      hiringLocations: ['Mumbai'],
      workModes: ['On-site'],
    });
    const approvalB = await EmployerApplicationService.approveApplication(subB.applicationId, adminActor);
    companyBId = approvalB.application.companyId!;
    userBId = approvalB.application.userId!;
    const setupB = await PasswordSetupTokenService.createSetupToken(userBId);
    const consumeB = await PasswordSetupTokenService.consumeSetupToken(setupB.rawToken, 'SecurePassword123!');
    tokenB = consumeB.sessionToken;
    const authB = await RecruiterAuthService.verifyRecruiter(tokenB);

    // Recruiter A creates a job
    const jobA = await RecruiterJobService.createJob({
      title: 'Senior Cloud Platform Architect',
      location: 'Bengaluru, India',
      workMode: 'Remote',
      employmentType: 'Full-time',
      experienceLevel: '5+ years',
      skills: ['TypeScript', 'Kubernetes', 'Go', 'AWS'],
      salaryMin: 2500000,
      salaryMax: 4000000,
      salaryCurrency: 'INR',
      salaryPeriod: 'YEAR',
      description: 'Architecting and scaling our resilient cloud infrastructure for millions of candidate profiles across India.',
      responsibilities: ['Design distributed microservices', 'Ensure 99.99% availability'],
      requirements: ['5+ years distributed systems', 'Deep Docker & Kubernetes expertise'],
      niceToHave: ['GraphQL', 'Terraform'],
      benefits: ['Remote first', 'Health cover', 'Learning budget'],
      status: 'PUBLISHED',
    }, authA);
    jobId = jobA.id;
    console.log(`  ✅ Recruiter A published job ID: ${jobId}`);

    // Verify Recruiter B cannot view or modify Job A (IDOR defense)
    let idorPrevented = false;
    try {
      await RecruiterJobService.getJobDetail(jobId, authB.company.id);
    } catch (err: any) {
      idorPrevented = true;
      console.log(`  ✅ IDOR prevented: Recruiter B blocked from accessing Company A's job (${err.message}).`);
    }
    if (!idorPrevented) {
      throw new Error('SECURITY VIOLATION: Recruiter B was able to view Company A job!');
    }

    // -------------------------------------------------------------
    // Step 5: Candidate Application Lifecycle & Pipeline
    // -------------------------------------------------------------
    console.log('\n▶ [Test 5] Recruitment Lifecycle & Pipeline Progression...');
    // Create test candidate
    const candidateUser = await db.user.create({
      data: {
        name: 'Dev Candidate',
        email: candidateEmail,
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
      },
    });
    candidateId = candidateUser.id;

    // Candidate applies to Job A
    const application = await db.jobApplication.create({
      data: {
        candidateId,
        jobId,
        status: 'APPLIED',
        coverNote: 'Excited about cloud architecture opportunities at Acme.',
        resumeUrl: 'https://cdn.pathway.eco/resumes/dev_candidate.pdf',
      },
    });
    applicationRecordId = application.id;
    console.log(`  ✅ Candidate applied to Job A. Application ID: ${applicationRecordId}`);

    // Recruiter A lists applications
    const appsList = await RecruiterApplicationService.listApplications(authA.company.id, { jobId });
    if (appsList.total !== 1 || appsList.items[0].id !== applicationRecordId) {
      throw new Error('Application list did not return newly submitted application');
    }

    // Recruiter A updates application: APPLIED -> UNDER_REVIEW -> SHORTLISTED
    await RecruiterApplicationService.updateApplicationStatus(
      applicationRecordId,
      authA.company.id,
      'UNDER_REVIEW',
      'Initial resume screening passed.',
      authA
    );
    let appDetail = await RecruiterApplicationService.getApplicationDetail(applicationRecordId, authA.company.id);
    if (appDetail.status !== 'UNDER_REVIEW') throw new Error('Status transition to UNDER_REVIEW failed');

    await RecruiterApplicationService.updateApplicationStatus(
      applicationRecordId,
      authA.company.id,
      'SHORTLISTED',
      'Candidate shortlisted for technical round.',
      authA
    );
    appDetail = await RecruiterApplicationService.getApplicationDetail(applicationRecordId, authA.company.id);
    if (appDetail.status !== 'SHORTLISTED') throw new Error('Status transition to SHORTLISTED failed');
    console.log('  ✅ Candidate successfully transitioned to SHORTLISTED.');

    // -------------------------------------------------------------
    // Step 6: Interview Scheduling
    // -------------------------------------------------------------
    console.log('\n▶ [Test 6] Scheduling Evaluation Interview...');
    const interview = await RecruiterInterviewService.scheduleInterview({
      jobId,
      applicationId: applicationRecordId,
      candidateId,
      title: 'Systems & Cloud Architecture Deep Dive',
      type: 'TECHNICAL',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: 60,
      meetingUrl: 'https://meet.google.com/test-call-acme',
      interviewerName: 'Alice Recruiter',
      notes: 'Focus on distributed consensus, Kubernetes, and API design.',
    }, authA);

    // Verify auto-progression to INTERVIEW
    appDetail = await RecruiterApplicationService.getApplicationDetail(applicationRecordId, authA.company.id);
    if (appDetail.status !== 'INTERVIEW') {
      throw new Error(`Expected auto-transition to INTERVIEW, but found ${appDetail.status}`);
    }
    console.log(`  ✅ Interview scheduled (ID: ${interview.id}) & Application automatically moved to INTERVIEW stage.`);

    // -------------------------------------------------------------
    // Step 7: Assessment Creation
    // -------------------------------------------------------------
    console.log('\n▶ [Test 7] Creating Standardized Assessment...');
    const assessment = await RecruiterAssessmentService.createAssessment({
      jobId,
      title: 'Distributed Systems & Go Fundamentals',
      description: 'Assessment for cloud platform engineering candidates.',
      type: 'MCQ',
      timeLimitMinutes: 45,
      passingScore: 75,
      questions: [
        {
          question: 'What is the primary benefit of Raft over Paxos?',
          type: 'MCQ',
          options: ['Simpler state machine replication and understandability', 'Lower latency', 'Zero network messages'],
          correctAnswer: 'Simpler state machine replication and understandability',
          points: 10,
        },
        {
          question: 'In Kubernetes, which controller manages stateful workloads?',
          type: 'MCQ',
          options: ['Deployment', 'StatefulSet', 'DaemonSet', 'ReplicaSet'],
          correctAnswer: 'StatefulSet',
          points: 10,
        },
      ],
    }, authA);
    if (assessment.questionsCount !== 2) throw new Error('Assessment questions count mismatch');
    console.log(`  ✅ Assessment created with 2 questions. ID: ${assessment.id}`);

    // -------------------------------------------------------------
    // Step 8: Formal Job Offer & Hiring
    // -------------------------------------------------------------
    console.log('\n▶ [Test 8] Extending Formal Offer & Candidate Acceptance...');
    const offer = await RecruiterOfferService.createOffer({
      jobId,
      applicationId: applicationRecordId,
      candidateId,
      positionTitle: 'Senior Cloud Platform Architect',
      salaryOffered: 3500000,
      currency: 'INR',
      salaryPeriod: 'YEAR',
      startDate: new Date(Date.now() + 14 * 86400000).toISOString(),
      notes: 'Standard 30-day signing window with sign-on equity component.',
    }, authA);

    if (offer.status !== 'SENT') throw new Error(`Expected offer status SENT, got ${offer.status}`);
    console.log(`  ✅ Formal offer extended to candidate. Offer ID: ${offer.id}`);

    // Candidate accepts offer
    const acceptedOffer = await RecruiterOfferService.updateOfferStatus(offer.id, authA.company.id, 'ACCEPTED', authA);
    if (acceptedOffer.status !== 'ACCEPTED') throw new Error('Failed to mark offer as ACCEPTED');
    console.log('  ✅ Offer marked as ACCEPTED by recruiter.');

    // -------------------------------------------------------------
    // Step 9: Recruiter Dashboard Operational Metrics
    // -------------------------------------------------------------
    console.log('\n▶ [Test 9] Validating Dashboard Operational Metrics...');
    const metrics = await RecruiterDashboardService.getDashboardMetrics(authA.company.id);
    if (metrics.summary.activeJobs < 1) throw new Error('Expected activeJobs >= 1 in dashboard');
    if (metrics.summary.totalApplications < 1) throw new Error('Expected totalApplications >= 1 in dashboard');
    console.log(`  ✅ Dashboard metrics verified: ${metrics.summary.activeJobs} active jobs, ${metrics.summary.totalApplications} applications, ${metrics.summary.upcomingInterviews} upcoming interviews.`);

    console.log('\n=============================================================');
    console.log('🎉 ALL INTEGRATION SUITE TESTS PASSED SUCCESSFULLY! (9/9)');
    console.log('=============================================================\n');
  } catch (err: any) {
    console.error('\n❌ INTEGRATION SUITE FAILED:', err);
    process.exit(1);
  } finally {
    // Cleanup test records
    console.log('🧹 Cleaning up test artifacts from database...');
    try {
      if (applicationRecordId) await db.jobApplication.deleteMany({ where: { id: applicationRecordId } });
      if (jobId) {
        await db.interview.deleteMany({ where: { jobId } });
        await db.offer.deleteMany({ where: { jobId } });
        await db.assessment.deleteMany({ where: { jobId } });
        await db.job.deleteMany({ where: { id: jobId } });
      }
      if (candidateId) await db.user.deleteMany({ where: { id: candidateId } });
      if (companyAId) {
        await db.companyMember.deleteMany({ where: { companyId: companyAId } });
        await db.recruiterProfile.deleteMany({ where: { companyId: companyAId } });
        await db.company.deleteMany({ where: { id: companyAId } });
      }
      if (userAId) {
        await db.passwordSetupToken.deleteMany({ where: { userId: userAId } });
        await db.user.deleteMany({ where: { id: userAId } });
      }
      if (appAId) await db.employerApplication.deleteMany({ where: { id: appAId } });

      if (companyBId) {
        await db.companyMember.deleteMany({ where: { companyId: companyBId } });
        await db.recruiterProfile.deleteMany({ where: { companyId: companyBId } });
        await db.company.deleteMany({ where: { id: companyBId } });
      }
      if (userBId) {
        await db.passwordSetupToken.deleteMany({ where: { userId: userBId } });
        await db.user.deleteMany({ where: { id: userBId } });
      }
      console.log('  ✅ Sandbox cleanup complete.');
    } catch (cleanupErr) {
      console.warn('  ⚠️ Note during cleanup:', cleanupErr);
    }
  }
}

runTests();
