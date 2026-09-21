'use client';
    
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    const [results, setResults] = useState<{ score: number; total: number; userAnswers: UserAnswers } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const { register, handleSubmit } = useForm();
    
    const handleGenerateQuiz = async () => {
        setIsLoading(true);
        setQuizData(null);
        setResults(null);
        const formData = new FormData();
        formData.append('num', numQuestions.toString());
        const data = await generateQuiz(formData);
        if ('error' in data) {
            console.error(data.error);
        } else {
            setQuizData(data);
        }
        setIsLoading(false);
    };
    
    const onSubmitQuiz = (data: UserAnswers) => {
        if (!quizData) return;
        let score = 0;
        for (const question of quizData.questions) {
            if (data[question.id.toString()] === quizData.answer_key[question.id.toString()]) {
                score++;
            }
        }
        setResults({ score, total: quizData.questions.length, userAnswers: data });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container py-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Quiz Generator</CardTitle>
                        <CardDescription>Generate a custom quiz to test your knowledge.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!hasMounted ? (
                             <div className="flex flex-col items-center gap-4">
                                <p>Loading...</p>
                            </div>
                        ) : (
                        <>
                            {!quizData && !results && (
                                <div className="flex flex-col items-center gap-4">
                                    <Label htmlFor="num-questions">Number of Questions (1-5)</Label>
                                    <Input
                                        id="num-questions"
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={numQuestions}
                                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                                        className="w-24 text-center"
                                        disabled={isLoading}
                                    />
                                    <Button onClick={handleGenerateQuiz} disabled={isLoading}>
                                        {isLoading ? 'Generating...' : 'Generate Quiz'}
                                    </Button>
                                </div>
                            )}

                            {quizData && !results && (
                                <form onSubmit={handleSubmit(onSubmitQuiz)}>
                                    <div className="space-y-8">
                                        {quizData.questions.map((q, index) => (
                                            <div key={q.id}>
                                                <p className="font-semibold mb-4">{index + 1}. {q.question}</p>
                                                <fieldset className="space-y-2">
                                                    {Object.entries(q.options).map(([key, value]) => (
                                                        <div className="flex items-center space-x-2" key={key}>
                                                            <input type="radio" id={`${q.id}-${key}`} value={key} {...register(q.id.toString())} className="peer"/>
                                                            <Label htmlFor={`${q.id}-${key}`} className="peer-checked:font-bold">
                                                                {key}: {value}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </fieldset>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="submit" className="mt-8">Submit Quiz</Button>
                                </form>
                            )}

                            {results && quizData && (
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <h2 className="font-headline text-2xl mb-2">Quiz Results</h2>
                                        <p className="text-4xl font-bold">{results.score} / {results.total}</p>
                                        <p className="text-lg text-muted-foreground">{Math.round((results.score / results.total) * 100)}%</p>
                                    </div>

                                    <div>
                                        {quizData.questions.map((q, index) => {
                                            const userAnswer = results.userAnswers[q.id.toString()];
                                            const correctAnswer = quizData.answer_key[q.id.toString()];
                                            const isCorrect = userAnswer === correctAnswer;
                                            return (
                                                <div key={q.id} className={`p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                                    <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
                                                    <div className="space-y-2 text-sm">
                                                        {Object.entries(q.options).map(([key, value]) => {
                                                            const isUserAnswer = userAnswer === key;
                                                            const isCorrectAnswer = correctAnswer === key;

                                                            return (
                                                                <div key={key} className="flex items-center gap-2">
                                                                    {isCorrectAnswer && <CheckCircle className="h-4 w-4 text-green-600" />}
                                                                    {!isCorrectAnswer && isUserAnswer && <XCircle className="h-4 w-4 text-red-600" />}
                                                                    <span className={`${isCorrectAnswer ? 'font-bold' : ''} ${isUserAnswer && !isCorrect ? 'line-through' : ''}`}>
                                                                        {key}: {value}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {!isCorrect && userAnswer && (
                                                        <p className="text-xs mt-2 text-red-600">Your answer: {userAnswer}. Correct answer: {correctAnswer}.</p>
                                                    )}
                                                    {!userAnswer && (
                                                        <p className="text-xs mt-2 text-yellow-600">You did not answer this question. Correct answer: {correctAnswer}.</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="text-center">
                                        <Button onClick={() => {
                                            setQuizData(null);
                                            setResults(null);
                                        }}>
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
