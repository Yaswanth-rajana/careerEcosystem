import { db } from '../db/client';
import { ApplicationService } from '../services/applicationService';
import { RecruiterApplicationService } from '../services/recruiter/recruiterApplicationService';
import { FileValidationService } from '../services/tools/file-validation-service';
import { StorageFactory } from '../services/tools/storage-provider';

async function runJobApplicationResumeFlowTests() {
  console.log('🚀 Starting Job Application Resume Selection & Upload Test Suite...\n');

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
  let candidate1: any;
  let candidate2: any;
  let candidateNoResume: any;
  let jobA: any;
  let jobB: any;
  let profile1: any;
  let profile2: any;
  let resume1: any;
  let resume2: any;
  let resume3_newer: any;

  try {
    console.log('--- 1. Setup Test Companies, Jobs, Candidates & Profiles ---');

    companyA = await db.company.create({
      data: {
        name: `Acme Robotics ${suffix}`,
        slug: `acme-robotics-${suffix}`,
        website: 'https://acme-robotics.example.com',
        industry: 'Robotics',
        size: '100-250',
        location: 'Bengaluru, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    companyB = await db.company.create({
      data: {
        name: `Beta Cloud ${suffix}`,
        slug: `beta-cloud-${suffix}`,
        website: 'https://beta-cloud.example.com',
        industry: 'Cloud',
        size: '20-50',
        location: 'Pune, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    recruiterUserA = await db.user.create({
      data: {
        email: `recruiter_a${suffix}@acme.com`,
        name: 'Rachel Recruiter',
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

    await db.companyMember.create({
      data: {
        companyId: companyA.id,
        userId: recruiterUserA.id,
        role: 'RECRUITER',
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

    candidate1 = await db.user.create({
      data: {
        email: `candidate1${suffix}@example.com`,
        name: 'Alex Johnson',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    candidate2 = await db.user.create({
      data: {
        email: `candidate2${suffix}@example.com`,
        name: 'Sam Rivera',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    candidateNoResume = await db.user.create({
      data: {
        email: `candidate_no_resume${suffix}@example.com`,
        name: 'Jordan Lee',
        role: 'CANDIDATE',
        status: 'ACTIVE',
      },
    });

    profile1 = await db.profile.create({
      data: {
        userId: candidate1.id,
        candidateType: 'EXPERIENCED',
        headline: 'Staff Software Engineer',
        location: 'Bengaluru, India',
      },
    });

    profile2 = await db.profile.create({
      data: {
        userId: candidate2.id,
        candidateType: 'STUDENT',
        headline: 'Junior Developer',
        location: 'Hyderabad, India',
      },
    });

    jobA = await db.job.create({
      data: {
        companyId: companyA.id,
        title: `Robotics Systems Engineer ${suffix}`,
        company: companyA.name,
        location: 'Bengaluru, India',
        workMode: 'On-site',
        employmentType: 'Full-time',
        experienceLevel: '3-5 years',
        skills: ['C++', 'ROS', 'Python'],
        description: 'Lead robotics systems development and autonomous algorithms.',
        status: 'PUBLISHED',
      },
    });

    jobB = await db.job.create({
      data: {
        companyId: companyB.id,
        title: `Cloud Infrastructure Architect ${suffix}`,
        company: companyB.name,
        location: 'Pune, India',
        workMode: 'Remote',
        employmentType: 'Full-time',
        experienceLevel: '5+ years',
        skills: ['AWS', 'Kubernetes', 'Terraform'],
        description: 'Design highly available scalable cloud architectures.',
        status: 'PUBLISHED',
      },
    });

    console.log('--- 2. Test File Signatures, Extensions & Limits ---');

    // 1. Valid PDF buffer
    const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
    const validPdfExt = FileValidationService.getExtension('Alex_Johnson_Resume_v1.pdf');
    assert(validPdfExt === 'pdf', '1. Correctly extracts PDF extension');
    try {
      FileValidationService.validateFileSignature(validPdfBuffer, 'pdf');
      assert(true, '1. Valid PDF file signature accepted');
    } catch {
      assert(false, '1. Valid PDF file signature accepted');
    }

    // 2. Valid DOCX buffer (starts with PK\x03\x04)
    const validDocxBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
    const validDocxExt = FileValidationService.getExtension('Alex_Johnson_CV.docx');
    assert(validDocxExt === 'docx', '2. Correctly extracts DOCX extension');
    try {
      FileValidationService.validateFileSignature(validDocxBuffer, 'docx');
      assert(true, '2. Valid DOCX file signature accepted');
    } catch {
      assert(false, '2. Valid DOCX file signature accepted');
    }

    // 3. Spoofed file rejected (plain text renamed to .pdf)
    const spoofedBuffer = Buffer.from('This is a plain text file pretending to be a PDF.');
    try {
      FileValidationService.validateFileSignature(spoofedBuffer, 'pdf');
      assert(false, '3. Rejects spoofed text file masquerading as PDF');
    } catch (err: any) {
      assert(err.code === 'INVALID_FILE_SIGNATURE', '3. Rejects spoofed text file masquerading as PDF');
    }

    // 4. Oversized file validation
    const elevenMb = 11 * 1024 * 1024;
    try {
      FileValidationService.validateResumeFileSize(elevenMb);
      assert(false, '4. Oversized file (>10MB) rejected');
    } catch (err: any) {
      assert(err.code === 'FILE_TOO_LARGE', '4. Oversized file (>10MB) rejected');
    }

    // Create Candidate 1 Saved Resume in storage & db
    resume1 = await db.resume.create({
      data: {
        profileId: profile1.id,
        filename: 'Alex_Johnson_Robotics_Resume_2025.pdf',
        fileType: 'application/pdf',
        fileSize: validPdfBuffer.length,
        status: 'READY',
      },
    });

    const storage = StorageFactory.getProvider();
    await storage.upload(`resumes/${resume1.id}/${resume1.filename}`, validPdfBuffer, 'application/pdf');

    // Create Candidate 2 Saved Resume in storage & db
    resume2 = await db.resume.create({
      data: {
        profileId: profile2.id,
        filename: 'Sam_Rivera_Portfolio.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        fileSize: validDocxBuffer.length,
        status: 'READY',
      },
    });
    await storage.upload(`resumes/${resume2.id}/${resume2.filename}`, validDocxBuffer, 'application/docx');

    console.log('--- 3. Test Resume Selection, Ownership & Submission Flow ---');

    // 5. Candidate 1 selects existing saved resume to apply to Job A
    const app1 = await ApplicationService.applyToJob(candidate1.id, jobA.id, {
      resumeId: resume1.id,
      coverNote: 'Excited about autonomous robotics algorithms!',
    });

    assert(app1.id !== undefined, '5. Candidate can apply with existing saved resume');
    assert(app1.resumeId === resume1.id, '8. Application stores exact submitted resumeId');
    assert(app1.resumeFilename === resume1.filename, '8. Application stores exact submitted resumeFilename snapshot');
    assert(app1.resumeFileSize === resume1.fileSize, '8. Application stores exact submitted resumeFileSize');
    assert(app1.resumeFileType === resume1.fileType, '8. Application stores exact submitted resumeFileType');
    assert(app1.coverNote === 'Excited about autonomous robotics algorithms!', 'Persists optional recruiter note');

    // 6. IDOR: Candidate 1 cannot attach Candidate 2's resume
    try {
      await ApplicationService.applyToJob(candidate1.id, jobB.id, {
        resumeId: resume2.id, // belongs to candidate 2!
      });
      assert(false, '6. Candidate cannot attach another candidate resume');
    } catch (err: any) {
      assert(
        err.message.includes('not found') || err.message.includes('permission'),
        '6. Candidate cannot attach another candidate resume'
      );
    }

    // 7. Candidate cannot submit without a resume (Candidate with no saved resume passes nothing)
    try {
      await ApplicationService.applyToJob(candidateNoResume.id, jobA.id, {
        coverNote: 'Applying with no resume attached',
      });
      assert(false, '7. Candidate cannot submit without a resume');
    } catch (err: any) {
      assert(
        err.message.includes('A resume must be selected or uploaded'),
        '7. Candidate cannot submit without a resume'
      );
    }

    // 13. Duplicate application attempts are rejected
    try {
      await ApplicationService.applyToJob(candidate1.id, jobA.id, {
        resumeId: resume1.id,
      });
      assert(false, '13. Duplicate application attempt rejected');
    } catch (err: any) {
      assert(
        err.message.includes('already submitted an application'),
        '13. Duplicate application attempt rejected'
      );
    }

    console.log('--- 4. Test Recruiter Authorization & Resume Access ---');

    // 9. Recruiter A (authorized for Job A's company) can access application details and submitted resume
    const recruiterViewA = await RecruiterApplicationService.getApplicationDetail(app1.id, companyA.id);
    assert(recruiterViewA.hasResume === true, '9. Recruiter authorized for job sees hasResume=true');
    assert(recruiterViewA.resumeFilename === 'Alex_Johnson_Robotics_Resume_2025.pdf', '9. Recruiter sees exact submitted resume filename');
    assert(recruiterViewA.resumeId === resume1.id, '9. Recruiter sees exact submitted resumeId');
    assert(recruiterViewA.resumeFileSize === resume1.fileSize, '9. Recruiter sees submitted resumeFileSize');

    // 10. Recruiter B (Beta Cloud, company B) cannot access application for Job A
    try {
      await RecruiterApplicationService.getApplicationDetail(app1.id, companyB.id);
      assert(false, '10. Unrelated recruiter denied access to application');
    } catch (err: any) {
      assert(
        err.message.includes('not found') || err.message.includes('access denied'),
        '10. Unrelated recruiter denied access to application'
      );
    }

    console.log('--- 5. Test Historical Resume Immutability ---');

    // 11. Candidate 1 uploads a brand-new primary resume to their profile
    resume3_newer = await db.resume.create({
      data: {
        profileId: profile1.id,
        filename: 'Alex_Johnson_NEW_Updated_Resume_2026.pdf',
        fileType: 'application/pdf',
        fileSize: 4567,
        status: 'READY',
      },
    });

    // Check recruiter view of earlier application (app1)
    const recruiterViewAfterUpdate = await RecruiterApplicationService.getApplicationDetail(app1.id, companyA.id);
    assert(
      recruiterViewAfterUpdate.resumeFilename === 'Alex_Johnson_Robotics_Resume_2025.pdf',
      '11. Earlier application retains original submitted resume filename after profile resume update'
    );
    assert(
      recruiterViewAfterUpdate.resumeId === resume1.id,
      '11. Earlier application retains original submitted resumeId after profile resume update'
    );
    assert(
      recruiterViewAfterUpdate.resumeFilename !== resume3_newer.filename,
      '11. Subsequent profile resume does not rewrite earlier application resume'
    );

    // Check candidate view of earlier application
    const candidateAppView = await ApplicationService.getApplication(candidate1.id, app1.id);
    assert(
      candidateAppView?.resumeFilename === 'Alex_Johnson_Robotics_Resume_2025.pdf',
      '15. Candidate application view shows exact submitted resume filename'
    );
    assert(
      candidateAppView?.resumeFilename === recruiterViewAfterUpdate.resumeFilename,
      '15. Candidate and recruiter views show consistent resume filenames'
    );

    console.log('--- 6. Test Orphan Cleanup on Failed Application Creation ---');

    // 12. Simulate newly uploaded resume for an invalid/duplicate application attempt
    const orphanedResume = await db.resume.create({
      data: {
        profileId: profile1.id,
        filename: 'Temporary_Upload_Failed_App.pdf',
        fileType: 'application/pdf',
        fileSize: 1234,
        status: 'READY',
      },
    });
    const orphanStorageKey = `resumes/${orphanedResume.id}/${orphanedResume.filename}`;
    await storage.upload(orphanStorageKey, validPdfBuffer, 'application/pdf');
    assert(await storage.exists(orphanStorageKey), 'Orphan test file initially exists in storage');

    // Attempting to apply to Job A again (which will fail because candidate already applied)
    try {
      await ApplicationService.applyToJob(candidate1.id, jobA.id, {
        resumeId: orphanedResume.id,
        isNewUpload: true, // uploaded specifically during this failed attempt
      });
      assert(false, '12. Duplicate submission should throw error');
    } catch (err: any) {
      assert(true, '12. Duplicate application threw error as expected');
    }

    // Verify orphaned storage file and db record were cleaned up
    const orphanStillInStorage = await storage.exists(orphanStorageKey);
    const orphanStillInDb = await db.resume.findUnique({ where: { id: orphanedResume.id } });
    assert(!orphanStillInStorage, '12. Orphaned storage file cleaned up on failure');
    assert(!orphanStillInDb, '12. Orphaned resume db record deleted on failure');

    // Ensure Candidate 1's pre-existing resume was NEVER touched
    const originalResumeStillExists = await db.resume.findUnique({ where: { id: resume1.id } });
    assert(originalResumeStillExists !== null, '12. Candidate pre-existing resume preserved and not deleted');

    console.log('--- 7. Test Legacy Applications Without Resume ---');

    // 14. Create legacy application with null resume fields
    const legacyApp = await db.jobApplication.create({
      data: {
        candidateId: candidateNoResume.id,
        jobId: jobB.id,
        status: 'APPLIED',
        coverNote: 'Legacy applicant from older system version',
        resumeId: null,
        resumeFilename: null,
        resumeFileSize: null,
        resumeFileType: null,
        resumeUrl: null,
      },
    });

    const legacyRecruiterView = await RecruiterApplicationService.getApplicationDetail(legacyApp.id, companyB.id);
    assert(legacyRecruiterView !== null, '14. Legacy application loads successfully in recruiter view');
    assert(legacyRecruiterView.hasResume === false, '14. Legacy application shows hasResume=false when no resume submitted');
    assert(legacyRecruiterView.resumeFilename === null, '14. Legacy application shows null resumeFilename');

    const legacyCandidateView = await ApplicationService.getApplication(candidateNoResume.id, legacyApp.id);
    assert(legacyCandidateView !== null, '14. Legacy application loads successfully in candidate view');
    assert(legacyCandidateView?.resumeFilename === null, '14. Legacy candidate view shows null resumeFilename');

    // Clean up test legacy app
    await db.jobApplication.delete({ where: { id: legacyApp.id } });

  } catch (error: any) {
    console.error('Unexpected test suite error:', error);
    failed++;
  } finally {
    console.log('--- Teardown: Clean up test records ---');
    try {
      const storage = StorageFactory.getProvider();
      if (resume1) await storage.delete(`resumes/${resume1.id}/${resume1.filename}`);
      if (resume2) await storage.delete(`resumes/${resume2.id}/${resume2.filename}`);

      if (candidate1 && jobA) {
        await db.jobApplication.deleteMany({ where: { candidateId: candidate1.id } });
      }
      if (candidateNoResume) {
        await db.jobApplication.deleteMany({ where: { candidateId: candidateNoResume.id } });
      }
      if (profile1) await db.resume.deleteMany({ where: { profileId: profile1.id } });
      if (profile2) await db.resume.deleteMany({ where: { profileId: profile2.id } });
      if (jobA) await db.job.delete({ where: { id: jobA.id } });
      if (jobB) await db.job.delete({ where: { id: jobB.id } });
      if (companyA) {
        await db.companyMember.deleteMany({ where: { companyId: companyA.id } });
        await db.company.delete({ where: { id: companyA.id } });
      }
      if (companyB) {
        await db.companyMember.deleteMany({ where: { companyId: companyB.id } });
        await db.company.delete({ where: { id: companyB.id } });
      }
      if (profile1) await db.profile.delete({ where: { id: profile1.id } });
      if (profile2) await db.profile.delete({ where: { id: profile2.id } });
      if (recruiterUserA) await db.user.delete({ where: { id: recruiterUserA.id } });
      if (recruiterUserB) await db.user.delete({ where: { id: recruiterUserB.id } });
      if (candidate1) await db.user.delete({ where: { id: candidate1.id } });
      if (candidate2) await db.user.delete({ where: { id: candidate2.id } });
      if (candidateNoResume) await db.user.delete({ where: { id: candidateNoResume.id } });
      console.log('✓ Teardown complete.\n');
    } catch (cleanupErr) {
      console.warn('Warning during teardown:', cleanupErr);
    }
  }

  console.log('========================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runJobApplicationResumeFlowTests();
