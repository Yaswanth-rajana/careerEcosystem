import { db } from '../db/client';
import { RecruiterRbacService, ROLE_PERMISSIONS } from '../services/recruiter/recruiterRbacService';
import { RecruiterTeamService } from '../services/recruiter/recruiterTeamService';
import { RecruiterJobService } from '../services/recruiter/recruiterJobService';
import { RecruiterApplicationService } from '../services/recruiter/recruiterApplicationService';
import { RecruiterInterviewService } from '../services/recruiter/recruiterInterviewService';
import { RecruiterOfferService } from '../services/recruiter/recruiterOfferService';
import { AuthenticatedRecruiter, RecruiterRole, RecruiterPermission } from '../types/recruiter';
import crypto from 'crypto';

async function runRbacTests() {
  console.log('🚀 Starting PATHWAY.ECO Recruiter RBAC Comprehensive Test Suite...\n');

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
  let companyA: any;
  let companyB: any;

  // Users
  let adminUser: any;
  let recruiterUser: any;
  let techInterviewerUser: any;
  let hrInterviewerUser: any;
  let coordinatorUser: any;
  let hiringManagerUser: any;
  let companyBUser: any;
  let candidateUser: any;

  // Memberships
  let adminMember: any;
  let recruiterMember: any;
  let techMember: any;
  let hrMember: any;
  let coordMember: any;
  let hmMember: any;
  let companyBMember: any;

  // AuthenticatedRecruiter objects
  let authAdmin: AuthenticatedRecruiter;
  let authRecruiter: AuthenticatedRecruiter;
  let authTech: AuthenticatedRecruiter;
  let authHr: AuthenticatedRecruiter;
  let authCoord: AuthenticatedRecruiter;
  let authHm: AuthenticatedRecruiter;
  let authCompanyB: AuthenticatedRecruiter;

  // Resources
  let job1: any;
  let job2: any; // for testing HM unassigned job
  let application1: any;
  let techInterview: any;
  let hrInterview: any;

  try {
    // -------------------------------------------------------------------------
    // SETUP: Test Companies, Users, Memberships, Jobs & Applications
    // -------------------------------------------------------------------------
    console.log('--- Setup: Test Entities ---');
    companyA = await db.company.create({
      data: {
        name: `Acme RBAC ${testSuffix}`,
        slug: `acme-rbac-${testSuffix}`,
        website: 'https://acme-rbac.example.com',
        industry: 'Software',
        size: '10-50',
        location: 'Bengaluru, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    companyB = await db.company.create({
      data: {
        name: `Other Corp ${testSuffix}`,
        slug: `other-corp-${testSuffix}`,
        website: 'https://other-rbac.example.com',
        industry: 'Finance',
        size: '100-500',
        location: 'Mumbai, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    // Helper to create user
    const createUser = async (name: string, emailPrefix: string) => {
      return db.user.create({
        data: {
          email: `${emailPrefix}_${testSuffix}@example.com`,
          name,
          role: 'RECRUITER',
          passwordHash: 'dummyhash123',
        },
      });
    };

    adminUser = await createUser('Alice Admin', 'alice');
    recruiterUser = await createUser('Bob Recruiter', 'bob');
    techInterviewerUser = await createUser('Charlie Tech', 'charlie');
    hrInterviewerUser = await createUser('Dana HR', 'dana');
    coordinatorUser = await createUser('Eli Coord', 'eli');
    hiringManagerUser = await createUser('Fiona Manager', 'fiona');
    companyBUser = await createUser('George Other', 'george');

    candidateUser = await db.user.create({
      data: {
        email: `candidate_${testSuffix}@example.com`,
        name: 'Carlos Candidate',
        role: 'JOB_SEEKER',
        passwordHash: 'dummyhash123',
      },
    });

    // Helper to create membership
    const createMember = async (companyId: string, userId: string, role: RecruiterRole, extraData: any = {}) => {
      return db.companyMember.create({
        data: {
          companyId,
          userId,
          role,
          status: 'ACTIVE',
          ...extraData,
        },
      });
    };

    adminMember = await createMember(companyA.id, adminUser.id, 'COMPANY_ADMIN');
    recruiterMember = await createMember(companyA.id, recruiterUser.id, 'RECRUITER');
    techMember = await createMember(companyA.id, techInterviewerUser.id, 'TECHNICAL_INTERVIEWER', {
      interviewTypes: ['TECHNICAL', 'SYSTEM_DESIGN'],
    });
    hrMember = await createMember(companyA.id, hrInterviewerUser.id, 'HR_INTERVIEWER', {
      interviewTypes: ['HR', 'CULTURE_FIT'],
    });
    coordMember = await createMember(companyA.id, coordinatorUser.id, 'INTERVIEW_COORDINATOR');

    companyBMember = await createMember(companyB.id, companyBUser.id, 'COMPANY_ADMIN');

    // Create Jobs under Company A
    job1 = await db.job.create({
      data: {
        companyId: companyA.id,
        company: companyA.name,
        title: `Senior Backend Engineer ${testSuffix}`,
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        description: 'Lead backend engineer test role.',
        location: 'Remote',
      },
    });

    job2 = await db.job.create({
      data: {
        companyId: companyA.id,
        company: companyA.name,
        title: `Frontend Specialist ${testSuffix}`,
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        experienceLevel: 'MID',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        description: 'Frontend engineer test role.',
        location: 'Bengaluru',
      },
    });

    // Hiring manager is only scoped to job1
    hmMember = await createMember(companyA.id, hiringManagerUser.id, 'HIRING_MANAGER', {
      assignedJobIds: [job1.id],
      department: 'Engineering',
    });

    // Build auth helper
    const buildAuth = (user: any, company: any, member: any, role: RecruiterRole): AuthenticatedRecruiter => ({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      recruiter: {
        id: `rec_${user.id}`,
        designation: member.title || 'Recruitment Member',
        status: 'ACTIVE',
      },
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        website: company.website,
        industry: company.industry,
        size: company.size,
        location: company.location,
        verified: company.verified,
        status: company.status,
      },
      membership: {
        id: member.id,
        role,
        status: member.status,
        department: member.department,
        assignedJobIds: member.assignedJobIds || [],
        interviewTypes: member.interviewTypes || [],
      },
      companyRole: role,
      permissions: ROLE_PERMISSIONS[role] || [],
    });

    authAdmin = buildAuth(adminUser, companyA, adminMember, 'COMPANY_ADMIN');
    authRecruiter = buildAuth(recruiterUser, companyA, recruiterMember, 'RECRUITER');
    authTech = buildAuth(techInterviewerUser, companyA, techMember, 'TECHNICAL_INTERVIEWER');
    authHr = buildAuth(hrInterviewerUser, companyA, hrMember, 'HR_INTERVIEWER');
    authCoord = buildAuth(coordinatorUser, companyA, coordMember, 'INTERVIEW_COORDINATOR');
    authHm = buildAuth(hiringManagerUser, companyA, hmMember, 'HIRING_MANAGER');
    authCompanyB = buildAuth(companyBUser, companyB, companyBMember, 'COMPANY_ADMIN');

    // Create Candidate Application on Job 1
    application1 = await db.jobApplication.create({
      data: {
        jobId: job1.id,
        candidateId: candidateUser.id,
        status: 'SHORTLISTED',
      },
    });

    // Create Tech Interview assigned to techInterviewerUser
    techInterview = await db.interview.create({
      data: {
        jobId: job1.id,
        candidateId: candidateUser.id,
        applicationId: application1.id,
        companyId: companyA.id,
        type: 'TECHNICAL',
        title: 'Backend Coding Round',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 86400000),
        durationMinutes: 60,
        interviewerId: techInterviewerUser.id,
        meetingUrl: 'https://meet.example.com/tech-1',
      },
    });

    // Create HR Interview assigned to hrInterviewerUser
    hrInterview = await db.interview.create({
      data: {
        jobId: job1.id,
        candidateId: candidateUser.id,
        applicationId: application1.id,
        companyId: companyA.id,
        type: 'HR',
        title: 'Culture & HR Round',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 172800000),
        durationMinutes: 45,
        interviewerId: hrInterviewerUser.id,
        meetingUrl: 'https://meet.example.com/hr-1',
      },
    });

    console.log('--- Entities initialized successfully ---\n');

    // -------------------------------------------------------------------------
    // TEST 1: Company Admin permissions
    // -------------------------------------------------------------------------
    console.log('--- Test 1: Company Admin Permissions ---');
    {
      const hasAllPerms = (
        [
          'company:manage',
          'team:invite',
          'team:manage_roles',
          'team:remove_member',
          'jobs:create',
          'jobs:edit',
          'offers:manage',
          'interviews:assign',
        ] as RecruiterPermission[]
      ).every(p => RecruiterRbacService.hasPermission(authAdmin, p));

      const teamList = await RecruiterTeamService.listTeamMembers(companyA.id, authAdmin);
      assert(hasAllPerms && teamList.length >= 6, 'Company Admin possesses all workspace admin permissions and can list team members');
    }

    // -------------------------------------------------------------------------
    // TEST 2: Recruiter job creation and application access
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: Recruiter Job Creation and Application Access ---');
    {
      const canCreateJob = RecruiterRbacService.hasPermission(authRecruiter, 'jobs:create');
      const canViewApps = RecruiterRbacService.hasPermission(authRecruiter, 'applications:view_all');
      const canTransition = RecruiterRbacService.hasPermission(authRecruiter, 'pipeline:transition');

      // Test transitioning candidate status
      const updatedApp = await RecruiterApplicationService.updateApplicationStatus(
        application1.id,
        companyA.id,
        'INTERVIEW',
        'Proceeding to technical evaluation',
        authRecruiter
      );

      assert(
        canCreateJob && canViewApps && canTransition && updatedApp.status === 'INTERVIEW',
        'Recruiter can access applications and transition pipeline stages'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 3: Technical interviewer assigned-interview access
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: Technical Interviewer Assigned-Interview Access ---');
    {
      // Tech interviewer should see their assigned tech interview
      const interviews = await RecruiterInterviewService.listInterviews(companyA.id, 'all', authTech);
      const hasAssigned = interviews.some(i => i.id === techInterview.id);

      // Tech interviewer can submit technical feedback on assigned interview
      const feedbackResult = await RecruiterInterviewService.submitFeedback(
        techInterview.id,
        {
          rating: 4,
          recommendation: 'STRONG_HIRE',
          feedback: 'Excellent knowledge of distributed systems and clean TypeScript patterns.',
        },
        authTech
      );

      assert(
        hasAssigned && feedbackResult.rating === 4,
        'Technical interviewer can view and submit feedback on their assigned interview'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 4: Technical interviewer denial for unassigned interviews
    // -------------------------------------------------------------------------
    console.log('\n--- Test 4: Technical Interviewer Denial for Unassigned Interviews ---');
    {
      let deniedView = false;
      let deniedFeedback = false;

      // Try accessing the HR interview which is unassigned to Tech interviewer
      try {
        await RecruiterInterviewService.getInterviewById(hrInterview.id, companyA.id, authTech);
      } catch (err: any) {
        if (err.message.includes('Access denied') || err.message.includes('assigned to you') || err.message.includes('Forbidden')) {
          deniedView = true;
        }
      }

      // Try submitting feedback on the HR interview
      try {
        await RecruiterInterviewService.submitFeedback(
          hrInterview.id,
          { rating: 5, recommendation: 'STRONG_HIRE', feedback: 'Should fail' },
          authTech
        );
      } catch (err: any) {
        if (err.message.includes('Access denied') || err.message.includes('assigned to you') || err.message.includes('Forbidden')) {
          deniedFeedback = true;
        }
      }

      assert(
        deniedView && deniedFeedback,
        'Technical interviewer is strictly denied access and feedback on unassigned interviews'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 5: HR interviewer restrictions
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5: HR Interviewer Restrictions ---');
    {
      // HR interviewer cannot submit technical feedback
      let deniedTechFeedback = false;
      try {
        await RecruiterInterviewService.submitFeedback(
          techInterview.id,
          { rating: 4, recommendation: 'STRONG_HIRE', feedback: 'HR feedback on tech round' },
          authHr
        );
      } catch (err: any) {
        deniedTechFeedback = true;
      }

      // But can submit feedback on their assigned HR interview
      const hrFeedback = await RecruiterInterviewService.submitFeedback(
        hrInterview.id,
        {
          rating: 5,
          recommendation: 'STRONG_HIRE',
          feedback: 'Great team alignment, leadership mindset and cultural fit.',
        },
        authHr
      );

      assert(
        deniedTechFeedback && hrFeedback.recommendation === 'STRONG_HIRE',
        'HR interviewer is restricted to HR rounds and cannot evaluate tech interviews'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 6: Coordinator scheduling and notification permissions
    // -------------------------------------------------------------------------
    console.log('\n--- Test 6: Coordinator Scheduling and Notification Permissions ---');
    {
      const canSchedule = RecruiterRbacService.hasPermission(authCoord, 'interviews:schedule');
      const canAssign = RecruiterRbacService.hasPermission(authCoord, 'interviews:assign');

      // Coordinator reassigns techInterview interviewer to adminUser
      const reassignResult = await RecruiterInterviewService.assignInterviewer(
        techInterview.id,
        { interviewerId: adminUser.id },
        authCoord
      );

      assert(
        canSchedule && canAssign && reassignResult.interviewerId === adminUser.id,
        'Coordinator has scheduling and interviewer assignment permissions'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: Coordinator denial for confidential hiring decisions
    // -------------------------------------------------------------------------
    console.log('\n--- Test 7: Coordinator Denial for Confidential Decisions ---');
    {
      const deniedOffersManage = !RecruiterRbacService.hasPermission(authCoord, 'offers:manage');
      const deniedOffersView = !RecruiterRbacService.hasPermission(authCoord, 'offers:view');

      let serviceOfferDenied = false;
      try {
        await RecruiterOfferService.createOffer(
          {
            candidateId: candidateUser.id,
            jobId: job1.id,
            applicationId: application1.id,
            positionTitle: 'Backend Engineer',
            salaryOffered: 1500000,
            currency: 'INR',
            salaryPeriod: 'YEAR',
            startDate: new Date().toISOString(),
          },
          authCoord
        );
      } catch (err: any) {
        if (err.message.includes('Missing required permission') || err.message.includes('Forbidden')) {
          serviceOfferDenied = true;
        }
      }

      let feedbackDenied = false;
      try {
        await RecruiterInterviewService.submitFeedback(
          techInterview.id,
          { rating: 5, recommendation: 'STRONG_HIRE', feedback: 'Coord submitting feedback' },
          authCoord
        );
      } catch (err: any) {
        feedbackDenied = true;
      }

      assert(
        deniedOffersManage && deniedOffersView && serviceOfferDenied && feedbackDenied,
        'Coordinator is strictly blocked from offers/hiring decisions and submitting feedback'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 8: Hiring Manager resource scope
    // -------------------------------------------------------------------------
    console.log('\n--- Test 8: Hiring Manager Resource Scope ---');
    {
      // HM assigned to job1 only
      let job1Allowed = false;
      let job2Denied = false;

      try {
        await RecruiterRbacService.assertJobAccess(authHm, job1.id);
        job1Allowed = true;
      } catch (e) {
        job1Allowed = false;
      }

      try {
        await RecruiterRbacService.assertJobAccess(authHm, job2.id);
      } catch (e: any) {
        if (e.message.includes('not assigned') || e.message.includes('Hiring Manager')) {
          job2Denied = true;
        }
      }

      assert(
        job1Allowed && job2Denied,
        'Hiring Manager has access scoped strictly to designated job requisitions (assignedJobIds)'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 9: Cross-company isolation
    // -------------------------------------------------------------------------
    console.log('\n--- Test 9: Cross-Company Isolation ---');
    {
      let crossJobDenied = false;
      let crossAppDenied = false;
      let crossInterviewDenied = false;

      // User from Company B attempts to access Company A's job
      try {
        await RecruiterJobService.getJobDetail(job1.id, companyB.id, authCompanyB);
      } catch (e: any) {
        crossJobDenied = true;
      }

      // User from Company B attempts to access Company A's application
      try {
        await RecruiterApplicationService.getApplicationDetail(application1.id, companyB.id, authCompanyB);
      } catch (e: any) {
        crossAppDenied = true;
      }

      // User from Company B attempts to access Company A's interview
      try {
        await RecruiterInterviewService.getInterviewById(techInterview.id, companyB.id, authCompanyB);
      } catch (e: any) {
        crossInterviewDenied = true;
      }

      assert(
        crossJobDenied && crossAppDenied && crossInterviewDenied,
        'Cross-company resource access (IDOR) is strictly blocked across jobs, applications, and interviews'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 10: Unauthorized role changes & Last Admin Protection
    // -------------------------------------------------------------------------
    console.log('\n--- Test 10: Unauthorized Role Changes & Last Admin Protection ---');
    {
      let recruiterRoleChangeDenied = false;
      // Recruiter tries to promote coordinator to Company Admin
      try {
        await RecruiterTeamService.updateMemberRole(
          companyA.id,
          coordMember.id,
          { role: 'COMPANY_ADMIN' },
          authRecruiter
        );
      } catch (e: any) {
        if (e.message.includes('team:manage_roles') || e.message.includes('Forbidden')) {
          recruiterRoleChangeDenied = true;
        }
      }

      // Company Admin tries to demote themselves when they are the sole admin
      let soleAdminDemotionDenied = false;
      try {
        await RecruiterTeamService.updateMemberRole(
          companyA.id,
          adminMember.id,
          { role: 'RECRUITER' },
          authAdmin
        );
      } catch (e: any) {
        if (e.message.includes('last active Company Admin') || e.message.includes('Cannot demote')) {
          soleAdminDemotionDenied = true;
        }
      }

      assert(
        recruiterRoleChangeDenied && soleAdminDemotionDenied,
        'Unauthorized role changes blocked and last Company Admin is protected from demotion'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 11: Unauthorized invitations
    // -------------------------------------------------------------------------
    console.log('\n--- Test 11: Unauthorized Invitations ---');
    {
      let recruiterInviteAdminDenied = false;
      try {
        // Recruiter lacks team:manage_roles, cannot invite admin
        await RecruiterTeamService.inviteMember(
          companyA.id,
          {
            email: `unauth_invite_${testSuffix}@example.com`,
            role: 'COMPANY_ADMIN',
          },
          authRecruiter
        );
      } catch (e: any) {
        if (e.message.includes('Only a Company Admin') || e.message.includes('Forbidden')) {
          recruiterInviteAdminDenied = true;
        }
      }

      assert(
        recruiterInviteAdminDenied,
        'Non-admins cannot invite new Company Admins or bypass role-management permissions'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 12: Duplicate invitations and memberships
    // -------------------------------------------------------------------------
    console.log('\n--- Test 12: Duplicate Invitations & Memberships ---');
    {
      let existingMemberInviteDenied = false;
      try {
        // Invite user who is already a member
        await RecruiterTeamService.inviteMember(
          companyA.id,
          {
            email: recruiterUser.email,
            role: 'HIRING_MANAGER',
          },
          authAdmin
        );
      } catch (e: any) {
        if (e.message.includes('already active')) {
          existingMemberInviteDenied = true;
        }
      }

      // Create a valid invite
      await RecruiterTeamService.inviteMember(
        companyA.id,
        {
          email: `duplicate_target_${testSuffix}@example.com`,
          role: 'TECHNICAL_INTERVIEWER',
        },
        authAdmin
      );

      // Attempt to invite the exact same email again while first is pending
      let duplicatePendingDenied = false;
      try {
        await RecruiterTeamService.inviteMember(
          companyA.id,
          {
            email: `duplicate_target_${testSuffix}@example.com`,
            role: 'RECRUITER',
          },
          authAdmin
        );
      } catch (e: any) {
        if (e.message.includes('pending invitation')) {
          duplicatePendingDenied = true;
        }
      }

      assert(
        existingMemberInviteDenied && duplicatePendingDenied,
        'Duplicate active memberships and conflicting pending invitations are prevented'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 13: Invitation token expiry, revocation, and replay
    // -------------------------------------------------------------------------
    console.log('\n--- Test 13: Token Expiry, Revocation, and Replay Safety ---');
    {
      // Create invitation
      const rawTokenExpired = crypto.randomBytes(32).toString('hex');
      const tokenHashExpired = crypto.createHash('sha256').update(rawTokenExpired).digest('hex');

      // Create an expired invitation in DB
      await db.companyInvitation.create({
        data: {
          companyId: companyA.id,
          email: `expired_user_${testSuffix}@example.com`,
          role: 'RECRUITER',
          tokenHash: tokenHashExpired,
          status: 'PENDING',
          expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
          invitedById: adminUser.id,
        },
      });

      let expiredDenied = false;
      try {
        await RecruiterTeamService.acceptInvitation(rawTokenExpired);
      } catch (e: any) {
        if (e.message.includes('expired')) {
          expiredDenied = true;
        }
      }

      // Create and revoke invitation
      const rawTokenRevoke = crypto.randomBytes(32).toString('hex');
      const tokenHashRevoke = crypto.createHash('sha256').update(rawTokenRevoke).digest('hex');

      const revokedRecord = await db.companyInvitation.create({
        data: {
          companyId: companyA.id,
          email: `revoked_user_${testSuffix}@example.com`,
          role: 'RECRUITER',
          tokenHash: tokenHashRevoke,
          status: 'PENDING',
          expiresAt: new Date(Date.now() + 86400000),
          invitedById: adminUser.id,
        },
      });

      await RecruiterTeamService.revokeInvitation(companyA.id, revokedRecord.id, authAdmin);

      let revokedDenied = false;
      try {
        await RecruiterTeamService.acceptInvitation(rawTokenRevoke);
      } catch (e: any) {
        if (e.message.includes('no longer valid') || e.message.includes('revoked')) {
          revokedDenied = true;
        }
      }

      assert(
        expiredDenied && revokedDenied,
        'Expired tokens and revoked invitations are properly rejected upon acceptance attempts'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 14: Existing-user invitation acceptance without duplication
    // -------------------------------------------------------------------------
    console.log('\n--- Test 14: Existing-User Invitation Acceptance ---');
    {
      // Invite candidateUser to become a Technical Interviewer
      await RecruiterTeamService.inviteMember(
        companyA.id,
        {
          email: candidateUser.email,
          role: 'TECHNICAL_INTERVIEWER',
          interviewTypes: ['TECHNICAL'],
        },
        authAdmin
      );

      // Get invitation record to retrieve token hash
      const invRecord = await db.companyInvitation.findFirst({
        where: { email: candidateUser.email.toLowerCase(), companyId: companyA.id },
      });

      // Update to known raw token for test verification
      const rawTokenAccept = crypto.randomBytes(32).toString('hex');
      const tokenHashAccept = crypto.createHash('sha256').update(rawTokenAccept).digest('hex');

      await db.companyInvitation.update({
        where: { id: invRecord!.id },
        data: { tokenHash: tokenHashAccept },
      });

      // Accept invitation
      const acceptResult = await RecruiterTeamService.acceptInvitation(rawTokenAccept);

      // Verify no duplicate User was created
      const userCount = await db.user.count({
        where: { email: candidateUser.email.toLowerCase() },
      });

      // Verify idempotent retry
      const retryResult = await RecruiterTeamService.acceptInvitation(rawTokenAccept);

      assert(
        acceptResult.success &&
        Boolean(acceptResult.memberId) &&
        userCount === 1 &&
        retryResult.success === true &&
        retryResult.alreadyAccepted === true,
        'Existing users are linked to company membership without duplicate User creation; safe to retry'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 15: Role changes taking effect on subsequent requests
    // -------------------------------------------------------------------------
    console.log('\n--- Test 15: Role Changes Taking Effect on Subsequent Requests ---');
    {
      // Update recruiterUser's role to HIRING_MANAGER
      await RecruiterTeamService.updateMemberRole(
        companyA.id,
        recruiterMember.id,
        {
          role: 'HIRING_MANAGER',
          assignedJobIds: [job2.id],
          department: 'Product',
        },
        authAdmin
      );

      // Fetch fresh member record
      const updatedMember = await db.companyMember.findUnique({
        where: { id: recruiterMember.id },
      });

      // Simulating subsequent request resolution
      const freshAuth = buildAuth(recruiterUser, companyA, updatedMember, updatedMember!.role as RecruiterRole);

      const hadOldJobsManage = freshAuth.permissions.includes('jobs:edit');
      const hasOffersManage = freshAuth.permissions.includes('offers:manage');

      assert(
        updatedMember!.role === 'HIRING_MANAGER' &&
        !hadOldJobsManage &&
        hasOffersManage,
        'Role change in DB immediately updates permissions on subsequent requests'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 16: Inactive membership access denial
    // -------------------------------------------------------------------------
    console.log('\n--- Test 16: Inactive Membership Access Denial ---');
    {
      // Suspend techMember
      await db.companyMember.update({
        where: { id: techMember.id },
        data: { status: 'SUSPENDED' },
      });

      const suspendedAuth = buildAuth(techInterviewerUser, companyA, { ...techMember, status: 'SUSPENDED' }, 'TECHNICAL_INTERVIEWER');

      let membershipDenied = false;
      try {
        RecruiterRbacService.assertActiveMembership(suspendedAuth);
      } catch (e: any) {
        if (e.message.includes('suspended') || e.message.includes('Access denied')) {
          membershipDenied = true;
        }
      }

      assert(
        membershipDenied,
        'Suspended or inactive memberships are denied access with 403'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 17: API authorization independent of frontend controls
    // -------------------------------------------------------------------------
    console.log('\n--- Test 17: API Authorization Independent of Frontend Controls ---');
    {
      // Attempting to delete team member directly using Recruiter role
      let directBackendDenied = false;
      try {
        await RecruiterTeamService.removeMember(companyA.id, hrMember.id, authRecruiter);
      } catch (e: any) {
        if (e.message.includes('team:remove_member') || e.message.includes('Forbidden')) {
          directBackendDenied = true;
        }
      }

      assert(
        directBackendDenied,
        'Backend strictly enforces RBAC rules independently of frontend visibility controls'
      );
    }

    // -------------------------------------------------------------------------
    // TEST 18: Existing job, application, and interview regression behavior
    // -------------------------------------------------------------------------
    console.log('\n--- Test 18: Regression Behavior & Core Workflow Integrity ---');
    {
      // Admin lists jobs, applications, and interviews
      const jobList = await RecruiterJobService.listJobs(companyA.id, {}, authAdmin);
      const appList = await RecruiterApplicationService.listApplications(companyA.id, {}, authAdmin);
      const intList = await RecruiterInterviewService.listInterviews(companyA.id, 'all', authAdmin);

      assert(
        jobList.items.length >= 2 &&
        appList.items.length >= 1 &&
        intList.length >= 2,
        'Core recruitment workflows for jobs, applications, and interviews function without regression'
      );
    }

  } catch (error: any) {
    console.error('Fatal error during test suite execution:', error);
    failed++;
  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    console.log('\n--- Cleanup: Removing Test Records ---');
    try {
      if (companyA && companyB) {
        await db.interview.deleteMany({ where: { companyId: { in: [companyA.id, companyB.id] } } });
        await db.jobApplication.deleteMany({ where: { job: { companyId: { in: [companyA.id, companyB.id] } } } });
        await db.job.deleteMany({ where: { companyId: { in: [companyA.id, companyB.id] } } });
        await db.companyInvitation.deleteMany({ where: { companyId: { in: [companyA.id, companyB.id] } } });
        await db.companyMember.deleteMany({ where: { companyId: { in: [companyA.id, companyB.id] } } });
        await db.company.deleteMany({ where: { id: { in: [companyA.id, companyB.id] } } });
        
        const testUserIds = [
          adminUser?.id,
          recruiterUser?.id,
          techInterviewerUser?.id,
          hrInterviewerUser?.id,
          coordinatorUser?.id,
          hiringManagerUser?.id,
          companyBUser?.id,
          candidateUser?.id,
        ].filter(Boolean);

        if (testUserIds.length > 0) {
          await db.user.deleteMany({ where: { id: { in: testUserIds } } });
        }
      }
      console.log('Cleanup completed cleanly.');
    } catch (cleanupErr) {
      console.error('Cleanup encountered error:', cleanupErr);
    }
  }

  console.log('\n======================================================');
  console.log(`RBAC Test Suite Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runRbacTests();
