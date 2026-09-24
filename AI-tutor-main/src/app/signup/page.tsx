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

import {
  useAuth,
  useFirestore,
  setDocumentNonBlocking,
} from '@/firebase';

import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

import { doc } from 'firebase/firestore';

import { Logo } from '@/components/logo';

import {
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
} from 'lucide-react';

const formSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, { message: 'Name must contain at least 2 characters.' }),

  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address.' }),

  password: z
    .string()
    .min(6, {
      message: 'Password must be at least 6 characters.',
    }),
});

export default function SignupPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const password = form.watch('password');

  const passwordChecks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSigningUp) return;

    setIsSigningUp(true);

    try {
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          values.email.trim(),
          values.password
        );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.displayName.trim(),
      });

      const userRef = doc(
        firestore,
        'users',
        user.uid
      );

      setDocumentNonBlocking(
        userRef,
        {
          id: user.uid,
          email: user.email,
          displayName: values.displayName.trim(),
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      toast({
        title: 'Account created! 🎉',
        description: 'Welcome to AI Study Buddy.',
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup Error:', error);

      let message = 'Unable to create your account.';

      if (error?.code === 'auth/email-already-in-use') {
        message =
          'An account already exists with this email.';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error?.code === 'auth/weak-password') {
        message = 'Please choose a stronger password.';
      } else if (error?.code === 'auth/network-request-failed') {
        message =
          'Network error. Please check your internet connection.';
      }

      toast({
        variant: 'destructive',
        title: 'Signup failed',
        description: message,
      });
    } finally {
      setIsSigningUp(false);
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
            Create an account
          </CardTitle>

          <CardDescription>
            Join AI Study Buddy and start learning smarter.
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
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>

                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>

                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
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
                    <FormLabel>Password</FormLabel>

                    <FormControl>
                      <div className="relative">
                        <Input
                          type={
                            showPassword
                              ? 'text'
                              : 'password'
                          }
                          placeholder="••••••••"
                          className="pr-10"
                          autoComplete="new-password"
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
                            setShowPassword(
                              (prev) => !prev
                            )
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

                    <div className="mt-2 space-y-1 text-xs">
                      <PasswordCheck
                        valid={passwordChecks.length}
                        text="At least 6 characters"
                      />

                      <PasswordCheck
                        valid={passwordChecks.uppercase}
                        text="Contains an uppercase letter"
                      />

                      <PasswordCheck
                        valid={passwordChecks.number}
                        text="Contains a number"
                      />
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create an account'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}

            <Link
              href="/login"
              className="font-medium text-primary underline underline-offset-4"
            >
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PasswordCheck({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${
        valid
          ? 'text-green-600'
          : 'text-muted-foreground'
      }`}
    >
      {valid ? (
        <Check className="h-3 w-3" />
      ) : (
        <X className="h-3 w-3" />
      )}

      <span>{text}</span>
    </div>
  );
}
