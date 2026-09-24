'use client';

import { useState, useEffect } from 'react';
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
import { CheckCircle, XCircle } from 'lucide-react';

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

export default function QuizGeneratorPage() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);

  const [results, setResults] = useState<{
    score: number;
    total: number;
    userAnswers: UserAnswers;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [numQuestions, setNumQuestions] = useState(5);

  const [hasMounted, setHasMounted] = useState(false);

  // Stores the IDs of questions already attempted by the user
  const [attemptedIds, setAttemptedIds] = useState<number[]>([]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { register, handleSubmit } = useForm();

  // --------------------------------------------------
  // GENERATE QUIZ
  // --------------------------------------------------

  const handleGenerateQuiz = async () => {
    setIsLoading(true);

    // Clear previous quiz and result
    setQuizData(null);
    setResults(null);

    const formData = new FormData();

    // Number of questions requested
    formData.append(
      'num',
      numQuestions.toString()
    );

    // Send already attempted question IDs
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
      console.error('Quiz generation error:', error);

      alert(
        'Something went wrong while generating the quiz. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // SUBMIT QUIZ
  // --------------------------------------------------

  const onSubmitQuiz = (data: UserAnswers) => {
    if (!quizData) return;

    let score = 0;

    // Calculate score
    for (const question of quizData.questions) {
      if (
        data[question.id.toString()] ===
        quizData.answer_key[question.id.toString()]
      ) {
        score++;
      }
    }

    // Get IDs of all questions in the current quiz
    const currentQuizIds = quizData.questions.map(
      (question) => question.id
    );

    // Add current questions to attempted list
    setAttemptedIds((previousIds) => [
      ...previousIds,
      ...currentQuizIds.filter(
        (id) => !previousIds.includes(id)
      ),
    ]);

    // Show results
    setResults({
      score,
      total: quizData.questions.length,
      userAnswers: data,
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container py-8">
        <Card className="max-w-4xl mx-auto">

          <CardHeader>
            <CardTitle className="font-headline text-3xl">
              Quiz Generator
            </CardTitle>

            <CardDescription>
              Generate a custom quiz to test your knowledge.
            </CardDescription>
          </CardHeader>

          <CardContent>

            {!hasMounted ? (
              <div className="flex flex-col items-center gap-4">
                <p>Loading...</p>
              </div>
            ) : (
              <>

                {/* ------------------------------------------------ */}
                {/* QUIZ GENERATION SCREEN */}
                {/* ------------------------------------------------ */}

                {!quizData && !results && (
                  <div className="flex flex-col items-center gap-4">

                    <Label htmlFor="num-questions">
                      Number of Questions (1-10)
                    </Label>

                    <Input
                      id="num-questions"
                      type="number"
                      min="1"
                      max="10"
                      value={numQuestions}
                      onChange={(e) => {
                        const value = Number(
                          e.target.value
                        );

                        if (value >= 1 && value <= 10) {
                          setNumQuestions(value);
                        }
                      }}
                      className="w-24 text-center"
                      disabled={isLoading}
                    />

                    <Button
                      onClick={handleGenerateQuiz}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? 'Generating...'
                        : 'Generate Quiz'}
                    </Button>

                    {/* Show how many questions have already been attempted */}
                    {attemptedIds.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {attemptedIds.length} question
                        {attemptedIds.length !== 1
                          ? 's'
                          : ''}{' '}
                        already attempted.
                      </p>
                    )}

                  </div>
                )}

                {/* ------------------------------------------------ */}
                {/* QUIZ QUESTIONS */}
                {/* ------------------------------------------------ */}

                {quizData && !results && (
                  <form
                    onSubmit={handleSubmit(onSubmitQuiz)}
                  >
                    <div className="space-y-8">

                      {quizData.questions.map(
                        (q, index) => (
                          <div key={q.id}>

                            <p className="font-semibold mb-4">
                              {index + 1}. {q.question}
                            </p>

                            <fieldset className="space-y-2">

                              {Object.entries(
                                q.options
                              ).map(([key, value]) => (

                                <div
                                  className="flex items-center space-x-2"
                                  key={key}
                                >

                                  <input
                                    type="radio"
                                    id={`${q.id}-${key}`}
                                    value={key}
                                    {...register(
                                      q.id.toString()
                                    )}
                                    className="peer"
                                  />

                                  <Label
                                    htmlFor={`${q.id}-${key}`}
                                    className="peer-checked:font-bold"
                                  >
                                    {key}: {value}
                                  </Label>

                                </div>

                              ))}

                            </fieldset>

                          </div>
                        )
                      )}

                    </div>

                    <Button
                      type="submit"
                      className="mt-8"
                    >
                      Submit Quiz
                    </Button>

                  </form>
                )}

                {/* ------------------------------------------------ */}
                {/* QUIZ RESULTS */}
                {/* ------------------------------------------------ */}

                {results && quizData && (
                  <div className="space-y-8">

                    {/* SCORE */}
                    <div className="text-center">

                      <h2 className="font-headline text-2xl mb-2">
                        Quiz Results
                      </h2>

                      <p className="text-4xl font-bold">
                        {results.score} / {results.total}
                      </p>

                      <p className="text-lg text-muted-foreground">
                        {Math.round(
                          (results.score /
                            results.total) *
                            100
                        )}
                        %
                      </p>

                    </div>

                    {/* QUESTION-BY-QUESTION RESULTS */}
                    <div>

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
                              className={`p-4 rounded-lg mb-4 ${
                                isCorrect
                                  ? 'bg-green-100 dark:bg-green-900/30'
                                  : 'bg-red-100 dark:bg-red-900/30'
                              }`}
                            >

                              <p className="font-semibold mb-2">
                                {index + 1}.{' '}
                                {q.question}
                              </p>

                              <div className="space-y-2 text-sm">

                                {Object.entries(
                                  q.options
                                ).map(
                                  ([key, value]) => {

                                    const isUserAnswer =
                                      userAnswer === key;

                                    const isCorrectAnswer =
                                      correctAnswer === key;

                                    return (
                                      <div
                                        key={key}
                                        className="flex items-center gap-2"
                                      >

                                        {isCorrectAnswer && (
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                        )}

                                        {!isCorrectAnswer &&
                                          isUserAnswer && (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                          )}

                                        <span
                                          className={`${
                                            isCorrectAnswer
                                              ? 'font-bold'
                                              : ''
                                          } ${
                                            isUserAnswer &&
                                            !isCorrect
                                              ? 'line-through'
                                              : ''
                                          }`}
                                        >
                                          {key}: {value}
                                        </span>

                                      </div>
                                    );
                                  }
                                )}

                              </div>

                              {/* WRONG ANSWER */}
                              {!isCorrect &&
                                userAnswer && (
                                  <p className="text-xs mt-2 text-red-600">
                                    Your answer:{' '}
                                    {userAnswer}.
                                    Correct answer:{' '}
                                    {correctAnswer}.
                                  </p>
                                )}

                              {/* NOT ANSWERED */}
                              {!userAnswer && (
                                <p className="text-xs mt-2 text-yellow-600">
                                  You did not answer
                                  this question.
                                  Correct answer:{' '}
                                  {correctAnswer}.
                                </p>
                              )}

                            </div>
                          );
                        }
                      )}

                    </div>

                    {/* TAKE ANOTHER QUIZ */}
                    <div className="text-center">

                      <Button
                        onClick={() => {
                          setQuizData(null);
                          setResults(null);
                        }}
                      >
                        Take Another Quiz
                      </Button>

                    </div>

                  </div>
                )}

              </>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
