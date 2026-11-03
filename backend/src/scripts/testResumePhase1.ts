import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { ResumeParserService } from '../services/resumeParserService';
import { FileValidationService } from '../services/tools/file-validation-service';

async function generateSamplePdf(textLines: string[], pages = 1): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let p = 0; p < pages; p++) {
    const page = doc.addPage([600, 800]);
    let y = 750;
    for (const line of textLines) {
      page.drawText(line, { x: 50, y, font, size: 11 });
      y -= 20;
    }
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

async function runResumePhase1Tests() {
  console.log('========================================================================');
  console.log('PATHWAY.ECO — RESUME PHASE 1 EXTRACTION & VALIDATION VERIFICATION');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      if (detail) console.error(`     ↳ ${detail}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------
    // 1. Normal text-based binary PDF Resume
    // -------------------------------------------------------------------
    console.log('--- 1. Normal Text-Based Binary PDF Resume ---');
    const pdfLines = [
      'Marcus Vance',
      'marcus.vance@example.com | +1 (555) 234-5678 | San Francisco, CA',
      'https://linkedin.com/in/marcusvance | https://github.com/marcusvance',
      'SUMMARY',
      'Experienced Senior Full Stack Developer passionate about scalable cloud systems.',
      'EXPERIENCE',
      'Senior Software Engineer at CloudCorp',
      '2021 - Present',
      'Architected distributed microservices in Go and TypeScript with Docker on AWS.',
      'EDUCATION',
      'University of California, Berkeley',
      'Bachelor of Science in Computer Science',
      '2017 - 2021',
      'SKILLS',
      'Go, TypeScript, React, Docker, Kubernetes, AWS, PostgreSQL, Redis',
    ];

    const pdfBuffer = await generateSamplePdf(pdfLines, 1);
    assert(pdfBuffer.slice(0, 5).toString('ascii') === '%PDF-', 'Generated real binary PDF with %PDF- header');

    const parsedPdf = await ResumeParserService.parseResume(pdfBuffer, 'marcus_vance.pdf', 'application/pdf');
    assert(parsedPdf.personalInfo.name === 'Marcus Vance', `Parsed candidate name: "${parsedPdf.personalInfo.name}"`);
    assert(parsedPdf.personalInfo.email === 'marcus.vance@example.com', 'Parsed candidate email');
    assert(parsedPdf.personalInfo.phone === '+1 (555) 234-5678', 'Parsed candidate phone');
    assert(parsedPdf.personalInfo.location === 'San Francisco, CA', 'Parsed candidate location');
    assert(parsedPdf.education.length > 0, `Parsed ${parsedPdf.education.length} education entries`);
    assert(parsedPdf.education[0]?.institution.includes('Berkeley'), 'Extracted real university (UC Berkeley)');
    assert(parsedPdf.education[0]?.degree === 'Bachelor of Science', 'Extracted degree');
    assert(parsedPdf.education[0]?.startYear === 2017 && parsedPdf.education[0]?.endYear === 2021, 'Extracted education years (2017-2021)');
    assert(parsedPdf.education[0]?.source === 'RESUME', 'Education source tagged as RESUME');
    assert(parsedPdf.experience.length > 0, `Parsed ${parsedPdf.experience.length} experience entries`);
    assert(parsedPdf.experience[0]?.company.includes('CloudCorp'), 'Extracted company name (CloudCorp)');
    assert(parsedPdf.experience[0]?.startDate === '2021', 'Extracted real start date (2021)');
    assert(parsedPdf.skills.some(s => s.name === 'Go') && parsedPdf.skills.some(s => s.name === 'Kubernetes'), 'Extracted skills accurately from text');

    // -------------------------------------------------------------------
    // 2. Multi-Page Binary PDF Resume
    // -------------------------------------------------------------------
    console.log('\n--- 2. Multi-Page Binary PDF Resume ---');
    const multiPagePdf = await generateSamplePdf(pdfLines, 3);
    const parsedMultiPage = await ResumeParserService.parseResume(multiPagePdf, 'marcus_cv.pdf', 'application/pdf');
    assert(!parsedMultiPage.rawText.includes('-- 1 of 3 --'), 'Stripped page marker noise from multi-page PDF');
    assert(parsedMultiPage.personalInfo.name === 'Marcus Vance', 'Extracted name correctly across multi-page PDF');
    assert(parsedMultiPage.rawText.length > 300, 'Extracted text across all 3 pages');

    // -------------------------------------------------------------------
    // 3. Real DOCX Resume Fixture
    // -------------------------------------------------------------------
    console.log('\n--- 3. Real DOCX Document Extraction ---');
    const docxPath = path.join(__dirname, '../__tests__/fixtures/ASE_JD_for_College.docx');
    assert(fs.existsSync(docxPath), 'Test DOCX fixture file exists');

    const docxBuffer = fs.readFileSync(docxPath);
    const parsedDocx = await ResumeParserService.parseResume(docxBuffer, 'Job_Description.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    assert(parsedDocx.rawText.length > 200, `Successfully extracted ${parsedDocx.rawText.length} characters from real DOCX via mammoth`);
    assert(!parsedDocx.rawText.includes('[Content_Types].xml'), 'Extracted clean text without zip XML artifacts');

    // -------------------------------------------------------------------
    // 4. Real TXT Resume
    // -------------------------------------------------------------------
    console.log('\n--- 4. Plain Text (TXT) Resume Extraction ---');
    const txtResume = `
      Sarah Connor
      sarah.connor@example.com | +1 (555) 987-6543 | Los Angeles, CA
      https://github.com/sarahconnor

      WORK EXPERIENCE
      Cybersecurity Analyst at Cyberdyne Systems
      2022 - Present
      Maintained zero-trust perimeter defense and vulnerability remediation.

      EDUCATION
      UCLA
      Bachelor of Science in Computer Science
      2018 - 2022

      SKILLS
      Cybersecurity, Python, Linux, Docker, Git, Agile
    `;
    const txtBuffer = Buffer.from(txtResume, 'utf-8');
    const parsedTxt = await ResumeParserService.parseResume(txtBuffer, 'sarah_connor.txt', 'text/plain');
    assert(parsedTxt.personalInfo.name === 'Sarah Connor', 'Extracted candidate name from TXT');
    assert(parsedTxt.personalInfo.email === 'sarah.connor@example.com', 'Extracted email from TXT');
    assert(parsedTxt.skills.some(s => s.name === 'Cybersecurity'), 'Extracted Cybersecurity skill from TXT');

    // -------------------------------------------------------------------
    // 5. Empty / Whitespace-only PDF
    // -------------------------------------------------------------------
    console.log('\n--- 5. Empty / Whitespace-Only Document ---');
    const emptyPdf = await generateSamplePdf([], 1);
    let caughtEmptyError = false;
    try {
      await ResumeParserService.parseResume(emptyPdf, 'empty.pdf', 'application/pdf');
    } catch (err: any) {
      caughtEmptyError = true;
      assert(err.message === 'No readable text was found in this resume.', `Threw clean error on empty document: "${err.message}"`);
    }
    assert(caughtEmptyError, 'Empty PDF was rejected with explicit error');

    // -------------------------------------------------------------------
    // 6. Corrupted PDF
    // -------------------------------------------------------------------
    console.log('\n--- 6. Corrupted PDF Document ---');
    const corruptedPdf = Buffer.from('%PDF-1.4 corrupt content that is definitely not valid PDF syntax #$@%!');
    let caughtCorruptPdf = false;
    try {
      await ResumeParserService.parseResume(corruptedPdf, 'broken.pdf', 'application/pdf');
    } catch (err: any) {
      caughtCorruptPdf = true;
      assert(err.message === 'Unable to read this PDF. Please upload a text-based PDF or another supported resume format.', `Threw expected error: "${err.message}"`);
    }
    assert(caughtCorruptPdf, 'Corrupted PDF caught and handled with friendly message');

    // -------------------------------------------------------------------
    // 7. Corrupted DOCX
    // -------------------------------------------------------------------
    console.log('\n--- 7. Corrupted DOCX Document ---');
    const corruptedDocx = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00, 0xFF, 0xEE, 0xDD]);
    let caughtCorruptDocx = false;
    try {
      await ResumeParserService.parseResume(corruptedDocx, 'broken.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    } catch (err: any) {
      caughtCorruptDocx = true;
      assert(err.message === 'Unable to read this DOCX file. Please verify the document is not corrupted.', `Threw expected error: "${err.message}"`);
    }
    assert(caughtCorruptDocx, 'Corrupted DOCX caught and handled with friendly message');

    // -------------------------------------------------------------------
    // 8. Spoofed File: Plain Text Renamed to .pdf (Magic Byte Validation)
    // -------------------------------------------------------------------
    console.log('\n--- 8. Spoofed File: Text Renamed to .pdf ---');
    const textAsPdf = Buffer.from('Just plain text without %PDF- header');
    let spoofCaught = false;
    try {
      FileValidationService.validateFileSignature(textAsPdf, 'pdf');
    } catch (err: any) {
      spoofCaught = true;
      assert(err.code === 'INVALID_FILE_SIGNATURE', `FileValidationService rejected spoofed PDF: ${err.code}`);
    }
    assert(spoofCaught, 'Magic-byte validator caught non-PDF renamed to .pdf');

    // -------------------------------------------------------------------
    // 9. Spoofed File: Executable Renamed to .pdf (Magic Byte Validation)
    // -------------------------------------------------------------------
    console.log('\n--- 9. Spoofed File: Binary Executable Renamed to .pdf ---');
    const exeAsPdf = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ header
    let exeCaught = false;
    try {
      FileValidationService.validateFileSignature(exeAsPdf, 'pdf');
    } catch (err: any) {
      exeCaught = true;
      assert(err.code === 'INVALID_FILE_SIGNATURE', `FileValidationService rejected executable renamed to .pdf: ${err.code}`);
    }
    assert(exeCaught, 'Magic-byte validator caught executable disguised as .pdf');

    // -------------------------------------------------------------------
    // 10. File Over 10MB Check
    // -------------------------------------------------------------------
    console.log('\n--- 10. Oversized File Handling ---');
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const oversizedSize = 11 * 1024 * 1024;
    assert(oversizedSize > MAX_FILE_SIZE, 'File size > 10MB correctly triggers route rejection threshold');

    // -------------------------------------------------------------------
    // 11. Legacy .doc File Rejection
    // -------------------------------------------------------------------
    console.log('\n--- 11. Legacy .doc File Handling ---');
    let legacyDocCaught = false;
    try {
      await ResumeParserService.parseResume(Buffer.from('legacy doc buffer'), 'resume.doc', 'application/msword');
    } catch (err: any) {
      legacyDocCaught = true;
      assert(err.message === 'Legacy .doc format is not supported. Please upload a PDF, DOCX, or TXT file.', `Clean rejection of legacy .doc: "${err.message}"`);
    }
    assert(legacyDocCaught, 'Legacy .doc rejected cleanly');

    // -------------------------------------------------------------------
    // 12. Verification of NO Fabricated Data
    // -------------------------------------------------------------------
    console.log('\n--- 12. Elimination of Fabricated Data ---');
    const minimalResume = `
      David Kim
      david.kim@example.com
      SKILLS: React, TypeScript
    `;
    const parsedMinimal = await ResumeParserService.parseResume(Buffer.from(minimalResume), 'david.txt', 'text/plain');
    assert(parsedMinimal.education.length === 0, 'No fake "State University" education fabricated');
    assert(parsedMinimal.experience.length === 0, 'No fake work experience or fake "2022 - Present" fabricated');
    assert(parsedMinimal.projects.length === 0, 'No fake "Personal Portfolio Project" fabricated');
    assert(parsedMinimal.personalInfo.phone === undefined, 'No fake phone number inferred');
    assert(parsedMinimal.personalInfo.location === undefined, 'No fake location inferred');

    // -------------------------------------------------------------------
    // 13. Section-Aware Parsing & Extraction Quality Verification
    // -------------------------------------------------------------------
    console.log('\n--- 13. Section-Aware Parsing & Multi-line Record Grouping ---');
    const targetResume = `
CHALLA YASWANTH RAJANA
yaswanth.rajana@example.com | +91 9876543210 | Andhra Pradesh, India
https://linkedin.com/in/yaswanth-rajana | https://github.com/yaswanth-rajana

EDUCATION

Sagi Rama Krishnam Raju Engineering College | 2023 – 2027
B.Tech in Computer Science – IoT & Cyber Security (Blockchain) | CGPA: 8.93/10

Sri Chaitanya Junior College | 2021 – 2023
Intermediate (MPC) | Percentage: 91.7%

Pragati EM School | 2020 – 2021
Secondary School Certificate (SSC) | Percentage: 95%

CERTIFICATIONS

Java with Data Structures & Algorithms – Apna College
Java Full Stack Development – Wipro TalentNext

SKILLS
Java, Python, C++, React, Node.js, Git
`;

    const parsedTarget = await ResumeParserService.parseResume(Buffer.from(targetResume), 'yaswanth_resume.pdf', 'application/pdf');

    // A. Certification must not become education
    assert(
      !parsedTarget.education.some(e => e.institution.toLowerCase().includes('apna') || e.institution.toLowerCase().includes('wipro')),
      'A. Certification must not become education (Apna College / Wipro not in education)'
    );

    // B. Education records must merge multi-line institution/degree/details into single records
    assert(parsedTarget.education.length === 3, `B. Education records merged correctly (expected 3, got ${parsedTarget.education.length})`);

    // C. No fabricated dates
    assert(
      parsedTarget.education[0]?.startYear === 2023 && parsedTarget.education[0]?.endYear === 2027,
      'C. Real education dates extracted accurately for college (2023 - 2027)'
    );
    assert(
      parsedTarget.education[1]?.startYear === 2021 && parsedTarget.education[1]?.endYear === 2023,
      'C. Real education dates extracted accurately for intermediate (2021 - 2023)'
    );
    assert(
      parsedTarget.education[2]?.startYear === 2020 && parsedTarget.education[2]?.endYear === 2021,
      'C. Real education dates extracted accurately for school (2020 - 2021)'
    );

    // D. No fabricated degree
    assert(
      parsedTarget.education[0]?.degree === 'B.Tech in Computer Science',
      `D. Extracted exact degree for engineering: "${parsedTarget.education[0]?.degree}"`
    );
    assert(
      parsedTarget.education[0]?.fieldOfStudy === 'IoT & Cyber Security (Blockchain)',
      `D. Extracted exact specialization: "${parsedTarget.education[0]?.fieldOfStudy}"`
    );

    // E. No duplicate education records
    const instNames = parsedTarget.education.map(e => e.institution);
    const uniqueInstNames = new Set(instNames);
    assert(instNames.length === uniqueInstNames.size, 'E. No duplicate education records created');

    // F. Correct CGPA extraction
    assert(parsedTarget.education[0]?.gpa === '8.93/10', `F. Correct CGPA extraction: "${parsedTarget.education[0]?.gpa}"`);

    // G. Correct percentage extraction
    assert(parsedTarget.education[1]?.gpa === '91.7%', `G. Correct percentage extraction for intermediate: "${parsedTarget.education[1]?.gpa}"`);
    assert(parsedTarget.education[2]?.gpa === '95%', `G. Correct percentage extraction for school: "${parsedTarget.education[2]?.gpa}"`);

    // H. Correct certification extraction
    assert(parsedTarget.certifications.length === 2, `H. Extracted 2 certifications (got ${parsedTarget.certifications.length})`);
    assert(
      parsedTarget.certifications[0]?.name === 'Java with Data Structures & Algorithms' &&
      parsedTarget.certifications[0]?.issuingOrganization === 'Apna College',
      `H. Extracted Cert 1 name & issuer: "${parsedTarget.certifications[0]?.name}" by "${parsedTarget.certifications[0]?.issuingOrganization}"`
    );
    assert(
      parsedTarget.certifications[1]?.name === 'Java Full Stack Development' &&
      parsedTarget.certifications[1]?.issuingOrganization === 'Wipro TalentNext',
      `H. Extracted Cert 2 name & issuer: "${parsedTarget.certifications[1]?.name}" by "${parsedTarget.certifications[1]?.issuingOrganization}"`
    );

    // I. Section boundaries prevent leaking
    assert(
      parsedTarget.skills.length > 0 && !parsedTarget.skills.some(s => s.name === 'Apna College'),
      'I. Section boundaries prevent certifications leaking into skills'
    );

    // J. Missing information remains null/undefined
    assert(parsedTarget.experience.length === 0, 'J. Missing experience remains empty array instead of fabricating job history');

    // K. Verify target candidate structure
    assert(parsedTarget.personalInfo.name === 'CHALLA YASWANTH RAJANA', `K. Parsed full name correctly: "${parsedTarget.personalInfo.name}"`);

    // L. Test a different generic resume structure
    console.log('\n--- 14. Second Generic Resume Structure Verification ---');
    const genericResume = `
Dr. Alan Turing
alan.turing@cambridge.ac.uk | Cambridge, UK

ACADEMIC QUALIFICATIONS
King's College, Cambridge
Ph.D. in Mathematics | 1935 - 1938

WORK HISTORY
Codebreaker at Bletchley Park
1939 - 1945
Led decryption of Enigma machine communications.

LICENSES & CERTIFICATIONS
Cryptographic Analysis Specialist – Government Code and Cypher School

TECHNICAL SKILLS
Mathematics, Cryptography, Logic, Python
`;
    const parsedGeneric = await ResumeParserService.parseResume(Buffer.from(genericResume), 'turing.pdf', 'application/pdf');
    assert(parsedGeneric.education.length === 1, 'L. Generic resume: parsed exactly 1 education record');
    assert(parsedGeneric.education[0]?.degree === 'Ph.D.', 'L. Generic resume: parsed Ph.D. degree');
    assert(parsedGeneric.education[0]?.fieldOfStudy === 'Mathematics', 'L. Generic resume: parsed Mathematics field');
    assert(parsedGeneric.experience.length === 1, 'L. Generic resume: parsed 1 work history record');
    assert(parsedGeneric.experience[0]?.company.includes('Bletchley Park'), 'L. Generic resume: parsed company');
    assert(parsedGeneric.certifications.length === 1, 'L. Generic resume: parsed 1 certification');
    assert(parsedGeneric.certifications[0]?.issuingOrganization === 'Government Code and Cypher School', 'L. Generic resume: parsed issuer');

    // -------------------------------------------------------------------
    // 15. Candidate Full Real Resume Verification
    // -------------------------------------------------------------------
    console.log('\n--- 15. Complete Real-World Candidate Resume Verification ---');
    const candidateFullResume = `
RAJANA BALA NAGA YASWANTH
+91 8919171136 | yaswanthrajanaindiann@gmail.com | LinkedIn | Rajahmundry
SUMMARY
MERN Stack Developer with hands-on experience building full-stack web applications using React.js, Node.js, Express.js, and MongoDB.
Proven experience building a patient-facing healthcare platform for appointment booking and doctor availability tracking, alongside
production-style applications involving payments, AI integration, and offline-first architecture. Strong foundation in data structures,
algorithms, and REST API integration, with a focus on writing clean, scalable, and maintainable code.
SKILLS
Frontend: React.js, HTML5, CSS3, Bootstrap, Tailwind CSS, Responsive Design
Backend: Node.js, Express.js, REST APIs
Database: MongoDB, MySQL, Redis
Version Control: Git, GitHub
Languages: JavaScript, TypeScript, Java, Python
Core CS: Data Structures & Algorithms, System Design Fundamentals, DBMS, Operating Systems, Computer Networks
EXPERIENCE
Full Stack Developer Intern — SMVEN Technologies | May 2026 – Present
• Developed responsive web interfaces using the MERN stack (React.js, Node.js, MongoDB) for production applications.
• Built reusable UI components and optimized registration flows for improved usability across devices.
• Designed scalable client-side routing for multiple technology programs.
• Integrated frontend applications with backend APIs, authentication, payment workflows, and MongoDB-based services.
• Collaborated with stakeholders to implement and improve user-facing features and landing pages.
PROJECTS
Hospital Management Platform — Prajwalan2K25 (Hackathon) | React.js, Node.js, MongoDB
• Built a patient-facing healthcare platform using the MERN stack, enabling appointment booking and real-time doctor availability tracking.
• Developed responsive, reusable React.js UI components and integrated frontend workflows with backend REST APIs.
• Collaborated under hackathon time constraints to design and ship a functional healthcare-operations workflow end-to-end.
NeuralFlow – AI Analytics & Insight Engine | React.js, JavaScript, Node.js, MongoDB, Redis, Gemini API | GitHub
• Developed a responsive React.js interface for CSV upload, data analysis, and visualization of generated insights.
• Integrated frontend workflows with backend REST APIs for real-time data processing and AI-generated insights.
• Integrated Gemini API for automated data interpretation and built supporting backend services using Node.js, MongoDB, and Redis.
Offline-First Order Management System | Node.js, IndexedDB, MongoDB, JavaScript | GitHub
• Built a browser-based offline-first ordering system using IndexedDB for local data persistence.
• Implemented background synchronization and conflict resolution to maintain data consistency during intermittent connectivity.
• Designed reliable client-server data flows and audit logging for improved traceability and system reliability.
CERTIFICATIONS
• Java with Data Structures & Algorithms – Apna College
• Java Full Stack Development – Wipro TalentNext
EDUCATION
Sagi Rama Krishnam Raju Engineering College | 2023 – 2027
B.Tech in Computer Science – IoT & Cyber Security (Blockchain) | CGPA: 8.93/10
Sri Chaitanya Junior College | 2021 – 2023
Intermediate (MPC) | Percentage: 91.7%
Pragati EM School | 2020 – 2021
Secondary School Certificate (SSC) | Percentage: 95%
`;

    const parsedCandidate = await ResumeParserService.parseResume(Buffer.from(candidateFullResume), 'Yaswanth_Resume_HextGen.pdf', 'application/pdf');

    // 1. Education Count & Extraction
    assert(parsedCandidate.education.length === 3, `15.1 Education count: expected 3, got ${parsedCandidate.education.length}`);
    assert(parsedCandidate.education[0]?.institution.includes('Sagi Rama Krishnam Raju'), '15.1 Education 1: SRKR Engineering College');
    assert(parsedCandidate.education[0]?.degree === 'B.Tech in Computer Science', '15.1 Education 1: B.Tech in Computer Science degree');
    assert(parsedCandidate.education[0]?.fieldOfStudy === 'IoT & Cyber Security (Blockchain)', '15.1 Education 1: Specialization');
    assert(parsedCandidate.education[0]?.gpa === '8.93/10', '15.1 Education 1: CGPA 8.93/10');
    assert(parsedCandidate.education[0]?.startYear === 2023 && parsedCandidate.education[0]?.endYear === 2027, '15.1 Education 1: Dates 2023 - 2027');
    assert(parsedCandidate.education[1]?.institution.includes('Sri Chaitanya'), '15.1 Education 2: Sri Chaitanya Junior College');
    assert(parsedCandidate.education[1]?.gpa === '91.7%', '15.1 Education 2: Percentage 91.7%');
    assert(parsedCandidate.education[2]?.institution.includes('Pragati'), '15.1 Education 3: Pragati EM School');
    assert(parsedCandidate.education[2]?.gpa === '95%', '15.1 Education 3: Percentage 95%');

    // 2. Work Experience Count & Extraction
    assert(parsedCandidate.experience.length === 1, `15.2 Experience count: expected 1, got ${parsedCandidate.experience.length}`);
    assert(parsedCandidate.experience[0]?.roleTitle === 'Full Stack Developer Intern', `15.2 Experience roleTitle: "${parsedCandidate.experience[0]?.roleTitle}"`);
    assert(parsedCandidate.experience[0]?.company === 'SMVEN Technologies', `15.2 Experience company: "${parsedCandidate.experience[0]?.company}"`);
    assert(parsedCandidate.experience[0]?.startDate === 'May 2026', `15.2 Experience startDate: "${parsedCandidate.experience[0]?.startDate}"`);
    assert(parsedCandidate.experience[0]?.endDate === 'Present', `15.2 Experience endDate: "${parsedCandidate.experience[0]?.endDate}"`);
    assert(parsedCandidate.experience[0]?.isCurrent === true, '15.2 Experience isCurrent: true');
    assert(parsedCandidate.experience[0]?.employmentType === 'Internship', '15.2 Experience employmentType: Internship');
    assert(parsedCandidate.experience[0]?.bullets?.length === 5, `15.2 Experience bullets count: expected 5, got ${parsedCandidate.experience[0]?.bullets?.length}`);
    assert(
      Boolean(parsedCandidate.experience[0]?.bullets?.[0]?.includes('MERN stack (React.js, Node.js, MongoDB)')),
      '15.2 Experience bullet 1 preserved'
    );
    assert(
      Boolean(parsedCandidate.experience[0]?.bullets?.[4]?.includes('stakeholders to implement and improve')),
      '15.2 Experience bullet 5 preserved'
    );

    // 3. Projects Count & Extraction
    assert(parsedCandidate.projects.length === 3, `15.3 Projects count: expected 3, got ${parsedCandidate.projects.length}`);
    assert(parsedCandidate.projects[0]?.title.includes('Hospital Management Platform'), '15.3 Project 1: Hospital Management Platform');
    assert(parsedCandidate.projects[0]?.technologies.includes('React.js'), '15.3 Project 1 has React.js technology');
    assert(parsedCandidate.projects[0]?.bullets?.length === 3, '15.3 Project 1 has 3 bullets');
    assert(parsedCandidate.projects[1]?.title.includes('NeuralFlow'), '15.3 Project 2: NeuralFlow');
    assert(parsedCandidate.projects[1]?.technologies.includes('Redis'), '15.3 Project 2 has Redis technology');
    assert(parsedCandidate.projects[2]?.title.includes('Offline-First Order Management System'), '15.3 Project 3: Offline-First Order Management System');
    assert(parsedCandidate.projects[2]?.technologies.includes('IndexedDB'), '15.3 Project 3 has IndexedDB technology');

    // 4. Certifications Count & Extraction
    assert(parsedCandidate.certifications.length === 2, `15.4 Certifications count: expected 2, got ${parsedCandidate.certifications.length}`);
    assert(parsedCandidate.certifications[0]?.name.includes('Java with Data Structures & Algorithms'), '15.4 Cert 1: Java DSA');
    assert(parsedCandidate.certifications[0]?.issuingOrganization === 'Apna College', '15.4 Cert 1 issuer: Apna College');
    assert(parsedCandidate.certifications[1]?.name.includes('Java Full Stack Development'), '15.4 Cert 2: Java Full Stack Development');
    assert(parsedCandidate.certifications[1]?.issuingOrganization === 'Wipro TalentNext', '15.4 Cert 2 issuer: Wipro TalentNext');

    // 5. Integrity & Non-Fabrication Rules
    assert(
      !parsedCandidate.education.some(e => e.institution.toLowerCase().includes('apna') || e.institution.toLowerCase().includes('wipro')),
      '15.5 Integrity: Certifications are not in education'
    );
    assert(
      !parsedCandidate.experience.some(e => e.company.toLowerCase().includes('hospital') || e.company.toLowerCase().includes('neuralflow')),
      '15.5 Integrity: Projects did not leak into experience'
    );
    assert(
      !parsedCandidate.projects.some(p => p.title.toLowerCase().includes('smven')),
      '15.5 Integrity: Experience did not leak into projects'
    );
    assert(
      parsedCandidate.experience.length > 0,
      '15.5 Integrity: Experience is NOT zero'
    );

  } catch (err: any) {
    assert(false, `Unexpected exception in test suite: ${err.message}`, err.stack);
  }

  console.log('\n========================================================================');
  console.log(`SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) process.exit(1);
}

runResumePhase1Tests();
