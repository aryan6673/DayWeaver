
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

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }), // Min 1 for demo purposes
});

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { login, user, isLoading: authIsLoading } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!authIsLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, authIsLoading, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await login(values.email);
      toast({
        title: 'Login Successful!',
        description: 'Welcome back!',
      });
      // Redirect is handled by login function or useEffect
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
      setIsSubmitting(false);
    }
    // No need to setIsSubmitting(false) on success as page will redirect
  }
  
  if (authIsLoading || (!authIsLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <IconSpinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back!</CardTitle>
        <CardDescription>
          Log in to your Day Weaver account to manage your schedule.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="text-base"
                      {...field}
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
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
              {isSubmitting ? (
                <>
                  <IconSpinner className="mr-2 h-5 w-5" />
                  Logging In...
                </>
              ) : (
                'Log In'
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="#" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
