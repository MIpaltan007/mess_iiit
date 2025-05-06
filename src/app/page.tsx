import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MenuDisplay } from '@/components/menu-display';
import { MealPlanSelection } from '@/components/meal-plan-selection';
import { OrderSummary } from '@/components/order-summary';
import { User, Settings, UtensilsCrossed } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Meal Plan Hub</h1>
          </div>
          <nav className="flex items-center gap-4">
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
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <MenuDisplay />
        </div>
        <div className="md:col-span-1 space-y-8">
          <MealPlanSelection />
          <OrderSummary />
        </div>
      </main>

      <footer className="bg-secondary text-secondary-foreground py-4 text-center">
        <p>&copy; {new Date().getFullYear()} Meal Plan Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}
