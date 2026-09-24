'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';

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

import { signInWithEmailAndPassword } from 'firebase/auth';

import { Logo } from '@/components/logo';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email.',
  }),

  password: z.string().min(1, {
    message: 'Password is required.',
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      toast({
        title: 'Login Successful',
      });

      router.push('/dashboard');

    } catch (error: any) {
      console.error('Login Error:', error);

      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password.',
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40">

      <div className="mb-8">
        <Logo />
      </div>

      <Card className="w-full max-w-sm">

        <CardHeader>

          <CardTitle className="text-2xl">
            Login
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

              {/* Email */}
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
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />

                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>

                    <FormLabel>Password</FormLabel>

                    <FormControl>
                      <div className="relative">

                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pr-10"
                          {...field}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
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
              >
                Login
              </Button>

            </form>

          </Form>

          <div className="mt-4 text-center text-sm">

            Don&apos;t have an account?{' '}

            <Link
              href="/signup"
              className="underline"
            >
              Sign up
            </Link>

          </div>

        </CardContent>

      </Card>

    </div>
  );
}
