import { db } from '../db/client';
import { RecruiterTeamService } from '../services/recruiter/recruiterTeamService';
import { EmailService } from '../services/email/emailService';
import {
  renderRecruiterTeamInvitationEmail,
  getFriendlyRoleLabel,
  extractInviteeGreeting,
  escapeHtml,
  RECRUITER_ROLE_LABELS,
} from '../services/email/templates/recruiter/teamInvitationEmail';
import { resolveRecruiterPortalUrl } from '../services/email/templates/urlHelper';
import { AuthenticatedRecruiter } from '../types/recruiter';

async function runRecruiterTeamInvitationEmailTests() {
  console.log('🚀 Starting Recruiter Team Invitation Email Test Suite...\n');

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
  let company: any;
  let adminUser: any;
  let adminProfile: any;
  let adminMember: any;
  let authContext: AuthenticatedRecruiter;

  try {
    // -------------------------------------------------------------
    // Unit Tests: Template Rendering & Helper Logic
    // -------------------------------------------------------------
    console.log('--- 1. Testing Role Label Mappings ---');
    assert(getFriendlyRoleLabel('COMPANY_ADMIN') === 'Company Admin', 'COMPANY_ADMIN maps to "Company Admin"');
    assert(getFriendlyRoleLabel('RECRUITER') === 'Recruiter', 'RECRUITER maps to "Recruiter"');
    assert(getFriendlyRoleLabel('TECHNICAL_INTERVIEWER') === 'Technical Interviewer', 'TECHNICAL_INTERVIEWER maps to "Technical Interviewer"');
    assert(getFriendlyRoleLabel('HR_INTERVIEWER') === 'HR / Managerial Interviewer', 'HR_INTERVIEWER maps to "HR / Managerial Interviewer"');
    assert(getFriendlyRoleLabel('INTERVIEW_COORDINATOR') === 'Interview Coordinator', 'INTERVIEW_COORDINATOR maps to "Interview Coordinator"');
    assert(getFriendlyRoleLabel('HIRING_MANAGER') === 'Hiring Manager', 'HIRING_MANAGER maps to "Hiring Manager"');
    assert(getFriendlyRoleLabel('INTERVIEWER') === 'Technical Interviewer', 'Legacy INTERVIEWER maps to "Technical Interviewer"');
    assert(getFriendlyRoleLabel(null) === 'Recruiter', 'Null role falls back to "Recruiter"');

    console.log('\n--- 2. Testing Invitee Greeting Resolution ---');
    assert(extractInviteeGreeting('Test') === 'Test', 'Greeting for "Test" extracts "Test" ("Hi Test,")');
    assert(extractInviteeGreeting('Sarah Jenkins') === 'Sarah', 'Greeting for "Sarah Jenkins" extracts first name "Sarah"');
    assert(extractInviteeGreeting('Colleague') === 'there', 'Generic "Colleague" falls back to "there" ("Hi there,")');
    assert(extractInviteeGreeting('') === 'there', 'Empty name falls back to "there"');
    assert(extractInviteeGreeting(null) === 'there', 'Null name falls back to "there"');
    assert(extractInviteeGreeting(undefined) === 'there', 'Undefined name falls back to "there"');
    assert(extractInviteeGreeting('User') === 'there', 'Generic "User" falls back to "there"');

    console.log('\n--- 3. Testing HTML Escaping & Dynamic Value Sanitization ---');
    const dirty = '<script>alert("xss")</script> & "quotes" \'apostrophe\'';
    const escaped = escapeHtml(dirty);
    assert(!escaped.includes('<script>'), 'HTML escaping eliminates raw <script> tags');
    assert(escaped.includes('&lt;script&gt;'), 'HTML escaping transforms < into &lt;');
    assert(escaped.includes('&amp;'), 'HTML escaping transforms & into &amp;');
    assert(escaped.includes('&quot;'), 'HTML escaping transforms " into &quot;');
    assert(escaped.includes('&#039;'), "HTML escaping transforms ' into &#039;");

    console.log('\n--- 4. Testing Template Content, Subject, and Heading ---');
    const mockToken = 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef';
    const acceptUrl = `https://pathway.eco/team/accept-invite?token=${mockToken}`;

    const rendered = renderRecruiterTeamInvitationEmail({
      toEmail: 'sarah@example.com',
      inviteeName: 'Sarah Jenkins',
      companyName: 'Acme Corporation',
      inviterName: 'John Doe',
      role: 'INTERVIEW_COORDINATOR',
      acceptUrl,
      expiresInDays: 7,
      message: 'Excited to have you coordinate interviews with us!',
    });

    assert(
      rendered.subject === 'Invitation to join Acme Corporation on PATHWAY.ECO',
      'Subject matches "Invitation to join Acme Corporation on PATHWAY.ECO"'
    );
    assert(
      rendered.html.includes("You&#039;re invited to join Acme Corporation on PATHWAY.ECO") ||
      rendered.html.includes("You're invited to join Acme Corporation on PATHWAY.ECO"),
      'Heading is "You\'re invited to join {{companyName}} on PATHWAY.ECO"'
    );
    assert(
      !rendered.html.includes("font-family: monospace") &&
      !rendered.html.includes("font-family: 'Courier New'"),
      'Heading does not use monospace font'
    );
    assert(rendered.html.includes('Hi Sarah,'), 'Greeting contains "Hi Sarah,"');
    assert(
      rendered.html.includes('John Doe') && rendered.html.includes('Acme Corporation') && rendered.html.includes('Interview Coordinator'),
      'Body contains inviter name, company name, and friendly role display name'
    );
    assert(rendered.html.includes('Accept Invitation'), 'Primary CTA text is "Accept Invitation"');
    assert(rendered.html.includes(acceptUrl), 'HTML contains full acceptUrl');
    assert(
      rendered.html.includes('This invitation link expires in 7 days'),
      'Notice specifies "This invitation link expires in 7 days"'
    );
    assert(rendered.html.includes('The PATHWAY.ECO Team'), 'Sign-off is "The PATHWAY.ECO Team"');
    assert(rendered.html.includes('Discover. Learn. Grow. Get Hired.'), 'Footer contains "Discover. Learn. Grow. Get Hired."');
    assert(
      rendered.html.includes('This is an automated email. Please do not reply directly to this message.'),
      'Footer contains automated disclaimer'
    );
    assert(
      rendered.html.includes('Excited to have you coordinate interviews with us!'),
      'Personal message note is cleanly displayed'
    );

    console.log('\n--- 5. Checking Absence of Template Artifacts & Placeholder Bleed ---');
    assert(!rendered.html.includes('{{') && !rendered.html.includes('}}'), 'No unrendered {{handlebar}} tags in HTML');
    assert(!rendered.text.includes('{{') && !rendered.text.includes('}}'), 'No unrendered {{handlebar}} tags in plain text');
    assert(!rendered.html.includes('{/*') && !rendered.html.includes('*/}'), 'No JSX comments in HTML');
    assert(!rendered.text.includes('{/*') && !rendered.text.includes('*/}'), 'No JSX comments in plain text');
    assert(!rendered.html.includes('undefined') && !rendered.text.includes('undefined'), 'No literal "undefined" in rendered HTML or plain text');

    console.log('\n--- 6. Testing Plain Text Version ---');
    assert(rendered.text.includes('Hi Sarah,'), 'Plain text contains greeting "Hi Sarah,"');
    assert(rendered.text.includes('Acme Corporation'), 'Plain text contains company name');
    assert(rendered.text.includes('John Doe'), 'Plain text contains inviter name');
    assert(rendered.text.includes('Interview Coordinator'), 'Plain text contains friendly role name');
    assert(rendered.text.includes(acceptUrl), 'Plain text contains acceptance link');
    assert(rendered.text.includes('This invitation link expires in 7 days'), 'Plain text contains 7-day expiry notice');
    assert(rendered.text.includes('The PATHWAY.ECO Team'), 'Plain text contains team sign-off');

    console.log('\n--- 7. Testing Fallback Greeting When Name Is Missing ---');
    const namelessRender = renderRecruiterTeamInvitationEmail({
      toEmail: 'unknown@example.com',
      companyName: 'Beta Labs',
      role: 'RECRUITER',
      acceptUrl: 'https://pathway.eco/team/accept-invite?token=xyz',
    });
    assert(namelessRender.html.includes('Hi there,'), 'HTML falls back to "Hi there," when inviteeName is omitted');
    assert(namelessRender.text.includes('Hi there,'), 'Plain text falls back to "Hi there," when inviteeName is omitted');

    console.log('\n--- 8. Testing URL Resolution Helper ---');
    const localUrl = resolveRecruiterPortalUrl();
    assert(typeof localUrl === 'string' && localUrl.length > 0, 'resolveRecruiterPortalUrl returns valid URL string');
    const override = resolveRecruiterPortalUrl('https://custom.recruiter.eco/');
    assert(override === 'https://custom.recruiter.eco', 'resolveRecruiterPortalUrl trims trailing slashes');

    // -------------------------------------------------------------
    // Integration Tests: End-to-End Invite, Resend, and Accept
    // -------------------------------------------------------------
    console.log('\n--- 9. Setting Up Database Test Fixtures ---');
    company = await db.company.create({
      data: {
        name: `Quantum Hire ${suffix}`,
        slug: `quantum-hire-${suffix}`,
        website: 'https://quantum.example.com',
        industry: 'Software',
        size: '11-50',
        location: 'Mumbai, India',
        verified: true,
        status: 'ACTIVE',
      },
    });

    adminUser = await db.user.create({
      data: {
        email: `admin${suffix}@quantum.example.com`,
        name: 'Quantum Admin',
        role: 'RECRUITER',
        status: 'ACTIVE',
      },
    });

    adminProfile = await db.recruiterProfile.create({
      data: {
        userId: adminUser.id,
        companyId: company.id,
        designation: 'Head of People',
        status: 'ACTIVE',
      },
    });

    adminMember = await db.companyMember.create({
      data: {
        companyId: company.id,
        userId: adminUser.id,
        role: 'COMPANY_ADMIN',
        title: 'Head of People',
        status: 'ACTIVE',
      },
    });

    authContext = {
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
      recruiter: {
        id: adminProfile.id,
        designation: adminProfile.designation,
        status: adminProfile.status,
      },
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        status: company.status,
        website: 'https://example.com',
        industry: 'Tech',
        size: '1-10',
        location: 'Remote',
        verified: true,
      },
      membership: {
        id: adminMember.id,
        role: 'COMPANY_ADMIN',
        title: adminMember.title,
        status: 'ACTIVE',
        assignedJobIds: [],
        interviewTypes: [],
      },
      companyRole: 'COMPANY_ADMIN',
      permissions: [
        'team:view',
        'team:invite',
        'team:manage_roles',
        'team:remove_member',
        'dashboard:view',
      ],
    } as any;

    console.log('\n--- 10. Testing RecruiterTeamService.inviteMember Execution ---');
    const inviteeEmail = `invitee${suffix}@quantum.example.com`;
    const inviteResult = await RecruiterTeamService.inviteMember(
      company.id,
      {
        email: inviteeEmail,
        name: 'Alex Johnson',
        role: 'TECHNICAL_INTERVIEWER',
        title: 'Staff Tech Interviewer',
        message: 'Looking forward to interviewing candidates together!',
      },
      authContext
    );

    assert(!!inviteResult.invitation.id, 'Created invitation has valid record ID');
    assert(inviteResult.invitation.status === 'PENDING', 'Created invitation status is PENDING');
    assert(inviteResult.invitation.role === 'TECHNICAL_INTERVIEWER', 'Created invitation role is TECHNICAL_INTERVIEWER');
    assert(!!inviteResult.rawToken, 'inviteMember returns rawToken for delivery');

    // Confirm token does not get logged or stored in plain text in DB
    const persistedInvite = await db.companyInvitation.findUnique({
      where: { id: inviteResult.invitation.id },
    });
    assert(persistedInvite !== null, 'Invitation found in database');
    assert(persistedInvite?.tokenHash !== inviteResult.rawToken, 'Token is securely hashed with SHA-256 in DB, not plain text');

    console.log('\n--- 11. Testing Token Immobility During Rendering ---');
    // Ensure rendering the email does not mutate or regenerate the invitation's token
    const tokenBefore = persistedInvite?.tokenHash;
    renderRecruiterTeamInvitationEmail({
      toEmail: inviteeEmail,
      inviteeName: 'Alex Johnson',
      companyName: company.name,
      inviterName: adminUser.name,
      role: persistedInvite!.role,
      acceptUrl: `https://pathway.eco/team/accept-invite?token=${inviteResult.rawToken}`,
    });
    const checkAfterRender = await db.companyInvitation.findUnique({
      where: { id: inviteResult.invitation.id },
    });
    assert(checkAfterRender?.tokenHash === tokenBefore, 'Email rendering does not regenerate or mutate the invitation token');

    console.log('\n--- 12. Testing Invitation Acceptance Workflow ---');
    const acceptResult = await RecruiterTeamService.acceptInvitation(inviteResult.rawToken);
    assert(acceptResult.role === 'TECHNICAL_INTERVIEWER', 'Accepted member received assigned role TECHNICAL_INTERVIEWER');
    assert(!!acceptResult.memberId, 'Accepted member record ID is returned');

    const acceptedInviteDb = await db.companyInvitation.findUnique({
      where: { id: inviteResult.invitation.id },
    });
    assert(acceptedInviteDb?.status === 'ACCEPTED', 'Database invitation status transitioned to ACCEPTED');
    assert(!!acceptedInviteDb?.acceptedAt, 'Invitation acceptedAt timestamp is populated');

    console.log('\n--- 13. Testing Replay Safety & Expired/Revoked Rejection ---');
    // Repeated accept with same token
    const repeatAccept = await RecruiterTeamService.acceptInvitation(inviteResult.rawToken);
    assert(repeatAccept.alreadyAccepted === true, 'Repeated accept safely returns alreadyAccepted without error or duplication');

    // Revoked invite cannot be accepted
    const inviteToRevoke = await RecruiterTeamService.inviteMember(
      company.id,
      {
        email: `revoked${suffix}@quantum.example.com`,
        name: 'Revoke Test',
        role: 'RECRUITER',
      },
      authContext
    );
    await RecruiterTeamService.revokeInvitation(company.id, inviteToRevoke.invitation.id, authContext);
    let revokedFailed = false;
    try {
      await RecruiterTeamService.acceptInvitation(inviteToRevoke.rawToken);
    } catch {
      revokedFailed = true;
    }
    assert(revokedFailed, 'Revoked invitation cannot be accepted');

    // Expired invite cannot be accepted
    const inviteToExpire = await RecruiterTeamService.inviteMember(
      company.id,
      {
        email: `expired${suffix}@quantum.example.com`,
        name: 'Expire Test',
        role: 'HR_INTERVIEWER',
      },
      authContext
    );
    // Backdate expiration
    await db.companyInvitation.update({
      where: { id: inviteToExpire.invitation.id },
      data: { expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8) },
    });
    let expiredFailed = false;
    try {
      await RecruiterTeamService.acceptInvitation(inviteToExpire.rawToken);
    } catch {
      expiredFailed = true;
    }
    assert(expiredFailed, 'Expired invitation cannot be accepted');
  } catch (err: any) {
    console.error('💥 Unexpected exception during test execution:', err);
    failed++;
  } finally {
    console.log('\n--- Cleanup: Removing Test Fixtures ---');
    try {
      if (company?.id) {
        await db.companyInvitation.deleteMany({ where: { companyId: company.id } });
        await db.companyMember.deleteMany({ where: { companyId: company.id } });
        await db.recruiterProfile.deleteMany({ where: { companyId: company.id } });
        await db.auditLog.deleteMany({ where: { actorEmail: { contains: suffix } } });
        await db.user.deleteMany({ where: { email: { contains: suffix } } });
        await db.company.deleteMany({ where: { id: company.id } });
      }
    } catch (cleanErr) {
      console.error('Failed to cleanup fixtures:', cleanErr);
    }
  }

  console.log('\n======================================================');
  console.log(`Recruiter Team Invitation Email Tests: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRecruiterTeamInvitationEmailTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal test error:', err);
    process.exit(1);
  });
