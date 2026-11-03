/**
 * PATHWAY.ECO — Phase 13 P1 Security Remediation Automated Verification Suite
 *
 * Verifies non-destructively:
 * Priority 1: Registration role restriction & escalation prevention.
 * Priority 2: Recruiter company takeover prevention (must match approvedApp.userId).
 * Priority 3: Mentor profile hijacking prevention (candidates rejected, must match app.userId).
 * Priority 4: Google OAuth anti-pre-hijacking (proof of ownership required for existing password accounts).
 * Priority 6: Mentor remote image wildcard removal.
 */

import path from 'path';
import fs from 'fs';

// Setup @backend/ module alias for Node CJS runtime
const Module = require('module');
const origResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request.startsWith('@backend/')) {
    const subPath = request.replace('@backend/', '');
    request = path.resolve(__dirname, '..', subPath);
  }
  return origResolveFilename.call(this, request, parent, isMain, options);
};

// Imports
const { SignUpSchema } = require('../validations/schemas');
const { POST: registerPOST } = require('../../../frontend/src/app/api/auth/register/route');
const { UserService } = require('../services/userService');
const { RecruiterAuthService, RecruiterAuthError } = require('../services/recruiter/recruiterAuthService');
const { MentorAuthService, MentorAuthError } = require('../services/mentorship/mentorAuthService');
const { hashPassword, comparePassword } = require('../auth/security');

async function runP1Tests() {
  console.log('\n========================================================================');
  console.log('🧪 PATHWAY.ECO Phase 13 P1 Account Security & Remediation Test Suite');
  console.log('========================================================================\n');

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

  // =========================================================================
  // PRIORITY 1: REGISTRATION & ROLE ESCALATION
  // =========================================================================
  console.log('--- Priority 1: Registration & Role Escalation Prevention ---');

  // 1.1: SignUpSchema rejects self-assigned RECRUITER
  try {
    SignUpSchema.parse({
      name: 'Attacker Recruiter',
      email: 'attacker@example.com',
      password: 'Password123!',
      role: 'RECRUITER',
    });
    assert(false, '1.1: SignUpSchema should reject role: RECRUITER');
  } catch (err: any) {
    assert(true, '1.1: SignUpSchema rejects role: RECRUITER');
  }

  // 1.2: SignUpSchema rejects self-assigned MENTOR
  try {
    SignUpSchema.parse({
      name: 'Attacker Mentor',
      email: 'attacker_mentor@example.com',
      password: 'Password123!',
      role: 'MENTOR',
    });
    assert(false, '1.2: SignUpSchema should reject role: MENTOR');
  } catch (err: any) {
    assert(true, '1.2: SignUpSchema rejects role: MENTOR');
  }

  // 1.3: SignUpSchema rejects self-assigned ADMIN
  try {
    SignUpSchema.parse({
      name: 'Attacker Admin',
      email: 'attacker_admin@example.com',
      password: 'Password123!',
      role: 'ADMIN',
    });
    assert(false, '1.3: SignUpSchema should reject role: ADMIN');
  } catch (err: any) {
    assert(true, '1.3: SignUpSchema rejects role: ADMIN');
  }

  // 1.4: SignUpSchema accepts explicit CANDIDATE
  const validCandidate = SignUpSchema.parse({
    name: 'Valid Student',
    email: 'student@example.com',
    password: 'Password123!',
    role: 'CANDIDATE',
  });
  assert(validCandidate.role === 'CANDIDATE', '1.4: SignUpSchema accepts explicit role: CANDIDATE');

  // 1.5: SignUpSchema defaults to CANDIDATE when role omitted
  const defaultCandidate = SignUpSchema.parse({
    name: 'Default Student',
    email: 'default_student@example.com',
    password: 'Password123!',
  });
  assert(defaultCandidate.role === 'CANDIDATE', '1.5: SignUpSchema defaults omitted role to CANDIDATE');

  // 1.6: /api/auth/register route rejects role escalation with HTTP 400
  const reqEscalation = new Request('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Privilege Escalation Attacker',
      email: 'escalate@example.com',
      password: 'Password123!',
      role: 'RECRUITER',
    }),
  });
  const resEscalation = await registerPOST(reqEscalation);
  const bodyEscalation = await resEscalation.json();
  assert(resEscalation.status === 400, '1.6: Register Route Handler rejects role escalation with HTTP 400');
  assert(Boolean(bodyEscalation.error), '1.6: Register Route Handler returns descriptive error message');

  // =========================================================================
  // PRIORITY 2: RECRUITER & COMPANY OWNERSHIP
  // =========================================================================
  console.log('\n--- Priority 2: Recruiter & Company Takeover Prevention ---');

  // Mock UserService.getSession and db for isolated testing
  const origGetSession = UserService.getSession;
  const { db } = require('../db/client');
  const origUserFindUnique = db.user.findUnique;
  const origRecruiterProfileFindUnique = db.recruiterProfile.findUnique;
  const origEmployerAppFindFirst = db.employerApplication.findFirst;
  const origCompanyMemberFindUnique = db.companyMember.findUnique;

  try {
    // 2.1: Candidate role cannot call verifyRecruiter
    UserService.getSession = async () => ({ id: 'cand_user_1' });
    db.user.findUnique = async () => ({
      id: 'cand_user_1',
      email: 'student@example.com',
      name: 'Candidate User',
      role: 'CANDIDATE',
      status: 'ACTIVE',
    });

    try {
      await RecruiterAuthService.verifyRecruiter('dummy_session_token');
      assert(false, '2.1: Candidates should be rejected from recruiter portal');
    } catch (err: any) {
      assert(err instanceof RecruiterAuthError, '2.1: Throws RecruiterAuthError for non-recruiter role');
      assert(err.statusCode === 403, '2.1: Returns 403 Forbidden for candidate attempting recruiter access');
    }

    // 2.2: Recruiter user whose email matches approved EmployerApplication, but app.userId !== fullUser.id
    // (Prevents unverified employer company takeover based on email string)
    UserService.getSession = async () => ({ id: 'attacker_recruiter_2' });
    db.user.findUnique = async () => ({
      id: 'attacker_recruiter_2',
      email: 'ceo@acmecorp.com',
      name: 'Attacker Recruiter',
      role: 'RECRUITER',
      status: 'ACTIVE',
    });
    db.recruiterProfile.findUnique = async () => null; // No profile yet
    db.employerApplication.findFirst = async (opts: any) => {
      // If query requires userId: 'attacker_recruiter_2', it returns null because it was approved for the real owner
      if (opts?.where?.userId === 'attacker_recruiter_2') {
        return null;
      }
      return {
        id: 'app_123',
        workEmail: 'ceo@acmecorp.com',
        userId: 'legitimate_ceo_id',
        companyId: 'company_acme',
        status: 'APPROVED',
      };
    };

    try {
      await RecruiterAuthService.verifyRecruiter('dummy_session_token');
      assert(false, '2.2: Should reject unlinked recruiter from auto-claiming company');
    } catch (err: any) {
      assert(err.statusCode === 403, '2.2: Rejects recruiter when application userId does not match fullUser.id');
      assert(err.message.includes('No recruiter profile exists'), '2.2: Enforces trusted approval linking before company access');
    }

    // 2.3: Recruiter user where app.userId === fullUser.id succeeds in legitimate linking
    db.employerApplication.findFirst = async (opts: any) => {
      if (opts?.where?.userId === 'legitimate_recruiter_3') {
        return {
          id: 'app_456',
          workEmail: 'recruiter@tech.com',
          userId: 'legitimate_recruiter_3',
          companyId: 'company_tech',
          status: 'APPROVED',
          designation: 'Talent Lead',
        };
      }
      return null;
    };
    db.company.findUnique = async () => ({ id: 'company_tech', name: 'Tech Inc', status: 'ACTIVE' });
    db.recruiterProfile.create = async (opts: any) => ({
      id: 'rec_prof_1',
      userId: opts.data.userId,
      companyId: opts.data.companyId,
      status: 'ACTIVE',
      company: { id: 'company_tech', name: 'Tech Inc', status: 'ACTIVE' },
    });
    db.companyMember.upsert = async () => ({});
    db.companyMember.findUnique = async () => ({
      id: 'member_1',
      companyId: 'company_tech',
      userId: 'legitimate_recruiter_3',
      role: 'COMPANY_ADMIN',
      status: 'ACTIVE',
    });

    UserService.getSession = async () => ({ id: 'legitimate_recruiter_3' });
    db.user.findUnique = async () => ({
      id: 'legitimate_recruiter_3',
      email: 'recruiter@tech.com',
      name: 'Legitimate Recruiter',
      role: 'RECRUITER',
      status: 'ACTIVE',
    });

    const legitimateRecruiter = await RecruiterAuthService.verifyRecruiter('dummy_session_token');
    assert(legitimateRecruiter.user.id === 'legitimate_recruiter_3', '2.3: Legitimate verified recruiter is authorized');
    assert(legitimateRecruiter.companyRole === 'COMPANY_ADMIN', '2.3: Legitimate approved employer owner receives COMPANY_ADMIN');

  } finally {
    UserService.getSession = origGetSession;
    db.user.findUnique = origUserFindUnique;
    db.recruiterProfile.findUnique = origRecruiterProfileFindUnique;
    db.employerApplication.findFirst = origEmployerAppFindFirst;
    db.companyMember.findUnique = origCompanyMemberFindUnique;
  }

  // =========================================================================
  // PRIORITY 3: MENTOR PROFILE OWNERSHIP
  // =========================================================================
  console.log('\n--- Priority 3: Mentor Profile Hijacking Prevention ---');

  const origMentorFindFirst = db.mentor.findFirst;
  const origMentorAppFindFirst = db.mentorApplication.findFirst;

  try {
    // 3.1: Candidate user cannot call verifyMentor or claim mentor profile
    UserService.getSession = async () => ({ id: 'candidate_user_10' });
    db.user.findUnique = async () => ({
      id: 'candidate_user_10',
      email: 'candidate@pathway.eco',
      name: 'Student Candidate',
      role: 'CANDIDATE',
      status: 'ACTIVE',
    });

    try {
      await MentorAuthService.verifyMentor('dummy_token');
      assert(false, '3.1: Candidate should be rejected from Mentor portal');
    } catch (err: any) {
      assert(err instanceof MentorAuthError, '3.1: Throws MentorAuthError for candidate role');
      assert(err.statusCode === 403, '3.1: Returns 403 Forbidden for candidate attempting mentor portal access');
      assert(err.message.includes('Candidates cannot access or claim mentor profiles'), '3.1: Clear role separation enforced');
    }

    // 3.2: Mentor user cannot claim another user's mentor record
    UserService.getSession = async () => ({ id: 'mentor_user_20' });
    db.user.findUnique = async () => ({
      id: 'mentor_user_20',
      email: 'dr.smith@example.com',
      name: 'Attacker Mentor',
      role: 'MENTOR',
      status: 'ACTIVE',
    });
    // Mentor record already linked to another user
    db.mentor.findFirst = async (opts: any) => {
      if (opts?.where?.userId === 'mentor_user_20') return null;
      return {
        id: 'mentor_rec_smith',
        userId: 'legitimate_dr_smith_id', // Linked to someone else!
        email: 'dr.smith@example.com',
        status: 'APPROVED',
      };
    };
    db.mentorApplication.findFirst = async () => null;

    try {
      await MentorAuthService.verifyMentor('dummy_token');
      assert(false, '3.2: Should reject claiming another user mentor record');
    } catch (err: any) {
      assert(err.statusCode === 403, '3.2: Rejects user attempting to access unlinked/unauthorized mentor profile');
    }

    // 3.3: Verified linked mentor succeeds
    db.mentor.findFirst = async (opts: any) => {
      if (opts?.where?.userId === 'verified_mentor_30') {
        return {
          id: 'mentor_rec_verified',
          userId: 'verified_mentor_30',
          email: 'verified_mentor@example.com',
          name: 'Verified Mentor',
          status: 'APPROVED',
          headline: 'Principal Engineer',
          domain: 'Engineering',
        };
      }
      return null;
    };
    UserService.getSession = async () => ({ id: 'verified_mentor_30' });
    db.user.findUnique = async () => ({
      id: 'verified_mentor_30',
      email: 'verified_mentor@example.com',
      name: 'Verified Mentor',
      role: 'MENTOR',
      status: 'ACTIVE',
    });

    const verifiedMentor = await MentorAuthService.verifyMentor('dummy_token');
    assert(verifiedMentor.mentor.id === 'mentor_rec_verified', '3.3: Verified linked mentor accesses portal successfully');

  } finally {
    UserService.getSession = origGetSession;
    db.user.findUnique = origUserFindUnique;
    db.mentor.findFirst = origMentorFindFirst;
    db.mentorApplication.findFirst = origMentorAppFindFirst;
  }

  // =========================================================================
  // PRIORITY 4: GOOGLE OAUTH ANTI-PRE-HIJACKING & ACCOUNT LINKING
  // =========================================================================
  console.log('\n--- Priority 4: Google OAuth Anti-Pre-Hijacking & Safe Account Linking ---');

  const origCreateSession = UserService.createSession;
  UserService.createSession = async (uid: string) => `session_token_${uid}`;

  try {
    const knownPassword = 'LegitPassword123!';
    const passwordHash = await hashPassword(knownPassword);

    // 4.1: Pre-registration attack simulation:
    // Existing account has passwordHash, but NOT googleId.
    // Attacker pre-registered victim@gmail.com with their own password.
    // Victim signs in with Google WITHOUT knowing or providing the password.
    // MUST BE REJECTED!
    db.user.findFirst = async () => null; // No user with this googleId
    db.user.findUnique = async () => ({
      id: 'victim_account_id',
      email: 'victim@gmail.com',
      passwordHash,
      googleId: null,
      role: 'CANDIDATE',
      isOnboarded: false,
    });

    try {
      await UserService.authenticateWithGoogle({
        googleId: 'google_sub_victim',
        email: 'victim@gmail.com',
        emailVerified: true,
        name: 'Victim User',
      });
      assert(false, '4.1: Pre-registration attack should be rejected when password is not verified');
    } catch (err: any) {
      assert(
        err.message.includes('verify ownership by providing your account password'),
        '4.1: Pre-registration attack rejected: requires account password proof of ownership'
      );
    }

    // 4.2: Linking with incorrect password is rejected
    try {
      await UserService.authenticateWithGoogle({
        googleId: 'google_sub_victim',
        email: 'victim@gmail.com',
        emailVerified: true,
        name: 'Victim User',
        linkPassword: 'WrongPassword999!',
      });
      assert(false, '4.2: Linking with invalid password should fail');
    } catch (err: any) {
      assert(
        err.message.includes('Invalid account password'),
        '4.2: Rejects linking when password does not match'
      );
    }

    // 4.3: Linking with VALID password succeeds in safe linking
    let updatedUser: any = null;
    db.user.update = async (opts: any) => {
      updatedUser = {
        id: 'victim_account_id',
        email: 'victim@gmail.com',
        name: 'Victim User',
        role: 'CANDIDATE',
        googleId: opts.data.googleId,
        isOnboarded: false,
        passwordHash, // passwordHash preserved!
      };
      return updatedUser;
    };

    const linkSuccess = await UserService.authenticateWithGoogle({
      googleId: 'google_sub_victim',
      email: 'victim@gmail.com',
      emailVerified: true,
      name: 'Victim User',
      linkPassword: knownPassword,
    });

    assert(linkSuccess.user.id === 'victim_account_id', '4.3: Safe linking succeeds with verified password');
    assert(Boolean(updatedUser && updatedUser.passwordHash), '4.3: Existing passwordHash is preserved intact');

    // 4.4: Returning Google user logs in without needing password
    db.user.findFirst = async (opts: any) => {
      if (opts?.where?.googleId === 'google_sub_victim') {
        return {
          id: 'victim_account_id',
          email: 'victim@gmail.com',
          name: 'Victim User',
          role: 'CANDIDATE',
          googleId: 'google_sub_victim',
          isOnboarded: false,
        };
      }
      return null;
    };

    const returningResult = await UserService.authenticateWithGoogle({
      googleId: 'google_sub_victim',
      email: 'victim@gmail.com',
      emailVerified: true,
      name: 'Victim User',
    });
    assert(returningResult.user.id === 'victim_account_id', '4.4: Returning linked Google user authenticates seamlessly');

    // 4.5: Conflicting identities: Account already linked to a different googleId
    db.user.findFirst = async () => null;
    db.user.findUnique = async () => ({
      id: 'existing_linked_id',
      email: 'user@example.com',
      googleId: 'original_google_id_111',
    });

    try {
      await UserService.authenticateWithGoogle({
        googleId: 'attacker_google_id_222',
        email: 'user@example.com',
        emailVerified: true,
        name: 'Attacker',
      });
      assert(false, '4.5: Should reject conflicting googleId');
    } catch (err: any) {
      assert(
        err.message.includes('already linked to a different Google account'),
        '4.5: Rejects conflicting Google identity linking'
      );
    }

  } finally {
    UserService.createSession = origCreateSession;
    db.user.findFirst = origUserFindUnique;
    db.user.findUnique = origUserFindUnique;
  }

  // =========================================================================
  // PRIORITY 6: MENTOR IMAGE CONFIGURATION
  // =========================================================================
  console.log('\n--- Priority 6: Mentor Remote Image Configuration ---');

  const mentorConfigPath = path.resolve(__dirname, '../../../mentor/next.config.js');
  const mentorConfigContent = fs.readFileSync(mentorConfigPath, 'utf8');

  assert(!mentorConfigContent.includes("hostname: '**'"), '6.1: mentor/next.config.js does NOT contain wildcard hostname: "**"');
  assert(mentorConfigContent.includes("'images.unsplash.com'"), '6.2: mentor/next.config.js includes approved hostname: images.unsplash.com');
  assert(mentorConfigContent.includes("'lh3.googleusercontent.com'"), '6.3: mentor/next.config.js includes approved hostname: lh3.googleusercontent.com');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runP1Tests().catch((err) => {
  console.error('Fatal test error in P1 suite:', err);
  process.exit(1);
});
