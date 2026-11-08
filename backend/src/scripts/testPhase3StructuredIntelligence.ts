import assert from 'assert';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { ResumeParserService } from '../services/resumeParserService';
import { StructuredResumeEngine } from '../services/resume/structuredResumeEngine';
import { DocumentExtractionService } from '../services/resume/documentExtractionService';

async function generatePdfBuffer(lines: string[]): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.addPage([600, 800]);
  let y = 750;
  for (const line of lines) {
    page.drawText(line, { x: 50, y, font, size: 10 });
    y -= 18;
  }
  return Buffer.from(await doc.save());
}

async function runPhase3RegressionTests() {
  console.log('========================================================================');
  console.log('   PATHWAY.ECO — Phase 3 Structured Intelligence Regression Suite       ');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function check(condition: boolean, label: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`  ✓ [PASS] ${label}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${label}`);
      if (detail) console.error(`     ↳ ${detail}`);
    }
  }

  // -------------------------------------------------------------------
  // TEST 1: Ambiguous Education vs Online Course Platforms
  // Ground truth:
  // - Stanford University -> Education (Undergraduate)
  // - Apna College & Scaler Academy -> Diverted to Certifications / Courses, NEVER Education
  // -------------------------------------------------------------------
  console.log('TEST 1: Ambiguous Education vs Online Course Platforms');
  {
    const text = `
Sarah Jenkins
sarah.j@example.com | +1 (555) 345-6789 | Seattle, WA

EDUCATION
Stanford University | 2019 – 2023
Bachelor of Science in Computer Science | CGPA: 3.88/4.0

Apna College | 2022
Full Stack Web Development Boot Camp

Scaler Academy | 2023
Data Structures and Distributed Systems Masterclass
`;
    const buf = await generatePdfBuffer(text.split('\n'));
    const parsed = await ResumeParserService.parseResume(buf, 'sarah_resume.pdf', 'application/pdf');

    check(parsed.education.length === 1, 'Only genuine degree retained in education (count: 1)');
    check(parsed.education[0]?.institution === 'Stanford University', 'Stanford is the only university in education');
    check(!parsed.education.some(e => e.institution.toLowerCase().includes('apna')), 'Apna College strictly rejected from education');
    check(!parsed.education.some(e => e.institution.toLowerCase().includes('scaler')), 'Scaler Academy strictly rejected from education');
    check(parsed.certifications.length >= 2, 'Non-degree courses successfully routed to certifications');
    check(parsed.structuredData?.education[0]?.educationLevel === 'UNDERGRADUATE', 'Education classified as UNDERGRADUATE');
  }

  // -------------------------------------------------------------------
  // TEST 2: Multiple Internships Segregation
  // Ground truth:
  // - 2 internships: Google (Software Engineering Intern) & Meta (Data Science Intern)
  // - Separated into structured.internships AND tagged with employmentType = Internship
  // - NEVER default company to "Organization"
  // -------------------------------------------------------------------
  console.log('\nTEST 2: Multiple Internships & Experience Classification');
  {
    const text = `
Michael Chang
michael.c@example.com | +1 (555) 876-5432 | New York, NY

INTERNSHIPS
Software Engineering Intern at Google
Jun 2023 – Aug 2023
• Built distributed indexing pipeline in Go and Kubernetes.
• Reduced search query latency by 18%.

Data Science Intern at Meta
Jun 2022 – Aug 2022
• Trained transformer recommendation models in PyTorch and Python.
• Analyzed engagement metrics on Instagram Reels.
`;
    const buf = await generatePdfBuffer(text.split('\n'));
    const parsed = await ResumeParserService.parseResume(buf, 'michael_cv.pdf', 'application/pdf');

    check(parsed.structuredData?.internships.length === 2, 'Parsed exactly 2 internships');
    check(parsed.experience.every(e => e.employmentType === 'Internship'), 'Both tagged with employmentType: Internship');
    check(parsed.experience[0]?.company === 'Google', 'Company 1 correctly extracted as Google');
    check(parsed.experience[1]?.company === 'Meta', 'Company 2 correctly extracted as Meta');
    check(!parsed.experience.some(e => e.company === 'Organization'), 'Zero fabricated "Organization" company names');
    check(parsed.experience[0]?.startDate === 'Jun 2023', 'Start date 1 extracted accurately');
    check(parsed.experience[1]?.startDate === 'Jun 2022', 'Start date 2 extracted accurately');
  }

  // -------------------------------------------------------------------
  // TEST 3: Projects with GitHub & Demo URLs and Technologies
  // Ground truth:
  // - 2 projects with technologies and GitHub links
  // -------------------------------------------------------------------
  console.log('\nTEST 3: Projects with GitHub & Live Demo URLs');
  {
    const text = `
Elena Rostova
elena@example.com | +44 20 7946 0912 | London, UK

PROJECTS
CloudVault — Distributed Storage Engine | Rust, Docker, gRPC | https://github.com/elena/cloudvault
• Built decentralized object storage node network with Raft consensus.
• Shipped client library with asynchronous zero-copy buffer streaming.

AutoDoc — AI Document Summarizer | TypeScript, Next.js, Redis | https://github.com/elena/autodoc
• Engineered streaming summaries via LLM API integration.
• Deployed production demo at https://autodoc.dev with Redis caching.
`;
    const buf = await generatePdfBuffer(text.split('\n'));
    const parsed = await ResumeParserService.parseResume(buf, 'elena_projects.pdf', 'application/pdf');

    check(parsed.projects.length === 2, 'Extracted 2 structured projects');
    check(parsed.projects[0]?.title.includes('CloudVault'), 'Project 1 title preserved');
    check(Boolean(parsed.projects[0]?.githubUrl?.includes('github.com/elena/cloudvault')), 'Project 1 GitHub URL extracted');
    check(parsed.projects[0]?.technologies.includes('Rust') || parsed.projects[0]?.technologies.includes('Docker'), 'Project 1 tech stack identified');
    check(Boolean(parsed.projects[1]?.projectUrl?.includes('autodoc.dev') || parsed.projects[1]?.githubUrl), 'Project 2 live/github link extracted');
  }

  // -------------------------------------------------------------------
  // TEST 4: Arbitrary Certifications with Issuing Organizations
  // Ground truth:
  // - Dynamic certification names (not limited to hardcoded lists)
  // -------------------------------------------------------------------
  console.log('\nTEST 4: Arbitrary Certifications Extraction');
  {
    const text = `
Arjun Patel
arjun.p@example.com | +91 9123456789 | Mumbai, India

CERTIFICATIONS
• CKAD: Certified Kubernetes Application Developer – Linux Foundation
• HashiCorp Certified: Terraform Associate – HashiCorp
• Deep Learning Specialization – DeepLearning.AI
`;
    const buf = await generatePdfBuffer(text.split('\n'));
    const parsed = await ResumeParserService.parseResume(buf, 'arjun_certs.pdf', 'application/pdf');

    check(parsed.certifications.length === 3, 'Extracted 3 arbitrary certifications');
    check(parsed.certifications[0]?.issuingOrganization.includes('Linux Foundation'), 'Extracted Linux Foundation as issuer');
    check(parsed.certifications[1]?.issuingOrganization.includes('HashiCorp'), 'Extracted HashiCorp as issuer');
    check(parsed.certifications[2]?.issuingOrganization.includes('DeepLearning.AI'), 'Extracted DeepLearning.AI as issuer');
  }

  // -------------------------------------------------------------------
  // TEST 5: Missing Personal Information (Strict Anti-Fabrication)
  // Ground truth:
  // - Missing phone and location remain undefined (not fabricated)
  // -------------------------------------------------------------------
  console.log('\nTEST 5: Missing Personal Information Anti-Fabrication');
  {
    const text = `
Candidate 89421
dev89421@example.com

SKILLS
Python, PostgreSQL, Git, Docker
`;
    const buf = await generatePdfBuffer(text.split('\n'));
    const parsed = await ResumeParserService.parseResume(buf, 'anon_dev.pdf', 'application/pdf');

    check(parsed.personalInfo.phone === undefined, 'No fake phone number invented');
    check(parsed.personalInfo.location === undefined, 'No fake location invented');
    check(parsed.experience.length === 0, 'No fake experience history invented');
    check(parsed.education.length === 0, 'No fake university degree invented');
  }

  // -------------------------------------------------------------------
  // TEST 6: Technical vs Soft Skills Categorization
  // Ground truth:
  // - Technical skills categorized (LANGUAGE, FRONTEND, CLOUD, DEVOPS, etc.)
  // - Soft skills categorized (Leadership, Problem Solving)
  // -------------------------------------------------------------------
  console.log('\nTEST 6: Technical vs Soft Skills Taxonomy');
  {
    const text = `
Dev Profile
dev@example.com | +1 555-1234

SKILLS
Technical: Python, React, PostgreSQL, Docker, AWS, Kubernetes
Professional: Leadership, Problem Solving, Agile Methodologies, Team Collaboration
`;
    const buf = await generatePdfBuffer(text.split('\n'));
    const parsed = await ResumeParserService.parseResume(buf, 'skills_profile.pdf', 'application/pdf');

    const tech = parsed.structuredData?.technicalSkills || [];
    const soft = parsed.structuredData?.softSkills || [];

    check(tech.some(s => s.name === 'Python' && s.category === 'LANGUAGE'), 'Python categorized as LANGUAGE');
    check(tech.some(s => s.name === 'React' && s.category === 'FRONTEND'), 'React categorized as FRONTEND');
    check(tech.some(s => s.name === 'Docker' && s.category === 'DEVOPS'), 'Docker categorized as DEVOPS');
    check(tech.some(s => s.name === 'AWS' && s.category === 'CLOUD'), 'AWS categorized as CLOUD');
    check(soft.some(s => s.name === 'Leadership'), 'Leadership categorized as SOFT_SKILL');
    check(soft.some(s => s.name === 'Problem Solving'), 'Problem Solving categorized as SOFT_SKILL');
  }

  // -------------------------------------------------------------------
  // TEST 7: Professional Links (LeetCode, CodeChef, GitHub, LinkedIn)
  // -------------------------------------------------------------------
  console.log('\nTEST 7: Multi-Platform Professional Links');
  {
    const text = `
Competitive Programmer
coder@example.com | India
https://linkedin.com/in/code-master
https://github.com/codemaster
https://leetcode.com/codemaster
https://codechef.com/users/codemaster

SKILLS
C++, Java, Algorithms
`;
    const buf = await generatePdfBuffer(text.split('\n'));
    const parsed = await ResumeParserService.parseResume(buf, 'links_profile.pdf', 'application/pdf');

    const links = parsed.professionalLinks;
    check(links.some(l => l.platform === 'LinkedIn'), 'LinkedIn profile detected');
    check(links.some(l => l.platform === 'GitHub'), 'GitHub profile detected');
    check(links.some(l => l.platform === 'LeetCode'), 'LeetCode profile detected');
    check(links.some(l => l.platform === 'CodeChef'), 'CodeChef profile detected');
  }

  console.log('\n========================================================================');
  console.log(`   Phase 3 Verification Complete: ${passed}/${total} Checks Passed (${Math.round((passed / total) * 100)}% Accuracy)`);
  console.log('========================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase3RegressionTests().catch((err) => {
  console.error('Fatal Phase 3 test error:', err);
  process.exit(1);
});

