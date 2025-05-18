
'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/services/firebase';
import { getUserProfile, type UserProfile } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (!user) {
        // Not logged in, redirect to login page, pass current path for redirect back
        const currentPath = window.location.pathname;
        router.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // User is logged in, check their role
      try {
        const userProfile: UserProfile | null = await getUserProfile(user.uid);
        if (userProfile && userProfile.role === 'Admin') {
          setIsAuthorized(true);
        } else {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access the admin panel.',
            variant: 'destructive',
          });
          router.replace('/'); // Redirect non-admins to home page
        }
      } catch (error) {
        console.error('Error fetching user profile for admin check:', error);
        toast({
          title: 'Authentication Error',
          description: 'Could not verify your admin status. Please try again.',
          variant: 'destructive',
        });
        router.replace('/'); // Redirect on error
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-secondary">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    // This case should ideally be handled by the redirect,
    // but as a fallback, prevent rendering children.
    // The redirects in useEffect should handle navigation.
    return null; 
  }

  return <>{children}</>;
}
