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
    // Simulate API call for login
    console.log('Login submitted with:', values);
    // In a real app, you would call your backend API here.
    // For example:
    // try {
    //   const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(values) });
    //   if (response.ok) {
    //     toast({ title: 'Login Successful!', description: 'Welcome back!' });
    //     router.push('/'); // Redirect to dashboard or home
    //   } else {
    //     const errorData = await response.json();
    //     toast({ title: 'Login Failed', description: errorData.message || 'Invalid credentials.', variant: 'destructive' });
    //   }
    // } catch (error) {
    //   toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    // }

    // Mock success
    if (values.email === 'admin@example.com' && values.password === 'password') {
        toast({ title: 'Admin Login Successful!', description: 'Redirecting to admin dashboard...' });
        router.push('/admin');
    } else if (values.email === 'user@example.com' && values.password === 'password') {
        toast({ title: 'Login Successful!', description: 'Welcome back!' });
        router.push('/');
    } else {
        toast({ title: 'Login Failed', description: 'Invalid email or password.', variant: 'destructive' });
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
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                <LogIn className="mr-2 h-5 w-5" /> Login
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Forgot your password?{' '}
            <Link href="/auth/forgot-password" legacyBehavior>
              <a className="font-medium text-primary hover:underline">Reset it here</a>
            </Link>
          </p>
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
