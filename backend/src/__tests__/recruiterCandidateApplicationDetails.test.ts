import { db } from '../db/client';
import { RecruiterApplicationService } from '../services/recruiter/recruiterApplicationService';
import { ApplicationService } from '../services/applicationService';
import { RecruiterInterviewService } from '../services/recruiter/recruiterInterviewService';
import { RecruiterOfferService } from '../services/recruiter/recruiterOfferService';
import { AuthenticatedRecruiter } from '../types/recruiter';
import { ROLE_PERMISSIONS } from '../services/recruiter/recruiterRbacService';

async function runCandidateApplicationDetailsTests() {
  console.log('🚀 Starting Candidate Application Details Test Suite...\n');

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
  let companyA: any;
  let companyB: any;
  let recruiterUserA: any;
  let recruiterUserB: any;
  let candidateWithExperience: any;
  let candidateWithoutExperience: any;
  let candidateWithoutResume: any;
  let jobA: any;
  let jobB: any;
  let appWithExperience: any;
  let appWithoutExperience: any;
  let appWithoutResume: any;
  let authA: AuthenticatedRecruiter;
  let authB: AuthenticatedRecruiter;

  try {
    console.log('--- Setup: Test Entities ---');
    companyA = await db.company.create({
      data: {
        name: `Acme Inc ${suffix}`,
        slug: `acme-${suffix}`,
        website: 'https://acme.example.com',
        industry: 'Technology',
        size: '50-100',
        location: 'Bengaluru, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    companyB = await db.company.create({
      data: {
        name: `Beta Corp ${suffix}`,
        slug: `beta-${suffix}`,
        website: 'https://beta.example.com',
        industry: 'Fintech',
        size: '10-50',
        location: 'Mumbai, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    recruiterUserA = await db.user.create({
      data: {
        email: `recruiter_a${suffix}@acme.com`,
        name: 'Alice Recruiter',
        role: 'EMPLOYER',
        status: 'ACTIVE',
      },
    });

    recruiterUserB = await db.user.create({
      data: {
        email: `recruiter_b${suffix}@beta.com`,
        name: 'Bob Recruiter',
        role: 'EMPLOYER',
        status: 'ACTIVE',
      },
    });

    authA = {
      user: {
        id: recruiterUserA.id,
        email: recruiterUserA.email,
        name: recruiterUserA.name,
        role: 'EMPLOYER',
      },
      recruiter: {
        id: `rec_a_${suffix}`,
        designation: 'Hiring Lead',
        status: 'ACTIVE',
      },
      company: {
        id: companyA.id,
        name: companyA.name,
        slug: companyA.slug,
        website: 'https://acme.example.com',
        industry: 'Technology',
        size: '50-100',
        location: 'Bengaluru, India',
        verified: true,
        status: 'ACTIVE',
      },
      membership: {
        id: `mem_a_${suffix}`,
        role: 'COMPANY_ADMIN',
        status: 'ACTIVE',
        department: null,
        assignedJobIds: [],
        interviewTypes: [],
      },
      companyRole: 'COMPANY_ADMIN',
      permissions: ROLE_PERMISSIONS['COMPANY_ADMIN'],
    };

    authB = {
      user: {
        id: recruiterUserB.id,
        email: recruiterUserB.email,
        name: recruiterUserB.name,
        role: 'EMPLOYER',
      },
      recruiter: {
        id: `rec_b_${suffix}`,
        designation: 'Recruiter',
        status: 'ACTIVE',
      },
      company: {
        id: companyB.id,
        name: companyB.name,
        slug: companyB.slug,
        website: 'https://beta.example.com',
        industry: 'Fintech',
        size: '10-50',
        location: 'Mumbai, India',
        verified: true,
        status: 'ACTIVE',
      },
      membership: {
        id: `mem_b_${suffix}`,
        role: 'RECRUITER',
        status: 'ACTIVE',
        department: null,
        assignedJobIds: [],
        interviewTypes: [],
      },
      companyRole: 'RECRUITER',
      permissions: ROLE_PERMISSIONS['RECRUITER'],
    };

    // Candidate 1: Full experience, education, projects, certifications, links, resume
    candidateWithExperience = await db.user.create({
      data: {
        email: `candidate_exp${suffix}@example.com`,
        name: 'Diana Dev',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
        profile: {
          create: {
            headline: 'Senior Full Stack Engineer',
            location: 'Hyderabad, India',
            phone: '+91 9876543210',
            bio: 'Passionate software craftsman specializing in high-throughput distributed architectures.',
            candidateType: 'EXPERIENCED',
            totalExperience: '5 years',
          },
        },
      },
      include: { profile: true },
    });

    // Populate relations for Candidate 1
    await db.experience.create({
      data: {
        profileId: candidateWithExperience.profile.id,
        company: 'Stripe Global',
        roleTitle: 'Senior Software Engineer',
        employmentType: 'Full-time',
        location: 'Bengaluru, India',
        startDate: '2022-03',
        endDate: '2025-01',
        isCurrent: false,
        responsibilities: 'Architected payment routing engine processing 50k transactions/sec with 99.999% uptime.',
        description: 'Lead developer on core payment routing.',
      },
    });

    await db.education.create({
      data: {
        profileId: candidateWithExperience.profile.id,
        institution: 'National Institute of Technology',
        degree: 'Bachelor of Technology',
        fieldOfStudy: 'Computer Science & Engineering',
        location: 'Warangal, India',
        startYear: 2017,
        endYear: 2021,
        gpa: '9.4/10',
        coursework: 'Distributed Systems, Advanced Algorithms, Database Internals',
      },
    });

    const testSkill = await db.skill.upsert({
      where: { name: `Distributed Systems ${suffix}` },
      create: { name: `Distributed Systems ${suffix}`, category: 'Architecture' },
      update: {},
    });

    await db.userSkill.create({
      data: {
        profileId: candidateWithExperience.profile.id,
        skillId: testSkill.id,
        level: 'EXPERT',
        verified: true,
      },
    });

    await db.project.create({
      data: {
        profileId: candidateWithExperience.profile.id,
        title: 'VectorKV — Append-Only Storage Engine',
        description: 'Engineered a crash-safe key-value store using LSM trees and memory-mapped append logs.',
        role: 'Author & Maintainer',
        technologies: ['TypeScript', 'Rust', 'Node.js'],
        projectUrl: 'https://vectorkv.dev',
        githubUrl: 'https://github.com/dianadev/vectorkv',
      },
    });

    await db.certification.create({
      data: {
        profileId: candidateWithExperience.profile.id,
        name: 'AWS Certified Solutions Architect – Professional',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2024-05',
        credentialUrl: 'https://aws.amazon.com/verify/cert123',
      },
    });

    await db.professionalLink.create({
      data: {
        profileId: candidateWithExperience.profile.id,
        platform: 'GitHub',
        url: 'https://github.com/dianadev',
      },
    });

    await db.resume.create({
      data: {
        profileId: candidateWithExperience.profile.id,
        filename: 'Diana_Dev_Principal_Resume.pdf',
        fileType: 'application/pdf',
        fileSize: 1048576,
        status: 'READY',
        extractedData: JSON.stringify({
          rawText: 'Diana Dev\nSenior Full Stack Engineer\nStripe Global\nNIT Warangal',
        }),
      },
    });

    // Candidate 2: Genuine student with no prior work experience (hasNoExperience: true)
    candidateWithoutExperience = await db.user.create({
      data: {
        email: `student_noexp${suffix}@example.com`,
        name: 'Sam Student',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
        profile: {
          create: {
            headline: 'Aspiring Software Engineer & Computer Science Student',
            location: 'Chennai, India',
            phone: '+91 9123456789',
            bio: 'Student at Anna University with strong foundations in algorithms and React.',
            candidateType: 'STUDENT',
            totalExperience: '0 years',
          },
        },
      },
      include: { profile: true },
    });

    await db.education.create({
      data: {
        profileId: candidateWithoutExperience.profile.id,
        institution: 'Anna University',
        degree: 'B.Tech',
        fieldOfStudy: 'Information Technology',
        startYear: 2023,
        endYear: 2027,
        isCurrent: true,
        gpa: '8.8/10',
      },
    });

    await db.resume.create({
      data: {
        profileId: candidateWithoutExperience.profile.id,
        filename: 'Sam_Student_Resume.pdf',
        fileType: 'application/pdf',
        fileSize: 524288,
        status: 'READY',
        extractedData: JSON.stringify({
          rawText: 'Sam Student\nAnna University\nStudent Developer',
        }),
      },
    });

    // Candidate 3: Candidate who never uploaded a resume
    candidateWithoutResume = await db.user.create({
      data: {
        email: `no_resume${suffix}@example.com`,
        name: 'Ned NoResume',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
        profile: {
          create: {
            headline: 'Backend Developer',
            location: 'Delhi, India',
          },
        },
      },
      include: { profile: true },
    });

    // Create Jobs
    jobA = await db.job.create({
      data: {
        companyId: companyA.id,
        company: companyA.name,
        title: `Staff Backend Architect ${suffix}`,
        description: 'Core backend engineering role building high-throughput payment systems.',
        location: 'Bengaluru, India',
        workMode: 'HYBRID',
        employmentType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });

    jobB = await db.job.create({
      data: {
        companyId: companyB.id,
        company: companyB.name,
        title: `Frontend Engineer ${suffix}`,
        description: 'Frontend engineering role building reactive UI pipelines.',
        location: 'Mumbai, India',
        workMode: 'REMOTE',
        employmentType: 'FULL_TIME',
        experienceLevel: 'MID',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      },
    });

    // Create Applications
    appWithExperience = await db.jobApplication.create({
      data: {
        candidateId: candidateWithExperience.id,
        jobId: jobA.id,
        status: 'APPLIED',
        coverNote: 'Excited about building high-scale financial infrastructure at Acme.',
      },
    });

    appWithoutExperience = await db.jobApplication.create({
      data: {
        candidateId: candidateWithoutExperience.id,
        jobId: jobA.id,
        status: 'APPLIED',
        coverNote: 'Eager student looking for summer internship opportunity.',
      },
    });

    appWithoutResume = await db.jobApplication.create({
      data: {
        candidateId: candidateWithoutResume.id,
        jobId: jobA.id,
        status: 'APPLIED',
        resumeUrl: null,
      },
    });

    console.log('✓ Test entities setup complete.\n');

    // -------------------------------------------------------------------------
    // TEST 1: Candidate Profile & Relations Render Correctly
    // -------------------------------------------------------------------------
    console.log('--- TEST 1: Candidate Overview & Profile Relations ---');
    const detailA = await RecruiterApplicationService.getApplicationDetail(
      appWithExperience.id,
      companyA.id
    );

    assert(detailA.candidate.name === 'Diana Dev', 'Candidate name matches persisted record');
    assert(detailA.candidate.email === candidateWithExperience.email, 'Candidate email matches');
    assert(detailA.candidate.phone === '+91 9876543210', 'Candidate phone retrieved from profile');
    assert(detailA.candidate.location === 'Hyderabad, India', 'Candidate location retrieved from profile');
    assert(detailA.candidate.headline === 'Senior Full Stack Engineer', 'Candidate headline retrieved');
    assert(Boolean(detailA.candidate.bio?.includes('software craftsman')), 'Professional summary/bio retrieved');
    assert(detailA.jobTitle === jobA.title, 'Job applied for matches actual job');
    assert(Boolean(detailA.coverNote?.includes('high-scale financial infrastructure')), 'Cover note preserved');

    // -------------------------------------------------------------------------
    // TEST 2: Existing Work Experience Appears with Responsibilities
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 2: Work Experience Details ---');
    assert(detailA.candidate.experience.length === 1, 'Experience array contains 1 persisted record');
    const exp = detailA.candidate.experience[0];
    assert(exp.company === 'Stripe Global', 'Experience company is accurate');
    assert(exp.roleTitle === 'Senior Software Engineer', 'Experience role title is accurate');
    assert(exp.employmentType === 'Full-time', 'Employment type is included');
    assert(exp.location === 'Bengaluru, India', 'Location is included');
    assert(exp.startDate === '2022-03' && exp.endDate === '2025-01', 'Experience dates are included');
    assert(Boolean(exp.responsibilities?.includes('50k transactions/sec')), 'Responsibilities field is accurately returned');

    // -------------------------------------------------------------------------
    // TEST 3: Genuine Missing Work Experience Displays Empty State
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 3: Genuine Missing Work Experience ---');
    const detailNoExp = await RecruiterApplicationService.getApplicationDetail(
      appWithoutExperience.id,
      companyA.id
    );
    assert(detailNoExp.candidate.experience.length === 0, 'Candidate without experience returns empty array');
    assert(detailNoExp.candidate.education.length === 1, 'Candidate education is preserved despite 0 experience');
    assert(detailNoExp.candidate.education[0].institution === 'Anna University', 'Education institution matches');
    assert(detailNoExp.candidate.education[0].gpa === '8.8/10', 'Education grades/GPA is accurately returned');

    // -------------------------------------------------------------------------
    // TEST 4: Education, Skills, Projects, and Certifications Render Accurately
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 4: Education, Skills, Projects, Certifications ---');
    assert(detailA.candidate.education.length === 1, 'Education count is 1');
    const edu = detailA.candidate.education[0];
    assert(edu.institution === 'National Institute of Technology', 'Education institution is accurate');
    assert(edu.degree === 'Bachelor of Technology', 'Degree is accurate');
    assert(edu.fieldOfStudy === 'Computer Science & Engineering', 'Specialization is accurate');
    assert(edu.gpa === '9.4/10', 'GPA is accurate');
    assert(Boolean(edu.coursework?.includes('Distributed Systems')), 'Coursework is accurate');

    assert(detailA.candidate.skills.length >= 1, 'Skills count >= 1');
    assert(detailA.candidate.skills[0].level === 'EXPERT', 'Skill level is accurate');
    assert(detailA.candidate.skills[0].verified === true, 'Skill verification status is accurate');

    assert(detailA.candidate.projects.length === 1, 'Projects count is 1');
    const proj = detailA.candidate.projects[0];
    assert(proj.title === 'VectorKV — Append-Only Storage Engine', 'Project title is accurate');
    assert(proj.technologies.includes('Rust'), 'Project technologies included');
    assert(proj.githubUrl === 'https://github.com/dianadev/vectorkv', 'Project GitHub URL included');

    assert(detailA.candidate.certifications.length === 1, 'Certifications count is 1');
    const cert = detailA.candidate.certifications[0];
    assert(cert.name === 'AWS Certified Solutions Architect – Professional', 'Certification name matches');
    assert(cert.issuingOrganization === 'Amazon Web Services', 'Issuing organization matches');

    assert(detailA.candidate.professionalLinks.length === 1, 'Professional links count is 1');
    assert(detailA.candidate.professionalLinks[0].platform === 'GitHub', 'Link platform matches');

    // -------------------------------------------------------------------------
    // TEST 5: Resume Availability and Fallback Resolution
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 5: Resume Availability ---');
    assert(detailA.hasResume === true, 'Application reflects hasResume = true from canonical profile resume');
    assert(Boolean(detailA.resumeUrl?.includes(`/api/recruiter/applications/${appWithExperience.id}/resume`)), 'Resume URL routes to secure endpoint');
    assert(detailA.resumeFilename === 'Diana_Dev_Principal_Resume.pdf', 'Resume filename accurately surfaced');

    // Candidate without resume:
    const detailNoResume = await RecruiterApplicationService.getApplicationDetail(
      appWithoutResume.id,
      companyA.id
    );
    assert(detailNoResume.hasResume === false, 'Candidate with no resume returns hasResume = false');
    assert(detailNoResume.resumeUrl === null, 'Candidate with no resume returns resumeUrl = null');

    // -------------------------------------------------------------------------
    // TEST 6: Multi-Tenant Recruiter Authorization & IDOR Protection
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 6: Multi-Tenant Authorization (IDOR) ---');
    let idorBlocked = false;
    try {
      // Recruiter B belongs to Company B; attempting to access Company A's application
      await RecruiterApplicationService.getApplicationDetail(appWithExperience.id, companyB.id);
    } catch (err: any) {
      idorBlocked = true;
      assert(err.message.includes('not found') || err.message.includes('denied'), 'Recruiter B blocked from Recruiter A application');
    }
    assert(idorBlocked, 'IDOR cross-company application access blocked');

    // -------------------------------------------------------------------------
    // TEST 7: Pipeline Actions on Real Application & Transition Consistency
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 7: Real Application Pipeline Transitions ---');
    const updatedUnderReview = await RecruiterApplicationService.updateApplicationStatus(
      appWithExperience.id,
      companyA.id,
      'UNDER_REVIEW',
      'Candidate has top-tier background in distributed systems',
      authA
    );
    assert(updatedUnderReview.status === 'UNDER_REVIEW', 'Application transitioned to UNDER_REVIEW');
    assert(updatedUnderReview.feedback === 'Candidate has top-tier background in distributed systems', 'Internal recruiter feedback saved');

    const updatedShortlist = await RecruiterApplicationService.updateApplicationStatus(
      appWithExperience.id,
      companyA.id,
      'SHORTLISTED',
      'Shortlisted for technical loop',
      authA
    );
    assert(updatedShortlist.status === 'SHORTLISTED', 'Application transitioned to SHORTLISTED');

    // Verify in database directly
    const directDbApp = await db.jobApplication.findUnique({ where: { id: appWithExperience.id } });
    assert(directDbApp?.status === 'SHORTLISTED', 'Database record confirmed as SHORTLISTED');

    // -------------------------------------------------------------------------
    // TEST 8: Internal Recruiter Notes Never Exposed to Candidate
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 8: Internal Notes Privacy ---');
    const candidateView = await ApplicationService.getApplication(
      candidateWithExperience.id,
      appWithExperience.id
    );
    assert(candidateView?.status === 'SHORTLISTED', 'Candidate sees consistent application status');
    assert(candidateView?.feedback === null, 'Internal recruiter notes are NULL in candidate view');

    const candidateList = await ApplicationService.listApplications(candidateWithExperience.id);
    const candidateListApp = candidateList.items.find((i: any) => i.id === appWithExperience.id);
    assert(candidateListApp?.feedback === null, 'Internal recruiter notes are NULL in candidate applications list');

    // -------------------------------------------------------------------------
    // TEST 9: Scheduling Interview Operates on Application
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 9: Interview Scheduling Integration ---');
    const interview = await RecruiterInterviewService.scheduleInterview(
      {
        jobId: jobA.id,
        applicationId: appWithExperience.id,
        candidateId: candidateWithExperience.id,
        title: 'System Design Deep Dive',
        type: 'TECHNICAL',
        scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
        durationMinutes: 60,
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
      },
      authA
    );
    assert(interview.title === 'System Design Deep Dive', 'Interview title matches');

    const detailWithInterview = await RecruiterApplicationService.getApplicationDetail(
      appWithExperience.id,
      companyA.id
    );
    assert(detailWithInterview.interviews.length === 1, 'Application detail includes scheduled interview');
    assert(detailWithInterview.interviews[0].title === 'System Design Deep Dive', 'Interview title matches');
    assert(detailWithInterview.status === 'INTERVIEW', 'Application auto-advanced to INTERVIEW');

    // -------------------------------------------------------------------------
    // TEST 10: Extending Job Offer Operates on Application
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 10: Offer Extension Integration ---');
    const offer = await RecruiterOfferService.createOffer(
      {
        jobId: jobA.id,
        applicationId: appWithExperience.id,
        candidateId: candidateWithExperience.id,
        positionTitle: 'Staff Backend Architect',
        salaryOffered: 4500000,
        currency: 'INR',
        salaryPeriod: 'YEAR',
      },
      authA
    );
    assert(offer.salaryOffered === 4500000, 'Offer salary matches');

    const detailWithOffer = await RecruiterApplicationService.getApplicationDetail(
      appWithExperience.id,
      companyA.id
    );
    assert(detailWithOffer.offers.length === 1, 'Application detail includes extended offer');
    assert(detailWithOffer.offers[0].positionTitle === 'Staff Backend Architect', 'Offer title matches');
    assert(detailWithOffer.status === 'OFFER', 'Application auto-advanced to OFFER');

    // -------------------------------------------------------------------------
    // TEST 11: Non-Existent Application ID Throws (Not Empty Data)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST 11: Invalid Application ID Handling ---');
    let notFoundCaught = false;
    try {
      await RecruiterApplicationService.getApplicationDetail('000000000000000000000000', companyA.id);
    } catch (err: any) {
      notFoundCaught = true;
      assert(err.message.includes('not found') || err.message.includes('denied'), 'Non-existent ID correctly throws error');
    }
    assert(notFoundCaught, 'Server error / not-found not misrepresented as empty candidate data');

  } catch (error: any) {
    console.error('Test execution failed with unhandled error:', error);
    failed++;
  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    console.log('\n--- Cleanup: Removing Test Data ---');
    try {
      if (appWithExperience) await db.jobApplication.deleteMany({ where: { id: appWithExperience.id } });
      if (appWithoutExperience) await db.jobApplication.deleteMany({ where: { id: appWithoutExperience.id } });
      if (appWithoutResume) await db.jobApplication.deleteMany({ where: { id: appWithoutResume.id } });
      if (jobA) await db.job.deleteMany({ where: { id: jobA.id } });
      if (jobB) await db.job.deleteMany({ where: { id: jobB.id } });
      if (candidateWithExperience) await db.user.deleteMany({ where: { id: candidateWithExperience.id } });
      if (candidateWithoutExperience) await db.user.deleteMany({ where: { id: candidateWithoutExperience.id } });
      if (candidateWithoutResume) await db.user.deleteMany({ where: { id: candidateWithoutResume.id } });
      if (recruiterUserA) await db.user.deleteMany({ where: { id: recruiterUserA.id } });
      if (recruiterUserB) await db.user.deleteMany({ where: { id: recruiterUserB.id } });
      if (companyA) await db.company.deleteMany({ where: { id: companyA.id } });
      if (companyB) await db.company.deleteMany({ where: { id: companyB.id } });
      console.log('✓ Cleanup completed.');
    } catch (cleanErr) {
      console.warn('Warning during cleanup:', cleanErr);
    }
  }

  console.log('\n========================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCandidateApplicationDetailsTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
