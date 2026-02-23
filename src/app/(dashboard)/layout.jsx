import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import OnboardingGuard from '@/features/auth/components/OnboardingGuard';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <OnboardingGuard>
            {children}
          </OnboardingGuard>
        </main>
      </div>
    </div>
  );
}
