import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center p-8 text-center bg-background text-foreground">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 border border-border">
        <span className="text-4xl font-bold text-muted-foreground mr-1">4</span>
        <span className="text-4xl font-bold text-muted-foreground animate-bounce mt-2">0</span>
        <span className="text-4xl font-bold text-muted-foreground ml-1">4</span>
      </div>
      <h2 className="mb-3 text-3xl font-bold tracking-tight">Resource Not Found</h2>
      <p className="mb-8 text-muted-foreground max-w-md">
        We couldn't find the developer profile, campaign, or page you were looking for. It may have been deleted or the URL might be incorrect.
      </p>
      <Link href="/dashboard">
        <Button>Return to Dashboard</Button>
      </Link>
    </div>
  );
}
