import { AsyncLocalStorage } from 'async_hooks';
(global as any).AsyncLocalStorage = AsyncLocalStorage;

import { db } from '../db/client';
import { UserService } from '../services/userService';
import { PasswordSetupTokenService } from '../services/passwordSetupTokenService';
import { MentorAuthService } from '../services/mentorship/mentorAuthService';
const MENTOR_COOKIE_NAME = 'career_mentor_session';

async function runMentorAuthSecurityTests() {
  console.log('🔒 Running Mentor Authentication Security Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}${detail ? ` (${detail})` : ''}`);
      failed++;
    }
  }

  // Load Next.js request async storage and route handlers
  const { requestAsyncStorage } = require('next/dist/client/components/request-async-storage.external.js');
  const { NextRequest } = require('next/server');

  const loginRouteModule = await import('../../../mentor/src/app/api/mentor/auth/login/route');
  const loginPOST = (loginRouteModule as any).POST || (loginRouteModule as any).default?.POST;

  const changePasswordRouteModule = await import('../../../mentor/src/app/api/mentor/auth/change-password/route');
  const changePasswordPOST = (changePasswordRouteModule as any).POST || (changePasswordRouteModule as any).default?.POST;

  // Helper to execute request within Next.js cookies context
  async function invokeLoginRoute(payload: Record<string, any>) {
    const cookieStore = new Map<string, any>();
    const mockStorage = {
      cookies: {
        get: (name: string) => cookieStore.get(name),
        set: (name: string, value: string, opts: any) => cookieStore.set(name, { value, ...opts }),
      },
    };

    const response = await requestAsyncStorage.run(mockStorage, async () => {
      const req = new NextRequest('http://localhost:3003/api/mentor/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await loginPOST(req);
    });

    const json = await response.json();
    return { status: response.status, json, cookieStore };
  }

  async function invokeChangePasswordRoute(payload: Record<string, any>, sessionToken?: string) {
    const cookieStore = new Map<string, any>();
    if (sessionToken) {
      cookieStore.set(MENTOR_COOKIE_NAME, { value: sessionToken });
    }

    const mockStorage = {
      cookies: {
        get: (name: string) => cookieStore.get(name),
        set: (name: string, value: string, opts: any) => cookieStore.set(name, { value, ...opts }),
      },
    };

    const response = await requestAsyncStorage.run(mockStorage, async () => {
      const req = new NextRequest('http://localhost:3003/api/mentor/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await changePasswordPOST(req);
    });

    const json = await response.json();
    return { status: response.status, json, cookieStore };
  }

  const timestamp = Date.now();
  const testEmailUnactivated = `security.mentor.unactivated.${timestamp}@pathway.eco`;
  const testEmailFullCycle = `security.mentor.cycle.${timestamp}@pathway.eco`;

  let unactivatedMentor: any;
  let cycleMentor: any;
  let cycleUser: any;
  let activeSessionToken: string | undefined;

  try {
    // =========================================================================
    // 1. Approved mentor with no linked User CANNOT create account through login
    // =========================================================================
    console.log('--- Phase 1: Login Auto-Registration Elimination ---');

    unactivatedMentor = await db.mentor.create({
      data: {
        email: testEmailUnactivated,
        name: 'Unactivated Approved Mentor',
        status: 'APPROVED',
        headline: 'Staff Engineer',
        bio: 'Experienced mentor specializing in security and cloud architecture.',
        domain: 'SOFTWARE_ENGINEERING',
        expertise: ['Security', 'Cloud'],
        startingPrice: 100,
        userId: null,
      },
    });

    // An attacker attempts to log in with an arbitrary password for this approved mentor
    const attackRes = await invokeLoginRoute({
      email: testEmailUnactivated,
      password: 'AttackerPassword123!',
    });

    assert(
      attackRes.status === 401,
      '1.1 Login endpoint rejects approved mentor without activated User account with HTTP 401',
      `Got status ${attackRes.status}`
    );

    assert(
      attackRes.json.error && attackRes.json.error.includes('account has not been activated'),
      '1.2 Response provides clear guidance directing user to secure account-activation email',
      `Got message: "${attackRes.json.error}"`
    );

    const userCreatedAfterAttack = await db.user.findUnique({
      where: { email: testEmailUnactivated },
    });

    assert(
      userCreatedAfterAttack === null,
      '1.3 Auto-registration eliminated: no User record is created in the database during login attempt',
      userCreatedAfterAttack ? 'Found user created!' : 'No user created'
    );

    // =========================================================================
    // 2. Setup-password flow works with valid 24-hour setup token
    // =========================================================================
    console.log('\n--- Phase 2: Secure Setup-Password Flow Verification ---');

    cycleUser = await db.user.create({
      data: {
        email: testEmailFullCycle,
        name: 'Full Cycle Security Mentor',
        role: 'MENTOR',
        status: 'ACTIVE',
        passwordHash: null,
        mustChangePassword: true,
      },
    });

    cycleMentor = await db.mentor.create({
      data: {
        userId: cycleUser.id,
        email: testEmailFullCycle,
        name: 'Full Cycle Security Mentor',
        status: 'APPROVED',
        headline: 'Principal Architect',
        bio: 'Principal Architect with extensive experience designing distributed systems.',
        domain: 'SYSTEM_DESIGN',
        expertise: ['Distributed Systems'],
        startingPrice: 150,
      },
    });

    // 2.1 Verify login fails while passwordHash is still null
    const loginBeforeSetup = await invokeLoginRoute({
      email: testEmailFullCycle,
      password: 'InitialPassword123!',
    });

    assert(
      loginBeforeSetup.status === 401,
      '2.1 User with null passwordHash cannot log in via login endpoint',
      `Got status ${loginBeforeSetup.status}`
    );

    // 2.2 Generate secure 24-hour setup token
    const { rawToken } = await PasswordSetupTokenService.createSetupToken(cycleUser.id);
    const verification = await PasswordSetupTokenService.verifyToken(rawToken);

    assert(
      verification.valid === true && verification.user?.id === cycleUser.id,
      '2.2 PasswordSetupTokenService verifies newly created setup token'
    );

    // 2.3 Consume setup token to set password
    const setupResult = await PasswordSetupTokenService.consumeSetupToken(
      rawToken,
      'InitialValidPassword123!'
    );

    assert(
      setupResult.success === true && !!setupResult.sessionToken,
      '2.3 Token consumption succeeds and returns session token'
    );

    const userAfterSetup = await db.user.findUnique({
      where: { id: cycleUser.id },
    });

    assert(
      !!userAfterSetup?.passwordHash && userAfterSetup.mustChangePassword === false,
      '2.4 User passwordHash is persisted and mustChangePassword is cleared'
    );

    const reVerification = await PasswordSetupTokenService.verifyToken(rawToken);
    assert(
      reVerification.valid === false,
      '2.5 Used setup token cannot be reused'
    );

    // =========================================================================
    // 3. Activated mentor login & credential rejection
    // =========================================================================
    console.log('\n--- Phase 3: Activated Mentor Login & Authentication ---');

    // 3.1 Login with incorrect password
    const wrongPassRes = await invokeLoginRoute({
      email: testEmailFullCycle,
      password: 'WrongPassword999!',
    });

    assert(
      wrongPassRes.status === 401,
      '3.1 Incorrect password is rejected with HTTP 401',
      `Got status ${wrongPassRes.status}`
    );

    // 3.2 Login with correct password
    const validLoginRes = await invokeLoginRoute({
      email: testEmailFullCycle,
      password: 'InitialValidPassword123!',
    });

    assert(
      validLoginRes.status === 200,
      '3.2 Activated mentor can log in with correct password',
      `Got status ${validLoginRes.status}`
    );

    assert(
      validLoginRes.cookieStore.has(MENTOR_COOKIE_NAME),
      '3.3 Secure HTTP-only session cookie is set upon successful login'
    );

    activeSessionToken = validLoginRes.cookieStore.get(MENTOR_COOKIE_NAME)?.value;

    // =========================================================================
    // 4. Current-password verification in change-password route
    // =========================================================================
    console.log('\n--- Phase 4: Current-Password Verification in Change-Password Route ---');

    // 4.1 Missing currentPassword is rejected
    const missingCurrentRes = await invokeChangePasswordRoute(
      {
        newPassword: 'BrandNewPassword123!',
        confirmPassword: 'BrandNewPassword123!',
      },
      activeSessionToken
    );

    assert(
      missingCurrentRes.status === 400 && missingCurrentRes.json.error === 'Current password is required.',
      '4.1 Missing currentPassword is rejected with HTTP 400',
      `Got status ${missingCurrentRes.status}: ${JSON.stringify(missingCurrentRes.json)}`
    );

    // 4.2 Incorrect currentPassword is rejected and does NOT change stored password
    const wrongCurrentRes = await invokeChangePasswordRoute(
      {
        currentPassword: 'IncorrectCurrentPass999!',
        newPassword: 'BrandNewPassword123!',
        confirmPassword: 'BrandNewPassword123!',
      },
      activeSessionToken
    );

    assert(
      wrongCurrentRes.status === 400 && wrongCurrentRes.json.error === 'Incorrect current password.',
      '4.2 Incorrect currentPassword is rejected with HTTP 400 without modifying stored hash',
      `Got status ${wrongCurrentRes.status}: ${JSON.stringify(wrongCurrentRes.json)}`
    );

    // Verify stored password hash was NOT changed
    const passCheckAfterFailure = await UserService.validatePassword(
      cycleUser.id,
      'InitialValidPassword123!'
    );
    assert(
      passCheckAfterFailure === true,
      '4.3 Password hash remains unchanged after incorrect currentPassword submission'
    );

    // 4.3 Password too short rejected
    const shortPassRes = await invokeChangePasswordRoute(
      {
        currentPassword: 'InitialValidPassword123!',
        newPassword: 'short',
        confirmPassword: 'short',
      },
      activeSessionToken
    );

    assert(
      shortPassRes.status === 400 && shortPassRes.json.error.includes('at least 8 characters'),
      '4.4 New password shorter than 8 characters is rejected'
    );

    // 4.4 Password mismatch rejected
    const mismatchRes = await invokeChangePasswordRoute(
      {
        currentPassword: 'InitialValidPassword123!',
        newPassword: 'BrandNewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      },
      activeSessionToken
    );

    assert(
      mismatchRes.status === 400 && mismatchRes.json.error === 'Passwords do not match.',
      '4.5 Mismatched confirmPassword is rejected'
    );

    // 4.5 Correct currentPassword permits valid password change
    const validChangeRes = await invokeChangePasswordRoute(
      {
        currentPassword: 'InitialValidPassword123!',
        newPassword: 'BrandNewPassword123!',
        confirmPassword: 'BrandNewPassword123!',
      },
      activeSessionToken
    );

    assert(
      validChangeRes.status === 200 && validChangeRes.json.success === true,
      '4.6 Correct currentPassword permits successful password change',
      `Got status ${validChangeRes.status}: ${JSON.stringify(validChangeRes.json)}`
    );

    // Verify stored password hash is updated and old password no longer works
    const oldPassWorks = await UserService.validatePassword(cycleUser.id, 'InitialValidPassword123!');
    const newPassWorks = await UserService.validatePassword(cycleUser.id, 'BrandNewPassword123!');

    assert(
      oldPassWorks === false && newPassWorks === true,
      '4.7 Old password is invalidated and new password successfully verifies'
    );

    // 4.6 Verify login with new password succeeds
    const loginWithNewPass = await invokeLoginRoute({
      email: testEmailFullCycle,
      password: 'BrandNewPassword123!',
    });

    assert(
      loginWithNewPass.status === 200,
      '4.8 Login with newly changed password succeeds'
    );

    // 4.7 Verify unauthenticated change-password request is rejected
    const unauthChangeRes = await invokeChangePasswordRoute({
      currentPassword: 'BrandNewPassword123!',
      newPassword: 'AnotherPassword123!',
    });

    assert(
      unauthChangeRes.status === 401,
      '4.9 Unauthenticated change-password request without session is rejected with HTTP 401',
      `Got status ${unauthChangeRes.status}`
    );

    // =========================================================================
    // 5. General UserService.validatePassword unit behavior
    // =========================================================================
    console.log('\n--- Phase 5: UserService.validatePassword Unit Checks ---');

    assert(
      (await UserService.validatePassword(cycleUser.id, 'BrandNewPassword123!')) === true,
      '5.1 UserService.validatePassword by userId returns true for matching password'
    );

    assert(
      (await UserService.validatePassword(cycleUser.email, 'BrandNewPassword123!')) === true,
      '5.2 UserService.validatePassword by email returns true for matching password'
    );

    assert(
      (await UserService.validatePassword(cycleUser.id, 'WrongPass')) === false,
      '5.3 UserService.validatePassword returns false for non-matching password'
    );

    assert(
      (await UserService.validatePassword('nonexistent_id', 'AnyPass')) === false,
      '5.4 UserService.validatePassword returns false for non-existent user'
    );

    assert(
      (await UserService.validatePassword('', '')) === false,
      '5.5 UserService.validatePassword returns false for empty input'
    );

  } finally {
    // Cleanup test artifacts
    console.log('\n--- Cleanup Test Records ---');
    try {
      if (unactivatedMentor?.id) {
        await db.mentor.deleteMany({ where: { id: unactivatedMentor.id } });
      }
      if (cycleMentor?.id) {
        await db.mentor.deleteMany({ where: { id: cycleMentor.id } });
      }
      if (cycleUser?.id) {
        await db.passwordSetupToken.deleteMany({ where: { userId: cycleUser.id } });
        await db.session.deleteMany({ where: { userId: cycleUser.id } });
        await db.user.deleteMany({ where: { id: cycleUser.id } });
      }
      console.log('  ✓ Test database artifacts cleaned up.');
    } catch (cleanupErr) {
      console.warn('  ⚠️ Cleanup warning:', cleanupErr);
    }
  }

  console.log(`\n========================================`);
  console.log(`Total Passed: ${passed} | Total Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runMentorAuthSecurityTests().catch((err) => {
  console.error('Fatal error during mentor auth security tests:', err);
  process.exit(1);
});
