import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { HiOutlineChartBar, HiOutlineStar } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';

export default function ProfileOverviewTab({ developer }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Left Column - Tech & Stats */}
      <div className="space-y-6 md:col-span-1">
        <Card title="Top Skills" subtitle="Languages & Tools from GitHub">
          <div className="flex flex-wrap gap-2">
            {developer.techStack?.length > 0 ? (
              developer.techStack.map(tech => (
                <Badge key={tech} variant="default" className="text-xs bg-muted/50">{tech}</Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No languages detected</p>
            )}
          </div>
        </Card>

        <Card title="GitHub Metrics" subtitle="Aggregated open source stats">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <HiOutlineChartBar className="h-4 w-4" />
                Public Repositories
              </span>
              <span className="font-medium text-foreground">{developer.totalRepos}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <HiOutlineStar className="h-4 w-4" />
                Total Stars Earned
              </span>
              <span className="font-medium text-foreground">{developer.totalStars}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <FaGithub className="h-4 w-4" />
                Contribution Proxy
              </span>
              <span className="font-medium text-foreground">{developer.contributionCount}</span>
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Last Activity</span>
              <span className="font-medium text-foreground">
                {developer.lastActivityAt ? new Date(developer.lastActivityAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column - Top Repositories */}
      <div className="md:col-span-2">
        <Card title="Top Repositories" subtitle="Highest starred public projects">
          {developer.topRepos?.length > 0 ? (
            <div className="space-y-4">
              {developer.topRepos.map(repo => (
                <div key={repo.id} className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-primary/50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {repo.name}
                      </a>
                      {repo.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 pr-4">
                          {repo.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5" title="Stars">
                          <HiOutlineStar className="h-3.5 w-3.5" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center gap-1.5" title="Forks">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878M9 5.5V3.75a.75.75 0 1 0-1.5 0V5.5m0 0v1.75a.75.75 0 1 0 1.5 0V5.5" />
                          </svg>
                          {repo.forks}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground bg-background">
              No public repositories found
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
