import { NextResponse } from 'next/server';
import { getGithubUserProfile } from '@/lib/github';
import { extractTechStack, calculateActivityScore } from '@/lib/models/developer.model';
import { findDevelopers, updateDeveloper } from '@/lib/repositories/developer.repository';
import { logActivity } from '@/lib/repositories/activity.repository';

// We want to prevent timing out on Vercel hobby if we do too many at once.
// We'll limit to a safe number of developers per cron run.
const BATCH_SIZE = 5;

// GET /api/workers/sync
// Intended to be called by a cron job or background scheduler.
export async function GET(request) {
  try {
    // 1. Optional Security: Verify API key if provided by cron
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch developers who haven't been updated recently.
    // We sort by lastFetchedAt ascending so we get the oldest ones.
    const dbResult = await findDevelopers({ 
      sortBy: 'lastFetchedAt', 
      sortOrder: 1, 
      limit: BATCH_SIZE 
    });
    const developers = dbResult.developers;

    if (!developers || developers.length === 0) {
      return NextResponse.json({ success: true, message: 'No developers found to sync.' });
    }

    const syncResults = [];

    // 3. Loop through and re-fetch them from GitHub
    for (const dev of developers) {
      try {
        const githubResult = await getGithubUserProfile(dev.username);
        
        if (!githubResult.success) {
          syncResults.push({ username: dev.username, status: 'failed', error: githubResult.error });
          continue;
        }
        
        const githubData = githubResult.data;
        const newTechStack = extractTechStack(githubData.languages);
        const newActivityScore = calculateActivityScore({
          totalRepos: githubData.publicRepos,
          totalStars: githubData.totalStars,
          contributionCount: githubData.contributionCount,
          daysSinceLastPush: githubData.daysSinceLastPush,
        });

        const updates = {
          lastFetchedAt: new Date(),
          totalRepos: githubData.publicRepos,
          totalStars: githubData.totalStars,
          totalForks: githubData.totalForks,
          techStack: newTechStack,
          languages: githubData.languages,
          activityScore: newActivityScore,
          topRepos: githubData.topRepos,
          contributionCount: githubData.contributionCount,
          lastActivityAt: githubData.daysSinceLastPush <= 365 
            ? new Date(Date.now() - githubData.daysSinceLastPush * 24 * 60 * 60 * 1000) 
            : null,
        };

        // 4. Detect Deltas & Log Activities
        let isUpdated = false;

        // Detect new repos
        if (githubData.publicRepos > dev.totalRepos) {
          await logActivity({
            developerId: dev._id,
            type: 'new_repo',
            details: { count: githubData.publicRepos - dev.totalRepos }
          });
          isUpdated = true;
        }

        // Detect significant activity score increase (e.g., +10 points)
        if (newActivityScore - dev.activityScore >= 10) {
          await logActivity({
            developerId: dev._id,
            type: 'activity_spike',
            details: { oldScore: dev.activityScore, newScore: newActivityScore }
          });
          isUpdated = true;
        }

        // Execute update to developer document
        await updateDeveloper(dev._id, updates);

        syncResults.push({ 
          username: dev.username, 
          status: 'success', 
          updated: isUpdated 
        });

      } catch (devError) {
        console.error(`Failed to sync ${dev.username}:`, devError);
        syncResults.push({ username: dev.username, status: 'error', message: devError.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: syncResults.length,
      results: syncResults
    });

  } catch (error) {
    console.error('Background Sync Worker Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
