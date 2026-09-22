export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto space-y-10">

          <div className="text-center space-y-4">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
              About AI Study Buddy
            </h1>

            <p className="text-lg text-muted-foreground">
              Your personal AI-powered learning companion designed to make
              studying smarter, easier, and more effective.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="font-headline text-3xl font-bold">
              What is AI Study Buddy?
            </h2>

            <p className="text-lg text-muted-foreground leading-8">
              AI Study Buddy is an AI-powered tutoring platform that helps
              students learn according to their individual needs. It provides
              personalized study plans, adaptive practice questions, and
              interactive learning experiences.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="font-headline text-3xl font-bold">
              Our Features
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-2">
                  Personalized Learning
                </h3>
                <p className="text-muted-foreground">
                  Get study plans designed around your learning goals,
                  schedule, and progress.
                </p>
              </div>

              <div className="p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-2">
                  Adaptive Practice
                </h3>
                <p className="text-muted-foreground">
                  Practice questions can adapt to your performance and help
                  you focus on areas that need improvement.
                </p>
              </div>

              <div className="p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-2">
                  Interactive Lessons
                </h3>
                <p className="text-muted-foreground">
                  Learn through interactive content, quizzes, and engaging
                  learning activities.
                </p>
              </div>

              <div className="p-6 rounded-lg border">
                <h3 className="text-xl font-semibold mb-2">
                  AI Tutor
                </h3>
                <p className="text-muted-foreground">
                  Get AI-powered assistance to understand concepts and
                  improve your learning experience.
                </p>
              </div>

            </div>
          </section>

          <section className="text-center space-y-4">
            <h2 className="font-headline text-3xl font-bold">
              Start Learning Smarter
            </h2>

            <p className="text-lg text-muted-foreground">
              Explore AI Study Buddy and take control of your learning journey.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
