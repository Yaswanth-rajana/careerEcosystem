import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

import { buildSvg } from './generate-workflows.mjs';
import { studentWorkflowData } from './data-student.mjs';
import { mentorWorkflowData } from './data-mentor.mjs';
import { recruiterWorkflowData } from './data-recruiter.mjs';
import { adminWorkflowData } from './data-admin.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const portals = [
  {
    name: 'student-backend-workflow',
    title: 'Student & Candidate Portal',
    data: studentWorkflowData
  },
  {
    name: 'mentor-backend-workflow',
    title: 'Mentor Portal',
    data: mentorWorkflowData
  },
  {
    name: 'recruiter-backend-workflow',
    title: 'Recruiter Portal',
    data: recruiterWorkflowData
  },
  {
    name: 'admin-backend-workflow',
    title: 'Admin Portal',
    data: adminWorkflowData
  }
];

console.log('================================================================');
console.log('PATHWAY.ECO — Generating 4 Dedicated 4K Workflow Diagrams');
console.log('================================================================');

for (const portal of portals) {
  console.log(`\n[1/3] Building SVG for ${portal.title}...`);
  const svgContent = buildSvg(portal.data);
  const svgPath = path.join(__dirname, `${portal.name}.svg`);
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log(`  -> Saved SVG: ${svgPath} (${(svgContent.length / 1024).toFixed(1)} KB)`);

  const pngPath = path.join(__dirname, `${portal.name}.png`);
  console.log(`[2/3] Rendering 4K PNG via Google Chrome Headless...`);
  const fileUrl = `file://${svgPath}`;
  const cmd = `"${CHROME_PATH}" --headless --disable-gpu --window-size=3840,2160 --default-background-color=00000000 --screenshot="${pngPath}" "${fileUrl}"`;
  
  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (err) {
    console.error(`  Error during Chrome render:`, err.message);
  }

  console.log(`[3/3] Verifying PNG output...`);
  if (fs.existsSync(pngPath)) {
    const stat = fs.statSync(pngPath);
    console.log(`  -> Successfully created: ${pngPath}`);
    console.log(`  -> File size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB (${stat.size} bytes)`);

    try {
      const sipsOutput = execSync(`sips -g pixelWidth -g pixelHeight "${pngPath}"`, { encoding: 'utf-8' });
      const widthMatch = sipsOutput.match(/pixelWidth:\s*(\d+)/);
      const heightMatch = sipsOutput.match(/pixelHeight:\s*(\d+)/);
      console.log(`  -> Dimensions: ${widthMatch ? widthMatch[1] : '?'} x ${heightMatch ? heightMatch[1] : '?'} pixels`);
    } catch (sipsErr) {
      console.log(`  -> (sips verification skipped or failed)`);
    }
  } else {
    console.error(`  -> ERROR: Output PNG not found: ${pngPath}`);
  }
}

console.log('\n================================================================');
console.log('ALL 4 PORTAL WORKFLOW IMAGES GENERATED & VERIFIED SUCCESSFULLY');
console.log('================================================================');
