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

async function runRegressionSuite() {
  console.log('========================================================================');
  console.log('   PATHWAY.ECO — Professional Links Extraction Suite (10 Scenarios)');
  console.log('========================================================================\n');

  // -------------------------------------------------------------------
  // TEST 1: Exact supplied resume (Yaswanth_Resume_FullStack_Intern (1).pdf)
  // -------------------------------------------------------------------
  console.log('TEST 1: Exact Supplied Resume Fixture');
  const pdfFixturePath = '/Users/yaswanthrajana/.gemini/antigravity/brain/1f874f8f-4c23-4482-903b-dbb8abcd5ffd/.user_uploaded/media_1793879967999_54606fc4.pdf';
  assert(fs.existsSync(pdfFixturePath), 'User resume PDF fixture exists on disk');

  const pdfBuffer = fs.readFileSync(pdfFixturePath);
  const parsed1 = await ResumeParserService.parseResume(pdfBuffer, 'Yaswanth_Resume_FullStack_Intern (1).pdf', 'application/pdf');

  assert(parsed1.professionalLinks.length === 1, `Exactly 1 professional link extracted (got: ${parsed1.professionalLinks.length})`);
  assert(parsed1.professionalLinks[0]?.platform === 'LinkedIn', `Extracted platform is LinkedIn (got: "${parsed1.professionalLinks[0]?.platform}")`);
  assert(parsed1.professionalLinks[0]?.url.includes('linkedin.com/in/LinkedIn'), `Extracted URL is accurate (got: "${parsed1.professionalLinks[0]?.url}")`);

  // Crucial: B.Tech must NEVER become a portfolio URL
  const hasBTechLink = parsed1.professionalLinks.some((l) => l.url.toLowerCase().includes('b.tech'));
  assert(!hasBTechLink, 'Degree acronym "B.Tech" was strictly filtered and NOT extracted as a portfolio link');

  // -------------------------------------------------------------------
  // TEST 2: Developer Code Hosting Platforms (GitHub, GitLab, Bitbucket)
  // -------------------------------------------------------------------
  console.log('\nTEST 2: Code Hosting Platforms');
  const codeHostsText = `
Candidate Name
dev@example.com
https://github.com/developer-lead
https://gitlab.com/devops-ninja
https://bitbucket.org/org-team/service-repo
https://devlead.github.io
`;
  const parsedCodeHosts = await ResumeParserService.parseResume(await createPdfFromLines(codeHostsText.split('\n')), 'codehosts.pdf', 'application/pdf');
  assert(parsedCodeHosts.professionalLinks.length === 4, `Extracted 4 code hosting links (got: ${parsedCodeHosts.professionalLinks.length})`);
  assert(parsedCodeHosts.professionalLinks.some((l) => l.platform === 'GitHub' && l.url.includes('github.com')), 'GitHub profile detected');
  assert(parsedCodeHosts.professionalLinks.some((l) => l.platform === 'GitLab' && l.url.includes('gitlab.com')), 'GitLab profile detected');
  assert(parsedCodeHosts.professionalLinks.some((l) => l.platform === 'Bitbucket' && l.url.includes('bitbucket.org')), 'Bitbucket profile detected');
  assert(parsedCodeHosts.professionalLinks.some((l) => l.platform === 'GitHub' && l.url.includes('github.io')), 'GitHub Pages detected as GitHub');

  // -------------------------------------------------------------------
  // TEST 3: Competitive Programming Platforms (LeetCode, CodeChef, HackerRank, Codeforces, Kaggle)
  // -------------------------------------------------------------------
  console.log('\nTEST 3: Competitive Programming Platforms');
  const cpText = `
Candidate Name
dev@example.com
https://leetcode.com/u/topcoder
https://codechef.com/users/chefmaster
https://hackerrank.com/profile/problem_solver
https://codeforces.com/profile/grandmaster
https://kaggle.com/datascientist
`;
  const parsedCp = await ResumeParserService.parseResume(await createPdfFromLines(cpText.split('\n')), 'cp.pdf', 'application/pdf');
  assert(parsedCp.professionalLinks.length === 5, `Extracted 5 competitive programming profiles (got: ${parsedCp.professionalLinks.length})`);
  assert(parsedCp.professionalLinks.some((l) => l.platform === 'LeetCode'), 'LeetCode profile detected');
  assert(parsedCp.professionalLinks.some((l) => l.platform === 'CodeChef'), 'CodeChef profile detected');
  assert(parsedCp.professionalLinks.some((l) => l.platform === 'HackerRank'), 'HackerRank profile detected');
  assert(parsedCp.professionalLinks.some((l) => l.platform === 'Codeforces'), 'Codeforces profile detected');
  assert(parsedCp.professionalLinks.some((l) => l.platform === 'Kaggle'), 'Kaggle profile detected');

  // -------------------------------------------------------------------
  // TEST 4: Design & Technical Blogging Platforms (Dev.to, Hashnode, Medium, Stack Overflow, Behance, Dribbble)
  // -------------------------------------------------------------------
  console.log('\nTEST 4: Design, Blogging & Community Platforms');
  const blogText = `
Candidate Name
dev@example.com
https://stackoverflow.com/users/12345/topdev
https://medium.com/@techwriter
https://dev.to/fullstackdev
https://hashnode.com/@cloudarchitect
https://behance.net/uiuxdesigner
https://dribbble.com/shots/portfolio
`;
  const parsedBlog = await ResumeParserService.parseResume(await createPdfFromLines(blogText.split('\n')), 'blog.pdf', 'application/pdf');
  assert(parsedBlog.professionalLinks.length === 6, `Extracted 6 community/blog profiles (got: ${parsedBlog.professionalLinks.length})`);
  assert(parsedBlog.professionalLinks.some((l) => l.platform === 'Stack Overflow'), 'Stack Overflow profile detected');
  assert(parsedBlog.professionalLinks.some((l) => l.platform === 'Medium'), 'Medium profile detected');
  assert(parsedBlog.professionalLinks.some((l) => l.platform === 'Dev.to'), 'Dev.to profile detected');
  assert(parsedBlog.professionalLinks.some((l) => l.platform === 'Hashnode'), 'Hashnode profile detected');
  assert(parsedBlog.professionalLinks.some((l) => l.platform === 'Behance'), 'Behance profile detected');
  assert(parsedBlog.professionalLinks.some((l) => l.platform === 'Dribbble'), 'Dribbble profile detected');

  // -------------------------------------------------------------------
  // TEST 5: Personal Portfolio & Custom Domains
  // -------------------------------------------------------------------
  console.log('\nTEST 5: Personal Portfolio & Custom Domains');
  const portfolioText = `
Candidate Name
dev@example.com
https://alexmorgan.me
yaswanth.dev
portfolio.site
`;
  const parsedPortfolio = await ResumeParserService.parseResume(await createPdfFromLines(portfolioText.split('\n')), 'portfolio.pdf', 'application/pdf');
  assert(parsedPortfolio.professionalLinks.length === 3, `Extracted 3 portfolio websites (got: ${parsedPortfolio.professionalLinks.length})`);
  assert(parsedPortfolio.professionalLinks.every((l) => l.platform === 'Portfolio'), 'All custom domains classified as Portfolio');
  assert(parsedPortfolio.professionalLinks.some((l) => l.url === 'https://alexmorgan.me'), 'alexmorgan.me preserved with https');
  assert(parsedPortfolio.professionalLinks.some((l) => l.url === 'https://yaswanth.dev'), 'yaswanth.dev normalized with https');

  // -------------------------------------------------------------------
  // TEST 6: Strict Rejection of Degrees and Technology Names
  // -------------------------------------------------------------------
  console.log('\nTEST 6: False Positive Rejection (Degrees & Tech Names)');
  const falsePositiveText = `
Candidate Name
dev@example.com | San Francisco, CA

EDUCATION
B.Tech in Computer Science
M.Tech in Software Engineering
B.Sc in Mathematics
Ph.D in Machine Learning

SKILLS
React.js, Node.js, Express.js, Vue.js, Next.js, Socket.io, Three.js, ASP.NET

EXPERIENCE
Software Engineer at SMVEN Technologies Pvt. Ltd. (v2.0 release, e.g. payment flow)
`;
  const parsedFP = await ResumeParserService.parseResume(await createPdfFromLines(falsePositiveText.split('\n')), 'fp.pdf', 'application/pdf');
  assert(parsedFP.professionalLinks.length === 0, `Zero links extracted from degree names and libraries (got: ${parsedFP.professionalLinks.length})`);

  // -------------------------------------------------------------------
  // TEST 7: Protocol Normalization & Punctuation Stripping
  // -------------------------------------------------------------------
  console.log('\nTEST 7: Protocol Normalization & Punctuation Stripping');
  const normText = `
Candidate Name
Contact: linkedin.com/in/alexmorgan, github.com/alexmorgan;
Website: (https://alexmorgan.dev).
`;
  const parsedNorm = await ResumeParserService.parseResume(await createPdfFromLines(normText.split('\n')), 'norm.pdf', 'application/pdf');
  assert(parsedNorm.professionalLinks.length === 3, `Extracted 3 normalized links (got: ${parsedNorm.professionalLinks.length})`);
  assert(parsedNorm.professionalLinks.every((l) => l.url.startsWith('https://')), 'All URLs normalized to start with https://');
  assert(parsedNorm.professionalLinks.every((l) => !/[.,;:)\]]$/.test(l.url)), 'All trailing punctuation cleanly stripped');

  // -------------------------------------------------------------------
  // TEST 8: Deduplication (Case-Insensitive & Trailing Slashes)
  // -------------------------------------------------------------------
  console.log('\nTEST 8: Deduplication Across Formats');
  const dupText = `
Candidate Name
https://github.com/alexmorgan
github.com/alexmorgan/
https://GITHUB.COM/alexmorgan
`;
  const parsedDup = await ResumeParserService.parseResume(await createPdfFromLines(dupText.split('\n')), 'dup.pdf', 'application/pdf');
  assert(parsedDup.professionalLinks.length === 1, `Duplicates collapsed into 1 unique link (got: ${parsedDup.professionalLinks.length})`);

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
  const aiExtracted = await AiResumeExtractor.extractWithAi(
    parsed1.rawText,
    'Yaswanth_Resume.pdf',
    dummyMetadata
  );
  assert(Array.isArray(aiExtracted.professionalLinks), 'AI extractor returns professionalLinks array');
  assert(aiExtracted.professionalLinks.length === 1, `AI extraction retains exact 1 link (got: ${aiExtracted.professionalLinks.length})`);
  assert(aiExtracted.professionalLinks[0]?.platform === 'LinkedIn', 'Platform is LinkedIn');

  // -------------------------------------------------------------------
  // TEST 10: Phase 5.1 Review Model Integration
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
  const linkReview = reviewSections.find((s: any) => s.key === 'professionalLinks');
  assert(Boolean(linkReview && linkReview.entries.length === 1), `Review modal has exactly 1 link entry (got: ${linkReview?.entries?.length})`);
  assert(linkReview.entries[0].duplicate === false, 'Link duplicate flag is false');
  assert(linkReview.entries[0].fields.find((f: any) => f.key === 'platform')?.value === 'LinkedIn', 'Review model platform is LinkedIn');
  assert(linkReview.entries[0].fields.find((f: any) => f.key === 'url')?.value.includes('linkedin.com/in/LinkedIn'), 'Review model URL is accurate');
  assert(linkReview.entries[0].fields.find((f: any) => f.key === 'platform')?.decision === 'pending', 'Platform decision is pending candidate approval');

  console.log('\n========================================================================');
  console.log('   ALL 10 PROFESSIONAL LINKS REGRESSION SCENARIOS PASSED WITH ZERO FAILURES');
  console.log('========================================================================\n');
}

runRegressionSuite().catch((err) => {
  console.error('Fatal error in regression suite:', err);
  process.exit(1);
});

