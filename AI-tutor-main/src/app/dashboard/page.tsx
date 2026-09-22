'use client';

import { Header } from '@/components/layout/header';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">
            AI Study Buddy Dashboard
          </h1>

          <p className="mt-2 text-muted-foreground">
            Learn, practice, and improve your cryptography skills.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* Cryptography AI Tutor */}
          <section className="rounded-xl border bg-background shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-2xl font-bold">
                🤖 Cryptography AI Tutor
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Ask your AI tutor anything related to cryptography.
              </p>
            </div>

            <iframe
              src="/chatbot/cryptography"
              title="Cryptography AI Tutor"
              className="w-full h-[700px] border-0"
            />
          </section>

          {/* Quiz Generator */}
          <section className="rounded-xl border bg-background shadow-sm overflow-hidden">
            <div className="p-5 border-b">
              <h2 className="text-2xl font-bold">
                📝 Quiz Generator
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Generate quizzes and test your cryptography knowledge.
              </p>
            </div>

            <iframe
              src="/quiz-generator"
              title="Quiz Generator"
              className="w-full h-[700px] border-0"
            />
          </section>

        </div>
      </main>
    </div>
  );
}
