
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MenuDisplay, type MenuItem as DisplayMenuItem } from '@/components/menu-display';
import { OrderSummary } from '@/components/order-summary';
import { User, Settings, UtensilsCrossed, LogOut, UserCircle, Mail } from 'lucide-react'; // Added Mail
import { getAuth, onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getUserProfile, type UserProfile } from '@/services/userService'; 
import { Card, CardContent } from '@/components/ui/card'; // Added Card, CardContent

export default function Home() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<DisplayMenuItem[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setCurrentUserProfile(profile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setCurrentUserProfile(null); 
        }
      } else {
        setSelectedMeals([]);
        setCurrentUserProfile(null); 
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      setSelectedMeals([]); 
      setCurrentUserProfile(null); 
      router.push('/'); 
    } catch (error) {
      console.error('Logout failed:', error);
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
    }
  };

  const handleMealSelect = (meal: DisplayMenuItem, isSelected: boolean) => {
    if (!currentUser && isSelected) {
      toast({
        title: 'Login Required',
        description: 'Please log in or register to select meals.',
        variant: 'destructive',
        action: <Link href="/auth/login"><Button variant="outline" size="sm">Login</Button></Link>,
      });
      return; 
    }
    setSelectedMeals(prevSelectedMeals => {
      if (isSelected) {
        return [...prevSelectedMeals, meal];
      } else {
        return prevSelectedMeals.filter(m => m.id !== meal.id);
      }
    });
  };

  const handleClearSelections = () => {
    setSelectedMeals([]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8" />
            <h1 className="text-2xl font-bold">IIIT Mess</h1>
          </div>
          <nav className="flex items-center gap-4">
            {isLoadingAuth ? (
              <div className="h-8 w-20 bg-primary/50 rounded animate-pulse"></div>
            ) : currentUser ? (
              <>
                <span className="flex items-center gap-2">
                  <UserCircle className="h-6 w-6" />
                  {currentUserProfile?.fullName || currentUser.displayName || currentUser.email}
                </span>
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80" onClick={handleLogout}>
                  <LogOut className="mr-2 h-5 w-5" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
                    <User className="mr-2 h-5 w-5" /> Login
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80">
                    <Settings className="mr-2 h-5 w-5" /> Admin
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <div className="md:col-span-1"> {/* Adjusted from md:col-span-2 */}
          <MenuDisplay 
            currentUser={currentUser} 
            currentUserProfile={currentUserProfile}
            onMealSelect={handleMealSelect}
            selectedMeals={selectedMeals}
          />
        </div>
        <div className="md:col-span-1 space-y-8">
          <OrderSummary 
            selectedMeals={selectedMeals}
            currentUserEmail={currentUser?.email || null}
            currentUserDisplayName={currentUserProfile?.fullName || currentUser?.displayName || null}
            currentUserUid={currentUser?.uid || null}
            currentUserProfile={currentUserProfile} 
            onPaymentSuccess={handleClearSelections}
          />
          <Card className="shadow-lg rounded-lg">
            <CardContent className="p-4 text-xs text-muted-foreground"> {/* Changed text-sm to text-xs */}
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                <p className="break-words">
                  Share your queries or feedback on <a href="mailto:messcaptainiiitbbsr@gmail.com" className="font-medium text-primary hover:underline">messcaptainiiitbbsr@gmail.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-4 text-center">
        <p>&copy; {new Date().getFullYear()} IIIT Mess. All rights reserved.</p>
      </footer>
    </div>
  );
}
