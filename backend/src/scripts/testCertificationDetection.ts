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
  console.log('   PATHWAY.ECO — Resume Certifications Extraction Suite (10 Scenarios)');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------
  // TEST 1: Exact supplied resume (Yaswanth_Resume_FullStack_Intern (1).pdf)
  // -------------------------------------------------------------------
  console.log('TEST 1: Exact Supplied Resume Fixture');
  const pdfFixturePath = '/Users/yaswanthrajana/.gemini/antigravity/brain/1f874f8f-4c23-4482-903b-dbb8abcd5ffd/.user_uploaded/media_1793879967999_54606fc4.pdf';
  assert(fs.existsSync(pdfFixturePath), 'User resume PDF fixture exists on disk');

  const pdfBuffer = fs.readFileSync(pdfFixturePath);
  const parsed1 = await ResumeParserService.parseResume(pdfBuffer, 'Yaswanth_Resume_FullStack_Intern (1).pdf', 'application/pdf');

  assert(parsed1.certifications.length === 3, `Exactly 3 certifications extracted (got: ${parsed1.certifications.length})`);

  // Cert 1
  const cert1 = parsed1.certifications[0];
  assert(cert1?.name === 'Cyber Defense & Security Analyst', `Cert 1 title is exact (got: "${cert1?.name}")`);
  assert(cert1?.issuingOrganization === 'Blackbucks Education Pvt. Ltd. (APSCHE-affiliated)', `Cert 1 issuer is exact (got: "${cert1?.issuingOrganization}")`);
  assert(cert1?.issueDate === 'July 2026', `Cert 1 issueDate is exact (got: "${cert1?.issueDate}")`);

  // Cert 2
  const cert2 = parsed1.certifications[1];
  assert(cert2?.name === 'Java with Data Structures & Algorithms', `Cert 2 title is exact (got: "${cert2?.name}")`);
  assert(cert2?.issuingOrganization === 'Apna College', `Cert 2 issuer is exact (got: "${cert2?.issuingOrganization}")`);

  // Cert 3
  const cert3 = parsed1.certifications[2];
  assert(cert3?.name === 'Java Full Stack Development', `Cert 3 title is exact (got: "${cert3?.name}")`);
  assert(cert3?.issuingOrganization === 'Wipro TalentNext', `Cert 3 issuer is exact (got: "${cert3?.issuingOrganization}")`);

  // Verify no placeholder "Issuing Organization" exists
  const hasDummyIssuer = parsed1.certifications.some((c) => c.issuingOrganization === 'Issuing Organization');
  assert(!hasDummyIssuer, 'No fake dummy "Issuing Organization" placeholder created');

  // Verify sub-bullet was not turned into a separate certification
  const hasSubBulletCert = parsed1.certifications.some((c) => c.name.includes('12-Week Internship'));
  assert(!hasSubBulletCert, 'Sub-bullet "12-Week Internship" was not turned into a separate certification');

  // -------------------------------------------------------------------
  // TEST 2: Inline Delimited Formats (dash, en-dash, pipe, by, from)
  // -------------------------------------------------------------------
  console.log('\nTEST 2: Inline Delimited Formats');
  const delimText = `
Candidate Name
dev@example.com

CERTIFICATIONS
• CKAD: Certified Kubernetes Application Developer – Linux Foundation
• AWS Certified Solutions Architect | Amazon Web Services | 2024
• Deep Learning Specialization by DeepLearning.AI
• Python for Everybody from Coursera
`;
  const parsedDelim = await ResumeParserService.parseResume(await createPdfFromLines(delimText.split('\n')), 'delim.pdf', 'application/pdf');
  assert(parsedDelim.certifications.length === 4, `Extracted 4 delimited certifications (got: ${parsedDelim.certifications.length})`);
  assert(parsedDelim.certifications[0]?.issuingOrganization.includes('Linux Foundation'), 'Extracted Linux Foundation as issuer');
  assert(parsedDelim.certifications[1]?.issuingOrganization.includes('Amazon Web Services'), 'Extracted Amazon Web Services as issuer');
  assert(parsedDelim.certifications[1]?.issueDate === '2024', 'Extracted 2024 as issueDate');
  assert(parsedDelim.certifications[2]?.issuingOrganization.includes('DeepLearning.AI'), 'Extracted DeepLearning.AI as issuer (via "by")');
  assert(parsedDelim.certifications[3]?.issuingOrganization.includes('Coursera'), 'Extracted Coursera as issuer (via "from")');

  // -------------------------------------------------------------------
  // TEST 3: Multi-line Certification Blocks
  // -------------------------------------------------------------------
  console.log('\nTEST 3: Multi-line Certification Blocks');
  const multiLineText = `
Candidate Name
dev@example.com

CERTIFICATIONS
Google Cloud Certified Associate Cloud Engineer
Google Cloud • May 2023

Microsoft Certified: Azure Fundamentals
Microsoft
`;
  const parsedMulti = await ResumeParserService.parseResume(await createPdfFromLines(multiLineText.split('\n')), 'multi.pdf', 'application/pdf');
  assert(parsedMulti.certifications.length === 2, `Extracted 2 multi-line certifications (got: ${parsedMulti.certifications.length})`);
  assert(parsedMulti.certifications[0]?.name.includes('Google Cloud Certified'), 'Cert 1 title preserved');
  assert(parsedMulti.certifications[0]?.issuingOrganization === 'Google Cloud', 'Cert 1 issuer extracted from line 2');
  assert(parsedMulti.certifications[0]?.issueDate === 'May 2023', 'Cert 1 date extracted from line 2');
  assert(parsedMulti.certifications[1]?.issuingOrganization === 'Microsoft', 'Cert 2 issuer extracted from line 2');

  // -------------------------------------------------------------------
  // TEST 4: Credential ID and URL Association
  // -------------------------------------------------------------------
  console.log('\nTEST 4: Credential ID and URL Association');
  const credText = `
Candidate Name
dev@example.com

CERTIFICATIONS
AWS Certified Solutions Architect
Amazon Web Services
• Credential ID: AWS-9921048
• https://aws.amazon.com/verify/AWS-9921048
`;
  const parsedCred = await ResumeParserService.parseResume(await createPdfFromLines(credText.split('\n')), 'cred.pdf', 'application/pdf');
  assert(parsedCred.certifications.length === 1, `Extracted 1 certification with credentials (got: ${parsedCred.certifications.length})`);
  assert(parsedCred.certifications[0]?.credentialId === 'AWS-9921048', `Credential ID extracted: "${parsedCred.certifications[0]?.credentialId}"`);
  assert(Boolean(parsedCred.certifications[0]?.credentialUrl?.includes('aws.amazon.com')), `Credential URL extracted: "${parsedCred.certifications[0]?.credentialUrl}"`);

  // -------------------------------------------------------------------
  // TEST 5: Date Range Extraction (Issue and Expiry)
  // -------------------------------------------------------------------
  console.log('\nTEST 5: Date Range Extraction (Issue and Expiry)');
  const dateRangeText = `
Candidate Name
dev@example.com

CERTIFICATIONS
CompTIA Security+ – CompTIA
Issued May 2023 - Expires May 2026
`;
  const parsedDateRange = await ResumeParserService.parseResume(await createPdfFromLines(dateRangeText.split('\n')), 'dates.pdf', 'application/pdf');
  assert(parsedDateRange.certifications.length === 1, 'Extracted 1 certification');
  assert(parsedDateRange.certifications[0]?.issueDate === 'May 2023', `Issue date extracted: "${parsedDateRange.certifications[0]?.issueDate}"`);
  assert(parsedDateRange.certifications[0]?.expiryDate === 'May 2026', `Expiry date extracted: "${parsedDateRange.certifications[0]?.expiryDate}"`);

  // -------------------------------------------------------------------
  // TEST 6: Known Issuer Inferencing (When Omitted)
  // -------------------------------------------------------------------
  console.log('\nTEST 6: Known Issuer Inferencing');
  const inferText = `
Candidate Name
dev@example.com

CERTIFICATIONS
AWS Certified Solutions Architect Associate
Certified Kubernetes Administrator (CKA)
`;
  const parsedInfer = await ResumeParserService.parseResume(await createPdfFromLines(inferText.split('\n')), 'infer.pdf', 'application/pdf');
  assert(parsedInfer.certifications.length === 2, `Extracted 2 certifications (got: ${parsedInfer.certifications.length})`);
  assert(parsedInfer.certifications[0]?.issuingOrganization === 'Amazon Web Services', `Inferred AWS issuer: "${parsedInfer.certifications[0]?.issuingOrganization}"`);
  assert(parsedInfer.certifications[1]?.issuingOrganization.includes('Cloud Native Computing Foundation'), `Inferred CNCF issuer: "${parsedInfer.certifications[1]?.issuingOrganization}"`);

  // -------------------------------------------------------------------
  // TEST 7: Strict Anti-Fabrication for Unknown Issuers
  // -------------------------------------------------------------------
  console.log('\nTEST 7: Anti-Fabrication Guarantees');
  const unknownText = `
Candidate Name
dev@example.com

CERTIFICATIONS
Advanced Distributed Architecture Mastery
`;
  const parsedUnknown = await ResumeParserService.parseResume(await createPdfFromLines(unknownText.split('\n')), 'unknown.pdf', 'application/pdf');
  assert(parsedUnknown.certifications.length === 1, 'Extracted certification');
  assert(parsedUnknown.certifications[0]?.issuingOrganization === '', 'Unknown issuer remains empty (not fabricated with fake dummy text)');

  // -------------------------------------------------------------------
  // TEST 8: Online Course Diversion from Education
  // -------------------------------------------------------------------
  console.log('\nTEST 8: Online Course Diversion from Education');
  const divertedText = `
Candidate Name
dev@example.com

EDUCATION
Stanford University | 2018 - 2022
B.S. in Computer Science
Scaler Academy | 2022 - 2023
Full Stack Web Development

CERTIFICATIONS
Java Full Stack – Wipro TalentNext
`;
  const parsedDiverted = await ResumeParserService.parseResume(await createPdfFromLines(divertedText.split('\n')), 'divert.pdf', 'application/pdf');
  assert(parsedDiverted.education.length === 1, 'Only Stanford in education');
  assert(!parsedDiverted.education.some((e) => e.institution.includes('Scaler')), 'Scaler strictly rejected from education');
  assert(parsedDiverted.certifications.some((c) => c.issuingOrganization.includes('Scaler')), 'Scaler successfully routed to certifications');
  assert(parsedDiverted.certifications.some((c) => c.issuingOrganization.includes('Wipro')), 'Native certification preserved');

  // -------------------------------------------------------------------
  // TEST 9: AI Extraction Merging & Fallback Consistency
  // -------------------------------------------------------------------
  console.log('\nTEST 9: AI Extraction Merging & Fallback Consistency');
  const dummyMetadata = {
    fileType: 'pdf' as const,
    extractionMethod: 'PDF_PARSE_LAYOUT' as const,
    characterCount: parsed1.rawText.length,
    wordCount: parsed1.rawText.split(/\s+/).length,
    pageCount: 1,
    ocrUsed: false,
    warnings: [],
    qualityStatus: 'HIGH' as const,
  };
  const aiExtractionResult = await AiResumeExtractor.extractWithAi(
    parsed1.rawText,
    'Yaswanth_Resume.pdf',
    dummyMetadata
  );
  assert(Array.isArray(aiExtractionResult.certifications), 'AI extractor returns certifications array');
  assert(aiExtractionResult.certifications.length === 3, `AI merge retains exact 3 certifications (got: ${aiExtractionResult.certifications.length})`);
  assert(aiExtractionResult.certifications[0]?.name === 'Cyber Defense & Security Analyst', 'AI Cert 1 title matches');
  assert(aiExtractionResult.certifications[0]?.issuingOrganization === 'Blackbucks Education Pvt. Ltd. (APSCHE-affiliated)', 'AI Cert 1 issuer matches');

  // -------------------------------------------------------------------
  // TEST 10: Structured Evidence & Review Model Guarantees
  // -------------------------------------------------------------------
  console.log('\nTEST 10: Structured Evidence & Review Model Guarantees');
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
  const certReview = reviewSections.find((s: any) => s.key === 'certifications');
  assert(Boolean(certReview && certReview.entries.length === 3), `Certifications section has exactly 3 entries in review modal (got: ${certReview?.entries?.length})`);
  assert(certReview.entries[0].duplicate === false, 'Cert 1 duplicate flag is false');
  assert(certReview.entries[0].fields.find((f: any) => f.key === 'name')?.value === 'Cyber Defense & Security Analyst', 'Cert 1 review model name is accurate');
  assert(certReview.entries[0].fields.find((f: any) => f.key === 'issuingOrganization')?.value === 'Blackbucks Education Pvt. Ltd. (APSCHE-affiliated)', 'Cert 1 review model issuer is accurate');
  assert(certReview.entries[0].fields.find((f: any) => f.key === 'issueDate')?.value === 'July 2026', 'Cert 1 review model issueDate is accurate');
  assert(certReview.entries[0].fields.find((f: any) => f.key === 'name')?.decision === 'pending', 'Cert 1 decision is pending candidate approval');

  console.log('\n========================================================================');
  console.log('   ALL 10 CERTIFICATIONS REGRESSION SCENARIOS PASSED WITH ZERO FAILURES');
  console.log('========================================================================\n');
}

runRegressionSuite().catch((err) => {
  console.error('Test suite execution failed:', err);
  process.exit(1);
});
