import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Vector Icon Definitions
const ICONS = {
  user: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <circle cx="20" cy="12" r="10" fill="#000000"/>
      <path d="M 6 36 C 6 24 12 21 20 21 C 28 21 34 24 34 36 Z" fill="#000000"/>
    </g>
  `,
  monitor: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <rect x="0" y="0" width="56" height="40" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="2.5"/>
      <line x1="28" y1="40" x2="28" y2="48" stroke="#000000" stroke-width="3"/>
      <line x1="16" y1="48" x2="40" y2="48" stroke="#000000" stroke-width="3"/>
      <line x1="8" y1="10" x2="24" y2="10" stroke="#F59E0B" stroke-width="2.5"/>
      <line x1="8" y1="16" x2="20" y2="16" stroke="#EF4444" stroke-width="2.5"/>
      <line x1="8" y1="22" x2="26" y2="22" stroke="#3B82F6" stroke-width="2.5"/>
      <circle cx="39" cy="21" r="10" fill="#0D9488"/>
      <path d="M 39 21 L 39 11 A 10 10 0 0 1 49 21 Z" fill="#F59E0B"/>
    </g>
  `,
  database: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <ellipse cx="22" cy="10" rx="18" ry="7" fill="#FFFFFF" stroke="#000000" stroke-width="2.5"/>
      <path d="M 4 10 L 4 22 A 18 7 0 0 0 40 22 L 40 10" fill="none" stroke="#000000" stroke-width="2.5"/>
      <path d="M 4 22 L 4 34 A 18 7 0 0 0 40 34 L 40 22" fill="none" stroke="#000000" stroke-width="2.5"/>
      <path d="M 4 34 L 4 46 A 18 7 0 0 0 40 46 L 40 34" fill="none" stroke="#000000" stroke-width="2.5"/>
    </g>
  `,
  databaseGear: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <ellipse cx="24" cy="12" rx="19" ry="7" fill="#FFFFFF" stroke="#000000" stroke-width="2.5"/>
      <path d="M 5 12 L 5 30 A 19 7 0 0 0 43 30 L 43 12" fill="none" stroke="#000000" stroke-width="2.5"/>
      <path d="M 5 21 A 19 7 0 0 0 43 21" fill="none" stroke="#000000" stroke-width="2"/>
      <g transform="translate(6, 18) scale(0.65)">
        <circle cx="16" cy="16" r="11" fill="#0284C7" stroke="#0369A1" stroke-width="2.5"/>
        <circle cx="16" cy="16" r="4" fill="#FFFFFF"/>
      </g>
      <g transform="translate(22, 10) scale(0.5)">
        <circle cx="16" cy="16" r="11" fill="#0D9488" stroke="#115E59" stroke-width="2.5"/>
        <circle cx="16" cy="16" r="4" fill="#FFFFFF"/>
      </g>
    </g>
  `,
  neuralNet: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <line x1="8" y1="12" x2="24" y2="6" stroke="#000000" stroke-width="2"/>
      <line x1="8" y1="12" x2="24" y2="24" stroke="#000000" stroke-width="2"/>
      <line x1="8" y1="36" x2="24" y2="24" stroke="#000000" stroke-width="2"/>
      <line x1="8" y1="36" x2="24" y2="42" stroke="#000000" stroke-width="2"/>
      <line x1="24" y1="6" x2="40" y2="12" stroke="#000000" stroke-width="2"/>
      <line x1="24" y1="24" x2="40" y2="12" stroke="#000000" stroke-width="2"/>
      <line x1="24" y1="24" x2="40" y2="36" stroke="#000000" stroke-width="2"/>
      <line x1="24" y1="42" x2="40" y2="36" stroke="#000000" stroke-width="2"/>
      <circle cx="8" cy="12" r="4.5" fill="#000000"/>
      <circle cx="8" cy="36" r="4.5" fill="#000000"/>
      <circle cx="24" cy="6" r="4.5" fill="#000000"/>
      <circle cx="24" cy="24" r="5" fill="#000000"/>
      <circle cx="24" cy="42" r="4.5" fill="#000000"/>
      <circle cx="40" cy="12" r="4.5" fill="#000000"/>
      <circle cx="40" cy="36" r="4.5" fill="#000000"/>
    </g>
  `,
  chartTrend: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <line x1="4" y1="4" x2="4" y2="36" stroke="#0284C7" stroke-width="2.5"/>
      <line x1="4" y1="36" x2="44" y2="36" stroke="#0284C7" stroke-width="2.5"/>
      <polyline points="6,28 15,28 23,16 32,22 40,10" fill="none" stroke="#EF4444" stroke-width="2.5"/>
      <circle cx="6" cy="28" r="2.5" fill="#0284C7"/>
      <circle cx="15" cy="28" r="2.5" fill="#0284C7"/>
      <circle cx="23" cy="16" r="2.5" fill="#0284C7"/>
      <circle cx="32" cy="22" r="2.5" fill="#0284C7"/>
      <circle cx="32" cy="22" r="9" fill="none" stroke="#D97706" stroke-width="3"/>
      <line x1="39" y1="28" x2="46" y2="36" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/>
    </g>
  `,
  aiBrain: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <path d="M 28 8 C 22 8 18 12 18 18 C 14 18 10 22 10 26 C 10 32 14 36 18 36 L 28 36 C 34 36 38 32 38 24 C 38 14 34 8 28 8 Z" fill="#FDE68A" stroke="#D97706" stroke-width="2"/>
      <circle cx="33" cy="16" r="2" fill="#0284C7"/>
      <circle cx="35" cy="24" r="2" fill="#0284C7"/>
      <line x1="28" y1="16" x2="33" y2="16" stroke="#0284C7" stroke-width="1.5"/>
      <line x1="28" y1="24" x2="35" y2="24" stroke="#0284C7" stroke-width="1.5"/>
      <circle cx="12" cy="32" r="5" fill="#EC4899" stroke="#BE185D" stroke-width="1.5"/>
      <rect x="34" y="26" width="14" height="10" rx="1.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
      <circle cx="41" cy="31" r="2.5" fill="#EF4444"/>
    </g>
  `,
  reportDoc: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <path d="M 6 4 L 32 4 L 44 16 L 44 50 L 6 50 Z" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.5"/>
      <path d="M 32 4 L 32 16 L 44 16 Z" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
      <circle cx="19" cy="30" r="8" fill="#0D9488"/>
      <path d="M 19 30 L 19 22 A 8 8 0 0 1 27 30 Z" fill="#EA580C"/>
      <rect x="30" y="32" width="3.5" height="10" fill="#EF4444"/>
      <rect x="35.5" y="27" width="3.5" height="15" fill="#F59E0B"/>
    </g>
  `,
  envelope: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <rect x="2" y="8" width="42" height="28" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="2.5"/>
      <polyline points="2,8 23,23 44,8" fill="none" stroke="#000000" stroke-width="2.5"/>
      <circle cx="39" cy="8" r="5" fill="#EF4444"/>
    </g>
  `,
  calendar: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <rect x="4" y="10" width="38" height="32" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="2.5"/>
      <rect x="4" y="6" width="38" height="10" rx="2" fill="#EF4444" stroke="#000000" stroke-width="2"/>
      <line x1="13" y1="2" x2="13" y2="8" stroke="#000000" stroke-width="3" stroke-linecap="round"/>
      <line x1="33" y1="2" x2="33" y2="8" stroke="#000000" stroke-width="3" stroke-linecap="round"/>
      <circle cx="15" cy="23" r="2" fill="#0F172A"/>
      <circle cx="23" cy="23" r="2" fill="#0F172A"/>
      <circle cx="31" cy="23" r="2" fill="#0F172A"/>
      <circle cx="15" cy="31" r="2" fill="#0F172A"/>
      <circle cx="23" cy="31" r="2" fill="#0F172A"/>
      <circle cx="31" cy="31" r="2" fill="#0F172A"/>
    </g>
  `,
  shield: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <path d="M 22 4 L 40 10 L 40 26 C 40 38 22 46 22 46 C 22 46 4 38 4 26 L 4 10 Z" fill="#FEF3C7" stroke="#D97706" stroke-width="2.5"/>
      <circle cx="22" cy="22" r="5" fill="#B45309"/>
      <rect x="20" y="24" width="4" height="8" rx="1" fill="#B45309"/>
    </g>
  `,
  star: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <polygon points="20,4 25,15 37,16 28,24 31,36 20,29 9,36 12,24 3,16 15,15" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>
    </g>
  `,
  building: (x, y) => `
    <g transform="translate(${x}, ${y})">
      <rect x="8" y="8" width="32" height="38" rx="2" fill="#FFFFFF" stroke="#000000" stroke-width="2.5"/>
      <rect x="14" y="14" width="6" height="6" fill="#0284C7"/>
      <rect x="26" y="14" width="6" height="6" fill="#0284C7"/>
      <rect x="14" y="24" width="6" height="6" fill="#0284C7"/>
      <rect x="26" y="24" width="6" height="6" fill="#0284C7"/>
      <rect x="20" y="34" width="8" height="12" fill="#000000"/>
    </g>
  `
};

function renderNode(node) {
  const { x, y, w, h, title, sub1, sub2, icon, iconPos = 'top', iconOffset = { x: 0, y: 0 } } = node;
  let iconXml = '';
  if (icon && ICONS[icon]) {
    const ix = iconPos === 'top' ? x + (w / 2) - 22 + (iconOffset.x || 0) : x + w + 12 + (iconOffset.x || 0);
    const iy = iconPos === 'top' ? y - 56 + (iconOffset.y || 0) : y + (h / 2) - 24 + (iconOffset.y || 0);
    iconXml = ICONS[icon](ix, iy);
  }

  const lines = [title, sub1, sub2].filter(Boolean);
  let textXml = '';
  if (lines.length === 1) {
    textXml = `<text x="${x + w / 2}" y="${y + h / 2}" fill="#000000" font-size="18" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXml(lines[0])}</text>`;
  } else if (lines.length === 2) {
    textXml = `
      <text x="${x + w / 2}" y="${y + h / 2 - 11}" fill="#000000" font-size="17" font-weight="800" text-anchor="middle">${escapeXml(lines[0])}</text>
      <text x="${x + w / 2}" y="${y + h / 2 + 15}" fill="#334155" font-size="13.5" font-weight="600" text-anchor="middle">${escapeXml(lines[1])}</text>
    `;
  } else if (lines.length >= 3) {
    textXml = `
      <text x="${x + w / 2}" y="${y + h / 2 - 20}" fill="#000000" font-size="16.5" font-weight="800" text-anchor="middle">${escapeXml(lines[0])}</text>
      <text x="${x + w / 2}" y="${y + h / 2 + 3}" fill="#1E293B" font-size="13" font-weight="600" text-anchor="middle">${escapeXml(lines[1])}</text>
      <text x="${x + w / 2}" y="${y + h / 2 + 24}" fill="#475569" font-size="12" font-weight="500" text-anchor="middle">${escapeXml(lines[2])}</text>
    `;
  }

  return `
    ${iconXml}
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#nodeGrad)" stroke="#A7F3D0" stroke-width="1.2" />
      ${textXml}
    </g>
  `;
}

function renderArrow(edge) {
  const { from, to, label, pos = 'mid', offsetLabel = { x: 0, y: 0 }, route = 'straight', points } = edge;
  
  let pathD = '';
  let midX = 0;
  let midY = 0;

  if (points && points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    const p1 = points[Math.floor(points.length / 2) - 1] || points[0];
    const p2 = points[Math.floor(points.length / 2)] || points[1];
    midX = (p1.x + p2.x) / 2;
    midY = (p1.y + p2.y) / 2;
  } else if (route === 'straight') {
    pathD = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    midX = (from.x + to.x) / 2;
    midY = (from.y + to.y) / 2;
  } else if (route === 'orthogonal') {
    const bendX = to.x;
    const bendY = from.y;
    pathD = `M ${from.x} ${from.y} L ${bendX} ${bendY} L ${to.x} ${to.y}`;
    midX = (from.x + bendX) / 2;
    midY = bendY;
  }

  const lx = midX + (offsetLabel.x || 0);
  const ly = midY + (offsetLabel.y || 0);

  let labelXml = '';
  if (label) {
    const textWidth = Math.max(label.length * 8.5 + 16, 50);
    labelXml = `
      <rect x="${lx - textWidth / 2}" y="${ly - 12}" width="${textWidth}" height="22" rx="4" fill="#FFFFFF" opacity="0.95" />
      <text x="${lx}" y="${ly + 4}" fill="#000000" font-size="14.5" font-weight="700" text-anchor="middle">${escapeXml(label)}</text>
    `;
  }

  return `
    <path d="${pathD}" fill="none" stroke="#000000" stroke-width="2.5" marker-end="url(#arrBlack)" />
    ${labelXml}
  `;
}

function buildDiagramSvg({ title, subtitle, nodes, edges, width = 2200, height = 1400 }) {
  const nodesXml = nodes.map(renderNode).join('\n');
  const edgesXml = edges.map(renderArrow).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background:#FFFFFF; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Pastel Mint-to-Blue Horizontal Gradient exactly matching reference image -->
    <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D1FAE5" />
      <stop offset="50%" stop-color="#E0F2FE" />
      <stop offset="100%" stop-color="#DBEAFE" />
    </linearGradient>

    <!-- Marker Arrowhead -->
    <marker id="arrBlack" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#000000" />
    </marker>
  </defs>

  <!-- Outer Black Border (Matching Reference Image) -->
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="#FFFFFF" stroke="#000000" stroke-width="4.5" rx="4" />

  <!-- Diagram Title Header -->
  <text x="60" y="70" fill="#000000" font-size="28" font-weight="900" letter-spacing="-0.3">${escapeXml(title)}</text>
  <text x="60" y="98" fill="#64748B" font-size="16" font-weight="600">${escapeXml(subtitle)}</text>
  <line x1="60" y1="115" x2="${width - 60}" y2="115" stroke="#E2E8F0" stroke-width="1.5" />

  <!-- Directional Connecting Edges -->
  ${edgesXml}

  <!-- Rectangular Process Nodes & Visual Icons -->
  ${nodesXml}
</svg>`;
}

export { buildDiagramSvg, CHROME_PATH };
