/**
 * PATHWAY.ECO — Phase 12 P0 Endpoint Authorization & Containment Verification Tests
 *
 * Verifies non-destructively:
 * 1. Missing CRON_SECRET -> Fails closed with 500 Configuration Error.
 * 2. Invalid Bearer Token -> Fails with 401 Unauthorized.
 * 3. Legacy fallback secret ('pathway_cron_internal_secret') -> Rejected with 401/500.
 * 4. Side-effect suppression -> Privileged services are NEVER invoked when auth fails.
 * 5. Host Header Poisoning mitigation -> URL resolved via server configuration, NOT Host header.
 * 6. Valid Bearer Token -> Succeeds and executes intended workflow.
 */

import path from 'path';

// Register @backend/ path mapping for Node CJS runtime runner
const Module = require('module');
const origResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request.startsWith('@backend/')) {
    const subPath = request.replace('@backend/', '');
    request = path.resolve(__dirname, '..', subPath);
  }
  return origResolveFilename.call(this, request, parent, isMain, options);
};

// Now import the route handlers and services
const { POST: cleanupPOST } = require('../../../frontend/src/app/api/tools/cleanup/route');
const { GET: expireGET, POST: expirePOST } = require('../../../frontend/src/app/api/jobs/cron/expire/route');
const { POST: remindersPOST } = require('../../../frontend/src/app/api/onboarding/reminders/route');

const { CleanupService } = require('../services/tools/cleanup-service');
const { JobExpirationService } = require('../services/jobExpirationService');
const { OnboardingLifecycleService } = require('../services/onboardingLifecycleService');

async function runP0Tests() {
  console.log('\n========================================================================');
  console.log('🧪 PATHWAY.ECO Phase 12 P0 Endpoint Authorization Verification');
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

  // Preserve original environment
  const originalCronSecret = process.env.CRON_SECRET;
  const originalAppUrl = process.env.APP_URL;

  try {
    // -------------------------------------------------------------------------
    // TEST SUITE 1: Tools Cleanup Endpoint (frontend/src/app/api/tools/cleanup)
    // -------------------------------------------------------------------------
    console.log('--- Test Suite 1: Tool Cleanup Authorization (/api/tools/cleanup) ---');
    
    let cleanupCalled = false;
    const origRunCleanupCycle = CleanupService.runCleanupCycle;
    CleanupService.runCleanupCycle = async () => {
      cleanupCalled = true;
      return { totalPurged: 0, durationMs: 1 };
    };

    // 1.1: Missing CRON_SECRET in environment -> 500 error, cleanup not called
    delete process.env.CRON_SECRET;
    cleanupCalled = false;
    const req1_1 = new Request('http://localhost:3000/api/tools/cleanup', {
      method: 'POST',
      headers: { authorization: 'Bearer some_token' },
    });
    const res1_1 = await cleanupPOST(req1_1);
    const body1_1 = await res1_1.json();
    assert(res1_1.status === 500, '1.1: Missing CRON_SECRET returns HTTP 500');
    assert(body1_1.error === 'Cleanup service configuration error', '1.1: Returns clean configuration error message');
    assert(!cleanupCalled, '1.1: CleanupService was NOT called when secret unconfigured');

    // 1.2: Configured CRON_SECRET, missing authorization header -> 401
    process.env.CRON_SECRET = 'super_secret_cron_token_123';
    cleanupCalled = false;
    const req1_2 = new Request('http://localhost:3000/api/tools/cleanup', {
      method: 'POST',
    });
    const res1_2 = await cleanupPOST(req1_2);
    assert(res1_2.status === 401, '1.2: Missing Authorization header returns HTTP 401');
    assert(!cleanupCalled, '1.2: CleanupService was NOT called when header missing');

    // 1.3: Invalid bearer token -> 401
    cleanupCalled = false;
    const req1_3 = new Request('http://localhost:3000/api/tools/cleanup', {
      method: 'POST',
      headers: { authorization: 'Bearer invalid_wrong_token' },
    });
    const res1_3 = await cleanupPOST(req1_3);
    assert(res1_3.status === 401, '1.3: Invalid Bearer token returns HTTP 401');
    assert(!cleanupCalled, '1.3: CleanupService was NOT called with invalid token');

    // 1.4: Valid bearer token -> 200, cleanup called
    cleanupCalled = false;
    const req1_4 = new Request('http://localhost:3000/api/tools/cleanup', {
      method: 'POST',
      headers: { authorization: 'Bearer super_secret_cron_token_123' },
    });
    const res1_4 = await cleanupPOST(req1_4);
    const body1_4 = await res1_4.json();
    assert(res1_4.status === 200, '1.4: Valid Bearer token returns HTTP 200');
    assert(body1_4.success === true, '1.4: Response indicates success');
    assert(cleanupCalled, '1.4: CleanupService was called with valid authorization');

    // Restore CleanupService
    CleanupService.runCleanupCycle = origRunCleanupCycle;

    // -------------------------------------------------------------------------
    // TEST SUITE 2: Job Expiration Cron Endpoint (/api/jobs/cron/expire)
    // -------------------------------------------------------------------------
    console.log('\n--- Test Suite 2: Job Expiration Cron Authorization (/api/jobs/cron/expire) ---');

    let expireCalled = false;
    const origExpireOldJobs = JobExpirationService.expireOldJobs;
    JobExpirationService.expireOldJobs = async () => {
      expireCalled = true;
      return { totalExpired: 0, durationMs: 1 };
    };

    // 2.1: Missing CRON_SECRET -> 500 error, expireOldJobs not called
    delete process.env.CRON_SECRET;
    expireCalled = false;
    const req2_1 = new Request('http://localhost:3000/api/jobs/cron/expire', {
      method: 'GET',
    });
    const res2_1 = await expireGET(req2_1);
    assert(res2_1.status === 500, '2.1: Missing CRON_SECRET returns HTTP 500 for GET');
    assert(!expireCalled, '2.1: JobExpirationService was NOT called when secret unconfigured');

    // 2.2: Hardcoded legacy secret rejected when CRON_SECRET is unconfigured -> 500
    expireCalled = false;
    const req2_2 = new Request('http://localhost:3000/api/jobs/cron/expire', {
      method: 'GET',
      headers: { authorization: 'Bearer pathway_cron_internal_secret' },
    });
    const res2_2 = await expireGET(req2_2);
    assert(res2_2.status === 500, '2.2: Legacy secret "pathway_cron_internal_secret" does not bypass unconfigured secret');
    assert(!expireCalled, '2.2: JobExpirationService was NOT called with legacy fallback');

    // 2.3: Configured CRON_SECRET, missing token -> 401
    process.env.CRON_SECRET = 'active_cron_secret_456';
    expireCalled = false;
    const req2_3 = new Request('http://localhost:3000/api/jobs/cron/expire', {
      method: 'GET',
    });
    const res2_3 = await expireGET(req2_3);
    assert(res2_3.status === 401, '2.3: Missing Authorization header returns HTTP 401');
    assert(!expireCalled, '2.3: JobExpirationService was NOT called when token missing');

    // 2.4: Legacy secret rejected when active secret is configured -> 401
    expireCalled = false;
    const req2_4 = new Request('http://localhost:3000/api/jobs/cron/expire', {
      method: 'POST',
      headers: { authorization: 'Bearer pathway_cron_internal_secret' },
    });
    const res2_4 = await expirePOST(req2_4);
    assert(res2_4.status === 401, '2.4: Legacy fallback secret rejected with HTTP 401');
    assert(!expireCalled, '2.4: JobExpirationService was NOT called with invalid secret');

    // 2.5: Valid bearer token -> 200, expireOldJobs called
    expireCalled = false;
    const req2_5 = new Request('http://localhost:3000/api/jobs/cron/expire', {
      method: 'POST',
      headers: { authorization: 'Bearer active_cron_secret_456' },
    });
    const res2_5 = await expirePOST(req2_5);
    const body2_5 = await res2_5.json();
    assert(res2_5.status === 200, '2.5: Valid Bearer token returns HTTP 200 on POST');
    assert(body2_5.totalExpired === 0, '2.5: Job expiration result returned');
    assert(expireCalled, '2.5: JobExpirationService executed successfully');

    // Restore JobExpirationService
    JobExpirationService.expireOldJobs = origExpireOldJobs;

    // -------------------------------------------------------------------------
    // TEST SUITE 3: Onboarding Reminders Endpoint (/api/onboarding/reminders)
    // -------------------------------------------------------------------------
    console.log('\n--- Test Suite 3: Onboarding Reminders Authorization & Host Poisoning Prevention ---');

    let remindersCalled = false;
    let receivedAppUrl = '';
    const origProcessPendingReminders = OnboardingLifecycleService.processPendingReminders;
    OnboardingLifecycleService.processPendingReminders = async (opts: any) => {
      remindersCalled = true;
      receivedAppUrl = opts.appUrl;
      return { totalEligible: 0, totalSent: 0, totalFailed: 0, durationMs: 1 };
    };

    // 3.1: Missing CRON_SECRET -> 500 error
    delete process.env.CRON_SECRET;
    remindersCalled = false;
    const req3_1 = new Request('http://localhost:3000/api/onboarding/reminders', {
      method: 'POST',
    });
    const res3_1 = await remindersPOST(req3_1);
    assert(res3_1.status === 500, '3.1: Missing CRON_SECRET returns HTTP 500');
    assert(!remindersCalled, '3.1: OnboardingLifecycleService was NOT called');

    // 3.2: Invalid bearer token -> 401
    process.env.CRON_SECRET = 'reminders_secret_789';
    remindersCalled = false;
    const req3_2 = new Request('http://localhost:3000/api/onboarding/reminders', {
      method: 'POST',
      headers: { authorization: 'Bearer wrong_token' },
    });
    const res3_2 = await remindersPOST(req3_2);
    assert(res3_2.status === 401, '3.2: Invalid Bearer token returns HTTP 401');
    assert(!remindersCalled, '3.2: OnboardingLifecycleService was NOT called with invalid token');

    // 3.3: Host Header Poisoning Defense Test
    // Attacker sends Host: malicious-phishing-host.com
    // The endpoint MUST NOT use this host to construct reminder URLs
    process.env.APP_URL = 'https://pathway.eco';
    remindersCalled = false;
    receivedAppUrl = '';
    const req3_3 = new Request('http://localhost:3000/api/onboarding/reminders', {
      method: 'POST',
      headers: {
        authorization: 'Bearer reminders_secret_789',
        host: 'malicious-phishing-host.com',
        'x-forwarded-host': 'malicious-phishing-host.com',
      },
    });
    const res3_3 = await remindersPOST(req3_3);
    assert(res3_3.status === 200, '3.3: Valid authorization returns HTTP 200');
    assert(remindersCalled, '3.3: OnboardingLifecycleService executed');
    assert(!receivedAppUrl.includes('malicious-phishing-host.com'), '3.3: Host header was NOT used in appUrl (mitigates Host Header Poisoning)');
    assert(receivedAppUrl === 'https://pathway.eco', '3.3: Trusted server-configured APP_URL was used');

    // Restore OnboardingLifecycleService
    OnboardingLifecycleService.processPendingReminders = origProcessPendingReminders;

  } finally {
    // Restore original env vars
    if (originalCronSecret !== undefined) {
      process.env.CRON_SECRET = originalCronSecret;
    } else {
      delete process.env.CRON_SECRET;
    }
    if (originalAppUrl !== undefined) {
      process.env.APP_URL = originalAppUrl;
    } else {
      delete process.env.APP_URL;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runP0Tests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
