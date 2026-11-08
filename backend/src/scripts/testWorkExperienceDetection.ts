import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ResumeParserService } from '../services/resumeParserService';
import { SectionSplitter } from '../services/resume/sectionSplitter';
import { StructuredResumeEngine } from '../services/resume/structuredResumeEngine';
import { AiResumeExtractor } from '../services/resume/aiResumeExtractor';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ PASSED: ${message}`);
}

async function createPdfFromLines(lines: string[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 850]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  let y = 800;

  for (const line of lines) {
    if (y < 50) {
      page = pdfDoc.addPage([600, 850]);
      y = 800;
    }
    page.drawText(line.slice(0, 95), {
      x: 50,
      y,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 15;
  }
  const uint8 = await pdfDoc.save();
  return Buffer.from(uint8);
}

async function runRegressionSuite() {
  console.log('========================================================================');
  console.log('   PATHWAY.ECO — Resume Work Experience Detection Test Suite (10 Scenarios)');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------
  // TEST 1: Exact supplied resume (Yaswanth_Resume_FullStack_Intern (1).pdf)
  // -------------------------------------------------------------------
  console.log('TEST 1: Exact Supplied Resume Fixture');
  const pdfFixturePath = '/Users/yaswanthrajana/.gemini/antigravity/brain/1f874f8f-4c23-4482-903b-dbb8abcd5ffd/.user_uploaded/media_1793879967999_54606fc4.pdf';
  assert(fs.existsSync(pdfFixturePath), 'User resume PDF fixture exists on disk');

  const pdfBuffer = fs.readFileSync(pdfFixturePath);
  const parsed1 = await ResumeParserService.parseResume(pdfBuffer, 'Yaswanth_Resume_FullStack_Intern (1).pdf', 'application/pdf');

  assert(parsed1.experience.length === 1, `Exactly 1 Work Experience record produced (got: ${parsed1.experience.length})`);
  const exp0 = parsed1.experience[0];
  const bullets = exp0.bullets || [];
  assert(exp0.roleTitle === 'Full Stack Developer Intern', `Correct job title: "${exp0.roleTitle}"`);
  assert(exp0.company === 'SMVEN Technologies', `Correct company: "${exp0.company}"`);
  assert(exp0.startDate === 'May 2026', `Correct start date: "${exp0.startDate}"`);
  assert(exp0.endDate === null, `Correct end date (null for current): "${exp0.endDate}"`);
  assert(exp0.isCurrent === true, `Correct current employment status: ${exp0.isCurrent}`);
  assert(exp0.location === 'Rajahmundry', `Correct location: "${exp0.location}"`);
  assert(bullets.length === 6, `All 6 responsibility bullets associated (got: ${bullets.length})`);
  assert(Boolean(bullets[0]?.includes('Developed and modified 10–20 backend APIs')), 'Bullet 1 content verified');
  assert(Boolean(bullets[1]?.includes('Built and enhanced 10–15 production interfaces')), 'Bullet 2 content verified');
  assert(Boolean(bullets[2]?.includes('Integrated Razorpay payment workflows')), 'Bullet 3 content verified');
  assert(Boolean(bullets[3]?.includes('Implemented lead attribution tracking')), 'Bullet 4 content verified');
  assert(Boolean(bullets[4]?.includes('Enhanced lead management and email automation workflows')), 'Bullet 5 content verified');
  assert(Boolean(bullets[5]?.includes('Worked on production deployments and troubleshooting')), 'Bullet 6 content verified');
  assert(exp0.company !== 'Organization', 'No fabricated company name');
  assert((parsed1.structuredData?.internships.length ?? 0) === 0, 'No duplicate entry in internships section');

  // -------------------------------------------------------------------
  // TEST 2: Alternative Headings
  // -------------------------------------------------------------------
  console.log('\nTEST 2: Alternative Section Headings Recognition');
  const headings = [
    'EXPERIENCE',
    'WORK EXPERIENCE',
    'PROFESSIONAL EXPERIENCE',
    'EMPLOYMENT HISTORY',
    'CAREER EXPERIENCE',
    'WORK HISTORY',
  ];
  for (const heading of headings) {
    const text = `
John Doe
john@example.com | 9876543210

${heading}
Software Engineer
Stripe 2022 - Present, San Francisco
• Built developer billing infrastructure.
`;
    const buf = await createPdfFromLines(text.split('\n'));
    const parsed = await ResumeParserService.parseResume(buf, 'heading_test.pdf', 'application/pdf');
    assert(parsed.experience.length === 1 && parsed.experience[0].company === 'Stripe', `Heading "${heading}" detected correctly`);
  }

  // -------------------------------------------------------------------
  // TEST 3: Alternative Layouts (Pattern A, B, C, D)
  // -------------------------------------------------------------------
  console.log('\nTEST 3: Alternative Layout Patterns');

  // Pattern A: Role line, then Company/Date line
  const patternAText = `
Alice Smith
alice@example.com | 9876543210
EXPERIENCE
Full Stack Developer
Vercel May 2021 - Present, San Francisco
• Optimized Edge runtime rendering.
`;
  const parsedA = await ResumeParserService.parseResume(await createPdfFromLines(patternAText.split('\n')), 'a.pdf', 'application/pdf');
  assert(parsedA.experience.length === 1 && parsedA.experience[0].company === 'Vercel', 'Pattern A (Role-first) extracted cleanly');

  // Pattern B: Company line, then Role/Date line
  const patternBText = `
Bob Smith
bob@example.com | 9876543210
EXPERIENCE
Datadog
Backend Engineer Jan 2020 - Dec 2022
• Scaled metrics ingestion pipeline.
`;
  const parsedB = await ResumeParserService.parseResume(await createPdfFromLines(patternBText.split('\n')), 'b.pdf', 'application/pdf');
  assert(parsedB.experience.length === 1 && parsedB.experience[0].company === 'Datadog', 'Pattern B (Company-first) extracted cleanly');

  // Pattern C: Combined line with at
  const patternCText = `
Carol Danvers
carol@example.com | 9876543210
EXPERIENCE
DevOps Specialist at Netflix
Mar 2019 - Present
• Automated container cluster orchestration.
`;
  const parsedC = await ResumeParserService.parseResume(await createPdfFromLines(patternCText.split('\n')), 'c.pdf', 'application/pdf');
  assert(parsedC.experience.length === 1 && parsedC.experience[0].company === 'Netflix', 'Pattern C (Combined with "at") extracted cleanly');

  // Pattern D: Delimited multi-column
  const patternDText = `
David Banner
david@example.com | 9876543210
EXPERIENCE
Platform Engineer — Snowflake | Feb 2021 - Present | Seattle, WA
• Managed storage warehouse clusters.
`;
  const parsedD = await ResumeParserService.parseResume(await createPdfFromLines(patternDText.split('\n')), 'd.pdf', 'application/pdf');
  assert(parsedD.experience.length === 1 && parsedD.experience[0].company === 'Snowflake', 'Pattern D (Delimited dash/pipe) extracted cleanly');

  // -------------------------------------------------------------------
  // TEST 4: Date Format Variations
  // -------------------------------------------------------------------
  console.log('\nTEST 4: Date Formats Handling');
  const dateCases = [
    { text: 'May 2026 - Present', expectedStart: 'May 2026', expectedEnd: null, expectedCur: true },
    { text: 'Jan 2024 - Dec 2025', expectedStart: 'Jan 2024', expectedEnd: 'Dec 2025', expectedCur: false },
    { text: '2021 - 2024', expectedStart: '2021', expectedEnd: '2024', expectedCur: false },
    { text: '06/2023 - Present', expectedStart: '06/2023', expectedEnd: null, expectedCur: true },
  ];
  for (const d of dateCases) {
    const resumeText = `
Test User
test@example.com | 9876543210
EXPERIENCE
Software Engineer at TechCorp
${d.text}
• Contributed to core systems.
`;
    const parsedDate = await ResumeParserService.parseResume(await createPdfFromLines(resumeText.split('\n')), 'date.pdf', 'application/pdf');
    const entry = parsedDate.experience[0];
    assert(Boolean(entry && entry.startDate === d.expectedStart), `Start date "${d.expectedStart}" parsed accurately`);
    assert(Boolean(entry && entry.isCurrent === d.expectedCur), `Current status ${d.expectedCur} parsed accurately`);
  }

  // -------------------------------------------------------------------
  // TEST 5: Internship Classification Under EXPERIENCE Section
  // -------------------------------------------------------------------
  console.log('\nTEST 5: Section-First Classification');
  const internInExpText = `
Priya Sharma
priya@example.com | 9876543210
EXPERIENCE
Frontend Developer Intern
Amazon Jun 2023 - Present, Hyderabad
• Built high-performance checkout UI components.
`;
  const parsedInternInExp = await ResumeParserService.parseResume(await createPdfFromLines(internInExpText.split('\n')), 'intern_exp.pdf', 'application/pdf');
  assert(parsedInternInExp.experience.length === 1, 'Intern title under EXPERIENCE remains in Work Experience');
  assert(parsedInternInExp.experience[0].company === 'Amazon', 'Company is Amazon');
  assert(parsedInternInExp.experience[0].employmentType === 'Internship', 'Employment type captured as Internship');
  assert((parsedInternInExp.structuredData?.internships.length ?? 0) === 0, 'Does NOT move entry to internships when source section is EXPERIENCE');

  // -------------------------------------------------------------------
  // TEST 6: Multiple Employers Separation
  // -------------------------------------------------------------------
  console.log('\nTEST 6: Multiple Employers Separation');
  const multiExpText = `
Alex Mercer
alex@example.com | 9876543210
EXPERIENCE
Senior Software Engineer
Google Jan 2023 - Present, Mountain View
• Led search indexing team.
• Improved query throughput by 30%.

Backend Developer
Uber Jan 2021 - Dec 2022, San Francisco
• Built dispatch microservices in Go.
• Integrated Kafka messaging architecture.
`;
  const parsedMulti = await ResumeParserService.parseResume(await createPdfFromLines(multiExpText.split('\n')), 'multi.pdf', 'application/pdf');
  assert(parsedMulti.experience.length === 2, `Extracted 2 distinct employers (got: ${parsedMulti.experience.length})`);
  assert(parsedMulti.experience[0].company === 'Google', 'First employer is Google');
  assert((parsedMulti.experience[0].bullets?.length ?? 0) === 2, 'Google has 2 bullets');
  assert(parsedMulti.experience[1].company === 'Uber', 'Second employer is Uber');
  assert((parsedMulti.experience[1].bullets?.length ?? 0) === 2, 'Uber has 2 bullets');

  // -------------------------------------------------------------------
  // TEST 7: Missing Information Anti-Fabrication
  // -------------------------------------------------------------------
  console.log('\nTEST 7: Anti-Fabrication Guarantees');
  const missingInfoText = `
Dev Without Company
dev@example.com | 9876543210
EXPERIENCE
Software Engineer
• Only bullet points provided without company name or dates.
`;
  const parsedMissing = await ResumeParserService.parseResume(await createPdfFromLines(missingInfoText.split('\n')), 'missing.pdf', 'application/pdf');
  for (const exp of parsedMissing.experience) {
    assert(exp.company !== 'Organization', 'Never invents "Organization" as company');
    assert(exp.company !== 'SMVEN Technologies', 'Never bleeds other company names');
  }

  // -------------------------------------------------------------------
  // TEST 8: Responsibility Bullet Continuation & Normalization
  // -------------------------------------------------------------------
  console.log('\nTEST 8: Wrapped Line Continuation');
  const wrappedText = `
Candidate Name
candidate@example.com | 9876543210
EXPERIENCE
Full Stack Developer
Tech Innovators May 2023 - Present
• Developed complex distributed microservices architecture using Node.js and TypeScript,
supporting multi-tenant client onboarding and billing integrations.
• Automated CI/CD deployment pipelines using GitHub Actions and Docker containers,
resulting in 50% faster release cycles across engineering teams.
`;
  const parsedWrapped = await ResumeParserService.parseResume(await createPdfFromLines(wrappedText.split('\n')), 'wrapped.pdf', 'application/pdf');
  const wrappedBullets = parsedWrapped.experience[0]?.bullets || [];
  assert(wrappedBullets.length === 2, `Preserved exactly 2 complete bullets (got: ${wrappedBullets.length})`);
  assert(Boolean(wrappedBullets[0]?.includes('supporting multi-tenant client onboarding')), 'Wrapped line 1 correctly joined');
  assert(Boolean(wrappedBullets[1]?.includes('resulting in 50% faster release cycles')), 'Wrapped line 2 correctly joined');

  // -------------------------------------------------------------------
  // TEST 9: AI and Deterministic Fallback Consistency
  // -------------------------------------------------------------------
  console.log('\nTEST 9: AI Extraction Merging & Fallback Consistency');
  const dummyMetadata = {
    fileType: 'txt' as const,
    characterCount: wrappedText.length,
    wordCount: wrappedText.split(/\s+/).length,
    extractionMethod: 'TXT_DECODE' as const,
    qualityStatus: 'HIGH' as const,
    ocrUsed: false,
    warnings: [],
  };
  const baselineStructured = StructuredResumeEngine.processStructuredIntelligence(wrappedText, 'wrapped.pdf', dummyMetadata);
  const aiExtracted = await AiResumeExtractor.extractWithAi(
    wrappedText,
    'wrapped.pdf',
    dummyMetadata
  );
  assert(aiExtracted.experience.length === baselineStructured.experience.length, 'Deterministic fallback produces matching experience length');
  assert(aiExtracted.experience[0]?.company === baselineStructured.experience[0]?.company, 'Company name is consistent across extraction paths');

  // -------------------------------------------------------------------
  // TEST 10: Phase 5.1 Review State Verification
  // -------------------------------------------------------------------
  console.log('\nTEST 10: Review State & Approval Policy Guarantees');
  const jiti = require('jiti')(path.join(process.cwd(), 'runner.js'), {
    alias: {
      '@backend': path.resolve(process.cwd(), 'backend/src'),
      '@': path.resolve(process.cwd(), 'frontend/src'),
    },
  });
  const { buildReviewSections, collectReviewStats } = jiti('./frontend/src/components/onboarding/resume-review/reviewModel.ts');

  const reviewSections = buildReviewSections(parsed1);
  const reviewStats = collectReviewStats(reviewSections);

  assert(reviewStats.approved === 0, 'Every extracted field starts pending (approved: 0)');
  const expReview = reviewSections.find((s: any) => s.key === 'experience');
  assert(Boolean(expReview && expReview.entries.length === 1), 'Work Experience has exactly 1 entry in review modal');
  assert(expReview.entries[0].fields.find((f: any) => f.key === 'company')?.value === 'SMVEN Technologies', 'Review modal company is SMVEN Technologies');
  assert(expReview.entries[0].fields.find((f: any) => f.key === 'company')?.decision === 'pending', 'Company decision is pending explicit candidate approval');

  const internReview = reviewSections.find((s: any) => s.key === 'internships');
  assert(Boolean(internReview && internReview.entries.length === 0), 'Internships tab has 0 entries (no duplicate display)');

  console.log('\n========================================================================');
  console.log('   ALL 10 REGRESSION SCENARIOS PASSED WITH ZERO FAILURES');
  console.log('========================================================================\n');
}

runRegressionSuite().catch((err) => {
  console.error('Fatal error in regression suite:', err);
  process.exit(1);
});
