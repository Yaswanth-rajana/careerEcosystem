import fs from 'fs';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ResumeParserService } from '../services/resumeParserService';
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

async function runProjectRegressionSuite() {
  console.log('========================================================================');
  console.log('   PATHWAY.ECO — Resume Projects Extraction Regression Suite (10 Scenarios)');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------
  // TEST 1: Exact supplied resume (Yaswanth_Resume_FullStack_Intern (1).pdf)
  // -------------------------------------------------------------------
  console.log('TEST 1: Exact Supplied Resume Fixture');
  const pdfFixturePath = '/Users/yaswanthrajana/.gemini/antigravity/brain/1f874f8f-4c23-4482-903b-dbb8abcd5ffd/.user_uploaded/media_1793879967999_54606fc4.pdf';
  assert(fs.existsSync(pdfFixturePath), 'User resume PDF fixture exists on disk');

  const pdfBuffer = fs.readFileSync(pdfFixturePath);
  const parsed1 = await ResumeParserService.parseResume(pdfBuffer, 'Yaswanth_Resume_FullStack_Intern (1).pdf', 'application/pdf');

  assert(parsed1.projects.length === 2, `Exactly 2 project records produced (got: ${parsed1.projects.length})`);

  // Project 1: Offline-First Order Management System
  const proj1 = parsed1.projects[0];
  assert(proj1.title === 'Offline-First Order Management System', `Project 1 title: "${proj1.title}"`);
  const bullets1 = proj1.bullets || [];
  assert(bullets1.length === 3, `Project 1 has exactly 3 responsibility bullets (got: ${bullets1.length})`);
  assert(Boolean(bullets1[0]?.includes('Built a browser-based offline-first ordering system')), 'Project 1 bullet 1 preserved');
  assert(Boolean(bullets1[1]?.includes('Implemented background synchronization') && bullets1[1]?.includes('connectivity.')), 'Project 1 bullet 2 wrapped line reassembled');
  assert(Boolean(bullets1[2]?.includes('Designed reliable client-server REST API data flows')), 'Project 1 bullet 3 preserved');
  assert(proj1.technologies.includes('IndexedDB'), 'Project 1 includes IndexedDB');
  assert(proj1.technologies.includes('Web Storage'), 'Project 1 includes Web Storage');
  assert(proj1.technologies.includes('REST API'), 'Project 1 includes REST API');
  assert(proj1.githubUrl === undefined, 'No fake GitHub URL invented for Project 1');

  // Project 2: NeuralFlow – AI Analytics & Insight Engine
  const proj2 = parsed1.projects[1];
  assert(proj2.title.includes('NeuralFlow'), `Project 2 title: "${proj2.title}"`);
  const bullets2 = proj2.bullets || [];
  assert(bullets2.length === 3, `Project 2 has exactly 3 responsibility bullets (got: ${bullets2.length})`);
  assert(Boolean(bullets2[0]?.includes('Developed a responsive React.js interface')), 'Project 2 bullet 1 preserved');
  assert(Boolean(bullets2[1]?.includes('Integrated asynchronous frontend workflows')), 'Project 2 bullet 2 preserved');
  assert(Boolean(bullets2[2]?.includes('Integrated Gemini API for automated data interpretation')), 'Project 2 bullet 3 preserved');
  assert(proj2.technologies.includes('React.js'), 'Project 2 includes React.js');
  assert(proj2.technologies.includes('Node.js'), 'Project 2 includes Node.js');
  assert(proj2.technologies.includes('MongoDB'), 'Project 2 includes MongoDB');
  assert(proj2.technologies.includes('Redis'), 'Project 2 includes Redis');
  assert(proj2.technologies.includes('Gemini API'), 'Project 2 includes Gemini API');
  assert(proj2.technologies.includes('AWS EC2'), 'Project 2 includes AWS EC2');
  assert(proj2.githubUrl === undefined, 'No fake GitHub URL invented for Project 2');

  // Negative Check: GitHub was never created as a project
  assert(!parsed1.projects.some((p) => p.title.toLowerCase() === 'github'), 'GitHub is never extracted as a project title');

  // -------------------------------------------------------------------
  // TEST 2: GitHub Labels
  // -------------------------------------------------------------------
  console.log('\nTEST 2: GitHub Labels Handling');
  const ghVariantsText = `
Alex Dev
alex@example.com | 9876543210

PROJECTS
TaskFlow Manager
GitHub: https://github.com/alex/taskflow
• Built task management application with React.

DataSync Engine | GitHub
https://github.com/alex/datasync
• Implemented distributed sync.
`;
  const parsedGh = await ResumeParserService.parseResume(await createPdfFromLines(ghVariantsText.split('\n')), 'gh.pdf', 'application/pdf');
  assert(parsedGh.projects.length === 2, `Extracted 2 projects from GitHub variants (got: ${parsedGh.projects.length})`);
  assert(parsedGh.projects[0].githubUrl === 'https://github.com/alex/taskflow', 'Extracted github.com URL for Project 1');
  assert(parsedGh.projects[1].githubUrl === 'https://github.com/alex/datasync', 'Extracted github.com URL for Project 2');
  assert(!parsedGh.projects.some((p) => p.title.toLowerCase() === 'github'), 'Zero projects named GitHub');

  // -------------------------------------------------------------------
  // TEST 3: Other Platform Labels
  // -------------------------------------------------------------------
  console.log('\nTEST 3: Other Link Labels Handling');
  const otherPlatformsText = `
Dev User
dev@example.com | 9876543210

PROJECTS
Portal System
GitLab
Live Demo: https://portal.example.com
• Shipped client interface.

Analytics Pipeline
Repository
• Built ETL service.
`;
  const parsedOther = await ResumeParserService.parseResume(await createPdfFromLines(otherPlatformsText.split('\n')), 'other.pdf', 'application/pdf');
  assert(parsedOther.projects.length === 2, `Extracted 2 projects despite GitLab/Live Demo/Repository labels (got: ${parsedOther.projects.length})`);
  assert(parsedOther.projects[0].title === 'Portal System', 'Project 1 title preserved');
  assert(parsedOther.projects[0].projectUrl === 'https://portal.example.com', 'Live Demo URL extracted');
  assert(parsedOther.projects[1].title === 'Analytics Pipeline', 'Project 2 title preserved');
  assert(!parsedOther.projects.some((p) => /^(?:gitlab|live demo|repository)$/i.test(p.title)), 'Platform labels ignored as titles');

  // -------------------------------------------------------------------
  // TEST 4: Project Title Formats
  // -------------------------------------------------------------------
  console.log('\nTEST 4: Different Project Title Formats');
  const formatsText = `
Format Tester
tester@example.com | 9876543210

PROJECTS
Alpha Project - Microservices Backend
• Built backend in Go.

Beta System – Real-Time Messaging Engine
• Built WebSocket gateway.

Gamma Hub | TypeScript, Next.js, Docker
• Deployed full stack application.
`;
  const parsedFormats = await ResumeParserService.parseResume(await createPdfFromLines(formatsText.split('\n')), 'formats.pdf', 'application/pdf');
  assert(parsedFormats.projects.length === 3, `Handled 3 title formats (hyphen, en-dash, pipe) (got: ${parsedFormats.projects.length})`);
  assert(parsedFormats.projects[0].title.includes('Alpha Project'), 'Hyphen format preserved');
  assert(parsedFormats.projects[1].title.includes('Beta System'), 'En-dash format preserved');
  assert(parsedFormats.projects[2].title === 'Gamma Hub', 'Pipe format extracts clean title');
  assert(parsedFormats.projects[2].technologies.includes('Next.js'), 'Pipe format extracts inline technologies');

  // -------------------------------------------------------------------
  // TEST 5: Multiple Projects Separation
  // -------------------------------------------------------------------
  console.log('\nTEST 5: Multiple Projects Separation');
  const multiProjText = `
Multi Dev
multi@example.com | 9876543210

PROJECTS
Project One
• First bullet for project one.
• Second bullet for project one.

Project Two
• First bullet for project two.
• Second bullet for project two.
`;
  const parsedMulti = await ResumeParserService.parseResume(await createPdfFromLines(multiProjText.split('\n')), 'multi.pdf', 'application/pdf');
  assert(parsedMulti.projects.length === 2, 'Separated 2 distinct projects');
  assert((parsedMulti.projects[0].bullets?.length ?? 0) === 2, 'Project 1 has 2 bullets');
  assert((parsedMulti.projects[1].bullets?.length ?? 0) === 2, 'Project 2 has 2 bullets');
  assert(parsedMulti.projects[0].bullets?.[0].includes('project one') ?? false, 'Project 1 does not leak Project 2 bullets');

  // -------------------------------------------------------------------
  // TEST 6: Wrapped Descriptions
  // -------------------------------------------------------------------
  console.log('\nTEST 6: Wrapped Descriptions Reassembly');
  const wrappedProjText = `
Wrap Dev
wrap@example.com | 9876543210

PROJECTS
High Scale Cache
• Built a low latency distributed cache with eviction policies and
consistent hashing algorithms for cluster rebalancing.
`;
  const parsedWrap = await ResumeParserService.parseResume(await createPdfFromLines(wrappedProjText.split('\n')), 'wrap.pdf', 'application/pdf');
  assert((parsedWrap.projects[0]?.bullets?.length ?? 0) === 1, 'Wrapped line joined into exactly 1 bullet');
  assert(Boolean(parsedWrap.projects[0]?.bullets?.[0]?.includes('consistent hashing algorithms')), 'Wrapped line text retained');

  // -------------------------------------------------------------------
  // TEST 7: Missing Information Anti-Fabrication
  // -------------------------------------------------------------------
  console.log('\nTEST 7: Anti-Fabrication Guarantees');
  const minimalProjText = `
Minimal Dev
min@example.com | 9876543210

PROJECTS
Minimalist Tool
• Simple utility script.
`;
  const parsedMin = await ResumeParserService.parseResume(await createPdfFromLines(minimalProjText.split('\n')), 'min.pdf', 'application/pdf');
  assert(parsedMin.projects[0].githubUrl === undefined, 'No fabricated githubUrl');
  assert(parsedMin.projects[0].projectUrl === undefined, 'No fabricated projectUrl');
  assert(parsedMin.projects[0].role === undefined, 'No fabricated role');

  // -------------------------------------------------------------------
  // TEST 8: Technology Association Scoping
  // -------------------------------------------------------------------
  console.log('\nTEST 8: Technology Association Scoping');
  const techScopeText = `
Candidate
cand@example.com | 9876543210

PROJECTS
Payment Gateway
• Integrated Stripe API in Node.js and Redis.

Machine Learning Pipeline
• Trained PyTorch neural networks in Python.

SKILLS
Java, C++, PHP, Ruby
`;
  const parsedTech = await ResumeParserService.parseResume(await createPdfFromLines(techScopeText.split('\n')), 'tech.pdf', 'application/pdf');
  assert(parsedTech.projects[0].technologies.includes('Node.js'), 'Project 1 includes Node.js');
  assert(!parsedTech.projects[0].technologies.includes('PyTorch'), 'Project 1 does NOT receive Project 2 technologies');
  assert(!parsedTech.projects[0].technologies.includes('Java'), 'Project 1 does NOT receive overall skills wholesale');

  // -------------------------------------------------------------------
  // TEST 9: AI and Deterministic Fallback Consistency
  // -------------------------------------------------------------------
  console.log('\nTEST 9: AI Extraction Merging & Fallback Consistency');
  const dummyMetadata = {
    fileType: 'txt' as const,
    characterCount: techScopeText.length,
    wordCount: techScopeText.split(/\s+/).length,
    extractionMethod: 'TXT_DECODE' as const,
    qualityStatus: 'HIGH' as const,
    ocrUsed: false,
    warnings: [],
  };
  const baselineStructured = StructuredResumeEngine.processStructuredIntelligence(techScopeText, 'tech.pdf', dummyMetadata);
  const aiExtracted = await AiResumeExtractor.extractWithAi(techScopeText, 'tech.pdf', dummyMetadata);
  assert(aiExtracted.projects.length === baselineStructured.projects.length, 'Deterministic fallback produces matching projects length');
  assert(aiExtracted.projects[0]?.title === baselineStructured.projects[0]?.title, 'Project title is identical across paths');

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
  const projReview = reviewSections.find((s: any) => s.key === 'projects');
  assert(Boolean(projReview && projReview.entries.length === 2), `Projects section has exactly 2 entries in review modal (got: ${projReview?.entries?.length})`);
  assert(projReview.entries[0].duplicate === false, 'Project 1 duplicate flag is false');
  assert(projReview.entries[1].duplicate === false, 'Project 2 duplicate flag is false');
  assert(projReview.entries[0].fields.find((f: any) => f.key === 'title')?.decision === 'pending', 'Project 1 decision is pending candidate approval');

  console.log('\n========================================================================');
  console.log('   ALL 10 PROJECTS REGRESSION SCENARIOS PASSED WITH ZERO FAILURES');
  console.log('========================================================================\n');
}

runProjectRegressionSuite().catch((err) => {
  console.error('Fatal error in regression suite:', err);
  process.exit(1);
});

