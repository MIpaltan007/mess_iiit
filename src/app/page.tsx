
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MenuDisplay, type MenuItem as DisplayMenuItem } from '@/components/menu-display';
import { OrderSummary } from '@/components/order-summary';
import { User, Settings, UtensilsCrossed, LogOut, UserCircle } from 'lucide-react';
import { getAuth, onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


export default function Home() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<DisplayMenuItem[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoadingAuth(false);
      if (!user) { // Clear selected meals if user logs out
        setSelectedMeals([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth(app);
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      setSelectedMeals([]); // Clear meals on logout
      router.push('/'); // Optional: redirect to home or login
    } catch (error) {
      console.error('Logout failed:', error);
      toast({ title: 'Logout Failed', description: 'Could not log you out. Please try again.', variant: 'destructive' });
    }
  };

  const handleMealSelect = (meal: DisplayMenuItem, isSelected: boolean) => {
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
                  {currentUser.displayName || currentUser.email}
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

      <main className="flex-grow container mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <MenuDisplay 
            currentUser={currentUser} // Pass currentUser here
            onMealSelect={handleMealSelect}
            selectedMeals={selectedMeals}
          />
        </div>
        <div className="md:col-span-1 space-y-8">
          <OrderSummary 
            selectedMeals={selectedMeals}
            currentUserEmail={currentUser?.email || null}
            currentUserDisplayName={currentUser?.displayName || null}
            onPaymentSuccess={handleClearSelections}
          />
        </div>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-4 text-center">
        <p>&copy; {new Date().getFullYear()} IIIT Mess. All rights reserved.</p>
      </footer>
    </div>
  );
}
