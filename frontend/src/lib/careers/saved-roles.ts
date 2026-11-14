/**
 * Lightweight, browser-safe saved target role utilities.
 *
 * This module manages candidate target roles in localStorage with zero
 * dependencies on large career catalogs, levels data, or mentor repositories.
 */

export interface SavedRoleItem {
  slug: string;
  title: string;
  category?: string;
}

/**
 * Curated career role definitions (metadata-only) for fast client-side mapping
 * without loading full curriculum roadmaps or level datasets.
 */
export const CURATED_ROLES: readonly SavedRoleItem[] = [
  { slug: 'software-engineer', title: 'Software Engineer', category: 'Technology' },
  { slug: 'cloud-engineer', title: 'Cloud Engineer', category: 'Technology' },
  { slug: 'devops-engineer', title: 'DevOps Engineer', category: 'Technology' },
  { slug: 'site-reliability-engineer', title: 'Site Reliability Engineer', category: 'Technology' },
  { slug: 'virtualization-engineer', title: 'Virtualization Engineer', category: 'Technology' },
  { slug: 'server-engineer', title: 'Server Engineer', category: 'Technology' },
  { slug: 'network-security-engineer', title: 'Network & Security Engineer', category: 'Technology' },
  { slug: 'backup-storage-engineer', title: 'Backup & Storage Engineer', category: 'Technology' },
  { slug: 'it-infrastructure-engineer', title: 'IT Infrastructure Engineer', category: 'Technology' },
  { slug: 'microsoft-administrator', title: 'Microsoft Administrator', category: 'Technology' },
  { slug: 'it-service-management', title: 'IT Service Management', category: 'Technology' },
  { slug: 'embedded-hardware-engineer', title: 'Embedded & Hardware Engineer', category: 'Electronics & Systems' },
  { slug: 'data-analyst', title: 'Data Analyst', category: 'Data & AI' },
  { slug: 'data-scientist', title: 'Data Scientist', category: 'Data & AI' },
  { slug: 'ui-ux-designer', title: 'UI/UX Designer', category: 'Product & Design' },
  { slug: 'product-manager', title: 'Product Manager', category: 'Product & Design' },
  { slug: 'cybersecurity-engineer', title: 'Cybersecurity Engineer', category: 'Cybersecurity' },
] as const;

/**
 * Maps arbitrary career role titles or fuzzy inputs to a canonical career slug
 * using curated role definitions and keyword matching.
 */
export function findCareerSlugByTitle(roleTitle?: string): string | null {
  if (!roleTitle) return null;
  const normalized = roleTitle.toLowerCase().trim();

  // Direct slug or title match
  const directMatch = CURATED_ROLES.find(
    (c) => c.slug === normalized || c.title.toLowerCase() === normalized
  );
  if (directMatch) return directMatch.slug;

  // Fuzzy / substring match
  const fuzzyMatch = CURATED_ROLES.find((c) => {
    const titleLower = c.title.toLowerCase();
    return titleLower.includes(normalized) || normalized.includes(titleLower);
  });
  if (fuzzyMatch) return fuzzyMatch.slug;

  // Keyword mapping fallbacks
  if (
    normalized.includes('software') ||
    normalized.includes('developer') ||
    normalized.includes('full stack') ||
    normalized.includes('frontend') ||
    normalized.includes('backend')
  ) {
    return 'software-engineer';
  }
  if (normalized.includes('cloud') || normalized.includes('aws') || normalized.includes('azure')) {
    return 'cloud-engineer';
  }
  if (normalized.includes('devops')) {
    return 'devops-engineer';
  }
  if (normalized.includes('data analyst') || normalized.includes('analytics')) {
    return 'data-analyst';
  }
  if (
    normalized.includes('data scientist') ||
    normalized.includes('ai') ||
    normalized.includes('machine learning') ||
    normalized.includes('ml')
  ) {
    return 'data-scientist';
  }
  if (normalized.includes('ui') || normalized.includes('ux') || normalized.includes('designer')) {
    return 'ui-ux-designer';
  }
  if (normalized.includes('product')) {
    return 'product-manager';
  }
  if (normalized.includes('cyber')) {
    return 'cybersecurity-engineer';
  }
  if (
    normalized.includes('embedded') ||
    normalized.includes('hardware') ||
    normalized.includes('iot')
  ) {
    return 'embedded-hardware-engineer';
  }

  return null;
}

/**
 * Returns the curated role item matching a slug.
 */
export function getSavedRoleBySlug(slug: string): SavedRoleItem | null {
  const found = CURATED_ROLES.find((r) => r.slug === slug);
  return found ? { ...found } : null;
}

/**
 * Retrieves the list of candidate saved target roles from localStorage.
 */
export function getSavedTargetRoles(): SavedRoleItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('pathway_selected_roles');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const legacy = localStorage.getItem('pathway_selected_role');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed?.slug && parsed?.title) return [parsed];
    }
  } catch {}
  return [];
}

/**
 * Saves a candidate target role into localStorage and dispatches the change event.
 */
export function setSavedTargetRole(role: SavedRoleItem): SavedRoleItem[] {
  if (typeof window === 'undefined') return [];
  const roles = getSavedTargetRoles();
  const existingIdx = roles.findIndex((r) => r.slug === role.slug);

  let newRoles: SavedRoleItem[];
  if (existingIdx >= 0) {
    newRoles = [...roles];
    // Move existing to the end so it's the primary active path
    const [existing] = newRoles.splice(existingIdx, 1);
    newRoles.push(existing);
  } else {
    newRoles = [...roles, { slug: role.slug, title: role.title, category: role.category }];
  }

  try {
    localStorage.removeItem('pathway_user_explicitly_cleared_roles');
    localStorage.setItem('pathway_selected_roles', JSON.stringify(newRoles));
    localStorage.setItem('pathway_selected_role', JSON.stringify(role));
    window.dispatchEvent(new Event('pathway_selected_roles_changed'));
  } catch {}

  return newRoles;
}

/**
 * Toggles a target role on or off in localStorage and dispatches the change event.
 */
export function toggleTargetRole(role: SavedRoleItem): { isSelected: boolean; roles: SavedRoleItem[] } {
  if (typeof window === 'undefined') return { isSelected: false, roles: [] };
  const roles = getSavedTargetRoles();
  const existingIdx = roles.findIndex((r) => r.slug === role.slug);

  let newRoles: SavedRoleItem[];
  let isSelected = false;

  if (existingIdx >= 0) {
    newRoles = roles.filter((r) => r.slug !== role.slug);
    isSelected = false;
  } else {
    newRoles = [...roles, { slug: role.slug, title: role.title, category: role.category }];
    isSelected = true;
  }

  try {
    if (newRoles.length === 0) {
      localStorage.setItem('pathway_user_explicitly_cleared_roles', 'true');
    } else {
      localStorage.removeItem('pathway_user_explicitly_cleared_roles');
    }

    localStorage.setItem('pathway_selected_roles', JSON.stringify(newRoles));
    if (newRoles.length > 0) {
      const active = newRoles[newRoles.length - 1];
      localStorage.setItem('pathway_selected_role', JSON.stringify(active));
    } else {
      localStorage.removeItem('pathway_selected_role');
    }
    window.dispatchEvent(new Event('pathway_selected_roles_changed'));
  } catch {}

  return { isSelected, roles: newRoles };
}

/**
 * Checks if a specific career slug is currently selected in localStorage.
 */
export function isTargetRoleSelected(slug: string): boolean {
  const roles = getSavedTargetRoles();
  return roles.some((r) => r.slug === slug);
}
