import { NextResponse } from 'next/server';
import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import { rateLimit } from '@/lib/rate-limiter';
import { getGithubUserProfile } from '@/lib/github';
import { 
  createDeveloperDocument, 
  validateDeveloperInput,
  calculateActivityScore,
  extractTechStack
} from '@/lib/models/developer.model';
import { insertDeveloper } from '@/lib/repositories/developer.repository';

// POST /api/developers/ingest
export async function POST(request) {
  // 1. Rate Limiting: Max 20 ingestion requests per minute per IP
  const rateLimitResponse = rateLimit(request, 20, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  // Only recruiters or admins can ingest developers
  const auth = await verifyAuth(request, ['admin', 'recruiter']);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return apiError('GitHub username is required', 400);
    }

    // 1. Fetch data from GitHub
    const githubResult = await getGithubUserProfile(username);
    
    if (!githubResult.success) {
      return apiError(githubResult.error, 400);
    }
    
    const githubData = githubResult.data;

    // 2. Process data into our model's expected shape
    const techStack = extractTechStack(githubData.languages);
    
    const activityScore = calculateActivityScore({
      totalRepos: githubData.publicRepos,
      totalStars: githubData.totalStars,
      contributionCount: githubData.contributionCount,
      daysSinceLastPush: githubData.daysSinceLastPush,
    });

    const rawDeveloperData = {
      username: githubData.username,
      name: githubData.name,
      source: 'github',
      sourceUrl: githubData.sourceUrl,
      avatarUrl: githubData.avatarUrl,
      bio: githubData.bio,
      location: githubData.location,
      company: githubData.company,
      blog: githubData.blog,
      techStack,
      languages: githubData.languages,
      topRepos: githubData.topRepos,
      totalRepos: githubData.publicRepos,
      totalStars: githubData.totalStars,
      totalForks: githubData.totalForks,
      activityScore,
      contributionCount: githubData.contributionCount,
      lastActivityAt: githubData.daysSinceLastPush <= 365 
        ? new Date(Date.now() - githubData.daysSinceLastPush * 24 * 60 * 60 * 1000) 
        : null,
    };

    // 3. Validate
    const validation = validateDeveloperInput(rawDeveloperData);
    if (!validation.valid) {
      return apiError(`Validation failed: ${validation.errors.join(', ')}`, 400);
    }

    // 4. Create document
    const developerDoc = createDeveloperDocument(rawDeveloperData);

    // 5. Save to database using idempotency (upsert)
    const result = await insertDeveloper(developerDoc);

    return apiSuccess(
      { 
        message: result.upserted 
          ? 'Developer imported successfully' 
          : 'Developer profile updated successfully',
        id: result.id,
        developer: developerDoc
      }, 
      result.upserted ? 201 : 200
    );

  } catch (error) {
    console.error('Developer ingestion error:', error);
    return apiError('Failed to ingest developer profile', 500);
  }
}
