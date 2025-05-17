
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
import { UtensilsCrossed, Mail, KeyRound, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import { app } from '@/services/firebase';

const emailCheckFormSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});
type EmailCheckFormValues = z.infer<typeof emailCheckFormSchema>;

const passwordResetFormSchema = z.object({
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type PasswordResetFormValues = z.infer<typeof passwordResetFormSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [stage, setStage] = useState<'checkEmail' | 'resetPassword'>('checkEmail');
  const [validatedEmail, setValidatedEmail] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const emailForm = useForm<EmailCheckFormValues>({
    resolver: zodResolver(emailCheckFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const passwordForm = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function handleEmailCheck(values: EmailCheckFormValues) {
    setIsCheckingEmail(true);
    const auth = getAuth(app);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, values.email);
      console.log('SignIn methods for email:', values.email, methods); // Diagnostic log
      if (methods.length > 0) {
        setValidatedEmail(values.email);
        setStage('resetPassword');
        toast({ title: 'Email Verified', description: 'Please enter your new password.', icon: <CheckCircle className="h-5 w-5 text-green-500" /> });
      } else {
        toast({ title: 'Email Not Found', description: 'Email-ID not registered in our database.', variant: 'destructive' });
      }
    } catch (error: any) {
      console.error("Error checking email - Code:", error.code, "Message:", error.message, "Full Error:", error); // Enhanced error logging
      if (error.code === 'auth/invalid-api-key') {
        toast({ title: 'Configuration Error', description: 'There is a problem with the application configuration. Please contact support.', variant: 'destructive' });
      } else if (error.code === 'auth/network-request-failed') {
        toast({ title: 'Network Error', description: 'Could not connect to authentication service. Please check your internet connection.', variant: 'destructive' });
      }
      else {
        toast({ title: 'Error', description: 'An unexpected error occurred while checking your email.', variant: 'destructive' });
      }
    } finally {
      setIsCheckingEmail(false);
    }
  }

  async function handlePasswordReset(values: PasswordResetFormValues) {
    if (!validatedEmail) return; 

    setIsResettingPassword(true);
    // ** IMPORTANT SIMULATION NOTE **
    // Directly updating a user's password without current authentication or a reset token
    // is not possible with client-side Firebase SDKs for security reasons.
    // This section simulates a successful password update.
    console.log(`SIMULATING password update for ${validatedEmail} with new password: ${values.newPassword}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({ title: 'Password Updated (Simulated)', description: 'Your password has been successfully updated. Please log in.', icon: <CheckCircle className="h-5 w-5 text-green-500" /> });
    setIsResettingPassword(false);
    router.push('/auth/login');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <UtensilsCrossed className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">
            {stage === 'checkEmail' ? 'Forgot Password?' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {stage === 'checkEmail' 
              ? 'Enter your email to check if it\'s registered.' 
              : `Enter a new password for ${validatedEmail}.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stage === 'checkEmail' ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(handleEmailCheck)} className="space-y-6">
                <FormField
                  control={emailForm.control}
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
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isCheckingEmail}>
                  {isCheckingEmail ? <Loader2 className="animate-spin" /> : <Mail className="mr-2 h-5 w-5" />}
                  {isCheckingEmail ? 'Checking...' : 'Check Email'}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordReset)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isResettingPassword}>
                  {isResettingPassword ? <Loader2 className="animate-spin" /> : <KeyRound className="mr-2 h-5 w-5" />}
                  {isResettingPassword ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </Form>
          )}
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

    