// GitHub API Client
// Handles fetching data from GitHub REST API

const GITHUB_API_URL = 'https://api.github.com';

// Generic fetcher with authentication and error handling
async function fetchGithub(endpoint) {
  const token = process.env.GITHUB_API_TOKEN;
  const headers = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    headers,
    next: { revalidate: 3600 }, // Cache GitHub responses for 1 hour to preserve rate limits
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('GitHub user not found');
    }
    if (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0') {
      throw new Error('GitHub API rate limit exceeded');
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch a user's profile and their repositories to extract tech stack and activity metrics
 * @param {string} username GitHub username
 */
export async function getGithubUserProfile(username) {
  try {
    // 1. Fetch user profile
    const profile = await fetchGithub(`/users/${username}`);

    // 2. Fetch user's public repositories (up to 100, sorted by updated)
    const repos = await fetchGithub(`/users/${username}/repos?per_page=100&sort=updated`);

    // 3. Process repository data for metrics and languages
    let totalStars = 0;
    let totalForks = 0;
    const languages = {};
    const processedRepos = [];

    // Filter out forks for more accurate language/tech stack profiling
    const originalRepos = repos.filter((r) => !r.fork);

    for (const repo of originalRepos) {
      totalStars += repo.stargazers_count;
      totalForks += repo.forks_count;

      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }

      processedRepos.push({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt: repo.updated_at,
      });
    }

    // Sort repos by stars to get top repos
    const topRepos = [...processedRepos].sort((a, b) => b.stars - a.stars).slice(0, 5);

    // Calculate recency of last push
    let daysSinceLastPush = 365; // Default to 1 year if no repos
    if (originalRepos.length > 0 && originalRepos[0].updated_at) {
      const lastPushDate = new Date(originalRepos[0].updated_at);
      const now = new Date();
      daysSinceLastPush = Math.floor((now - lastPushDate) / (1000 * 60 * 60 * 24));
    }

    return {
      success: true,
      data: {
        username: profile.login,
        name: profile.name || profile.login,
        avatarUrl: profile.avatar_url,
        sourceUrl: profile.html_url,
        bio: profile.bio || '',
        location: profile.location || '',
        company: profile.company || '',
        blog: profile.blog || '',
        publicRepos: profile.public_repos,
        followers: profile.followers,
        
        // Calculated metrics
        totalStars,
        totalForks,
        languages,
        topRepos,
        daysSinceLastPush,
        contributionCount: profile.public_repos + totalStars, // Simplified proxy for contributions
      },
    };
  } catch (error) {
    console.error(`Error fetching GitHub profile for ${username}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}
