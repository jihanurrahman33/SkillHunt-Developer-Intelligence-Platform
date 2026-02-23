// Developer Schema & Validation
// Defines the developer document structure and validation

import crypto from 'crypto';

// Generate a unique hash for deduplication
export function generateProfileHash(username, source = 'github') {
  return crypto
    .createHash('sha256')
    .update(`${source}:${username.toLowerCase()}`)
    .digest('hex');
}

// Default developer document shape
export function createDeveloperDocument(data) {
  return {
    // Identity
    username: data.username,
    name: data.name || data.username,
    profileHash: generateProfileHash(data.username, data.source || 'github'),
    source: data.source || 'github',
    sourceUrl: data.sourceUrl || `https://github.com/${data.username}`,
    avatarUrl: data.avatarUrl || null,
    addedBy: data.addedBy,

    // Profile
    bio: data.bio || '',
    location: data.location || '',
    company: data.company || '',
    blog: data.blog || '',

    // Technical
    techStack: data.techStack || [],
    languages: data.languages || {},
    topRepos: data.topRepos || [],
    totalRepos: data.totalRepos || 0,
    totalStars: data.totalStars || 0,
    totalForks: data.totalForks || 0,

    // Activity
    activityScore: data.activityScore || 0,
    contributionCount: data.contributionCount || 0,
    lastActivityAt: data.lastActivityAt || null,
    readinessLevel: data.readinessLevel || 'Low',
    lastFetchedAt: new Date(),

    // Recruitment (managed separately but denormalized for list queries)
    currentStatus: 'new',

    // Metadata
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Validate developer input
export function validateDeveloperInput(data) {
  const errors = [];

  if (!data.username || typeof data.username !== 'string') {
    errors.push('username is required and must be a string');
  }

  if (data.username && data.username.length < 1) {
    errors.push('username cannot be empty');
  }

  if (data.techStack && !Array.isArray(data.techStack)) {
    errors.push('techStack must be an array');
  }

  if (data.activityScore && typeof data.activityScore !== 'number') {
    errors.push('activityScore must be a number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Calculate activity score from GitHub data
export function calculateActivityScore({
  totalRepos = 0,
  totalStars = 0,
  contributionCount = 0,
  daysSinceLastPush = 365,
}) {
  let score = 0;

  // Repos contribution (max 25 points)
  score += Math.min(totalRepos * 2, 25);

  // Stars contribution (max 25 points)
  score += Math.min(totalStars * 0.5, 25);

  // Contribution count (max 30 points)
  score += Math.min(contributionCount * 0.1, 30);

  // Recency bonus (max 20 points — decays over time)
  if (daysSinceLastPush <= 7) score += 20;
  else if (daysSinceLastPush <= 30) score += 15;
  else if (daysSinceLastPush <= 90) score += 10;
  else if (daysSinceLastPush <= 180) score += 5;

  return Math.round(Math.min(score, 100));
}

/**
 * Determine Engagement Readiness level based on activity and recency
 * @param {Object} metrics 
 * @returns {'High' | 'Medium' | 'Low'}
 */
export function calculateReadinessLevel({ 
  daysSinceLastPush = 365, 
  activityScore = 0 
}) {
  // High: Active in the last 14 days AND decent activity
  if (daysSinceLastPush <= 14 && activityScore >= 40) return 'High';
  
  // Medium: Recently active (45 days) OR high historical expertise
  if (daysSinceLastPush <= 45 || activityScore >= 70) return 'Medium';
  
  // Low: Inactive for > 45 days
  return 'Low';
}

// Normalize GitHub languages object → techStack array
export function extractTechStack(languages = {}) {
  return Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([lang]) => lang);
}
