import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cylinderIcon(x, y, primaryColor, darkColor, lightColor) {
  return `
    <g transform="translate(${x}, ${y})">
      <ellipse cx="14" cy="7" rx="12" ry="5" fill="${darkColor}"/>
      <path d="M 2 7 L 2 21 A 12 5 0 0 0 26 21 L 26 7 A 12 5 0 0 1 2 7 Z" fill="${primaryColor}" opacity="0.95"/>
      <ellipse cx="14" cy="7" rx="12" ry="5" fill="${lightColor}"/>
      <ellipse cx="14" cy="14" rx="12" ry="5" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.5"/>
      <ellipse cx="14" cy="21" rx="12" ry="5" fill="none" stroke="#FFFFFF" stroke-width="1.2" opacity="0.8"/>
    </g>
  `;
}

function makeHeader(title, subtitle, themeName, themeColor, portBadge, verifiedBadge) {
  return `
  <!-- TOP HEADER (80, 50, 3680 x 120) -->
  <g transform="translate(80, 50)">
    <rect width="3680" height="120" rx="16" fill="url(#headerGrad)" filter="url(#mainShadow)" />
    
    <text x="45" y="70" fill="#FFFFFF" font-size="36" font-weight="900" letter-spacing="-0.5">PATHWAY<tspan fill="#60A5FA">.ECO</tspan></text>
    <line x1="340" y1="35" x2="340" y2="85" stroke="#475569" stroke-width="2" />
    <text x="375" y="56" fill="#FFFFFF" font-size="26" font-weight="800">${escapeXml(title)}</text>
    <text x="375" y="86" fill="#94A3B8" font-size="16" font-weight="500">${escapeXml(subtitle)}</text>

    <!-- Badges -->
    <rect x="2900" y="42" width="230" height="38" rx="8" fill="#1E293B" stroke="#334155" />
    <circle cx="2922" cy="61" r="6" fill="${themeColor}" />
    <text x="2940" y="67" fill="#E2E8F0" font-size="14" font-weight="700">THEME: ${escapeXml(themeName)}</text>

    <rect x="3150" y="42" width="240" height="38" rx="8" fill="#1E293B" stroke="#334155" />
    <circle cx="3172" cy="61" r="6" fill="#10B981" />
    <text x="3190" y="67" fill="#E2E8F0" font-size="14" font-weight="700">${escapeXml(verifiedBadge)}</text>

    <rect x="3410" y="42" width="230" height="38" rx="8" fill="#1E293B" stroke="#334155" />
    <circle cx="3430" cy="61" r="6" fill="#38BDF8" />
    <text x="3448" y="67" fill="#E2E8F0" font-size="14" font-weight="700">${escapeXml(portBadge)}</text>
  </g>
  `;
}

function renderPipelineCard(x, stepNum, title, actorBadge, actorPort, bullets, outcomeTitle, outcomeDesc, theme) {
  let bulletsXml = '';
  let curY = 130;
  for (const b of bullets) {
    bulletsXml += `<text x="18" y="${curY}" fill="#1E293B" font-size="15" font-weight="700">• ${escapeXml(b.header)}</text>\n`;
    curY += 21;
    for (const sub of b.sublines) {
      bulletsXml += `<text x="32" y="${curY}" fill="${sub.color || '#475569'}" font-size="${sub.size || 13}" font-weight="${sub.bold ? '700' : '500'}">${escapeXml(sub.text)}</text>\n`;
      curY += 20;
    }
    curY += 8;
  }

  return `
    <g transform="translate(${x}, 0)">
      <rect width="420" height="470" rx="12" fill="#FFFFFF" stroke="${theme.border}" stroke-width="2" filter="url(#cardShadow)" />
      <rect x="18" y="18" width="55" height="32" rx="6" fill="${theme.badgeBg}" stroke="${theme.primary}" stroke-width="2" />
      <text x="45" y="40" fill="${theme.primary}" font-size="16" font-weight="900" text-anchor="middle">${escapeXml(stepNum)}</text>
      <text x="85" y="40" fill="#0F172A" font-size="18" font-weight="800">${escapeXml(title)}</text>
      <line x1="18" y1="62" x2="400" y2="62" stroke="#E2E8F0" stroke-width="1.5" />

      <rect x="18" y="75" width="95" height="24" rx="4" fill="${theme.badgeBg}" />
      <text x="65" y="92" fill="${theme.dark}" font-size="12" font-weight="800" text-anchor="middle">${escapeXml(actorBadge)}</text>
      <text x="125" y="92" fill="#64748B" font-size="13" font-weight="600">${escapeXml(actorPort)}</text>

      ${bulletsXml}

      <rect x="18" y="365" width="384" height="85" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
      <text x="30" y="390" fill="#0F172A" font-size="13" font-weight="800">${escapeXml(outcomeTitle)}</text>
      <text x="30" y="413" fill="#334155" font-size="13">${escapeXml(outcomeDesc[0] || '')}</text>
      <text x="30" y="433" fill="#64748B" font-size="12">${escapeXml(outcomeDesc[1] || '')}</text>
    </g>
  `;
}

function buildSvg(data) {
  const {
    title,
    subtitle,
    themeName,
    theme,
    portBadge,
    verifiedBadge,
    pipelineTitle,
    pipelineSubtitle,
    pipelineSteps,
    apiHandlers,
    safetyRules,
    prismaModels,
    stateAnalysis,
    securityItems,
    externalIntegrations,
    gapsAndMocks
  } = data;

  // Render 8 pipeline cards (width 420, gap 37, total width 3619 in 3680 container)
  let pipelineCardsXml = '';
  let arrowXml = '';
  for (let i = 0; i < pipelineSteps.length; i++) {
    const step = pipelineSteps[i];
    const xPos = 30 + i * (420 + 37);
    pipelineCardsXml += renderPipelineCard(
      xPos,
      step.stepNum,
      step.title,
      step.actorBadge,
      step.actorPort,
      step.bullets,
      step.outcomeTitle,
      step.outcomeDesc,
      theme
    );

    if (i < pipelineSteps.length - 1) {
      const arrX1 = xPos + 420 + 7;
      const arrX2 = arrX1 + 23;
      arrowXml += `<line x1="${arrX1}" y1="315" x2="${arrX2}" y2="315" stroke="${theme.primary}" stroke-width="3" marker-end="url(#arrTheme)" />\n`;
    }
  }

  // Render Column 1: API Handlers (3 boxes + 1 safety rules box)
  let col1BoxesXml = '';
  let col1Y = 90;
  for (const h of apiHandlers) {
    let linesXml = '';
    let itemY = 90;
    for (const line of h.details) {
      linesXml += `<text x="25" y="${itemY}" fill="#334155" font-size="15" font-weight="700">• ${escapeXml(line.title)}: <tspan fill="${line.valColor || theme.dark}" font-weight="${line.bold ? '700' : '500'}">${escapeXml(line.value)}</tspan></text>\n`;
      itemY += 24;
      if (line.subtext) {
        linesXml += `<text x="45" y="${itemY}" fill="${line.subColor || '#64748B'}" font-size="13.5">${escapeXml(line.subtext)}</text>\n`;
        itemY += 22;
      }
    }

    col1BoxesXml += `
      <g transform="translate(35, ${col1Y})">
        <rect width="1130" height="${h.height || 260}" rx="12" fill="#F8FAFC" stroke="${theme.border}" stroke-width="1.5" />
        <rect x="25" y="20" width="85" height="28" rx="6" fill="${h.methodColor || theme.primary}" />
        <text x="67" y="39" fill="#FFFFFF" font-size="13" font-weight="900" text-anchor="middle">${escapeXml(h.method)}</text>
        <text x="125" y="40" fill="#0F172A" font-size="18" font-weight="800">${escapeXml(h.path)}</text>
        <line x1="25" y1="60" x2="1105" y2="60" stroke="#E2E8F0" stroke-width="1" />
        ${linesXml}
      </g>
    `;
    col1Y += (h.height || 260) + 20;
  }

  // Safety / Idempotency box in Column 1
  let safetyRulesXml = '';
  let sY = 80;
  for (const sr of safetyRules.items) {
    safetyRulesXml += `<text x="25" y="${sY}" fill="#334155" font-size="14">• <tspan font-weight="700">${escapeXml(sr.label)}: </tspan>${escapeXml(sr.text)}</text>\n`;
    sY += 28;
  }
  col1BoxesXml += `
    <g transform="translate(35, ${col1Y})">
      <rect width="1130" height="${safetyRules.height || 220}" rx="12" fill="${theme.badgeBg}" stroke="${theme.border}" stroke-width="1.5" />
      <text x="25" y="35" fill="${theme.dark}" font-size="17" font-weight="800">${escapeXml(safetyRules.title)}</text>
      <line x1="25" y1="52" x2="1105" y2="52" stroke="${theme.border}" stroke-width="1" />
      ${safetyRulesXml}
    </g>
  `;

  // Render Column 2: Data Persistence & Prisma Schema Group
  let col2BoxesXml = '';
  let col2Y = 90;
  for (const pm of prismaModels) {
    let fieldsXml = '';
    let fY = 90;
    for (const f of pm.fields) {
      if (f.isHighlight) {
        fieldsXml += `
          <rect x="20" y="${fY - 18}" width="1090" height="${f.boxHeight || 75}" rx="8" fill="${theme.badgeBg}" stroke="${theme.border}" />
          <text x="35" y="${fY}" fill="${theme.dark}" font-size="14" font-weight="800">${escapeXml(f.highlightTitle)}</text>
        `;
        fY += 24;
        for (const subF of f.highlightFields) {
          fieldsXml += `<text x="35" y="${fY}" fill="${theme.dark}" font-size="13.5" font-family="monospace">${escapeXml(subF)}</text>\n`;
          fY += 22;
        }
        fY += 8;
      } else {
        fieldsXml += `<text x="25" y="${fY}" fill="${f.color || '#334155'}" font-size="14" font-family="monospace">${escapeXml(f.text)}</text>\n`;
        fY += 23;
      }
    }

    let indexConstraintXml = '';
    if (pm.indexConstraint) {
      indexConstraintXml = `
        <rect x="25" y="${pm.height - 40}" width="1080" height="24" rx="4" fill="#FEF3C7" />
        <text x="35" y="${pm.height - 23}" fill="#92400E" font-size="13" font-weight="700">${escapeXml(pm.indexConstraint)}</text>
      `;
    }

    col2BoxesXml += `
      <g transform="translate(35, ${col2Y})">
        <rect width="1130" height="${pm.height || 480}" rx="12" fill="#F8FAFC" stroke="${theme.border}" stroke-width="1.5" />
        
        <!-- Cylinder Icon -->
        ${cylinderIcon(25, 20, theme.primary, theme.dark, theme.light)}

        <rect x="65" y="20" width="130" height="28" rx="6" fill="${theme.dark}" />
        <text x="130" y="39" fill="#FFFFFF" font-size="13" font-weight="900" text-anchor="middle">PRISMA MODEL</text>
        <text x="210" y="40" fill="#0F172A" font-size="18" font-weight="800">${escapeXml(pm.modelTitle)}</text>
        <line x1="25" y1="60" x2="1105" y2="60" stroke="#E2E8F0" stroke-width="1" />
        ${fieldsXml}
        ${indexConstraintXml}
      </g>
    `;
    col2Y += (pm.height || 480) + 20;
  }

  // State Analysis / Lifecycle in Column 2
  let stateItemsXml = '';
  let saY = 90;
  for (const item of stateAnalysis.items) {
    stateItemsXml += `<text x="25" y="${saY}" fill="#334155" font-size="14">• <tspan font-weight="700">${escapeXml(item.label)}: </tspan>${escapeXml(item.text)}</text>\n`;
    saY += 24;
    if (item.subtext) {
      stateItemsXml += `<text x="45" y="${saY}" fill="#64748B" font-size="13">${escapeXml(item.subtext)}</text>\n`;
      saY += 22;
    }
  }

  col2BoxesXml += `
    <g transform="translate(35, ${col2Y})">
      <rect width="1130" height="${stateAnalysis.height || 260}" rx="12" fill="#F8FAFC" stroke="${theme.border}" stroke-width="1.5" />
      <rect x="25" y="20" width="130" height="28" rx="6" fill="#0D9488" />
      <text x="90" y="39" fill="#FFFFFF" font-size="13" font-weight="900" text-anchor="middle">${escapeXml(stateAnalysis.badge || 'LIFECYCLE')}</text>
      <text x="175" y="40" fill="#0F172A" font-size="18" font-weight="800">${escapeXml(stateAnalysis.title)}</text>
      <line x1="25" y1="60" x2="1105" y2="60" stroke="#E2E8F0" stroke-width="1" />
      ${stateItemsXml}
    </g>
  `;

  // Render Column 3: Security, Multi-Tenant Isolation, External Integrations & Gaps
  let col3BoxesXml = '';
  let col3Y = 90;

  // Box 1: Security & Auth
  let secXml = '';
  let sItemY = 90;
  for (const sec of securityItems.details) {
    secXml += `<text x="25" y="${sItemY}" fill="#334155" font-size="14.5">• <tspan font-weight="700">${escapeXml(sec.label)}: </tspan><tspan fill="${theme.dark}">${escapeXml(sec.text)}</tspan></text>\n`;
    sItemY += 24;
    if (sec.subtext) {
      secXml += `<text x="45" y="${sItemY}" fill="#64748B" font-size="13">${escapeXml(sec.subtext)}</text>\n`;
      sItemY += 22;
    }
  }
  col3BoxesXml += `
    <g transform="translate(35, ${col3Y})">
      <rect width="1130" height="${securityItems.height || 260}" rx="12" fill="#F8FAFC" stroke="${theme.border}" stroke-width="1.5" />
      <rect x="25" y="20" width="130" height="28" rx="6" fill="#1E293B" />
      <text x="90" y="39" fill="#FFFFFF" font-size="13" font-weight="900" text-anchor="middle">SECURITY</text>
      <text x="175" y="40" fill="#0F172A" font-size="18" font-weight="800">${escapeXml(securityItems.title)}</text>
      <line x1="25" y1="60" x2="1105" y2="60" stroke="#E2E8F0" stroke-width="1" />
      ${secXml}
    </g>
  `;
  col3Y += (securityItems.height || 260) + 20;

  // Box 2: External Integrations
  let extXml = '';
  let eItemY = 90;
  for (const ext of externalIntegrations.details) {
    extXml += `<text x="25" y="${eItemY}" fill="#334155" font-size="14.5">• <tspan font-weight="700">${escapeXml(ext.service)}: </tspan><tspan fill="${theme.dark}">${escapeXml(ext.action)}</tspan></text>\n`;
    eItemY += 24;
    if (ext.subtext) {
      extXml += `<text x="45" y="${eItemY}" fill="#64748B" font-size="13">${escapeXml(ext.subtext)}</text>\n`;
      eItemY += 22;
    }
  }
  col3BoxesXml += `
    <g transform="translate(35, ${col3Y})">
      <rect width="1130" height="${externalIntegrations.height || 260}" rx="12" fill="#F8FAFC" stroke="${theme.border}" stroke-width="1.5" />
      <rect x="25" y="20" width="130" height="28" rx="6" fill="#4338CA" />
      <text x="90" y="39" fill="#FFFFFF" font-size="13" font-weight="900" text-anchor="middle">INTEGRATION</text>
      <text x="175" y="40" fill="#0F172A" font-size="18" font-weight="800">${escapeXml(externalIntegrations.title)}</text>
      <line x1="25" y1="60" x2="1105" y2="60" stroke="#E2E8F0" stroke-width="1" />
      ${extXml}
    </g>
  `;
  col3Y += (externalIntegrations.height || 260) + 20;

  // Box 3: Codebase Gaps, Mocks & Unconnected Flows (Warning Amber/Red Box)
  let gapXml = '';
  let gItemY = 90;
  for (const gap of gapsAndMocks.items) {
    gapXml += `
      <g transform="translate(25, ${gItemY - 18})">
        <rect width="75" height="24" rx="4" fill="${gap.severity === 'HIGH' ? '#EF4444' : '#F59E0B'}" />
        <text x="37" y="16" fill="#FFFFFF" font-size="12" font-weight="900" text-anchor="middle">${escapeXml(gap.code)}</text>
        <text x="90" y="17" fill="#7F1D1D" font-size="15" font-weight="800">${escapeXml(gap.title)}</text>
      </g>
    `;
    gItemY += 26;
    gapXml += `<text x="45" y="${gItemY}" fill="#334155" font-size="14">${escapeXml(gap.description)}</text>\n`;
    gItemY += 22;
    gapXml += `<text x="45" y="${gItemY}" fill="#64748B" font-size="13"><tspan font-weight="700">Code Path: </tspan>${escapeXml(gap.location)}</text>\n`;
    gItemY += 28;
  }

  col3BoxesXml += `
    <g transform="translate(35, ${col3Y})">
      <rect width="1130" height="${gapsAndMocks.height || 380}" rx="12" fill="#FFFBEB" stroke="#FCD34D" stroke-width="2" />
      <rect x="25" y="20" width="130" height="28" rx="6" fill="#B45309" />
      <text x="90" y="39" fill="#FFFFFF" font-size="13" font-weight="900" text-anchor="middle">GAP ANALYSIS</text>
      <text x="175" y="40" fill="#92400E" font-size="18" font-weight="800">${escapeXml(gapsAndMocks.title)}</text>
      <line x1="25" y1="60" x2="1105" y2="60" stroke="#FDE68A" stroke-width="1.5" />
      ${gapXml}
    </g>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 3840 2160" width="3840" height="2160" style="background:#F8FAFC; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Gradients -->
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>

    <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.primary}" />
      <stop offset="100%" stop-color="${theme.dark}" />
    </linearGradient>

    <!-- Shadows -->
    <filter id="mainShadow" x="-2%" y="-2%" width="104%" height="106%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0F172A" flood-opacity="0.08" />
    </filter>
    <filter id="cardShadow" x="-3%" y="-4%" width="106%" height="110%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.06" />
    </filter>

    <!-- Markers -->
    <marker id="arrTheme" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="${theme.primary}" />
    </marker>
    <marker id="arrGreen" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#10B981" />
    </marker>

    <!-- Grid Pattern -->
    <pattern id="bgGrid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#E2E8F0" stroke-width="0.8" opacity="0.6"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="3840" height="2160" fill="url(#bgGrid)" />

  ${makeHeader(title, subtitle, themeName, theme.primary, portBadge, verifiedBadge)}

  <!-- SECTION 1: END-TO-END WORKFLOW STEP PIPELINE (8 Sequential Cards) -->
  <g transform="translate(80, 200)">
    <rect width="3680" height="580" rx="16" fill="#FFFFFF" stroke="${theme.border}" stroke-width="2" filter="url(#mainShadow)" />
    
    <!-- Title Bar -->
    <path d="M 0 16 Q 0 0 16 0 L 3664 0 Q 3680 0 3680 16 L 3680 60 L 0 60 Z" fill="url(#bannerGrad)" />
    <text x="35" y="38" fill="#FFFFFF" font-size="22" font-weight="800">${escapeXml(pipelineTitle)}</text>
    <text x="3260" y="38" fill="${theme.light}" font-size="15" font-weight="600">${escapeXml(pipelineSubtitle)}</text>

    <!-- 8 Cards -->
    <g transform="translate(0, 80)">
      ${pipelineCardsXml}
      ${arrowXml}
    </g>
  </g>

  <!-- SECTION 2: TECHNICAL ARCHITECTURE DEEP DIVE (3 Columns of 1200px each) -->
  <g transform="translate(80, 810)">
    <!-- Column 1: API Route Handlers, Payload Schemas & Validation Guards -->
    <g transform="translate(0, 0)">
      <rect width="1200" height="1280" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#mainShadow)" />
      <rect width="1200" height="64" rx="16" fill="#1E293B" />
      <text x="30" y="42" fill="#FFFFFF" font-size="20" font-weight="800">1. API ROUTE HANDLERS, PAYLOAD SCHEMAS &amp; VALIDATION GUARDS</text>
      ${col1BoxesXml}
    </g>

    <!-- Column 2: Data Persistence & Prisma Schema Group -->
    <g transform="translate(1240, 0)">
      <rect width="1200" height="1280" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#mainShadow)" />
      <rect width="1200" height="64" rx="16" fill="#1E293B" />
      <text x="30" y="42" fill="#FFFFFF" font-size="20" font-weight="800">2. DATA PERSISTENCE &amp; PRISMA MODEL SCHEMAS</text>
      ${col2BoxesXml}
    </g>

    <!-- Column 3: Security, Multi-Tenant Isolation & External Integrations -->
    <g transform="translate(2480, 0)">
      <rect width="1200" height="1280" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#mainShadow)" />
      <rect width="1200" height="64" rx="16" fill="#1E293B" />
      <text x="30" y="42" fill="#FFFFFF" font-size="20" font-weight="800">3. SECURITY, INTEGRATIONS &amp; VERIFIED CODEBASE GAPS</text>
      ${col3BoxesXml}
    </g>
  </g>
</svg>`;
}

export { buildSvg };
