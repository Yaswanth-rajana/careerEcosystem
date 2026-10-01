import {
  ProfileCoreDTO,
  PersonalProfileDTO,
  EducationDTO,
  ExperienceDTO,
  SkillDTO,
  ProjectDTO,
  CareerGoalDTO,
  JobPreferenceDTO,
  ProfessionalLinkDTO,
  CertificationDTO,
  AchievementDTO,
} from '@backend/types/profile';

export async function fetchProfileCore(): Promise<ProfileCoreDTO> {
  const res = await fetch('/api/profile', { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to load profile.');
  return json.data;
}

export async function updatePersonalProfile(data: Partial<PersonalProfileDTO>): Promise<PersonalProfileDTO> {
  const res = await fetch('/api/profile/personal', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update personal details.');
  return json.data;
}

export async function updateCareerDirection(data: Partial<CareerGoalDTO>): Promise<CareerGoalDTO> {
  const res = await fetch('/api/profile/career-direction', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update career direction.');
  return json.data;
}

export async function updateJobPreferences(data: Partial<JobPreferenceDTO>): Promise<JobPreferenceDTO> {
  const res = await fetch('/api/profile/job-preferences', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update job preferences.');
  return json.data;
}

// ============================================================================
// EDUCATION
// ============================================================================

export async function fetchEducation(): Promise<EducationDTO[]> {
  const res = await fetch('/api/profile/education', { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to load education.');
  return json.data;
}

export async function createEducation(data: Omit<EducationDTO, 'id' | 'source'>): Promise<EducationDTO> {
  const res = await fetch('/api/profile/education', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create education entry.');
  return json.data;
}

export async function updateEducation(id: string, data: Partial<EducationDTO>): Promise<EducationDTO> {
  const res = await fetch(`/api/profile/education/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update education entry.');
  return json.data;
}

export async function deleteEducation(id: string): Promise<void> {
  const res = await fetch(`/api/profile/education/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete education entry.');
}

// ============================================================================
// EXPERIENCE
// ============================================================================

export async function fetchExperience(): Promise<ExperienceDTO[]> {
  const res = await fetch('/api/profile/experience', { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to load experience.');
  return json.data;
}

export async function createExperience(data: Omit<ExperienceDTO, 'id' | 'source'>): Promise<ExperienceDTO> {
  const res = await fetch('/api/profile/experience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create experience entry.');
  return json.data;
}

export async function updateExperience(id: string, data: Partial<ExperienceDTO>): Promise<ExperienceDTO> {
  const res = await fetch(`/api/profile/experience/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update experience entry.');
  return json.data;
}

export async function deleteExperience(id: string): Promise<void> {
  const res = await fetch(`/api/profile/experience/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete experience entry.');
}

// ============================================================================
// SKILLS
// ============================================================================

export async function fetchSkills(): Promise<SkillDTO[]> {
  const res = await fetch('/api/profile/skills', { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to load skills.');
  return json.data;
}

export async function updateSkills(skills: Array<{ name: string; category?: string | null; level: string }>): Promise<SkillDTO[]> {
  const res = await fetch('/api/profile/skills', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update skills.');
  return json.data;
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function fetchProjects(): Promise<ProjectDTO[]> {
  const res = await fetch('/api/profile/projects', { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to load projects.');
  return json.data;
}

export async function createProject(data: Omit<ProjectDTO, 'id' | 'source'>): Promise<ProjectDTO> {
  const res = await fetch('/api/profile/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create project entry.');
  return json.data;
}

export async function updateProject(id: string, data: Partial<ProjectDTO>): Promise<ProjectDTO> {
  const res = await fetch(`/api/profile/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update project entry.');
  return json.data;
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/profile/projects/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete project entry.');
}

// ============================================================================
// CERTIFICATIONS & ACHIEVEMENTS
// ============================================================================

export async function fetchCertifications(): Promise<CertificationDTO[]> {
  const res = await fetch('/api/profile/certifications', { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to load certifications.');
  return json.data;
}

export async function createCertification(data: Omit<CertificationDTO, 'id' | 'source'>): Promise<CertificationDTO> {
  const res = await fetch('/api/profile/certifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create certification.');
  return json.data;
}

export async function updateCertification(id: string, data: Partial<CertificationDTO>): Promise<CertificationDTO> {
  const res = await fetch(`/api/profile/certifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update certification.');
  return json.data;
}

export async function deleteCertification(id: string): Promise<void> {
  const res = await fetch(`/api/profile/certifications/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete certification.');
}

export async function fetchAchievements(): Promise<AchievementDTO[]> {
  const res = await fetch('/api/profile/achievements', { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to load achievements.');
  return json.data;
}

export async function createAchievement(data: Omit<AchievementDTO, 'id' | 'source'>): Promise<AchievementDTO> {
  const res = await fetch('/api/profile/achievements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create achievement.');
  return json.data;
}

export async function updateAchievement(id: string, data: Partial<AchievementDTO>): Promise<AchievementDTO> {
  const res = await fetch(`/api/profile/achievements/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update achievement.');
  return json.data;
}

export async function deleteAchievement(id: string): Promise<void> {
  const res = await fetch(`/api/profile/achievements/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete achievement.');
}

// ============================================================================
// LINKS
// ============================================================================

export async function fetchLinks(): Promise<ProfessionalLinkDTO[]> {
  const res = await fetch('/api/profile/links', { cache: 'no-store' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to load professional links.');
  return json.data;
}

export async function createLink(data: { platform: string; url: string }): Promise<ProfessionalLinkDTO> {
  const res = await fetch('/api/profile/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to add link.');
  return json.data;
}

export async function updateLink(id: string, data: { platform: string; url: string }): Promise<ProfessionalLinkDTO> {
  const res = await fetch(`/api/profile/links/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update link.');
  return json.data;
}

export async function deleteLink(id: string): Promise<void> {
  const res = await fetch(`/api/profile/links/${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete link.');
}

// ============================================================================
// ACCOUNT & PASSWORD
// ============================================================================

export async function updatePassword(payload: {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<void> {
  const res = await fetch('/api/profile/password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to change password.');
}
