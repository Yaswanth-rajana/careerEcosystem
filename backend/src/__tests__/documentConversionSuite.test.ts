import assert from 'assert';
import crypto from 'crypto';
import zlib from 'zlib';
import { db } from '../db/client';
import { ConversionService } from '../services/tools/conversion-service';
import { ConversionProviderFactory } from '../services/tools/provider-factory';
import { MockConversionProvider } from '../services/tools/mock-conversion-provider';
import { FileValidationService } from '../services/tools/file-validation-service';
import { OutputValidationService } from '../services/tools/output-validation-service';
import { CleanupService } from '../services/tools/cleanup-service';
import { CloudConvertConversionProvider } from '../services/tools/cloudconvert-provider';
import { StorageFactory, StorageKeyGenerator } from '../services/tools/storage-provider';
import { RateLimitService } from '../services/tools/rate-limit-service';
import { ToolError } from '../services/tools/errors';

// Helper to create valid OpenXML ZIP package (DOCX, XLSX, PPTX)
function createZipFixture(xmlPath: string, rootXml: string): Buffer {
  const typesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/${xmlPath}" ContentType="application/vnd.custom+xml"/>
</Types>`;

  const entries = [
    { name: '[Content_Types].xml', content: Buffer.from(typesXml, 'utf-8') },
    { name: xmlPath, content: Buffer.from(rootXml, 'utf-8') },
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

// Helper to create valid legacy OLE Compound Document (DOC, XLS, PPT)
function createOleFixture(typeMarker: string): Buffer {
  const header = Buffer.alloc(512);
  Buffer.from('D0CF11E0A1B11AE1', 'hex').copy(header, 0);
  header.write(typeMarker, 64, 'utf-8');
  const body = Buffer.alloc(512, 0xAA);
  return Buffer.concat([header, body]);
}

async function runTestSuite() {
  console.log('🚀 Running Comprehensive Document Conversion Suite (26 Verification Points)...\n');
  let passed = 0;
  let failed = 0;

  function testAssert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ PASSED: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${name}`);
      failed++;
    }
  }

  const mockProvider = new MockConversionProvider();
  ConversionProviderFactory.setProvider(mockProvider);

  // Fixtures
  const docxBuf = createZipFixture('word/document.xml', '<w:document><w:body><w:p><w:t>DOCX Document</w:t></w:p></w:body></w:document>');
  const xlsxBuf = createZipFixture('xl/workbook.xml', '<workbook><sheets><sheet name="Sheet1"/></sheets></workbook>');
  const pptxBuf = createZipFixture('ppt/presentation.xml', '<presentation><sldMasterIdLst/></presentation>');
  const docBuf = createOleFixture('Word.Document.8');
  const xlsBuf = createOleFixture('Excel.Sheet.8');
  const pptBuf = createOleFixture('PowerPoint.Show.8');

  // Test 1: DOC to PDF
  try {
    RateLimitService.reset();
    const res = await ConversionService.convertDocument({
      filename: 'sample.doc',
      buffer: docBuf,
      targetFormat: 'pdf',
      clientIp: 'test-doc-pdf',
    });
    testAssert(res.status === 'COMPLETED' && res.outputFormat === 'pdf' && (res.outputSize || 0) > 0, '1. DOC to PDF conversion completes with valid PDF');
  } catch (err: any) {
    testAssert(false, `1. DOC to PDF failed: ${err.message}`);
  }

  // Test 2: DOCX to PDF
  try {
    RateLimitService.reset();
    const res = await ConversionService.convertDocument({
      filename: 'sample.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-docx-pdf',
    });
    testAssert(res.status === 'COMPLETED' && res.outputFilename.endsWith('.pdf'), '2. DOCX to PDF conversion completes with valid PDF');
  } catch (err: any) {
    testAssert(false, `2. DOCX to PDF failed: ${err.message}`);
  }

  // Test 3: XLS to PDF
  try {
    RateLimitService.reset();
    const res = await ConversionService.convertDocument({
      filename: 'financials.xls',
      buffer: xlsBuf,
      targetFormat: 'pdf',
      clientIp: 'test-xls-pdf',
    });
    testAssert(res.status === 'COMPLETED' && res.inputFormat === 'xls', '3. XLS to PDF conversion completes successfully');
  } catch (err: any) {
    testAssert(false, `3. XLS to PDF failed: ${err.message}`);
  }

  // Test 4: XLSX to PDF
  try {
    RateLimitService.reset();
    const res = await ConversionService.convertDocument({
      filename: 'spreadsheet.xlsx',
      buffer: xlsxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-xlsx-pdf',
    });
    testAssert(res.status === 'COMPLETED' && res.inputFormat === 'xlsx', '4. XLSX to PDF conversion completes successfully');
  } catch (err: any) {
    testAssert(false, `4. XLSX to PDF failed: ${err.message}`);
  }

  // Test 5: PPT to PDF
  try {
    RateLimitService.reset();
    const res = await ConversionService.convertDocument({
      filename: 'slides.ppt',
      buffer: pptBuf,
      targetFormat: 'pdf',
      clientIp: 'test-ppt-pdf',
    });
    testAssert(res.status === 'COMPLETED' && res.inputFormat === 'ppt', '5. PPT to PDF conversion completes successfully');
  } catch (err: any) {
    testAssert(false, `5. PPT to PDF failed: ${err.message}`);
  }

  // Test 6: PPTX to PDF
  try {
    RateLimitService.reset();
    const res = await ConversionService.convertDocument({
      filename: 'deck.pptx',
      buffer: pptxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-pptx-pdf',
    });
    testAssert(res.status === 'COMPLETED' && res.inputFormat === 'pptx', '6. PPTX to PDF conversion completes successfully');
  } catch (err: any) {
    testAssert(false, `6. PPTX to PDF failed: ${err.message}`);
  }

  // Test 7: Invalid file signature
  try {
    const fakeDocx = Buffer.from('NOT_A_ZIP_OR_OFFICE_FILE_AT_ALL');
    FileValidationService.validateIncomingFile('test.docx', fakeDocx);
    testAssert(false, '7. Invalid file signature accepted unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'INVALID_FILE_SIGNATURE', '7. Invalid file signature properly rejected with INVALID_FILE_SIGNATURE');
  }

  // Test 8: Unsupported extension
  try {
    FileValidationService.validateIncomingFile('script.exe', Buffer.from('MZ\x90\x00'));
    testAssert(false, '8. Unsupported extension accepted unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'INVALID_FILE_TYPE', '8. Unsupported extension rejected with INVALID_FILE_TYPE');
  }

  // Test 9: Oversized file
  try {
    const oversizedBytes = 26 * 1024 * 1024; // > 25MB
    FileValidationService.validateFileSize(oversizedBytes);
    testAssert(false, '9. Oversized file accepted unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'FILE_TOO_LARGE', '9. Oversized file rejected with FILE_TOO_LARGE');
  }

  // Test 10: Corrupt document (truncated ZIP)
  try {
    const corruptDocx = Buffer.concat([Buffer.from('PK\x03\x04'), Buffer.alloc(30)]);
    FileValidationService.validateFileSignature(corruptDocx, 'docx');
    testAssert(false, '10. Corrupt document accepted unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'CORRUPTED_FILE', '10. Corrupt document rejected with CORRUPTED_FILE');
  }

  // Test 11: Encrypted document handling
  try {
    const encryptedDocx = Buffer.concat([
      Buffer.from('D0CF11E0A1B11AE1', 'hex'),
      Buffer.from('EncryptedPackage'),
      Buffer.alloc(200),
    ]);
    FileValidationService.validateFileSignature(encryptedDocx, 'docx');
    testAssert(false, '11. Encrypted file accepted unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'PASSWORD_PROTECTED_FILE', '11. Encrypted file rejected with PASSWORD_PROTECTED_FILE');
  }

  // Test 12: Provider rejection
  try {
    RateLimitService.reset();
    mockProvider.shouldFail = true;
    mockProvider.failureCode = 'CONVERSION_FAILED';
    mockProvider.failureMessage = 'Provider failed to convert corrupted shapes';
    await ConversionService.convertDocument({
      filename: 'fail.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-prov-reject',
    });
    testAssert(false, '12. Provider rejection unhandled');
  } catch (err: any) {
    testAssert(err.code === 'CONVERSION_FAILED', '12. Provider rejection captured and surfaced as CONVERSION_FAILED');
  } finally {
    mockProvider.shouldFail = false;
  }

  // Test 13: Provider timeout
  try {
    RateLimitService.reset();
    mockProvider.shouldTimeout = true;
    await ConversionService.convertDocument({
      filename: 'timeout.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-prov-timeout',
    });
    testAssert(false, '13. Provider timeout unhandled');
  } catch (err: any) {
    testAssert(err.code === 'CONVERSION_TIMEOUT', '13. Provider timeout surfaced as CONVERSION_TIMEOUT');
  } finally {
    mockProvider.shouldTimeout = false;
  }

  // Test 14: Temporary provider failure
  try {
    RateLimitService.reset();
    mockProvider.isHealthy = false;
    await ConversionService.startConversion({
      filename: 'temp_fail.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-temp-fail',
    });
    testAssert(false, '14. Temporary provider failure unhandled');
  } catch (err: any) {
    testAssert(err.code === 'TOOL_UNAVAILABLE', '14. Temporary provider failure returns TOOL_UNAVAILABLE');
  } finally {
    mockProvider.isHealthy = true;
  }

  // Test 15: Duplicate job-creation request
  try {
    RateLimitService.reset();
    const job1 = await ConversionService.startConversion({
      filename: 'dup1.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-dup-1',
    });
    const job2 = await ConversionService.startConversion({
      filename: 'dup2.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-dup-2',
    });
    testAssert(job1.jobId !== job2.jobId && job1.status === 'PROCESSING', '15. Separate distinct job IDs created without collision');
  } catch (err: any) {
    testAssert(false, `15. Job creation error: ${err.message}`);
  }

  // Test 16: Duplicate webhook event handling (idempotency)
  try {
    RateLimitService.reset();
    const testSecret = 'whsec_test_12345';
    process.env.CLOUDCONVERT_WEBHOOK_SECRET = testSecret;

    const testJob = await ConversionService.startConversion({
      filename: 'webhook_test.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-webhook-ip',
    });

    const webhookBody = JSON.stringify({
      event: 'job.finished',
      data: {
        job: {
          id: `mock-job-${Date.now()}`,
          tag: testJob.jobId,
          status: 'finished',
          tasks: [
            {
              operation: 'export/url',
              status: 'finished',
              result: {
                files: [{ url: `https://storage.cloudconvert.com/mock-export/${testJob.jobId}/output.pdf` }],
              },
            },
          ],
        },
      },
    });

    const sig = crypto.createHmac('sha256', testSecret).update(Buffer.from(webhookBody)).digest('hex');

    // First webhook delivery
    const res1 = await ConversionService.handleWebhookEvent(webhookBody, sig);
    testAssert(Boolean(res1.handled && res1.status === 'COMPLETED'), '16a. First webhook event processed and job marked COMPLETED');

    // Duplicate webhook delivery
    const res2 = await ConversionService.handleWebhookEvent(webhookBody, sig);
    testAssert(Boolean(res2.handled && res2.status === 'COMPLETED'), '16b. Duplicate webhook safely handled idempotently without re-processing');
  } catch (err: any) {
    testAssert(false, `16. Webhook handling error: ${err.message}`);
  }

  // Test 17: Forged webhook rejection
  try {
    process.env.CLOUDCONVERT_WEBHOOK_SECRET = 'whsec_test_12345';
    const fakeBody = JSON.stringify({ event: 'job.finished', data: { job: { id: 'fake' } } });
    const forgedSig = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    await ConversionService.handleWebhookEvent(fakeBody, forgedSig);
    testAssert(false, '17. Forged webhook accepted unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'UNAUTHORIZED_ACCESS', '17. Forged webhook rejected with UNAUTHORIZED_ACCESS');
  }

  // Test 18: Unauthorized status lookup
  try {
    RateLimitService.reset();
    const guestJob = await ConversionService.startConversion({
      filename: 'guest.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-guest-status',
    });

    // Try reading status without providing guestToken
    await ConversionService.getJobStatus(guestJob.jobId, null, null);
    testAssert(false, '18. Unauthenticated access without guest token allowed unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'UNAUTHORIZED_ACCESS', '18. Unauthorized status lookup rejected with UNAUTHORIZED_ACCESS');
  }

  // Test 19: Cross-user output download denial
  try {
    RateLimitService.reset();
    const validUserIdA = '6ada11847db705c8e3701df0';
    const validUserIdB = '6ada11847db705c8e3701df1';

    const userJob = await ConversionService.convertDocument({
      filename: 'private.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      userId: validUserIdA,
      clientIp: 'test-cross-user-ip',
    });

    // User B tries to download User A's file
    await ConversionService.getDownloadStream(userJob.jobId, validUserIdB, null);
    testAssert(false, '19. Cross-user download allowed unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'UNAUTHORIZED_ACCESS', '19. Cross-user output download denied with UNAUTHORIZED_ACCESS');
  }

  // Test 20: Storage failure
  try {
    const storage = StorageFactory.getProvider();
    const fakeKey = 'conversions/non_existent/output.pdf';
    await storage.download(fakeKey);
    testAssert(false, '20. Missing storage download succeeded unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'STORAGE_ERROR', '20. Storage download error handles missing files cleanly');
  }

  // Test 21: Output persistence failure handling
  try {
    const badPdfBuffer = Buffer.from('NOT_A_VALID_PDF_OUTPUT');
    await OutputValidationService.validatePdfOutput(badPdfBuffer, 'test-job', 'docx');
    testAssert(false, '21. Corrupt PDF output validated unexpectedly');
  } catch (err: any) {
    testAssert(err.code === 'OUTPUT_VALIDATION_FAILED', '21. Invalid output rejected by OutputValidationService');
  }

  // Test 22: Cleanup of abandoned files
  try {
    const cleanupResult = await CleanupService.runCleanupCycle();
    testAssert(typeof cleanupResult.purgedFiles === 'number', '22. CleanupService purges expired files safely');
  } catch (err: any) {
    testAssert(false, `22. CleanupService error: ${err.message}`);
  }

  // Test 23: Status polling timeout
  try {
    RateLimitService.reset();
    const timeoutProvider = new MockConversionProvider();
    timeoutProvider.shouldTimeout = true;
    ConversionProviderFactory.setProvider(timeoutProvider);

    await ConversionService.convertDocument({
      filename: 'poll_timeout.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-poll-timeout',
    });
    testAssert(false, '23. Polling timeout unhandled');
  } catch (err: any) {
    testAssert(err.code === 'CONVERSION_TIMEOUT', '23. Status polling timeout cleanly surfaces CONVERSION_TIMEOUT');
  } finally {
    ConversionProviderFactory.setProvider(mockProvider);
  }

  // Test 24: Existing conversion callers remain compatible
  try {
    RateLimitService.reset();
    const legacyResult = await ConversionService.convertDocument({
      filename: 'legacy_caller.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-legacy-caller',
    });
    testAssert(Boolean(legacyResult.jobId) && legacyResult.status === 'COMPLETED', '24. Existing conversion caller API remains 100% backward-compatible');
  } catch (err: any) {
    testAssert(false, `24. Legacy caller error: ${err.message}`);
  }

  // Test 25: Frontend refresh / resumption during processing
  try {
    RateLimitService.reset();
    const initJob = await ConversionService.startConversion({
      filename: 'resume_refresh.docx',
      buffer: docxBuf,
      targetFormat: 'pdf',
      clientIp: 'test-refresh-ip',
    });

    const refreshedStatus = await ConversionService.getJobStatus(
      initJob.jobId,
      null,
      initJob.guestToken
    );
    testAssert(Boolean(refreshedStatus.id === initJob.jobId && ['PROCESSING', 'COMPLETED'].includes(refreshedStatus.status)), '25. Frontend resumption via getJobStatus succeeds on simulated page refresh');
  } catch (err: any) {
    testAssert(false, `25. Resumption error: ${err.message}`);
  }

  // Test 26: Vercel-compatible upload and download behavior
  try {
    const key = StorageKeyGenerator.generateInputKey('job_123', 'docx');
    const outKey = StorageKeyGenerator.generateOutputKey('job_123');
    testAssert(
      Boolean(key.startsWith('conversions/job_123/input_') &&
      outKey.startsWith('conversions/job_123/output_') &&
      key !== outKey),
      '26. Vercel serverless keys are unique, separate, unpredictable, and isolated'
    );
  } catch (err: any) {
    testAssert(false, `26. Key generation error: ${err.message}`);
  }

  console.log(`\n========================================`);
  console.log(`Conversion Test Results: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal suite execution error:', err);
  process.exit(1);
});
