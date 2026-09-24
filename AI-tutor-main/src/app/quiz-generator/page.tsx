'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useUser } from '@/firebase';

import { Header } from '@/components/layout/header';

import { Button } from '@/components/ui/button';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  CheckCircle,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';

import { generateQuiz } from './actions';

type Question = {
  id: number;
  question: string;
  options: Record<string, string>;
};

type QuizData = {
  questions: Question[];
  answer_key: Record<string, string>;
  cycleReset?: boolean;
};

type UserAnswers = Record<string, string>;

function getFeedback(percentage: number) {
  if (percentage >= 90) {
    return {
      title: 'Excellent Work!',
      message:
        'Excellent performance. You have a strong understanding of these concepts.',
    };
  }

  if (percentage >= 75) {
    return {
      title: 'Great Job!',
      message:
        'Good performance. You understand most of the concepts, with only a few areas to revise.',
    };
  }

  if (percentage >= 60) {
    return {
      title: 'Good Effort!',
      message:
        'You have a basic understanding. Review the incorrect answers and try another quiz.',
    };
  }

  return {
    title: 'Keep Practicing!',
    message:
      'Do not worry. Review the concepts behind your incorrect answers and take another quiz.',
  };
}

export default function QuizGeneratorPage() {
  const router = useRouter();

  const { user, isUserLoading } = useUser();

  const [quizData, setQuizData] =
    useState<QuizData | null>(null);

  const [results, setResults] = useState<{
    score: number;
    total: number;
    percentage: number;
    userAnswers: UserAnswers;
  } | null>(null);

  const [numQuestions, setNumQuestions] =
    useState(5);

  const [isLoading, setIsLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  async function handleGenerateQuiz() {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setQuizData(null);
      setResults(null);

      const formData = new FormData();

      formData.append(
        'num',
        String(numQuestions)
      );

      // No previous quiz history is used.
      formData.append(
        'attemptedIds',
        ''
      );

      const generatedQuiz =
        await generateQuiz(formData);

      if (
        !generatedQuiz ||
        !generatedQuiz.questions ||
        generatedQuiz.questions.length === 0
      ) {
        throw new Error(
          'No quiz questions were generated.'
        );
      }

      setQuizData(generatedQuiz);
    } catch (error) {
      console.error(
        'Quiz generation failed:',
        error
      );

      setErrorMessage(
        'Unable to generate the quiz right now. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmitQuiz(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!quizData) {
      return;
    }

    const form = new FormData(
      event.currentTarget
    );

    const userAnswers: UserAnswers = {};

    quizData.questions.forEach(
      (question) => {
        const answer = form.get(
          `question-${question.id}`
        );

        userAnswers[
          String(question.id)
        ] = answer
          ? String(answer)
          : '';
      }
    );

    let score = 0;

    quizData.questions.forEach(
      (question) => {
        const userAnswer =
          userAnswers[
            String(question.id)
          ] || '';

        const correctAnswer =
          quizData.answer_key[
            String(question.id)
          ] || '';

        if (
          userAnswer === correctAnswer
        ) {
          score++;
        }
      }
    );

    const total =
      quizData.questions.length;

    const percentage =
      Math.round(
        (score / total) * 100
      );

    setResults({
      score,
      total,
      percentage,
      userAnswers,
    });
  }

  function startNewQuiz() {
    setQuizData(null);
    setResults(null);
    setErrorMessage('');
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>
              Quiz Generator
            </CardTitle>

            <CardDescription>
              Test your knowledge with a
              randomly generated quiz.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">

            {/* QUIZ QUESTIONS */}

            {quizData && !results && (
              <form
                onSubmit={handleSubmitQuiz}
                className="space-y-6"
              >
                <div className="rounded-lg border p-4">
                  <p className="font-medium">
                    Answer all questions
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Select the option you
                    think is correct.
                  </p>
                </div>

                {quizData.questions.map(
                  (question, index) => (
                    <Card key={question.id}>
                      <CardContent className="pt-6">
                        <p className="mb-4 font-semibold">
                          {index + 1}.{' '}
                          {question.question}
                        </p>

                        <div className="space-y-3">
                          {Object.entries(
                            question.options
                          ).map(
                            ([key, value]) => (
                              <label
                                key={key}
                                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition hover:bg-muted"
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.id}`}
                                  value={key}
                                  required
                                />

                                <span>
                                  <strong>
                                    {key}.
                                  </strong>{' '}
                                  {value}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    Submit Quiz
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={startNewQuiz}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* RESULTS */}

            {results && quizData && (
              <div className="space-y-6">

                <div className="text-center">
                  <Trophy className="mx-auto mb-3 h-12 w-12" />

                  <h2 className="text-3xl font-bold">
                    {results.score}/
                    {results.total}
                  </h2>

                  <p className="text-lg text-muted-foreground">
                    {results.percentage}%
                  </p>
                </div>

                <div className="rounded-lg border p-5">
                  <h3 className="text-xl font-semibold">
                    {
                      getFeedback(
                        results.percentage
                      ).title
                    }
                  </h3>

                  <p className="mt-2 text-muted-foreground">
                    {
                      getFeedback(
                        results.percentage
                      ).message
                    }
                  </p>
                </div>

                {/* QUESTION REVIEW */}

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    Question Review
                  </h2>

                  {quizData.questions.map(
                    (question, index) => {
                      const userAnswer =
                        results.userAnswers[
                          String(
                            question.id
                          )
                        ] || '';

                      const correctAnswer =
                        quizData.answer_key[
                          String(
                            question.id
                          )
                        ] || '';

                      const isCorrect =
                        userAnswer ===
                        correctAnswer;

                      return (
                        <Card
                          key={question.id}
                        >
                          <CardContent className="pt-6">
                            <div className="flex gap-3">

                              <div className="mt-1">
                                {isCorrect ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  <XCircle className="h-5 w-5" />
                                )}
                              </div>

                              <div className="flex-1">

                                <p className="font-medium">
                                  {index + 1}.{' '}
                                  {
                                    question.question
                                  }
                                </p>

                                <p className="mt-3 text-sm">
                                  Your answer:{' '}
                                  <span className="font-semibold">
                                    {userAnswer
                                      ? `${userAnswer}. ${
                                          question
                                            .options[
                                            userAnswer
                                          ] || ''
                                        }`
                                      : 'Not answered'}
                                  </span>
                                </p>

                                <p className="mt-1 text-sm">
                                  Correct answer:{' '}
                                  <span className="font-semibold">
                                    {correctAnswer}.{' '}
                                    {
                                      question
                                        .options[
                                        correctAnswer
                                      ]
                                    }
                                  </span>
                                </p>

                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                  )}
                </div>

                <Button
                  onClick={startNewQuiz}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Take Another Quiz
                </Button>

              </div>
            )}

            {/* QUIZ GENERATOR */}

            {!quizData && !results && (
              <div className="space-y-6">

                <div className="rounded-lg border p-5">

                  <Label htmlFor="numQuestions">
                    Number of Questions
                  </Label>

                  <Input
                    id="numQuestions"
                    type="number"
                    min={1}
                    max={10}
                    value={numQuestions}
                    onChange={(event) => {
                      const value =
                        Number(
                          event.target.value
                        );

                      if (
                        value >= 1 &&
                        value <= 10
                      ) {
                        setNumQuestions(
                          value
                        );
                      }
                    }}
                    className="mt-2"
                  />

                  <p className="mt-2 text-xs text-muted-foreground">
                    Choose between 1 and 10
                    questions.
                  </p>

                </div>

                {errorMessage && (
                  <div className="rounded-lg border p-4">
                    <p className="text-sm">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <Button
                  onClick={
                    handleGenerateQuiz
                  }
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading
                    ? 'Generating Quiz...'
                    : 'Generate Quiz'}
                </Button>

              </div>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
