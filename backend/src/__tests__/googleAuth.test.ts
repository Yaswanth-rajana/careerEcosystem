import { db } from '../db/client';
import { UserService } from '../services/userService';
import { verifyGoogleIdToken } from '../auth/googleAuth';
import { SignJWT, generateKeyPair } from 'jose';

async function runGoogleAuthTests() {
  console.log('🧪 Starting Google Authentication & Account Linking Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failed++;
    }
  }

  const testEmailPrefix = `test_google_${Date.now()}`;

  try {
    // ----------------------------------------------------
    // TEST 1: verifyGoogleIdToken - Rejection of invalid/empty tokens
    // ----------------------------------------------------
    try {
      await verifyGoogleIdToken('');
      assert(false, 'verifyGoogleIdToken should reject empty string');
    } catch (err: any) {
      assert(err.message.includes('non-empty string'), 'verifyGoogleIdToken rejects empty token');
    }

    try {
      await verifyGoogleIdToken('invalid.jwt.token');
      assert(false, 'verifyGoogleIdToken should reject invalid JWT');
    } catch (err: any) {
      assert(true, 'verifyGoogleIdToken rejects malformed JWT');
    }

    // ----------------------------------------------------
    // TEST 2: verifyGoogleIdToken - Rejection of wrong issuer / algorithm
    // ----------------------------------------------------
    try {
      const { privateKey } = await generateKeyPair('RS256');
      const mockFakeJwt = await new SignJWT({
        sub: '123456789',
        email: 'fake@example.com',
        email_verified: true,
      })
        .setProtectedHeader({ alg: 'RS256' })
        .setIssuer('https://fake-issuer.com')
        .setAudience('some-client-id')
        .setExpirationTime('1h')
        .sign(privateKey);

      await verifyGoogleIdToken(mockFakeJwt);
      assert(false, 'verifyGoogleIdToken should reject untrusted issuer / key');
    } catch {
      assert(true, 'verifyGoogleIdToken rejects non-Google signed token');
    }

    // ----------------------------------------------------
    // TEST 3: UserService.authenticateWithGoogle - Rejection of unverified email
    // ----------------------------------------------------
    try {
      await UserService.authenticateWithGoogle({
        googleId: 'google-sub-unverified',
        email: `${testEmailPrefix}_unverified@example.com`,
        emailVerified: false,
        name: 'Unverified User',
      });
      assert(false, 'authenticateWithGoogle should reject unverified email');
    } catch (err: any) {
      assert(err.message.includes('not verified'), 'authenticateWithGoogle rejects unverified email');
    }

    // ----------------------------------------------------
    // TEST 4: CASE 2 & 3: New Google user creation (incomplete onboarding)
    // ----------------------------------------------------
    const newGoogleSub = `sub_${Date.now()}_new`;
    const newGoogleEmail = `${testEmailPrefix}_new@example.com`;
    const newGoogleName = 'New Google Candidate';
    const newGoogleAvatar = 'https://lh3.googleusercontent.com/a/avatar123';

    const newAuthResult = await UserService.authenticateWithGoogle({
      googleId: newGoogleSub,
      email: newGoogleEmail,
      emailVerified: true,
      name: newGoogleName,
      avatarUrl: newGoogleAvatar,
    });

    assert(Boolean(newAuthResult.user.id), 'New Google user created with database ID');
    assert(newAuthResult.user.email === newGoogleEmail, 'New Google user has verified email');
    assert(newAuthResult.user.name === newGoogleName, 'New Google user has Google name');
    assert(newAuthResult.user.isOnboarded === false, 'New Google user has isOnboarded=false (CASE 3: /onboarding)');
    assert(Boolean(newAuthResult.token), 'New Google user has session token created');

    // Verify session lookup
    const sessionUser = await UserService.getSession(newAuthResult.token);
    assert(sessionUser?.id === newAuthResult.user.id, 'Session lookup retrieves newly created Google user');

    // ----------------------------------------------------
    // TEST 5: CASE 1: Existing Google user signs in again
    // ----------------------------------------------------
    const repeatAuthResult = await UserService.authenticateWithGoogle({
      googleId: newGoogleSub,
      email: newGoogleEmail,
      emailVerified: true,
      name: newGoogleName,
    });

    assert(repeatAuthResult.user.id === newAuthResult.user.id, 'Existing Google user resolves to same PATHWAY user ID (CASE 1)');
    assert(Boolean(repeatAuthResult.token), 'Repeat Google login generates valid session');

    // ----------------------------------------------------
    // TEST 6: CASE 4: Existing Google user with completed onboarding
    // ----------------------------------------------------
    await db.user.update({
      where: { id: newAuthResult.user.id },
      data: { isOnboarded: true, onboardingCompletedAt: new Date() },
    });

    const onboardedAuthResult = await UserService.authenticateWithGoogle({
      googleId: newGoogleSub,
      email: newGoogleEmail,
      emailVerified: true,
      name: newGoogleName,
    });

    assert(onboardedAuthResult.user.isOnboarded === true, 'Existing user with completed onboarding has isOnboarded=true (CASE 4: /dashboard)');

    // ----------------------------------------------------
    // TEST 7: CASE 7 & Regression: Existing email/password user links Google
    // ----------------------------------------------------
    const linkEmail = `${testEmailPrefix}_link@example.com`;
    const linkPassword = 'Password123!';
    const linkGoogleSub = `sub_${Date.now()}_linked`;

    // 1. Create standard email/password user
    const passwordUser = await UserService.registerUser({
      name: 'Password User',
      email: linkEmail,
      password: linkPassword,
    });
    assert(Boolean(passwordUser.user.id), 'Registered standard email/password user');

    // 2. Sign in with Google using matching verified email
    const linkedResult = await UserService.authenticateWithGoogle({
      googleId: linkGoogleSub,
      email: linkEmail,
      emailVerified: true,
      name: 'Linked Google User',
      avatarUrl: 'https://lh3.googleusercontent.com/linked_avatar',
    });

    assert(linkedResult.user.id === passwordUser.user.id, 'Google login links to existing account without duplicating (CASE 7)');

    // 3. Verify user can STILL authenticate with original password
    const passwordAuthResult = await UserService.authenticateUser({
      email: linkEmail,
      password: linkPassword,
    });
    assert(passwordAuthResult.user.id === passwordUser.user.id, 'Original password login remains fully functional after Google linking');

    // 4. Verify user can STILL authenticate with Google
    const repeatLinkedGoogle = await UserService.authenticateWithGoogle({
      googleId: linkGoogleSub,
      email: linkEmail,
      emailVerified: true,
      name: 'Linked Google User',
    });
    assert(repeatLinkedGoogle.user.id === passwordUser.user.id, 'Google login works seamlessly after linking');

    // ----------------------------------------------------
    // TEST 8: Anti-hijacking: Reject linking if email is already linked to a different googleId
    // ----------------------------------------------------
    try {
      await UserService.authenticateWithGoogle({
        googleId: 'attacker_fake_google_sub',
        email: linkEmail,
        emailVerified: true,
        name: 'Attacker',
      });
      assert(false, 'Should reject linking when account is already linked to another googleId');
    } catch (err: any) {
      assert(err.message.includes('already linked to a different Google account'), 'Rejects conflicting Google account linking');
    }

    // ----------------------------------------------------
    // TEST 9: Session expiration and logout
    // ----------------------------------------------------
    await UserService.logoutSession(linkedResult.token);
    const expiredSession = await UserService.getSession(linkedResult.token);
    assert(expiredSession === null, 'UserService.logoutSession destroys session cleanly');

    // Clean up test users
    await db.user.deleteMany({
      where: {
        email: {
          in: [newGoogleEmail, linkEmail],
        },
      },
    }).catch(() => {});

  } catch (fatalError: any) {
    console.error('Fatal error during test execution:', fatalError);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runGoogleAuthTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
