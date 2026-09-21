import Image from 'next/image';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, BrainCircuit, PlaySquare, Target, CheckCircle, Lock, FileQuestion } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-image');
const personalizedLearningImage = PlaceHolderImages.find((img) => img.id === 'personalized-learning');
const progressTrackingImage = PlaceHolderImages.find((img) => img.id === 'progress-tracking');
const interactiveLessonsImage = PlaceHolderImages.find((img) => img.id === 'interactive-lessons');

const benefits = [
  {
    title: 'Personalized Learning Paths',
    description: 'Our AI crafts custom study plans tailored to your unique learning style and academic goals.',
    icon: <Target className="h-10 w-10 text-primary" />,
  },
  {
    title: 'Adaptive Question Generation',
    description: 'Receive practice questions that dynamically adjust to your progress and focus on areas needing improvement.',
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your performance with detailed reports on your strengths and weaknesses to stay on track.',
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
  },
  {
    title: 'Interactive Lessons',
    description: 'Engage with multimedia elements in our lessons to enhance understanding and long-term retention.',
    icon: <PlaySquare className="h-10 w-10 text-primary" />,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="container grid lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
          <div className="space-y-6">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Unlock Your Learning Potential with <span className="text-primary">AI Study Buddy</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your personal AI tutor for customized study plans, adaptive practice, and interactive lessons. Achieve your academic goals faster and smarter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/signup">Start Your Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          {heroImage && (
            <div className="flex justify-center">
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={600}
                height={400}
                data-ai-hint={heroImage.imageHint}
                className="rounded-xl shadow-2xl"
              />
            </div>
          )}
        </section>

        <section className="bg-muted py-20 md:py-24">
          <div className="container">
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Why Choose AI Study Buddy?</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We combine cutting-edge AI with proven educational strategies to create a learning experience that's both effective and enjoyable.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="text-center p-6 flex flex-col items-center shadow-lg transition-transform duration-300 hover:scale-105">
                  <div className="mb-4">{benefit.icon}</div>
                  <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardDescription className="mt-2 text-base">
                    {benefit.description}
                  </CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="container grid lg:grid-cols-2 gap-16 items-center py-20 md:py-24">
          {personalizedLearningImage && (
            <div className="flex justify-center">
              <Image
                src={personalizedLearningImage.imageUrl}
                alt={personalizedLearningImage.description}
                width={500}
                height={500}
                data-ai-hint={personalizedLearningImage.imageHint}
                className="rounded-xl shadow-2xl"
              />
            </div>
          )}
          <div className="space-y-6">
            <Badge variant="outline" className="text-sm py-1 px-3 border-primary text-primary">Personalized Learning Paths</Badge>
            <h3 className="font-headline text-3xl md:text-4xl font-bold">A Study Plan Just For You</h3>
            <p className="text-lg text-muted-foreground">
              Say goodbye to one-size-fits-all education. Our generative AI analyzes your learning style, goals, and subject matter to build a completely unique study plan that optimizes for your success.
            </p>
            <ul className="space-y-3 text-lg">
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Tailored to your learning style</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Adapts to your schedule</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Focuses on your goals</li>
            </ul>
          </div>
        </section>

        <section className="bg-muted py-20 md:py-24">
            <div className="container grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-6 lg:order-last">
                    <Badge variant="outline" className="text-sm py-1 px-3 border-primary text-primary">Interactive Experience</Badge>
                    <h3 className="font-headline text-3xl md:text-4xl font-bold">Learn by Doing</h3>
                    <p className="text-lg text-muted-foreground">
                        Move beyond passive reading. Our interactive lessons use multimedia, quizzes, and simulations to make learning active and engaging, dramatically improving retention and understanding.
                    </p>
                    <ul className="space-y-3 text-lg">
                        <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Engaging multimedia content</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Instant feedback on quizzes</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-accent" /> Real-world simulations</li>
                    </ul>
                </div>
                {interactiveLessonsImage && (
                  <div className="flex justify-center lg:order-first">
                    <Image
                      src={interactiveLessonsImage.imageUrl}
                      alt={interactiveLessonsImage.description}
                      width={500}
                      height={500}
                      data-ai-hint={interactiveLessonsImage.imageHint}
                      className="rounded-xl shadow-2xl"
                    />
                  </div>
                )}
            </div>
        </section>

        <section className="py-20 md:py-24">
          <div className="container">
              <div className="text-center space-y-4 mb-12">
                  <h2 className="font-headline text-3xl md:text-4xl font-bold">Explore Our Subjects</h2>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                      Dive deep into specialized topics with our expert AI Tutors.
                  </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8 justify-center">
                  <Link href="/chatbot/cryptography">
                      <Card className="text-center p-6 flex flex-col items-center shadow-lg transition-transform duration-300 hover:scale-105 w-full max-w-sm mx-auto">
                          <div className="mb-4"><Lock className="h-10 w-10 text-primary" /></div>
                          <CardHeader className="p-0">
                              <CardTitle className="font-headline text-xl">Cryptography</CardTitle>
                          </CardHeader>
                          <CardDescription className="mt-2 text-base">
                              Learn about encryption, decryption, and secure communication.
                          </CardDescription>
                      </Card>
                  </Link>
                   <Link href="/quiz-generator">
                      <Card className="text-center p-6 flex flex-col items-center shadow-lg transition-transform duration-300 hover:scale-105 w-full max-w-sm mx-auto">
                          <div className="mb-4"><FileQuestion className="h-10 w-10 text-primary" /></div>
                          <CardHeader className="p-0">
                              <CardTitle className="font-headline text-xl">Quiz Generator</CardTitle>
                          </CardHeader>
                          <CardDescription className="mt-2 text-base">
                              Generate custom quizzes to test your knowledge.
                          </CardDescription>
                      </Card>
                  </Link>
              </div>
          </div>
        </section>

        <section className="container text-center py-20 md:py-24 bg-muted rounded-lg my-12">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Ready to Revolutionize Your Study Routine?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of students who are already learning smarter, not harder. Sign up for AI Study Buddy today and take the first step towards academic excellence.
            </p>
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/signup">Sign Up Now and Start Learning</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
