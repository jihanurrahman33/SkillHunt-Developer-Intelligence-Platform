import Card from '@/components/ui/Card';
import Link from 'next/link';
import { HiOutlineUserGroup, HiOutlineCheckCircle, HiOutlineTrendingUp, HiOutlineLightBulb } from 'react-icons/hi';

export default function CampaignPerformanceCard({ campaigns = [] }) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card title="Recruitment Progress" subtitle="Performance of active hiring campaigns" className="h-[400px] flex flex-col">
        <div className="flex-1 flex items-center justify-center min-h-[300px] text-sm text-muted-foreground border border-dashed border-border rounded-lg m-4 px-6 text-center">
          <div className="space-y-2">
            <HiOutlineLightBulb className="h-8 w-8 mx-auto opacity-20" />
            <p>No active campaigns found. Assign developers to a campaign to track performance.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Recruitment Progress" 
      subtitle="Performance of active hiring campaigns" 
      className="h-full flex flex-col"
      innerClassName="flex-1 overflow-hidden flex flex-col"
      padding={false}
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        {campaigns.map((campaign) => {
          const stats = campaign.statusBreakdown || {};
          const total = campaign.developerCount || 0;
          
          // Metrics that matter to recruiters
          const inProgress = (stats.contacted || 0) + (stats.interviewing || 0);
          const hired = stats.hired || 0;
          const placementRate = total > 0 ? ((hired / total) * 100).toFixed(0) : 0;
            
          return (
            <div key={campaign._id} className="p-5 rounded-2xl border border-border bg-gradient-to-br from-surface/50 to-surface hover:from-surface hover:to-surface-hover transition-all duration-300 group shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <HiOutlineTrendingUp className="h-4 w-4" />
                    </div>
                    <h4 className="text-lg font-black text-foreground truncate">
                      {campaign.title}
                    </h4>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-4">
                  <span className="text-[10px] font-bold text-success uppercase tracking-widest mb-1">Placement Rate</span>
                  <div className="text-2xl font-black text-foreground leading-none tabular-nums">
                    {placementRate}<span className="text-sm ml-0.5 opacity-40">%</span>
                  </div>
                </div>
              </div>
              
              {/* Pipeline Overview */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="p-2.5 rounded-xl bg-background/40 border border-border/5 text-center">
                  <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight mb-1">In Pipeline</div>
                  <div className="text-lg font-bold text-primary leading-none">{inProgress}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-success/5 border border-success/10 text-center">
                  <div className="text-[9px] text-success/70 font-bold uppercase tracking-tight mb-1">Successful</div>
                  <div className="text-lg font-bold text-success leading-none">{hired}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-background/40 border border-border/5 text-center">
                  <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Total Pool</div>
                  <div className="text-lg font-bold text-foreground leading-none">{total}</div>
                </div>
              </div>

              {/* Segmented Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1 text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Contacted ({stats.contacted || 0})
                    </span>
                    <span className="flex items-center gap-1 text-info">
                      <span className="h-1.5 w-1.5 rounded-full bg-info" /> Interview ({stats.interviewing || 0})
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    Avg. 14d cycle
                  </span>
                </div>
                
                <div className="h-2.5 w-full bg-muted/20 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-border/50">
                  <div 
                    className="h-full bg-primary rounded-l-full transition-all duration-1000" 
                    style={{ width: `${(stats.contacted / (total || 1)) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-info transition-all duration-1000" 
                    style={{ width: `${(stats.interviewing / (total || 1)) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-warning transition-all duration-1000" 
                    style={{ width: `${(stats.rejected / (total || 1)) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-success rounded-r-full transition-all duration-1000" 
                    style={{ width: `${(stats.hired / (total || 1)) * 100}%` }} 
                  />
                </div>
                
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[9px] text-muted-foreground font-medium">Pipeline velocity is stable</span>
                  <Link href={`/campaigns/${campaign._id}`} className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline">
                    Manage Funnel
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
