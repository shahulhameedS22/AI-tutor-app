'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';

import { useAuth } from '@/firebase';

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

import { Logo } from '@/components/logo';

import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
} from 'lucide-react';

const formSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' }),

  password: z
    .string()
    .min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoggingIn) return;

    setIsLoggingIn(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        values.email.trim(),
        values.password
      );

      toast({
        title: 'Welcome back! 👋',
        description: 'You have successfully logged in.',
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login Error:', error);

      let message = 'Unable to login. Please try again.';

      if (error?.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error?.code === 'auth/user-not-found') {
        message = 'No account was found with this email.';
      } else if (error?.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error?.code === 'auth/too-many-requests') {
        message =
          'Too many unsuccessful attempts. Please wait and try again later.';
      } else if (error?.code === 'auth/network-request-failed') {
        message =
          'Network error. Please check your internet connection.';
      }

      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: message,
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleForgotPassword() {
    const email = form.getValues('email').trim();

    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Enter your email address first.',
      });
      return;
    }

    const emailValidation = z
      .string()
      .email()
      .safeParse(email);

    if (!emailValidation.success) {
      toast({
        variant: 'destructive',
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
      });
      return;
    }

    if (isResettingPassword) return;

    setIsResettingPassword(true);

    try {
      await sendPasswordResetEmail(auth, email);

      toast({
        title: 'Password reset email sent',
        description:
          'Check your email for instructions to reset your password.',
      });
    } catch (error: any) {
      console.error('Password Reset Error:', error);

      toast({
        variant: 'destructive',
        title: 'Unable to reset password',
        description:
          'Please check the email address and try again.',
      });
    } finally {
      setIsResettingPassword(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-8">
      <div className="mb-8">
        <Logo />
      </div>

      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome back
          </CardTitle>

          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>

                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          type="email"
                          placeholder="m@example.com"
                          className="pl-9"
                          autoComplete="email"
                          {...field}
                        />
                      </div>
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>

                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isResettingPassword}
                        className="text-xs text-primary underline-offset-4 hover:underline disabled:opacity-50"
                      >
                        {isResettingPassword
                          ? 'Sending...'
                          : 'Forgot password?'}
                      </button>
                    </div>

                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10"
                          autoComplete="current-password"
                          {...field}
                        />

                        <button
                          type="button"
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}

            <Link
              href="/signup"
              className="font-medium text-primary underline underline-offset-4"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
