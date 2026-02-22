import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
          <span className="text-xl font-bold text-primary-foreground">SH</span>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-foreground">
          SkillHunt IntelliTrack
        </h1>
        <p className="mb-8 max-w-md text-sm text-muted-foreground">
          Developer Intelligence & Recruitment Monitoring Platform
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
