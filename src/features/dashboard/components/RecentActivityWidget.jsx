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

const ACTIVITY_COLORS = {
  new_repo: 'bg-success/10 text-success border-success/20',
  activity_spike: 'bg-warning/10 text-warning border-warning/20',
  skills_updated: 'bg-info/10 text-info border-info/20',
  status_change: 'bg-primary/10 text-primary border-primary/20',
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
      title="Network Intelligence Feed" 
      subtitle="Latest alerts from tracking developers"
      className="h-full flex flex-col"
      innerClassName="flex-1 overflow-hidden flex flex-col"
    >
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-5 py-2">
        {loading ? (
          <div className="space-y-6 animate-pulse px-1">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-border shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-border w-2/3 rounded" />
                  <div className="h-2 bg-border w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-surface/50 m-2">
            <HiOutlineInformationCircle className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm font-medium">No intelligence data yet.</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-gradient-to-b before:from-border/80 before:via-border/50 before:to-transparent px-1">
            {activities.map((activity) => (
              <div key={activity._id} className="relative flex gap-4 group">
                <div className="relative z-10 shrink-0">
                  <Link href={`/developers/${activity.developerId}`}>
                    <div className="h-10 w-10 rounded-xl border-2 border-background overflow-hidden shadow-sm transition-transform group-hover:scale-105">
                      {activity.developer.avatarUrl ? (
                        <img 
                          src={activity.developer.avatarUrl} 
                          alt={activity.developer.username} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {activity.developer.name?.charAt(0) || activity.developer.username?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className={`absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-background flex items-center justify-center shadow-xs ${ACTIVITY_COLORS[activity.type] || 'bg-surface'}`}>
                    {ACTIVITY_ICONS[activity.type] || <HiOutlineInformationCircle className="h-3 w-3" />}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <Link 
                      href={`/developers/${activity.developerId}`}
                      className="text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center min-w-0 gap-1.5"
                    >
                      <span className="truncate">{activity.developer.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        activity.developer.readinessLevel === 'High' ? 'bg-success' : 
                        activity.developer.readinessLevel === 'Medium' ? 'bg-warning' : 'bg-danger'
                      }`} title={`${activity.developer.readinessLevel} Readiness`} />
                    </Link>
                    <span className="text-[10px] font-bold text-muted-foreground/60 whitespace-nowrap uppercase tracking-tighter">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: false })} ago
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {formatActivityType(activity.type)} <span className="opacity-70">— Intelligence alert</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {!loading && activities.length > 0 && (
        <div className="mt-2 pt-3 border-t border-border">
          <Link href="/developers" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 flex items-center justify-center gap-2 transition-colors">
            Access Full Directory <HiOutlineArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </Card>
  );
}
