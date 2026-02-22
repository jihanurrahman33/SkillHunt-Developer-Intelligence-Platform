import { useEffect, useState } from 'react';
import { getDeveloperActivity } from '@/features/developers/services/activity.service';
import { formatDistanceToNow } from 'date-fns';
import { 
  HiOutlineCode, 
  HiOutlineLightningBolt, 
  HiOutlineInformationCircle,
  HiOutlineRefresh
} from 'react-icons/hi';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

const ACTIVITY_ICONS = {
  new_repo: <HiOutlineCode className="h-5 w-5 text-success" />,
  activity_spike: <HiOutlineLightningBolt className="h-5 w-5 text-warning" />,
  skills_updated: <HiOutlineInformationCircle className="h-5 w-5 text-info" />,
  status_change: <HiOutlineRefresh className="h-5 w-5 text-primary" />,
};

const formatActivityDetails = (type, details) => {
  switch (type) {
    case 'new_repo':
      return `Detected ${details.count} new public repositor${details.count > 1 ? 'ies' : 'y'}.`;
    case 'activity_spike':
      return `Activity score increased significantly from ${details.oldScore} to ${details.newScore}.`;
    case 'skills_updated':
      return `Tech stack was updated.`;
    case 'status_change':
      return `Recruitment status moved to "${details.status}".`;
    default:
      return 'Profile was updated.';
  }
};

export default function ActivityFeed({ developerId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadActivity() {
      try {
        setLoading(true);
        const data = await getDeveloperActivity(developerId);
        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (developerId) loadActivity();
  }, [developerId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 p-4 border border-border rounded-lg bg-surface/50">
            <div className="h-10 w-10 rounded-full bg-border" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-border w-1/3 rounded" />
              <div className="h-3 bg-border w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl bg-surface">
        <HiOutlineInformationCircle className="h-8 w-8 mb-2 opacity-50 text-foreground" />
        <p className="text-sm">No recent background activity recorded yet.</p>
        <p className="text-xs mt-1">Activity logs are generated when the background worker detects GitHub updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {activities.map((activity, index) => (
        <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-surface shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
            {ACTIVITY_ICONS[activity.type] || <HiOutlineInformationCircle className="h-5 w-5 text-muted-foreground" />}
          </div>
          
          {/* Card */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-surface shadow-sm transition-colors hover:border-primary/50">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground text-sm capitalize">
                {activity.type.replace('_', ' ')}
              </h3>
              <time className="text-xs text-muted-foreground font-medium">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </time>
            </div>
            <div className="text-sm text-foreground/80 leading-relaxed">
              {formatActivityDetails(activity.type, activity.details)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
