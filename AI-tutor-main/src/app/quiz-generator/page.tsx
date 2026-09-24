'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateQuiz } from './actions';

import {
  CheckCircle,
  XCircle,
  Trophy,
  History,
  Clock,
  Target,
  RotateCcw,
} from 'lucide-react';

import {
  collection,
  doc,
  query,
  orderBy,
  setDoc,
} from 'firebase/firestore';

import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';

type Question = {
  id: number;
  question: string;
  options: Record<string, string>;
};

type QuizData = {
  questions: Question[];
  answer_key: Record<string, string>;
};

type UserAnswers = Record<string, string>;

type QuizAttempt = {
  id: string;
  score: number;
  total: number;
  percentage: number;
  attemptedQuestionIds: number[];
  completedAt: string;
};

export default function QuizGeneratorPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [quizData, setQuizData] = useState<QuizData | null>(null);

  const [results, setResults] = useState<{
    score: number;
    total: number;
    userAnswers: UserAnswers;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [numQuestions, setNumQuestions] = useState(5);

  const [hasMounted, setHasMounted] = useState(false);

  const { register, handleSubmit, reset } = useForm<UserAnswers>();

  /*
   * -------------------------------------------------------
   * FIRESTORE QUIZ HISTORY
   * -------------------------------------------------------
   */

  const quizHistoryQuery = useMemoFirebase(() => {
    if (!user) return null;

    return query(
      collection(
        firestore,
        'users',
        user.uid,
        'quizAttempts'
      ),
      orderBy('completedAt', 'desc')
    );
  }, [firestore, user]);

  const {
    data: quizHistory,
    isLoading: isHistoryLoading,
  } = useCollection<QuizAttempt>(quizHistoryQuery);

  /*
   * Convert history into question IDs.
   *
   * This is used to tell the quiz generator which questions
   * have already been attempted.
   */

  const attemptedIds = useMemo(() => {
    if (!quizHistory) return [];

    const ids = quizHistory.flatMap(
      (attempt) =>
        attempt.attemptedQuestionIds || []
    );

    return [...new Set(ids)];
  }, [quizHistory]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  /*
   * -------------------------------------------------------
   * GENERATE QUIZ
   * -------------------------------------------------------
   */

  const handleGenerateQuiz = async () => {
    if (!user) return;

    setIsLoading(true);

    setQuizData(null);
    setResults(null);
    reset();

    const formData = new FormData();

    formData.append(
      'num',
      numQuestions.toString()
    );

    /*
     * Send previously attempted questions
     * to the server.
     */
    formData.append(
      'attemptedIds',
      attemptedIds.join(',')
    );

    try {
      const data = await generateQuiz(formData);

      if ('error' in data) {
        alert(data.error);
      } else {
        setQuizData(data);
      }
    } catch (error) {
      console.error(
        'Quiz generation error:',
        error
      );

      alert(
        'Something went wrong while generating the quiz. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * -------------------------------------------------------
   * SUBMIT QUIZ
   * -------------------------------------------------------
   */

  const onSubmitQuiz = async (
    data: UserAnswers
  ) => {
    if (!quizData || !user) return;

    let score = 0;

    for (const question of quizData.questions) {
      if (
        data[question.id.toString()] ===
        quizData.answer_key[
          question.id.toString()
        ]
      ) {
        score++;
      }
    }

    const total =
      quizData.questions.length;

    const percentage = Math.round(
      (score / total) * 100
    );

    /*
     * Question IDs used in this quiz.
     */
    const currentQuizIds =
      quizData.questions.map(
        (question) => question.id
      );

    /*
     * Create a unique attempt document.
     */
    const attemptRef = doc(
      collection(
        firestore,
        'users',
        user.uid,
        'quizAttempts'
      )
    );

    const attempt: QuizAttempt = {
      id: attemptRef.id,
      score,
      total,
      percentage,
      attemptedQuestionIds:
        currentQuizIds,
      completedAt:
        new Date().toISOString(),
    };

    /*
     * Save result permanently.
     */
    try {
      await setDoc(
        attemptRef,
        attempt
      );

      console.log(
        'Quiz attempt saved successfully.'
      );
    } catch (error) {
      console.error(
        'Failed to save quiz attempt:',
        error
      );
    }

    setResults({
      score,
      total,
      userAnswers: data,
    });
  };

  /*
   * -------------------------------------------------------
   * FEEDBACK
   * -------------------------------------------------------
   */

  const getFeedback = (
    percentage: number
  ) => {
    if (percentage >= 90) {
      return {
        title: 'Excellent performance!',
        message:
          'Outstanding work. You have a strong understanding of the topic.',
      };
    }

    if (percentage >= 75) {
      return {
        title: 'Great job!',
        message:
          'You have a good understanding. A little more revision can make you even stronger.',
      };
    }

    if (percentage >= 50) {
      return {
        title: 'Good attempt!',
        message:
          'You have the basics. Review the incorrect answers and try another quiz.',
      };
    }

    return {
      title: 'Keep practicing!',
      message:
        'Review the topic carefully and attempt another quiz to improve your score.',
    };
  };

  /*
   * -------------------------------------------------------
   * LOADING
   * -------------------------------------------------------
   */

  if (
    isUserLoading ||
    isHistoryLoading ||
    !hasMounted
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * UI
   * -------------------------------------------------------
   */

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ------------------------------------------------ */}
          {/* PAGE HEADER */}
          {/* ------------------------------------------------ */}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl flex items-center gap-2">
                <Target className="h-7 w-7" />
                Quiz Generator
              </CardTitle>

              <CardDescription>
                Test your knowledge with personalized quizzes
                and track your learning progress.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* ------------------------------------------------ */}
          {/* PREVIOUS ATTEMPTS */}
          {/* ------------------------------------------------ */}

          {!quizData && !results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Your Previous Attempts
                </CardTitle>

                <CardDescription>
                  Review your previous quiz performance.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {quizHistory &&
                quizHistory.length > 0 ? (
                  <div className="space-y-3">

                    {quizHistory
                      .slice(0, 5)
                      .map((attempt) => {

                        const feedback =
                          getFeedback(
                            attempt.percentage
                          );

                        return (
                          <div
                            key={attempt.id}
                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-xl border p-4"
                          >

                            <div className="flex items-center gap-4">

                              <div className="rounded-full bg-primary/10 p-3">
                                <Trophy className="h-5 w-5 text-primary" />
                              </div>

                              <div>
                                <p className="font-semibold">
                                  {attempt.score} /{' '}
                                  {attempt.total}
                                </p>

                                <p className="text-sm text-muted-foreground">
                                  {feedback.title}
                                </p>
                              </div>

                            </div>

                            <div className="flex items-center gap-5 text-sm">

                              <div>
                                <p className="text-muted-foreground">
                                  Score
                                </p>
                                <p className="font-bold">
                                  {attempt.percentage}%
                                </p>
                              </div>

                              <div>
                                <p className="text-muted-foreground">
                                  Questions
                                </p>
                                <p className="font-medium">
                                  {attempt.total}
                                </p>
                              </div>

                              <div>
                                <p className="text-muted-foreground">
                                  Date
                                </p>

                                <p className="font-medium">
                                  {new Date(
                                    attempt.completedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>

                            </div>

                          </div>
                        );
                      })}

                  </div>
                ) : (
                  <div className="text-center py-8">

                    <History className="mx-auto h-10 w-10 text-muted-foreground mb-3" />

                    <p className="font-medium">
                      No quiz attempts yet
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Complete your first quiz and your
                      result will appear here.
                    </p>

                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ------------------------------------------------ */}
          {/* QUIZ GENERATION */}
          {/* ------------------------------------------------ */}

          {!quizData && !results && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Start a New Quiz
                </CardTitle>

                <CardDescription>
                  Choose how many questions you want to
                  answer.
                </CardDescription>
              </CardHeader>

              <CardContent>

                <div className="flex flex-col items-center gap-5">

                  <div className="text-center">
                    <Label htmlFor="num-questions">
                      Number of Questions
                    </Label>

                    <p className="text-sm text-muted-foreground mt-1">
                      Choose between 1 and 10 questions.
                    </p>
                  </div>

                  <Input
                    id="num-questions"
                    type="number"
                    min="1"
                    max="10"
                    value={numQuestions}
                    onChange={(e) => {
                      const value =
                        Number(e.target.value);

                      if (
                        value >= 1 &&
                        value <= 10
                      ) {
                        setNumQuestions(value);
                      }
                    }}
                    className="w-24 text-center"
                    disabled={isLoading}
                  />

                  <Button
                    onClick={
                      handleGenerateQuiz
                    }
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading
                      ? 'Generating...'
                      : 'Generate Quiz'}
                  </Button>

                  {attemptedIds.length > 0 && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />

                      {attemptedIds.length}{' '}
                      question
                      {attemptedIds.length !== 1
                        ? 's'
                        : ''}{' '}
                      already attempted.
                    </p>
                  )}

                </div>

              </CardContent>
            </Card>
          )}

          {/* ------------------------------------------------ */}
          {/* QUESTIONS */}
          {/* ------------------------------------------------ */}

          {quizData && !results && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Your Quiz
                </CardTitle>

                <CardDescription>
                  Answer all questions and submit when
                  you are ready.
                </CardDescription>
              </CardHeader>

              <CardContent>

                <form
                  onSubmit={handleSubmit(
                    onSubmitQuiz
                  )}
                >

                  <div className="space-y-8">

                    {quizData.questions.map(
                      (q, index) => (
                        <div
                          key={q.id}
                          className="rounded-xl border p-5"
                        >

                          <p className="font-semibold mb-4">
                            {index + 1}.{' '}
                            {q.question}
                          </p>

                          <fieldset className="space-y-3">

                            {Object.entries(
                              q.options
                            ).map(
                              ([key, value]) => (
                                <label
                                  key={key}
                                  htmlFor={`${q.id}-${key}`}
                                  className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50"
                                >

                                  <input
                                    type="radio"
                                    id={`${q.id}-${key}`}
                                    value={key}
                                    {...register(
                                      q.id.toString(),
                                      {
                                        required: true,
                                      }
                                    )}
                                  />

                                  <span>
                                    <strong>
                                      {key}:
                                    </strong>{' '}
                                    {value}
                                  </span>

                                </label>
                              )
                            )}

                          </fieldset>

                        </div>
                      )
                    )}

                  </div>

                  <div className="flex justify-end mt-8">
                    <Button
                      type="submit"
                      size="lg"
                    >
                      Submit Quiz
                    </Button>
                  </div>

                </form>

              </CardContent>
            </Card>
          )}

          {/* ------------------------------------------------ */}
          {/* RESULTS */}
          {/* ------------------------------------------------ */}

          {results && quizData && (
            <Card>
              <CardHeader className="text-center">

                <CardTitle className="text-3xl">
                  Quiz Results
                </CardTitle>

                <CardDescription>
                  Here is your performance summary.
                </CardDescription>

              </CardHeader>

              <CardContent>

                <div className="text-center mb-8">

                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                    <Trophy className="h-10 w-10 text-primary" />
                  </div>

                  <p className="text-5xl font-bold">
                    {results.score} /{' '}
                    {results.total}
                  </p>

                  <p className="text-xl text-muted-foreground mt-2">
                    {Math.round(
                      (results.score /
                        results.total) *
                        100
                    )}
                    %
                  </p>

                </div>

                {/* FEEDBACK */}

                <div className="rounded-xl border bg-muted/30 p-5 mb-8 text-center">

                  <h3 className="font-bold text-lg">
                    {getFeedback(
                      Math.round(
                        (results.score /
                          results.total) *
                          100
                      )
                    ).title}
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2">
                    {getFeedback(
                      Math.round(
                        (results.score /
                          results.total) *
                          100
                      )
                    ).message}
                  </p>

                </div>

                {/* QUESTIONS */}

                <div className="space-y-4">

                  {quizData.questions.map(
                    (q, index) => {

                      const userAnswer =
                        results.userAnswers[
                          q.id.toString()
                        ];

                      const correctAnswer =
                        quizData.answer_key[
                          q.id.toString()
                        ];

                      const isCorrect =
                        userAnswer ===
                        correctAnswer;

                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-xl border ${
                            isCorrect
                              ? 'bg-green-50 dark:bg-green-900/20'
                              : 'bg-red-50 dark:bg-red-900/20'
                          }`}
                        >

                          <div className="flex items-start gap-2 mb-3">

                            {isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            )}

                            <p className="font-semibold">
                              {index + 1}.{' '}
                              {q.question}
                            </p>

                          </div>

                          <div className="space-y-2 text-sm">

                            {Object.entries(
                              q.options
                            ).map(
                              ([key, value]) => {

                                const isUserAnswer =
                                  userAnswer ===
                                  key;

                                const isCorrectAnswer =
                                  correctAnswer ===
                                  key;

                                return (
                                  <div
                                    key={key}
                                    className={`p-2 rounded ${
                                      isCorrectAnswer
                                        ? 'font-semibold'
                                        : ''
                                    }`}
                                  >

                                    {key}: {value}

                                    {isCorrectAnswer && (
                                      <span className="ml-2 text-green-600">
                                        ✓ Correct answer
                                      </span>
                                    )}

                                    {isUserAnswer &&
                                      !isCorrect && (
                                        <span className="ml-2 text-red-600">
                                          ✗ Your answer
                                        </span>
                                      )}

                                  </div>
                                );
                              }
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                {/* ACTIONS */}

                <div className="flex justify-center mt-8">

                  <Button
                    onClick={() => {
                      setQuizData(null);
                      setResults(null);
                      reset();
                    }}
                    size="lg"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Take Another Quiz
                  </Button>

                </div>

              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}
