import Card from '@/components/ui/Card';
import Link from 'next/link';
import { HiOutlineStar, HiOutlineLocationMarker, HiOutlineArrowRight } from 'react-icons/hi';

export default function TopTalentSpotlight({ developers = [] }) {
  if (!developers || developers.length === 0) {
    return (
      <Card title="Top Talent Spotlight" subtitle="Highest-impact developers" className="h-[400px] flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-sm text-muted-foreground border border-dashed border-border rounded-lg m-4">
          No talent matches the spotlight criteria yet.
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Top Talent Spotlight" 
      subtitle="Highest-impact developers" 
      className="h-full flex flex-col"
      innerClassName="flex-1 overflow-hidden flex flex-col"
      padding={false}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {developers.map((dev) => (
          <div key={dev._id} className="relative p-4 rounded-xl border border-border bg-surface/50 hover:bg-surface transition-all group overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
            
            <div className="relative flex gap-4">
              <div className="h-14 w-14 rounded-xl border-2 border-primary/20 p-0.5 overflow-hidden shrink-0 group-hover:border-primary/40 transition-colors">
                {dev.avatarUrl ? (
                  <img src={dev.avatarUrl} alt={dev.name} className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary rounded-lg">
                    {dev.name?.charAt(0) || dev.username?.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {dev.name || dev.username}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-warning">
                    <HiOutlineStar className="h-3 w-3 fill-warning" />
                    {dev.activityScore}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground truncate">
                    <HiOutlineLocationMarker className="h-2.5 w-2.5" />
                    {dev.location || 'Remote'}
                  </div>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    dev.readinessLevel === 'High' ? 'bg-success' : 
                    dev.readinessLevel === 'Medium' ? 'bg-warning' : 'bg-danger'
                  }`} />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {dev.readinessLevel} Readiness
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {dev.techStack?.map((skill) => (
                    <span key={skill} className="px-1.5 py-0.5 rounded bg-muted/50 text-[9px] font-medium text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <Link 
              href={`/developers/${dev._id}`} 
              className="mt-3 flex items-center justify-center w-full py-1.5 rounded-lg bg-surface border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all opacity-0 group-hover:opacity-100"
            >
              Examine Profile <HiOutlineArrowRight className="h-3 w-3 ml-1.5" />
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
