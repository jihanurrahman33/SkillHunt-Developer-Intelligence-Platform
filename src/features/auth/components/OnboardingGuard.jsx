'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { requestRecruiterAccess } from '@/features/users/services/users.service';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  HiOutlineLockClosed, 
  HiOutlineUserGroup, 
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineArrowRight
} from 'react-icons/hi';
import Swal from 'sweetalert2';

export default function OnboardingGuard({ children }) {
  const { user, isAdmin, isRecruiter, loading: authLoading } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [localStatus, setLocalStatus] = useState(null); // Used for optimistic UI update

  if (authLoading) return null;

  // Admins and existing Recruiters get straight in
  if (isAdmin || isRecruiter) {
    return children;
  }

  // Determine current status
  const currentStatus = localStatus || user?.onboardingStatus || 'none';

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await requestRecruiterAccess();
      setLocalStatus('pending');
      Swal.fire({
        icon: 'success',
        title: 'Request Submitted',
        text: 'Your request for recruiter access is now pending admin approval.',
        background: '#0B1220',
        color: '#e2e8f0',
        confirmButtonColor: '#2563EB',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Request Failed',
        text: error.message,
        background: '#0B1220',
        color: '#e2e8f0',
        confirmButtonColor: '#2563EB',
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <Card className="p-8 border-2 border-primary/20 bg-surface/50 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <HiOutlineLockClosed className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Access Restricted</h1>
                <p className="text-muted-foreground font-medium">Welcome to the SkillHunt Intelligence Network</p>
              </div>
            </div>

            {currentStatus === 'none' || currentStatus === 'rejected' ? (
              <div className="space-y-8">
                <div className="p-6 rounded-2xl bg-secondary/5 border border-border/50">
                  <p className="text-foreground/80 leading-relaxed mb-6">
                    You've successfully created your account! To access the developer directory, campaigns, and global intelligence feed, you need to be approved as a **Recruiter**.
                  </p>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-border">
                      <HiOutlineUserGroup className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Talent Pool</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Access over 10,000+ GitHub developers.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-border">
                      <HiOutlineLightningBolt className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Predictive Intel</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Real-time signals and readiness scores.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {currentStatus === 'rejected' && (
                  <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 flex gap-3 items-center">
                    <div className="h-2 w-2 rounded-full bg-danger animate-pulse" />
                    <p className="text-sm text-danger font-medium">Your previous request was declined. You can resubmit for review.</p>
                  </div>
                )}

                <Button 
                  onClick={handleRequest} 
                  loading={requesting}
                  className="w-full h-14 text-lg font-bold group shadow-lg shadow-primary/20"
                >
                  Request Recruiter Access
                  <HiOutlineArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            ) : (
              <div className="space-y-8 text-center py-6">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-warning/10 border-2 border-warning/20 mb-4 animate-bounce">
                  <HiOutlineShieldCheck className="h-10 w-10 text-warning" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Request Pending Review</h2>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    Thanks for your interest! An administrator has been notified. We usually review requests within 24 hours.
                  </p>
                </div>
                <div className="pt-4">
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress-indeterminate" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-4">
                    Establishing secure connection...
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
