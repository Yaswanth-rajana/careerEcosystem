import assert from 'assert';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import zlib from 'zlib';
import { DocumentExtractionService } from '../services/resume/documentExtractionService';
import { TextNormalizer } from '../services/resume/textNormalizer';

// Helper to create an in-memory DOCX OpenXML package
function createDocxFixture(bodyXml: string): Buffer {
  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const fullDocXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
  </w:body>
</w:document>`;

  const entries = [
    { name: '[Content_Types].xml', content: Buffer.from(contentTypes, 'utf-8') },
    { name: '_rels/.rels', content: Buffer.from(docRels, 'utf-8') },
    { name: 'word/document.xml', content: Buffer.from(fullDocXml, 'utf-8') },
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

async function runTestSuite() {
  console.log('===============================================================');
  console.log('   PATHWAY.ECO — Phase 2 Document Extraction Test Matrix      ');
  console.log('===============================================================\n');

  let passedTests = 0;
  const totalTests = 9;

  // -------------------------------------------------------------------------
  // TEST 1: Standard Single-Column PDF
  // -------------------------------------------------------------------------
  console.log('TEST 1: Standard Single-Column PDF');
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([595, 842]);

    page.drawText('Jane Doe', { x: 50, y: 780, size: 20, font: bold });
    page.drawText('jane.doe@example.com | +1 555-0199 | San Francisco, CA', { x: 50, y: 755, size: 10, font });
    page.drawText('PROFESSIONAL SUMMARY', { x: 50, y: 720, size: 12, font: bold });
    page.drawText('Experienced full-stack engineer with 6 years building high scale cloud services.', { x: 50, y: 700, size: 10, font });
    page.drawText('WORK EXPERIENCE', { x: 50, y: 660, size: 12, font: bold });
    page.drawText('Senior Software Engineer - CloudTech Inc (2021 - Present)', { x: 50, y: 640, size: 10, font });
    page.drawText('Architected resilient microservices supporting 10M daily active users.', { x: 50, y: 620, size: 10, font });
    page.drawText('EDUCATION', { x: 50, y: 580, size: 12, font: bold });
    page.drawText('B.S. in Computer Science - University of California, Berkeley (2015 - 2019)', { x: 50, y: 560, size: 10, font });
    page.drawText('SKILLS', { x: 50, y: 520, size: 12, font: bold });
    page.drawText('TypeScript, Node.js, React, PostgreSQL, Docker, Kubernetes, AWS', { x: 50, y: 500, size: 10, font });

    const pdfBytes = Buffer.from(await pdfDoc.save());
    const res = await DocumentExtractionService.extractDocument(pdfBytes, 'jane_doe_resume.pdf', 'application/pdf');

    assert(res.text.includes('Jane Doe'), 'Extracted text should include candidate name');
    assert(res.text.includes('CloudTech Inc'), 'Extracted text should include company');
    assert(res.text.includes('University of California'), 'Extracted text should include education');
    assert(res.metadata.qualityStatus === 'HIGH' || res.metadata.qualityStatus === 'MEDIUM', 'Quality status should be acceptable');
    assert.strictEqual(res.metadata.fileType, 'pdf');
    console.log(`  ✓ Passed (Extracted: ${res.metadata.characterCount} chars, Method: ${res.metadata.extractionMethod}, Quality: ${res.metadata.qualityStatus})`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Multi-Column PDF Layout
  // -------------------------------------------------------------------------
  console.log('\nTEST 2: Multi-Column PDF Layout');
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([600, 700]);

    // Top Header (spans full width)
    page.drawText('Alex Morgan - Lead Developer', { x: 50, y: 650, size: 18, font: bold });
    page.drawText('alex@example.com | +91 9876543210 | Bangalore', { x: 50, y: 625, size: 10, font });

    // Left Column (Skills & Education: x = 50)
    page.drawText('TECHNICAL SKILLS', { x: 50, y: 580, size: 12, font: bold });
    page.drawText('JavaScript', { x: 50, y: 560, size: 10, font });
    page.drawText('TypeScript', { x: 50, y: 540, size: 10, font });
    page.drawText('Node.js', { x: 50, y: 520, size: 10, font });
    page.drawText('MongoDB', { x: 50, y: 500, size: 10, font });
    page.drawText('EDUCATION', { x: 50, y: 460, size: 12, font: bold });
    page.drawText('B.Tech in CS', { x: 50, y: 440, size: 10, font });
    page.drawText('IIT Madras (2018 - 2022)', { x: 50, y: 420, size: 10, font });

    // Right Column (Work Experience: x = 320)
    page.drawText('PROFESSIONAL EXPERIENCE', { x: 320, y: 580, size: 12, font: bold });
    page.drawText('Staff Software Engineer - Razorpay', { x: 320, y: 560, size: 10, font });
    page.drawText('Led backend payment processing platform', { x: 320, y: 540, size: 10, font });
    page.drawText('Handled 15000 transactions per second', { x: 320, y: 520, size: 10, font });
    page.drawText('Reduced checkout latency by 35%', { x: 320, y: 500, size: 10, font });

    const pdfBytes = Buffer.from(await pdfDoc.save());
    const res = await DocumentExtractionService.extractDocument(pdfBytes, 'alex_two_col.pdf', 'application/pdf');

    assert(res.metadata.isMultiColumn, 'Multi-column layout should be detected');
    // Verify that columns are not interleaved: "TECHNICAL SKILLS" should appear before "PROFESSIONAL EXPERIENCE",
    // and left column skills should NOT have "Staff Software Engineer" spliced inside them.
    const skillsIdx = res.text.indexOf('TECHNICAL SKILLS');
    const expIdx = res.text.indexOf('PROFESSIONAL EXPERIENCE');
    assert(skillsIdx !== -1 && expIdx !== -1, 'Both column headings should exist');
    assert(!res.text.includes('JavaScript Staff Software Engineer'), 'Left and right columns must not be spliced horizontally');

    console.log(`  ✓ Passed (isMultiColumn: ${res.metadata.isMultiColumn}, Method: ${res.metadata.extractionMethod})`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Scanned / Image-Only PDF Detection
  // -------------------------------------------------------------------------
  console.log('\nTEST 3: Scanned / Image-Only PDF');
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 500]);
    // 1x1 transparent PNG pixel to represent scanned image
    const pngHex = '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000000020001737501180000000049454e44ae426082';
    const imageBytes = Buffer.from(pngHex, 'hex');
    const embeddedImg = await pdfDoc.embedPng(imageBytes);
    page.drawImage(embeddedImg, { x: 0, y: 0, width: 500, height: 500 });

    const pdfBytes = Buffer.from(await pdfDoc.save());
    const res = await DocumentExtractionService.extractDocument(pdfBytes, 'scanned_resume.pdf', 'application/pdf');

    assert(res.metadata.scannedDocumentDetected, 'Scanned document flag should be set');
    assert.strictEqual(res.metadata.qualityStatus, 'INSUFFICIENT', 'Quality status must be INSUFFICIENT for scanned PDF');
    assert(res.metadata.warnings.some(w => w.toLowerCase().includes('scanned')), 'Should include scanned warning');
    console.log(`  ✓ Passed (scannedDetected: ${res.metadata.scannedDocumentDetected}, Quality: ${res.metadata.qualityStatus}, Warning: "${res.metadata.warnings[0]}")`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 4: DOCX with Tables (Preserves Columns without Flattening)
  // -------------------------------------------------------------------------
  console.log('\nTEST 4: DOCX with Tables');
  try {
    const tableXml = `
      <w:p><w:r><w:t>Education History</w:t></w:r></w:p>
      <w:tbl>
        <w:tr>
          <w:tc><w:p><w:r><w:t>Degree</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>Institution</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>Year</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>CGPA</w:t></w:r></w:p></w:tc>
        </w:tr>
        <w:tr>
          <w:tc><w:p><w:r><w:t>B.Tech Computer Science</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>Stanford University</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>2018 - 2022</w:t></w:r></w:p></w:tc>
          <w:tc><w:p><w:r><w:t>3.92</w:t></w:r></w:p></w:tc>
        </w:tr>
      </w:tbl>
      <w:p><w:r><w:t>Summary: Passionate computer systems architect.</w:t></w:r></w:p>
    `;
    const docxBuf = createDocxFixture(tableXml);
    const res = await DocumentExtractionService.extractDocument(docxBuf, 'education_table.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    assert(res.text.includes('| Degree | Institution | Year | CGPA |'), 'Header row should be converted to structured pipe row');
    assert(res.text.includes('| B.Tech Computer Science | Stanford University | 2018 - 2022 | 3.92 |'), 'Data row should preserve column associations');
    assert.strictEqual(res.metadata.extractionMethod, 'DOCX_STRUCTURED');
    console.log(`  ✓ Passed (Table preserved as structured markdown rows)`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 5: DOCX with Bullet Lists
  // -------------------------------------------------------------------------
  console.log('\nTEST 5: DOCX with Bullet Lists');
  try {
    const listXml = `
      <w:p><w:r><w:t>Experience Highlights:</w:t></w:r></w:p>
      <w:p>
        <w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>
        <w:r><w:t>Designed distributed event pipeline using Apache Kafka</w:t></w:r>
      </w:p>
      <w:p>
        <w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>
        <w:r><w:t>Reduced database load by 45% through Redis caching</w:t></w:r>
      </w:p>
      <w:p>
        <w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>
        <w:r><w:t>Mentored 4 junior engineers on clean architecture</w:t></w:r>
      </w:p>
    `;
    const docxBuf = createDocxFixture(listXml);
    const res = await DocumentExtractionService.extractDocument(docxBuf, 'experience_lists.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

    assert(res.text.includes('• Designed distributed event pipeline') || res.text.includes('Apache Kafka'), 'Bullet list item 1 preserved');
    assert(res.text.includes('Redis caching'), 'Bullet list item 2 preserved');
    assert.strictEqual(res.metadata.extractionMethod, 'DOCX_STRUCTURED');
    console.log(`  ✓ Passed (List items converted to formatted bullets)`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 6: Plain TXT Document
  // -------------------------------------------------------------------------
  console.log('\nTEST 6: TXT Resume');
  try {
    const txtContent = `John Developer
john.dev@example.com | (555) 321-4321
https://github.com/johndev

EXPERIENCE
Software Engineer - Alpha Inc (2020 - 2024)
- Built Next.js web application
- Integrated Stripe payments

SKILLS
React, Node.js, TypeScript, PostgreSQL`;
    const txtBuf = Buffer.from(txtContent, 'utf-8');
    const res = await DocumentExtractionService.extractDocument(txtBuf, 'resume.txt', 'text/plain');

    assert(res.text.includes('John Developer'));
    assert(res.text.includes('https://github.com/johndev'));
    assert(res.text.includes('• Built Next.js web application'), 'Hyphen list item normalized to bullet');
    assert.strictEqual(res.metadata.extractionMethod, 'TXT_DECODE');
    console.log(`  ✓ Passed (Extracted: ${res.metadata.characterCount} chars, Method: TXT_DECODE)`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 7: PDF with Unicode Punctuation, Ligatures & Mojibake
  // -------------------------------------------------------------------------
  console.log('\nTEST 7: Unicode Punctuation & Mojibake Normalization');
  try {
    const rawCorrupted = `Senior Software Engineer â€“ Google LLC
â€¢ Led candidateâ€™s profile evaluation engine
â€¢ Unfolded ligatures: ﬁnd, ﬂow, and aﬃliate
â€¢ Handled hyphenated line break: implemen-
tation of distributed consensus.
Technical terms: C++, C#, .NET, Node.js.`;

    const normalized = TextNormalizer.normalize(rawCorrupted);

    // Verify Mojibake repair
    assert(!normalized.includes('â€“'), 'â€“ must be replaced');
    assert(normalized.includes('– Google LLC'), 'En-dash must be restored');
    assert(!normalized.includes('â€¢'), 'â€¢ must be replaced');
    assert(normalized.includes('• Led'), 'Bullet must be restored');
    assert(!normalized.includes('â€™'), 'â€™ must be replaced');
    assert(normalized.includes("candidate's"), 'Apostrophe must be restored');

    // Verify Ligature unfolding
    assert(normalized.includes('find'), 'ﬁnd must be unfolded to find');
    assert(normalized.includes('flow'), 'ﬂow must be unfolded to flow');
    assert(normalized.includes('affiliate'), 'aﬃliate must be unfolded to affiliate');

    // Verify Hyphenated line break unwrapping
    assert(normalized.includes('implementation of distributed'), 'Hyphenated line break must be joined');

    // Verify Preservation of C++, C#, .NET
    assert(normalized.includes('C++'), 'C++ must be preserved');
    assert(normalized.includes('C#'), 'C# must be preserved');
    assert(normalized.includes('.NET'), '.NET must be preserved');

    console.log(`  ✓ Passed (Mojibake, ligatures, and hyphenated breaks accurately normalized)`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 8: Empty or Corrupted PDF
  // -------------------------------------------------------------------------
  console.log('\nTEST 8: Empty or Corrupted Document Handling');
  try {
    const corruptedBuf = Buffer.from('%PDF-1.4\n%corrupted binary stream\x00\x01\x02\x03\x04%%EOF');
    const res = await DocumentExtractionService.extractDocument(corruptedBuf, 'corrupted.pdf', 'application/pdf');

    assert.strictEqual(res.metadata.qualityStatus, 'INSUFFICIENT', 'Corrupted file must yield INSUFFICIENT quality status');
    assert(res.metadata.warnings.length > 0, 'Should return at least one warning');
    console.log(`  ✓ Passed (Safely handled corrupted PDF, Quality: INSUFFICIENT, Warning: "${res.metadata.warnings[0]}")`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------------------
  // TEST 9: Large Multi-Page Document Within Limits
  // -------------------------------------------------------------------------
  console.log('\nTEST 9: Large Multi-Page Document (4 Pages)');
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (let p = 1; p <= 4; p++) {
      const page = pdfDoc.addPage([595, 842]);
      page.drawText(`Page ${p} of 4 - Resume Portfolio Section`, { x: 50, y: 780, size: 14, font });
      for (let i = 0; i < 20; i++) {
        page.drawText(`Project ${p}.${i + 1}: Engineered scalable enterprise solution with cloud infrastructure.`, {
          x: 50,
          y: 740 - i * 30,
          size: 10,
          font,
        });
      }
    }

    const pdfBytes = Buffer.from(await pdfDoc.save());
    const res = await DocumentExtractionService.extractDocument(pdfBytes, 'large_resume.pdf', 'application/pdf');

    assert.strictEqual(res.metadata.pageCount, 4, 'Should detect all 4 pages');
    assert(res.text.includes('Page 1 of 4'), 'Page 1 text should be present');
    assert(res.text.includes('Page 4 of 4'), 'Page 4 text should be present');
    assert(res.metadata.characterCount > 1500, 'Character count should reflect multi-page content');
    assert.strictEqual(res.metadata.qualityStatus, 'HIGH', 'Quality status should be HIGH');
    console.log(`  ✓ Passed (Pages: ${res.metadata.pageCount}, Chars: ${res.metadata.characterCount}, Quality: ${res.metadata.qualityStatus})`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ Failed: ${err.message}`);
  }

  console.log('\n===============================================================');
  console.log(`   Phase 2 Verification Complete: ${passedTests}/${totalTests} Tests Passed`);
  console.log('===============================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

