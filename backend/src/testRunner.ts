import { ResumeParserService } from './services/resumeParserService';
import {
  Step1AboutYouSchema,
  Step4SkillsSchema,
  Step6CareerDirectionSchema,
  FullOnboardingPayloadSchema,
} from './validations/onboardingSchemas';

async function runTests() {
  console.log('🧪 Running Candidate Onboarding & Resume Parser Verification Tests...\n');
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

  // 1. ResumeParserService Test
  try {
    const sampleResume = `
      Alex Morgan
      alex.morgan@example.com | +1 (555) 019-2834 | San Francisco, CA
      https://linkedin.com/in/alexmorgan | https://github.com/alexmorgan

      WORK EXPERIENCE
      Software Engineer at Pathway Tech
      2022 - Present
      Developed React and Node.js microservices with AWS and PostgreSQL.

      EDUCATION
      Stanford University
      Bachelor of Science in Computer Science
      2018 - 2022

      SKILLS
      Python, TypeScript, React, Docker, Machine Learning, SQL
    `;

    const parsed = await ResumeParserService.parseResume(Buffer.from(sampleResume), 'resume.pdf', 'application/pdf');

    assert(parsed.personalInfo.email === 'alex.morgan@example.com', 'Resume Parser extracts email');
    assert(parsed.personalInfo.phone === '+1 (555) 019-2834', 'Resume Parser extracts phone');
    assert(parsed.personalInfo.location === 'San Francisco, CA', 'Resume Parser extracts location');
    assert(parsed.education.length > 0 && parsed.education[0].source === 'RESUME', 'Resume Parser extracts education with source=RESUME');
    assert(parsed.experience.length > 0 && parsed.experience[0].source === 'RESUME', 'Resume Parser extracts experience with source=RESUME');
    assert(parsed.skills.some(s => s.name === 'Python') && parsed.skills.every(s => s.source === 'RESUME'), 'Resume Parser extracts skills with provenance');
    assert(parsed.professionalLinks.length >= 2, 'Resume Parser extracts social links');
  } catch (err: any) {
    assert(false, `Resume Parser execution error: ${err.message}`);
  }

  // 2. Zod Validation Tests
  const step1Valid = Step1AboutYouSchema.safeParse({
    name: 'Alex Morgan',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    candidateType: 'STUDENT',
  });
  assert(step1Valid.success, 'Step 1 Zod Schema accepts valid personal info');

  const step1Invalid = Step1AboutYouSchema.safeParse({
    name: 'A',
    phone: '12',
    location: '',
    candidateType: 'INVALID',
  });
  assert(!step1Invalid.success, 'Step 1 Zod Schema rejects invalid personal info');

  const step4Valid = Step4SkillsSchema.safeParse({
    skills: [{ name: 'TypeScript', level: 'ADVANCED', source: 'USER', verified: true }],
  });
  assert(step4Valid.success, 'Step 4 Zod Schema accepts valid skills with provenance');

  const step4Empty = Step4SkillsSchema.safeParse({ skills: [] });
  assert(!step4Empty.success, 'Step 4 Zod Schema rejects empty skills list');

  const step6Valid = Step6CareerDirectionSchema.safeParse({
    targetRole: 'Software Engineer',
    careerGoalType: 'Get my first job',
  });
  assert(step6Valid.success, 'Step 6 Zod Schema validates target career role');

  const fullPayload = FullOnboardingPayloadSchema.safeParse({
    aboutYou: {
      name: 'Alex Morgan',
      phone: '+1 (555) 019-2834',
      location: 'London, UK',
      candidateType: 'STUDENT',
    },
    education: [
      {
        institution: 'Oxford University',
        degree: 'B.S.',
        fieldOfStudy: 'Computer Science',
        startYear: 2020,
        endYear: 2024,
        isCurrent: false,
      },
    ],
    hasNoExperience: true,
    experience: [],
    skills: [
      { name: 'Python', level: 'ADVANCED', source: 'USER', verified: true },
    ],
    projects: [
      {
        title: 'PATHWAY.ECO Platform',
        technologies: ['React', 'Next.js', 'MongoDB'],
      },
    ],
    careerDirection: {
      targetRole: 'Full Stack Engineer',
    },
    preferences: {
      preferredJobType: 'Full-time',
      workEnvironment: 'Remote',
      willingToRelocate: false,
      preferredIndustries: ['Fintech'],
      learningStyle: ['Hands-on projects'],
      availableHoursPerWeek: '5–10 hours/week',
      mentorshipNeeds: ['Career direction'],
    },
    certifications: [],
    achievements: [],
    professionalLinks: [],
  });
  // 3. Tools Platform Verification Tests
  try {
    console.log('\n🛠️  Running Tools Platform Unit Tests...');
    const { FileValidationService } = await import('./services/tools/file-validation-service');
    const { PdfToolsService } = await import('./services/tools/pdf-tools-service');
    const { RateLimitService } = await import('./services/tools/rate-limit-service');

    // Filename Sanitization Tests
    const clean1 = FileValidationService.sanitizeFilename('../../etc/passwd.docx');
    assert(clean1 === 'passwd.docx', 'Filename Sanitizer prevents path traversal and extracts clean basename');

    const clean2 = FileValidationService.sanitizeFilename('My Resume Final (2026).docx');
    assert(clean2 === 'My_Resume_Final__2026_.docx', 'Filename Sanitizer normalizes spaces and special characters');

    // File Size Validation
    try {
      FileValidationService.validateFileSize(0);
      assert(false, 'File Size Validator rejects empty files');
    } catch (e: any) {
      assert(e.code === 'EMPTY_FILE', 'File Size Validator returns EMPTY_FILE code');
    }

    try {
      FileValidationService.validateFileSize(30 * 1024 * 1024);
      assert(false, 'File Size Validator rejects > 25MB files');
    } catch (e: any) {
      assert(e.code === 'FILE_TOO_LARGE', 'File Size Validator returns FILE_TOO_LARGE code');
    }

    // Supported Conversions Validation
    try {
      FileValidationService.validateSupportedConversion('pdf', 'docx');
      assert(false, 'Validator rejects reverse conversion PDF -> DOCX in Phase 1');
    } catch (e: any) {
      assert(e.code === 'UNSUPPORTED_CONVERSION', 'Validator returns UNSUPPORTED_CONVERSION code for PDF -> DOCX');
    }

    // File Signature Magic Byte Tests
    try {
      const fakeDocxBuffer = Buffer.from('THIS IS NOT A ZIP FILE');
      FileValidationService.validateFileSignature(fakeDocxBuffer, 'docx');
      assert(false, 'Magic Byte Validator rejects fake .docx with invalid header');
    } catch (e: any) {
      assert(e.code === 'INVALID_FILE_SIGNATURE', 'Magic Byte Validator returns INVALID_FILE_SIGNATURE code');
    }

    // PDF Page Ranges Parsing
    const ranges = PdfToolsService.parsePageRanges('1-3, 5', 10);
    assert(JSON.stringify(ranges) === '[0,1,2,4]', 'PDF Page Range Parser parses "1-3, 5" into 0-indexed indices [0,1,2,4]');

    // Rate Limit Enforcement
    const rl1 = await RateLimitService.enforceRateLimit('test-guest-ip', false);
    assert(rl1.allowed && rl1.remaining === 2, 'Rate Limiter allows guest requests within limit');

    // 4. DOCX -> PDF Conversion Integration Test
    console.log('\n📄 Running DOCX -> PDF Conversion Integration Test...');
    const { GotenbergConversionProvider } = await import('./services/tools/gotenberg-provider');
    const { OutputValidationService } = await import('./services/tools/output-validation-service');
    const { PDFDocument } = await import('pdf-lib');
    const zlib = await import('zlib');

    // Helper to generate a real, spec-compliant DOCX ZIP fixture buffer
    function createRealDocxFixture(text: string): Buffer {
      const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>${text}</w:t></w:r></w:p>
  </w:body>
</w:document>`;

      const typesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

      const entries = [
        { name: '[Content_Types].xml', content: Buffer.from(typesXml, 'utf-8') },
        { name: 'word/document.xml', content: Buffer.from(docXml, 'utf-8') },
      ];

      function calcCrc32(buf: Buffer): number {
        let crc = 0xffffffff;
        for (let i = 0; i < buf.length; i++) {
          crc ^= buf[i];
          for (let j = 0; j < 8; j++) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
          }
        }
        return (crc ^ 0xffffffff) >>> 0;
      }

      const parts: Buffer[] = [];
      const cdEntries: Buffer[] = [];
      let offset = 0;

      for (const entry of entries) {
        const compData = zlib.deflateRawSync(entry.content);
        const fileNameBuf = Buffer.from(entry.name, 'utf-8');
        const crc = calcCrc32(entry.content);

        const lfh = Buffer.alloc(30 + fileNameBuf.length);
        lfh.writeUInt32LE(0x04034b50, 0);
        lfh.writeUInt16LE(20, 4);
        lfh.writeUInt16LE(0, 6);
        lfh.writeUInt16LE(8, 8);
        lfh.writeUInt16LE(0, 10);
        lfh.writeUInt16LE(0, 12);
        lfh.writeUInt32LE(crc, 14);
        lfh.writeUInt32LE(compData.length, 18);
        lfh.writeUInt32LE(entry.content.length, 22);
        lfh.writeUInt16LE(fileNameBuf.length, 26);
        lfh.writeUInt16LE(0, 28);
        fileNameBuf.copy(lfh, 30);

        const lfhOffset = offset;
        parts.push(lfh);
        parts.push(compData);
        offset += lfh.length + compData.length;

        const cdh = Buffer.alloc(46 + fileNameBuf.length);
        cdh.writeUInt32LE(0x02014b50, 0);
        cdh.writeUInt16LE(20, 4);
        cdh.writeUInt16LE(20, 6);
        cdh.writeUInt16LE(0, 8);
        cdh.writeUInt16LE(8, 10);
        cdh.writeUInt16LE(0, 12);
        cdh.writeUInt16LE(0, 14);
        cdh.writeUInt32LE(crc, 16);
        cdh.writeUInt32LE(compData.length, 20);
        cdh.writeUInt32LE(entry.content.length, 24);
        cdh.writeUInt16LE(fileNameBuf.length, 28);
        cdh.writeUInt16LE(0, 30);
        cdh.writeUInt16LE(0, 32);
        cdh.writeUInt16LE(0, 34);
        cdh.writeUInt16LE(0, 36);
        cdh.writeUInt32LE(0, 38);
        cdh.writeUInt32LE(lfhOffset, 42);
        fileNameBuf.copy(cdh, 46);

        cdEntries.push(cdh);
      }

      const cdOffset = offset;
      let cdSize = 0;
      for (const cdh of cdEntries) {
        parts.push(cdh);
        cdSize += cdh.length;
      }

      const eocd = Buffer.alloc(22);
      eocd.writeUInt32LE(0x06054b50, 0);
      eocd.writeUInt16LE(0, 4);
      eocd.writeUInt16LE(0, 6);
      eocd.writeUInt16LE(entries.length, 8);
      eocd.writeUInt16LE(entries.length, 10);
      eocd.writeUInt32LE(cdSize, 12);
      eocd.writeUInt32LE(cdOffset, 16);
      eocd.writeUInt16LE(0, 20);

      parts.push(eocd);
      return Buffer.concat(parts);
    }

    const realDocxFixture = createRealDocxFixture('Yaswanth Rajana - Software Engineer Resume');

    const provider = new GotenbergConversionProvider();
    const result = await provider.convertToPdf(realDocxFixture, {
      jobId: 'test-job-123',
      sourceFormat: 'docx',
      targetFormat: 'pdf',
      originalFilename: 'resume.docx',
    });

    assert(result.pdfBuffer && result.pdfBuffer.length > 0, 'DOCX -> PDF output size is greater than zero');
    assert(result.pdfBuffer.slice(0, 5).toString('ascii') === '%PDF-', 'DOCX -> PDF output starts with valid %PDF- magic bytes');

    // Parse with real PDF parser (pdf-lib)
    const pdfDoc = await PDFDocument.load(result.pdfBuffer);
    assert(pdfDoc.getPageCount() >= 1, 'PDF parser successfully loads document with at least 1 page');

    // Verify raw PDF buffer does NOT contain raw DOCX package strings
    const pdfString = result.pdfBuffer.toString('binary');
    const hasDocxPackageStrings =
      pdfString.includes('word/document.xml') ||
      pdfString.includes('[Content_Types].xml') ||
      pdfString.includes('_rels/.rels');

    assert(!hasDocxPackageStrings, 'Output PDF binary does NOT contain raw DOCX package strings (PK, word/document.xml)');

    // Output Validation Service Verification
    const validatedOutput = await OutputValidationService.validatePdfOutput(result.pdfBuffer, 'test-job-123', 'docx');
    assert(validatedOutput.isPdf && validatedOutput.sizeBytes > 0 && validatedOutput.pageCount >= 1, 'OutputValidationService confirms valid PDF structure with pageCount >= 1');

    console.log('✓ Tools Platform Integration Tests Completed.');
  } catch (err: any) {
    assert(false, `Tools Platform test error: ${err.message}`);
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
