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
import { UtensilsCrossed, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const forgotPasswordFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    // Simulate API call for password reset request
    console.log('Password reset requested for:', values.email);
    // In a real app, you would call your backend API here.
    // For example:
    // try {
    //   const response = await fetch('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(values) });
    //   if (response.ok) {
    //     toast({ title: 'Password Reset Email Sent', description: 'Please check your email for instructions.' });
    //     router.push('/auth/login'); 
    //   } else {
    //     const errorData = await response.json();
    //     toast({ title: 'Request Failed', description: errorData.message || 'Could not process request.', variant: 'destructive' });
    //   }
    // } catch (error) {
    //   toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    // }

    // Mock success
    toast({ title: 'Password Reset Email Sent', description: 'If an account exists for this email, you will receive reset instructions.' });
    // Don't redirect immediately to avoid confirming if an email exists for security.
    // form.reset(); // Optionally reset form
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <UtensilsCrossed className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Forgot Password?</CardTitle>
          <CardDescription>Enter your email to receive reset instructions.</CardDescription>
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
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                <Mail className="mr-2 h-5 w-5" /> Send Reset Link
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link href="/auth/login" legacyBehavior>
              <a className="font-medium text-primary hover:underline">Log in here</a>
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
