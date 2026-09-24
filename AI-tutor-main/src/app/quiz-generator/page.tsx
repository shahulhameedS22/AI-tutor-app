'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  collection,
  addDoc,
  getDocs,
} from 'firebase/firestore';

import { useUser, useFirestore } from '@/firebase';

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
  XCircle,
  History,
  Trophy,
  RotateCcw,
  ArrowLeft,
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

type QuestionReview = {
  id: number;
  question: string;
  options: Record<string, string>;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

type QuizAttempt = {
  id: string;
  score: number;
  total: number;
  percentage: number;
  questionIds: number[];
  answers: UserAnswers;
  review: QuestionReview[];
  feedbackTitle: string;
  feedbackMessage: string;
  completedAt: string;
};

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

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function QuizGeneratorPage() {
  const router = useRouter();

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [quizData, setQuizData] = useState<QuizData | null>(null);

  const [results, setResults] = useState<{
    score: number;
    total: number;
    percentage: number;
    userAnswers: UserAnswers;
  } | null>(null);

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  const [selectedAttempt, setSelectedAttempt] =
    useState<QuizAttempt | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  const [numQuestions, setNumQuestions] =
    useState(5);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [historyError, setHistoryError] =
    useState('');

  // ---------------------------------------------------------
  // LOGIN CHECK
  // ---------------------------------------------------------

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [
    user,
    isUserLoading,
    router,
  ]);

  // ---------------------------------------------------------
  // LOAD QUIZ HISTORY
  // ---------------------------------------------------------

  useEffect(() => {
    if (!user || !firestore) {
      return;
    }

    let cancelled = false;

    async function loadAttempts() {
      try {
        setHistoryLoading(true);
        setHistoryError('');

        const attemptsRef = collection(
          firestore,
          'users',
          user.uid,
          'quizAttempts'
        );

        /*
         * We intentionally do not use orderBy() here.
         * This avoids problems with missing fields/indexes.
         * We sort the results in JavaScript instead.
         */

        const snapshot = await getDocs(
          attemptsRef
        );

        if (cancelled) {
          return;
        }

        const loadedAttempts: QuizAttempt[] =
          snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              score:
                typeof data.score === 'number'
                  ? data.score
                  : 0,
              total:
                typeof data.total === 'number'
                  ? data.total
                  : 0,
              percentage:
                typeof data.percentage === 'number'
                  ? data.percentage
                  : 0,
              questionIds:
                Array.isArray(data.questionIds)
                  ? data.questionIds
                  : [],
              answers:
                data.answers &&
                typeof data.answers === 'object'
                  ? data.answers
                  : {},
              review:
                Array.isArray(data.review)
                  ? data.review
                  : [],
              feedbackTitle:
                typeof data.feedbackTitle ===
                'string'
                  ? data.feedbackTitle
                  : 'Quiz Result',
              feedbackMessage:
                typeof data.feedbackMessage ===
                'string'
                  ? data.feedbackMessage
                  : '',
              completedAt:
                typeof data.completedAt ===
                'string'
                  ? data.completedAt
                  : '',
            };
          });

        loadedAttempts.sort((a, b) => {
          const dateA = new Date(
            a.completedAt
          ).getTime();

          const dateB = new Date(
            b.completedAt
          ).getTime();

          return dateB - dateA;
        });

        setAttempts(loadedAttempts);

        console.log(
          'Quiz history loaded:',
          loadedAttempts.length
        );
      } catch (error) {
        console.error(
          'Unable to load quiz history:',
          error
        );

        if (!cancelled) {
          setAttempts([]);

          setHistoryError(
            'Unable to load your previous quiz results. Please check your Firestore rules and Firebase connection.'
          );
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    loadAttempts();

    return () => {
      cancelled = true;
    };
  }, [user, firestore]);

  // ---------------------------------------------------------
  // GET PREVIOUSLY ATTEMPTED QUESTION IDS
  // ---------------------------------------------------------

  function getAttemptedQuestionIds() {
    const ids = new Set<number>();

    attempts.forEach((attempt) => {
      if (
        Array.isArray(
          attempt.questionIds
        )
      ) {
        attempt.questionIds.forEach(
          (id) => {
            if (
              typeof id === 'number'
            ) {
              ids.add(id);
            }
          }
        );
      }
    });

    return Array.from(ids);
  }

  // ---------------------------------------------------------
  // GENERATE QUIZ
  // ---------------------------------------------------------

  async function handleGenerateQuiz() {
    if (!user) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setQuizData(null);
      setResults(null);
      setSelectedAttempt(null);

      const attemptedIds =
        getAttemptedQuestionIds();

      const formData = new FormData();

      formData.append(
        'num',
        String(numQuestions)
      );

      formData.append(
        'attemptedIds',
        attemptedIds.join(',')
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

  // ---------------------------------------------------------
  // SUBMIT QUIZ
  // ---------------------------------------------------------

  async function handleSubmitQuiz(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!quizData || !user) {
      return;
    }

    if (!firestore) {
      setErrorMessage(
        'Database connection is not ready. Please refresh the page and try again.'
      );

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

    const review: QuestionReview[] =
      quizData.questions.map(
        (question) => {
          const userAnswer =
            userAnswers[
              String(question.id)
            ] || '';

          const correctAnswer =
            quizData.answer_key[
              String(question.id)
            ] || '';

          const isCorrect =
            userAnswer === correctAnswer;

          if (isCorrect) {
            score++;
          }

          return {
            id: question.id,
            question:
              question.question,
            options:
              question.options,
            userAnswer,
            correctAnswer,
            isCorrect,
          };
        }
      );

    const total =
      quizData.questions.length;

    const percentage =
      Math.round(
        (score / total) * 100
      );

    const feedback =
      getFeedback(percentage);

    // Show result immediately
    setResults({
      score,
      total,
      percentage,
      userAnswers,
    });

    // -------------------------------------------------------
    // SAVE TO FIRESTORE
    // -------------------------------------------------------

    try {
      setIsSaving(true);
      setErrorMessage('');

      const attemptsRef =
        collection(
          firestore,
          'users',
          user.uid,
          'quizAttempts'
        );

      const completedAt =
        new Date().toISOString();

      const attemptData = {
        score,
        total,
        percentage,

        questionIds:
          quizData.questions.map(
            (question) =>
              question.id
          ),

        answers: userAnswers,

        review,

        feedbackTitle:
          feedback.title,

        feedbackMessage:
          feedback.message,

        completedAt,
      };

      console.log(
        'Saving quiz attempt...',
        attemptData
      );

      const savedDoc =
        await addDoc(
          attemptsRef,
          attemptData
        );

      console.log(
        'Quiz attempt saved successfully:',
        savedDoc.id
      );

      // -----------------------------------------------------
      // IMPORTANT:
      // Immediately add the new result to the UI.
      // No second Firestore query is required.
      // -----------------------------------------------------

      const newAttempt: QuizAttempt = {
        id: savedDoc.id,
        score,
        total,
        percentage,

        questionIds:
          quizData.questions.map(
            (question) =>
              question.id
          ),

        answers: userAnswers,

        review,

        feedbackTitle:
          feedback.title,

        feedbackMessage:
          feedback.message,

        completedAt,
      };

      setAttempts(
        (previousAttempts) => [
          newAttempt,
          ...previousAttempts,
        ]
      );
    } catch (error) {
      console.error(
        'Unable to save quiz result:',
        error
      );

      setErrorMessage(
        'Your quiz result could not be saved. Please check your Firestore rules and Firebase configuration.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  // ---------------------------------------------------------
  // START NEW QUIZ
  // ---------------------------------------------------------

  function startNewQuiz() {
    setQuizData(null);
    setResults(null);
    setSelectedAttempt(null);
    setErrorMessage('');
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          Loading...
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------
  // PREVIOUS ATTEMPT DETAILS
  // ---------------------------------------------------------

  if (selectedAttempt) {
    return (
      <div className="min-h-screen">
        <Header />

        <main className="mx-auto max-w-5xl p-4 md:p-8">
          <Button
            variant="ghost"
            onClick={() =>
              setSelectedAttempt(null)
            }
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quiz Generator
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>
                    Previous Quiz Result
                  </CardTitle>

                  <CardDescription>
                    {formatDate(
                      selectedAttempt.completedAt
                    )}
                  </CardDescription>
                </div>

                <Trophy className="h-8 w-8" />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Score
                    </p>

                    <p className="text-3xl font-bold">
                      {selectedAttempt.score}/
                      {selectedAttempt.total}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Percentage
                    </p>

                    <p className="text-3xl font-bold">
                      {
                        selectedAttempt.percentage
                      }
                      %
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Questions
                    </p>

                    <p className="text-3xl font-bold">
                      {selectedAttempt.total}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-lg border p-5">
                <h3 className="text-lg font-semibold">
                  {
                    selectedAttempt.feedbackTitle
                  }
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {
                    selectedAttempt.feedbackMessage
                  }
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Question Review
                </h2>

                {selectedAttempt.review?.map(
                  (item, index) => (
                    <Card key={item.id}>
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <div className="mt-1">
                            {item.isCorrect ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="font-medium">
                              {index + 1}.{' '}
                              {item.question}
                            </p>

                            <p className="mt-3 text-sm">
                              Your answer:{' '}
                              <span className="font-semibold">
                                {item.userAnswer
                                  ? `${item.userAnswer}. ${
                                      item.options[
                                        item.userAnswer
                                      ] || ''
                                    }`
                                  : 'Not answered'}
                              </span>
                            </p>

                            <p className="mt-1 text-sm">
                              Correct answer:{' '}
                              <span className="font-semibold">
                                {
                                  item.correctAnswer
                                }
                                .{' '}
                                {
                                  item.options[
                                    item.correctAnswer
                                  ]
                                }
                              </span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>

              <Button
                onClick={startNewQuiz}
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Take Another Quiz
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN PAGE
  // ---------------------------------------------------------

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
              Test your knowledge and track your
              progress.
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
                    Select the option you think is
                    correct.
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
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving
                      ? 'Saving...'
                      : 'Submit Quiz'}
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

            {/* CURRENT RESULT */}

            {results && (
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

                {errorMessage && (
                  <div className="rounded-lg border p-4">
                    <p className="text-sm">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <Button
                  onClick={startNewQuiz}
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Take Another Quiz
                </Button>
              </div>
            )}

            {/* GENERATOR + HISTORY */}

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
                    You can generate between 1
                    and 10 questions.
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

                {/* HISTORY */}

                <div className="pt-4">
                  <div className="mb-4 flex items-center gap-2">
                    <History className="h-5 w-5" />

                    <h2 className="text-xl font-semibold">
                      Previous Quiz Results
                    </h2>
                  </div>

                  {historyLoading && (
                    <div className="rounded-lg border p-5">
                      <p className="text-sm text-muted-foreground">
                        Loading your quiz history...
                      </p>
                    </div>
                  )}

                  {historyError && (
                    <div className="rounded-lg border p-5">
                      <p className="text-sm">
                        {historyError}
                      </p>
                    </div>
                  )}

                  {!historyLoading &&
                    !historyError &&
                    attempts.length === 0 && (
                      <div className="rounded-lg border p-6 text-center">
                        <History className="mx-auto mb-3 h-8 w-8" />

                        <p className="font-medium">
                          No quiz attempts yet
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Your completed quizzes
                          will appear here.
                        </p>
                      </div>
                    )}

                  {!historyLoading &&
                    attempts.length > 0 && (
                      <div className="space-y-3">
                        {attempts.map(
                          (attempt) => (
                            <button
                              key={
                                attempt.id
                              }
                              type="button"
                              onClick={() =>
                                setSelectedAttempt(
                                  attempt
                                )
                              }
                              className="w-full rounded-lg border p-4 text-left transition hover:bg-muted"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-semibold">
                                    {
                                      attempt.feedbackTitle
                                    }
                                  </p>

                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {formatDate(
                                      attempt.completedAt
                                    )}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="text-xl font-bold">
                                    {
                                      attempt.score
                                    }
                                    /
                                    {
                                      attempt.total
                                    }
                                  </p>

                                  <p className="text-sm text-muted-foreground">
                                    {
                                      attempt.percentage
                                    }
                                    %
                                  </p>
                                </div>
                              </div>
                            </button>
                          )
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
