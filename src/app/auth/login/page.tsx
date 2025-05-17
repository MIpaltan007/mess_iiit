
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/services/firebase';

const loginFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    const auth = getAuth(app);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      // const user = userCredential.user;
      toast({ title: 'Login Successful!', description: 'Welcome back!' });
      // Check if the user is an admin (e.g. by email) and redirect accordingly
      if (values.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) { // Example admin check
        router.push('/admin');
      } else {
        router.push('/'); 
      }
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.'; // Default user-facing message
      let logMessage = `Login Failed: ${error.message || 'Unknown error'}`;
      let logLevel: 'error' | 'warn' = 'error';

      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
        logLevel = 'warn'; 
        logMessage = `Login attempt failed due to invalid credentials (Code: ${error.code}). User notified: "${errorMessage}"`;
      } else if (error.code === 'auth/invalid-api-key') {
        errorMessage = 'Configuration error. Please contact support.';
        logMessage = `Login Failed - Firebase API Key Invalid: (Code: ${error.code}) ${error.message}`;
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
        logMessage = `Login Failed - Network Error: (Code: ${error.code}) ${error.message}`;
      } else {
        // For other unexpected errors, use the default errorMessage and log full error.
        logMessage = `Login Failed - Unexpected Error: (Code: ${error.code || 'N/A'}) ${error.message || 'Unknown error'}`;
      }

      if (logLevel === 'error') {
        console.error(logMessage, error); // Log the full error object for unexpected errors for more debug info.
      } else {
        console.warn(logMessage); // Log expected user errors as warnings.
      }
      
      toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <UtensilsCrossed className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Log in to manage your meal plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : <><LogIn className="mr-2 h-5 w-5" /> Login</>}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          {/* Removed "Forgot password" link */}
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" legacyBehavior>
              <a className="font-medium text-primary hover:underline">Sign up now</a>
            </Link>
          </p>
           <Link href="/" legacyBehavior>
              <a className="text-sm text-primary hover:underline mt-4">← Back to Home</a>
            </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
