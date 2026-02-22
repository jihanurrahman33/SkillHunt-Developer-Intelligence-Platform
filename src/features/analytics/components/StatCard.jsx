import Card from '@/components/ui/Card';

export default function StatCard({ title, value, icon: Icon, trend, description }) {
  return (
    <Card className="flex flex-col h-full justify-between shadow-sm hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
        </div>
        {Icon && (
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      {(trend || description) && (
        <div className="mt-2 text-sm flex items-center">
          {typeof trend !== 'undefined' && (
            <span className={`font-semibold mr-2 flex items-center ${trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-muted-foreground'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : ''} {Math.abs(trend)}%
            </span>
          )}
          {description && <span className="text-muted-foreground">{description}</span>}
        </div>
      )}
    </Card>
  );
}
