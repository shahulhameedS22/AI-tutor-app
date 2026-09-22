'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { useUser } from '@/firebase';
import { KeyRound, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const userName = user?.displayName || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">

          {/* Welcome section */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-center">
              Hi, {userName} 👋
            </h1>

            <p className="mt-2 text-muted-foreground text-center">
              Ready to level up your learning? Learn at your own pace with your AI Tutor, practice with personalized questions, discover your strengths, and improve the areas that need more attention. Choose a feature below and take the next step toward smarter, more confident learning.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            {/* Cryptography Tutor */}
            <Link
              href="/chatbot/cryptography"
              className="group block rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary transition-transform duration-200 group-hover:scale-110" />
              </div>

              <h2 className="text-xl font-semibold">
                Cryptography Tutor
              </h2>

              <p className="mt-2 text-muted-foreground">
                Ask an AI expert about cryptography.
              </p>

              <p className="mt-5 text-sm font-medium text-primary">
                Start learning →
              </p>
            </Link>

            {/* Quiz Generator */}
            <Link
              href="/quiz-generator"
              className="group block rounded-xl border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <ClipboardList className="h-6 w-6 text-primary transition-transform duration-200 group-hover:scale-110" />
              </div>

              <h2 className="text-xl font-semibold">
                Quiz Generator
              </h2>

              <p className="mt-2 text-muted-foreground">
                Generate a quiz and test your knowledge.
              </p>

              <p className="mt-5 text-sm font-medium text-primary">
                Create a quiz →
              </p>
            </Link>

          </div>

        </div>
      </main>
    </div>
  );
}
