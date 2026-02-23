import { useEffect, useState } from 'react';
import { getRecentGlobalActivity } from '@/features/developers/services/activity.service';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { 
  HiOutlineCode, 
  HiOutlineLightningBolt, 
  HiOutlineInformationCircle,
  HiOutlineRefresh,
  HiOutlineArrowRight
} from 'react-icons/hi';
import Card from '@/components/ui/Card';

const ACTIVITY_ICONS = {
  new_repo: <HiOutlineCode className="h-4 w-4 text-success" />,
  activity_spike: <HiOutlineLightningBolt className="h-4 w-4 text-warning" />,
  skills_updated: <HiOutlineInformationCircle className="h-4 w-4 text-info" />,
  status_change: <HiOutlineRefresh className="h-4 w-4 text-primary" />,
};

const formatActivityType = (type) => {
  switch (type) {
    case 'new_repo': return 'Pushed new code';
    case 'activity_spike': return 'Trending activity';
    case 'skills_updated': return 'Updated tech stack';
    case 'status_change': return 'Status updated';
    default: return 'Profile updated';
  }
};

export default function RecentActivityWidget({ limit = 5 }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGlobalActivity() {
      try {
        setLoading(true);
        const data = await getRecentGlobalActivity(limit);
        setActivities(data);
      } catch (err) {
        console.error('Failed to load global recent activity', err);
      } finally {
        setLoading(false);
      }
    }
    loadGlobalActivity();
  }, [limit]);

  return (
    <Card 
      title="Recent Network Activity" 
      subtitle="Latest alerts from tracking developers"
      className="h-full flex flex-col"
      innerClassName="flex-1 overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-border shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-border w-2/3 rounded" />
                  <div className="h-2 bg-border w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground border border-dashed border-border rounded-lg bg-surface/50">
            <HiOutlineInformationCircle className="h-6 w-6 mb-2 opacity-50" />
            <p className="text-sm">No recent activity detected.</p>
          </div>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-border/50">
            {activities.map((activity) => (
              <div key={activity._id} className="relative flex gap-3 group">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface border-2 border-background shadow-xs transition-transform group-hover:scale-110">
                  {ACTIVITY_ICONS[activity.type] || <HiOutlineInformationCircle className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm text-foreground">
                    <Link 
                      href={`/developers/${activity.developerId}`}
                      className="font-medium hover:text-primary transition-colors hover:underline"
                    >
                      {activity.developer.name || activity.developer.username}
                    </Link>{' '}
                    <span className="text-muted-foreground">
                      {formatActivityType(activity.type).toLowerCase()}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5 mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {!loading && activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Link href="/developers" className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center justify-center gap-1 transition-colors">
            View All Developers <HiOutlineArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </Card>
  );
}
