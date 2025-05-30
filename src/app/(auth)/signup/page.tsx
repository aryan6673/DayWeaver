
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { IconSpinner } from '@/components/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Github, Chrome } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters.' })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

export default function SignupPage() {
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [isSubmittingGitHub, setIsSubmittingGitHub] = useState(false);
  const { toast } = useToast();
  const { signupWithEmail, signInWithGoogle, signInWithGitHub, user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!authIsLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authIsLoading, router]);

  async function onEmailSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmittingEmail(true);
    try {
      await signupWithEmail(values.email, values.password);
      toast({
        title: 'Signup Successful!',
        description: 'Welcome to Day Weaver!',
      });
      // Redirect is handled by AuthProvider or useEffect
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmittingEmail(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsSubmittingGoogle(true);
    try {
      await signInWithGoogle();
      toast({
        title: 'Google Sign-Up Successful!',
        description: 'Welcome!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Google Sign-Up Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmittingGoogle(false);
    }
  }

  async function handleGitHubSignIn() {
    setIsSubmittingGitHub(true);
    try {
      await signInWithGitHub();
      toast({
        title: 'GitHub Sign-Up Successful!',
        description: 'Welcome!',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'GitHub Sign-Up Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsSubmittingGitHub(false);
    }
  }

  if (authIsLoading || (!authIsLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <IconSpinner className="h-10 w-10 text-primary" />
      </div>
    );
  }
  
  const isAnySubmitting = isSubmittingEmail || isSubmittingGoogle || isSubmittingGitHub;

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Join Day Weaver and start planning your days effectively.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onEmailSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email-signup">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="you@example.com"
                      className="text-base"
                      {...field}
                      disabled={isAnySubmitting}
                    />
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
                  <FormLabel htmlFor="password-signup">Password</FormLabel>
                  <FormControl>
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="••••••••"
                      className="text-base"
                      {...field}
                      disabled={isAnySubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="confirmPassword-signup">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      id="confirmPassword-signup"
                      type="password"
                      placeholder="••••••••"
                      className="text-base"
                      {...field}
                      disabled={isAnySubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <Button type="submit" disabled={isAnySubmitting} size="lg" className="w-full">
              {isSubmittingEmail ? (
                <>
                  <IconSpinner className="mr-2 h-5 w-5" />
                  Signing Up...
                </>
              ) : (
                'Sign Up with Email'
              )}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={isAnySubmitting}>
                {isSubmittingGoogle ? <IconSpinner className="mr-2 h-5 w-5" /> : <Chrome className="mr-2 h-5 w-5" />}
                Google
              </Button>
              <Button variant="outline" type="button" onClick={handleGitHubSignIn} disabled={isAnySubmitting}>
                {isSubmittingGitHub ? <IconSpinner className="mr-2 h-5 w-5" /> : <Github className="mr-2 h-5 w-5" />}
                GitHub
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
