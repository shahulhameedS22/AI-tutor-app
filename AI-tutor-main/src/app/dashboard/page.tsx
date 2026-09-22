'use client';

import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-12">

        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            Welcome to your Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Choose a feature to continue learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Link
            href="/chatbot/cryptography"
            className="block rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md cursor-pointer"
          >
            <h2 className="text-xl font-semibold">
              Cryptography Tutor
            </h2>

            <p className="mt-2 text-muted-foreground">
              Ask an AI expert about cryptography.
            </p>
          </Link>

          <Link
            href="/quiz-generator"
            className="block rounded-xl border bg-card p-6 shadow-sm transition hover:shadow-md cursor-pointer"
          >
            <h2 className="text-xl font-semibold">
              Quiz Generator
            </h2>

            <p className="mt-2 text-muted-foreground">
              Generate a quiz and test your knowledge.
            </p>
          </Link>

        </div>

      </div>

    </main>
  );
}
