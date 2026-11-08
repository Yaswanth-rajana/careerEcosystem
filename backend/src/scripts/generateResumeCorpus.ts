import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Ensure output directories exist
const BASE_FIXTURES_DIR = path.resolve(process.cwd(), 'backend/src/tests/fixtures/resume-parser');
const RESUMES_DIR = path.join(BASE_FIXTURES_DIR, 'resumes');
const EXPECTED_DIR = path.join(BASE_FIXTURES_DIR, 'expected');

if (!fs.existsSync(RESUMES_DIR)) fs.mkdirSync(RESUMES_DIR, { recursive: true });
if (!fs.existsSync(EXPECTED_DIR)) fs.mkdirSync(EXPECTED_DIR, { recursive: true });

// CRC32 helper for spec-compliant OpenXML DOCX packaging
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

// Generate spec-compliant OpenXML DOCX document
export function generateDocxBuffer(
  title: string,
  sections: Array<{
    heading?: string;
    subheading?: string;
    paragraphs?: string[];
    bullets?: string[];
    table?: string[][];
  }>
): Buffer {
  let bodyXml = `<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${escapeXml(title)}</w:t></w:r></w:p>`;

  for (const sec of sections) {
    if (sec.heading) {
      bodyXml += `<w:p><w:pPr><w:pStyle w:val="Heading2"/><w:spacing w:before="240" w:after="80"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>${escapeXml(sec.heading)}</w:t></w:r></w:p>`;
    }
    if (sec.subheading) {
      bodyXml += `<w:p><w:pPr><w:spacing w:before="80" w:after="40"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>${escapeXml(sec.subheading)}</w:t></w:r></w:p>`;
    }
    if (sec.paragraphs) {
      for (const p of sec.paragraphs) {
        bodyXml += `<w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:sz w:val="20"/><w:t>${escapeXml(p)}</w:t></w:r></w:p>`;
      }
    }
    if (sec.bullets) {
      for (const b of sec.bullets) {
        bodyXml += `<w:p><w:pPr><w:ind w:left="360"/><w:spacing w:after="40"/></w:pPr><w:r><w:sz w:val="20"/><w:t>• ${escapeXml(b)}</w:t></w:r></w:p>`;
      }
    }
    if (sec.table && sec.table.length > 0) {
      bodyXml += `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="none"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="none"/></w:tblBorders></w:tblPr>`;
      for (const row of sec.table) {
        bodyXml += `<w:tr>`;
        for (const cell of row) {
          bodyXml += `<w:tc><w:p><w:r><w:sz w:val="18"/><w:t>${escapeXml(cell)}</w:t></w:r></w:p></w:tc>`;
        }
        bodyXml += `</w:tr>`;
      }
      bodyXml += `</w:tbl>`;
    }
  }

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${bodyXml}</w:body>
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

    parts.push(lfh);
    parts.push(compData);

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
    cdh.writeUInt32LE(offset, 42);
    fileNameBuf.copy(cdh, 46);

    cdEntries.push(cdh);
    offset += lfh.length + compData.length;
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

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper to wrap text without truncation
function wrapText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];

  if (text.includes(' | ') && text.length > maxLen) {
    const parts = text.split(' | ');
    const res: string[] = [];
    let cur = '';
    for (const p of parts) {
      if ((cur ? cur + ' | ' + p : p).length <= maxLen) {
        cur = cur ? cur + ' | ' + p : p;
      } else {
        if (cur) res.push(cur);
        cur = p;
      }
    }
    if (cur) res.push(cur);
    return res;
  }

  const words = text.split(' ');
  const result: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current ? current + ' ' + word : word).length <= maxLen) {
      current = current ? current + ' ' + word : word;
    } else {
      if (current) result.push(current);
      current = word;
    }
  }
  if (current) result.push(current);
  return result;
}

// Generate spec-compliant PDF document
export async function generatePdfBuffer(
  title: string,
  lines: Array<{ text: string; isHeader?: boolean; isSub?: boolean; isBullet?: boolean }>,
  fontFamily: 'Helvetica' | 'Times' | 'Courier' = 'Helvetica',
  isTwoColumn = false
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // Standard A4 points
  const fontNormal = await pdfDoc.embedFont(
    fontFamily === 'Times' ? StandardFonts.TimesRoman : fontFamily === 'Courier' ? StandardFonts.Courier : StandardFonts.Helvetica
  );
  const fontBold = await pdfDoc.embedFont(
    fontFamily === 'Times' ? StandardFonts.TimesRomanBold : fontFamily === 'Courier' ? StandardFonts.CourierBold : StandardFonts.HelveticaBold
  );

  let y = 800;

  // Title / Name Header
  page.drawText(title, {
    x: 50,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 25;

  if (isTwoColumn) {
    // Two column simulation: left sidebar [50 to 220], right body [235 to 550]
    let yLeft = y;
    let yRight = y;

    // Semantic section affinity: keep all lines of a section in its assigned column
    let activeColumn: 'left' | 'right' = 'left';

    for (const item of lines) {
      if (item.isHeader) {
        if (/^(?:SKILLS|TECHNICAL TOOLBOX|LANGUAGES|EDUCATION|CERTIFICATIONS|LINKS|CONTACT)/i.test(item.text)) {
          activeColumn = 'left';
        } else {
          activeColumn = 'right';
        }
      }

      const isSidebar = activeColumn === 'left';
      const wrapped = wrapText(item.text, isSidebar ? 32 : 55);

      if (isSidebar && yLeft > 60) {
        for (const subLine of wrapped) {
          page.drawText(subLine, {
            x: 50,
            y: yLeft,
            size: item.isHeader ? 11 : item.isSub ? 9.5 : 8.5,
            font: item.isHeader || item.isSub ? fontBold : fontNormal,
            color: item.isHeader ? rgb(0.15, 0.25, 0.6) : rgb(0.15, 0.15, 0.15),
          });
          yLeft -= item.isHeader ? 18 : 13;
        }
      } else if (yRight > 60) {
        for (const subLine of wrapped) {
          page.drawText(subLine, {
            x: 235,
            y: yRight,
            size: item.isHeader ? 11 : item.isSub ? 9.5 : 8.5,
            font: item.isHeader || item.isSub ? fontBold : fontNormal,
            color: item.isHeader ? rgb(0.15, 0.25, 0.6) : rgb(0.15, 0.15, 0.15),
          });
          yRight -= item.isHeader ? 18 : 13;
        }
      }
    }
  } else {
    // Single column standard flow with automatic pagination
    for (const item of lines) {
      const maxChars = item.isBullet ? 95 : 105;
      const wrappedLines = wrapText(item.text, maxChars);

      for (let i = 0; i < wrappedLines.length; i++) {
        if (y < 60) {
          page = pdfDoc.addPage([595, 842]);
          y = 800;
        }

        const size = item.isHeader ? 12 : item.isSub ? 10 : 9;
        const font = item.isHeader || item.isSub ? fontBold : fontNormal;
        const color = item.isHeader ? rgb(0.1, 0.2, 0.5) : rgb(0.15, 0.15, 0.15);
        // Indent wrapped bullet lines slightly
        const x = item.isBullet ? (i === 0 ? 65 : 75) : 50;

        page.drawText(wrappedLines[i], {
          x,
          y,
          size,
          font,
          color,
        });

        y -= item.isHeader ? 20 : item.isSub ? 15 : 13;
      }
    }
  }

  const uint8 = await pdfDoc.save();
  return Buffer.from(uint8);
}

import { SCENARIOS } from './corpusScenarios';

const TEST_MATRIX_PATH = path.join(BASE_FIXTURES_DIR, 'test-matrix.json');
const README_PATH = path.join(BASE_FIXTURES_DIR, 'README.md');

const VALIDATION_GOALS: Record<string, string> = {
  'resume-01-student-no-exp': 'Verify 0 work experience or internships extracted (no false positives); education and academic projects captured; missing phone handled gracefully without hallucination.',
  'resume-02-fresher-academic-projects': 'Verify academic coursework projects properly extracted; project URLs and GitHub links correctly associated; no work experience fabricated.',
  'resume-03-fresher-multi-internships': 'Verify multiple internship records classified into internships section; not contaminated into full-time work experience; no duplicate entries.',
  'resume-04-recent-grad-intern-fulltime': 'Verify proper section-first separation of full-time role into experience and internship role into internships.',
  'resume-05-fullstack-2y-exp': 'Verify single-company full-time tenure, role titles, bullet reconstruction, and professional portfolio link classification.',
  'resume-06-backend-multi-employer': 'Verify 3 distinct employment records with correct date ranges; no cross-contamination of bullets or technologies across employers.',
  'resume-07-frontend-freelance': 'Verify freelance and contractual projects accurately captured; client projects distinguished from core employment.',
  'resume-08-java-certified': 'Verify multiple professional certifications extracted with issuer, date, and credential ID; no false certification records from bullet lines.',
  'resume-09-python-ai-research': 'Verify AI/ML research projects, Kaggle/GitHub links, and high-density technical skills extracted without data loss.',
  'resume-10-senior-engineer-7y': 'Verify long-tenure progressive career history, promotion detection, and multi-year date range normalization.',
  'resume-11-engineering-manager': 'Verify leadership/engineering management roles, team size metrics in bullets, and soft skills classification.',
  'resume-12-career-switcher': 'Verify prior non-technical employment preserved in work experience, coding bootcamp in education, and no fabricated technical tenure.',
  'resume-13-traditional-single-column': 'Verify traditional Times Roman single-column layout parsing, standard headings, and clean bullet extraction.',
  'resume-14-two-column-layout': 'Verify two-column layout parsing without horizontal interleaving of sidebar skills/education and main experience column.',
  'resume-15-tables-structured': 'Verify tabular formatting in DOCX and aligned table text in PDF parsed into structured records without cell corruption.',
  'resume-16-multi-project-inline-repos': 'Verify standalone GitHub/Live Demo labels are not parsed as project titles, and URLs are mapped to their respective project records.',
  'resume-17-unusual-headings': 'Verify non-standard section headings (e.g. "Where I\'ve Made an Impact", "Technical Toolbox") correctly classified by section normalizer.',
  'resume-18-diverse-date-formats': 'Verify diverse date formatting patterns ("05/2021 – 11/2023", "Spring 2020", "\'21 - \'24") standardized without throwing.',
  'resume-19-missing-info': 'Verify intentional missing fields (no phone, no degree field, missing company location) are handled cleanly without fabrication.',
  'resume-20-complex-wrapped-bullets': 'Verify wrapped multi-line bullet points in PDF are stitched cleanly into complete sentences without orphan bullets.',
};

export async function generateAllCorpusFiles(): Promise<void> {
  console.log('========================================================================');
  console.log('  PATHWAY.ECO — Generating 20 Synthetic Resumes (PDF, DOCX & JSON Ground Truth)');
  console.log('========================================================================\n');

  const testMatrixList: any[] = [];
  let scenarioNum = 1;

  for (const scenario of SCENARIOS) {
    const numPadded = String(scenarioNum).padStart(2, '0');
    console.log(`[${numPadded}/20] Generating fixture: ${scenario.id} (${scenario.name})...`);

    // 1. Generate PDF
    const pdfBuf = await generatePdfBuffer(
      scenario.name,
      scenario.pdfLines,
      scenario.fontFamily,
      scenario.isTwoColumn
    );
    const pdfPath = path.join(RESUMES_DIR, `${scenario.id}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuf);

    // 2. Generate DOCX
    const docxBuf = generateDocxBuffer(scenario.name, scenario.docSections);
    const docxPath = path.join(RESUMES_DIR, `${scenario.id}.docx`);
    fs.writeFileSync(docxPath, docxBuf);

    // 3. Generate Expected Ground Truth JSON
    const expectedJsonPath = path.join(EXPECTED_DIR, `${scenario.id}.json`);
    fs.writeFileSync(expectedJsonPath, JSON.stringify(scenario.expected, null, 2), 'utf-8');

    // 4. Record Matrix Entry
    testMatrixList.push({
      scenarioNumber: scenarioNum,
      scenarioId: scenario.id,
      candidateName: scenario.name,
      category: scenario.scenarioCategory,
      formattingStyle: scenario.formattingStyle,
      fontFamily: scenario.fontFamily,
      isTwoColumn: !!scenario.isTwoColumn,
      intentionalOmissions: scenario.intentionalOmissions,
      formats: ['pdf', 'docx'],
      files: {
        pdf: `resumes/${scenario.id}.pdf`,
        docx: `resumes/${scenario.id}.docx`,
        expectedJson: `expected/${scenario.id}.json`,
      },
      expectedCounts: {
        education: scenario.expected.education.length,
        experience: scenario.expected.experience.length,
        internships: scenario.expected.internships.length,
        projects: scenario.expected.projects.length,
        certifications: scenario.expected.certifications.length,
        technicalSkills: scenario.expected.technicalSkills.length,
        softSkills: scenario.expected.softSkills.length,
        achievements: scenario.expected.achievements.length,
        professionalLinks: scenario.expected.professionalLinks.length,
        languages: scenario.expected.languages.length,
      },
      validationGoal: VALIDATION_GOALS[scenario.id] || 'General parsing accuracy and layout stability.',
    });

    scenarioNum++;
  }

  // 5. Write test-matrix.json
  const matrixPayload = {
    version: '1.0.0',
    totalScenarios: SCENARIOS.length,
    formatsPerScenario: ['pdf', 'docx'],
    totalGeneratedDocuments: SCENARIOS.length * 2,
    createdAt: new Date().toISOString(),
    scenarios: testMatrixList,
  };
  fs.writeFileSync(TEST_MATRIX_PATH, JSON.stringify(matrixPayload, null, 2), 'utf-8');
  console.log(`\n✓ Generated test matrix: ${TEST_MATRIX_PATH}`);

  // 6. Write README.md
  const readmeContent = generateReadmeMarkdown(testMatrixList);
  fs.writeFileSync(README_PATH, readmeContent, 'utf-8');
  console.log(`✓ Generated documentation: ${README_PATH}`);

  console.log(`\n========================================================================`);
  console.log(`  SUCCESS: 20 PDF, 20 DOCX, 20 JSON ground truth files generated.`);
  console.log(`  Fixtures Directory: ${BASE_FIXTURES_DIR}`);
  console.log(`========================================================================\n`);
}

function generateReadmeMarkdown(scenarios: any[]): string {
  const scenarioRows = scenarios
    .map(
      (s) =>
        `| ${s.scenarioNumber} | \`${s.scenarioId}\` | ${s.candidateName} | ${s.category} | ${s.formattingStyle} | Edu: ${s.expectedCounts.education}, Exp: ${s.expectedCounts.experience}, Intern: ${s.expectedCounts.internships}, Proj: ${s.expectedCounts.projects}, Cert: ${s.expectedCounts.certifications}, Links: ${s.expectedCounts.professionalLinks} |`
    )
    .join('\n');

  return `# PATHWAY.ECO — Resume Parser Synthetic Test Corpus

## Overview

This directory contains a comprehensive, reusable synthetic resume dataset designed to rigorously benchmark, evaluate, and prevent regressions in the PATHWAY.ECO resume parsing pipeline.

The dataset covers **20 distinct candidate scenarios** across both **PDF** and **DOCX** formats (40 total test documents), paired with independently authored ground-truth JSON files.

All candidate identities, companies, phone numbers, email addresses, and URLs are **100% fictional** to ensure zero exposure of private personal information.

---

## Directory Structure

\`\`\`
backend/src/tests/fixtures/resume-parser/
├── resumes/                      # 40 Test Documents (20 PDF + 20 DOCX)
│   ├── resume-01-student-no-exp.pdf
│   ├── resume-01-student-no-exp.docx
│   ├── ...
│   ├── resume-20-complex-wrapped-bullets.pdf
│   └── resume-20-complex-wrapped-bullets.docx
├── expected/                     # 20 Independently Authored Ground Truth Files
│   ├── resume-01-student-no-exp.json
│   ├── ...
│   └── resume-20-complex-wrapped-bullets.json
├── test-matrix.json              # Full Machine-Readable Test Metadata Matrix
└── README.md                     # Dataset Documentation (This File)
\`\`\`

---

## Candidate Scenarios Matrix

| # | Scenario ID | Candidate Name | Category | Formatting Style | Expected Counts |
|---|-------------|----------------|----------|------------------|-----------------|
${scenarioRows}

---

## Format Generation Architecture

1. **PDF Generation (\`pdf-lib\`)**:
   - Uses \`pdf-lib\` standard vector text rendering with standard typography (Helvetica, Times, Courier).
   - Generates single-column standard top-down flows and multi-column sidebars without third-party CLI tools or native binaries.
   - Text streams adhere to standard PDF text matrices, making text parseable via \`pdf-parse\` layout and simple modes.

2. **DOCX Generation (OpenXML Package Engine)**:
   - Built with native Node.js \`zlib\` and raw OPC ZIP packaging (zero new external npm dependencies).
   - Includes standard \`[Content_Types].xml\`, relationships, and \`word/document.xml\` formatting tags (\`<w:p>\`, \`<w:r>\`, \`<w:tbl>\`, \`<w:tc>\`, bullet indentation \`<w:ind>\`).
   - Validated against \`mammoth\` structured extraction.

---

## Ground Truth Schema Contracts

Expected ground-truth files strictly align with TypeScript interfaces (\`StructuredResumeData\` and \`ParsedResumeData\`):

- **Personal Info**: \`name\`, \`email\`, \`phone\`, \`location\`, \`headline\`, \`bio\`
- **Education**: \`institution\`, \`degree\`, \`fieldOfStudy\`, \`startYear\`, \`endYear\`, \`isCurrent\`, \`gpa\`
- **Experience**: \`company\`, \`roleTitle\`, \`employmentType\`, \`startDate\`, \`endDate\`, \`isCurrent\`, \`bulletsCount\`
- **Internships**: \`company\`, \`roleTitle\`, \`employmentType\`, \`startDate\`, \`endDate\`, \`isCurrent\`, \`bulletsCount\`
- **Projects**: \`title\`, \`role\`, \`technologies\`, \`githubUrl\`, \`projectUrl\`, \`bulletsCount\`
- **Certifications**: \`name\`, \`issuingOrganization\`, \`issueDate\`, \`expiryDate\`, \`credentialId\`
- **Technical & Soft Skills**: \`technicalSkills\`, \`softSkills\`
- **Professional Links**: \`platform\`, \`url\`
- **Languages**: \`language\`, \`proficiency\`

---

## Evaluation Harness & Discrepancy Taxonomy

The automated evaluation harness (\`backend/src/scripts/testResumeParserCorpus.ts\`) evaluates both PDF and DOCX files against the expected ground truth and categorizes differences according to:

1. **Missing Record (False Negative)**: An expected entity was not found in the parsed output.
2. **Incorrectly Classified Record**: An entity was detected but placed in the wrong section (e.g., an internship placed in experience, or a project label extracted as an experience entry).
3. **Correct Record with Missing Fields**: The entity was detected, but key attributes (e.g., startYear, degree, issuingOrganization) were empty or unparsed.
4. **Incorrect Field Value**: An extracted attribute had an inaccurate value (e.g., start year parsed as 2021 instead of 2020).
5. **Fabricated Field (False Positive)**: The parser extracted an entity or field not present in the source resume or ground truth.
6. **Duplicate Record**: The same entity was extracted more than once.

---

## How to Run the Evaluation Harness

To run the automated corpus evaluation harness:

\`\`\`bash
# Build backend
npm --prefix backend run build

# Run corpus test harness
node backend/dist/scripts/testResumeParserCorpus.js
\`\`\`
`;
}

// Auto-run if executed directly via node or ts-node
if (require.main === module) {
  generateAllCorpusFiles().catch((err) => {
    console.error('Fatal error generating resume corpus:', err);
    process.exit(1);
  });
}

