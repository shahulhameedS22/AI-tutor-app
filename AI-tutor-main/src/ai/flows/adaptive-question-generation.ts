'use server';
/**
 * @fileOverview Adaptive question generation flow.
 *
 * - adaptiveQuestionGeneration - A function that generates practice questions tailored to student progress.
 * - AdaptiveQuestionGenerationInput - The input type for the adaptiveQuestionGeneration function.
 * - AdaptiveQuestionGenerationOutput - The return type for the adaptiveQuestionGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdaptiveQuestionGenerationInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate practice questions.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('The difficulty level of the questions.'),
  studentProgress: z.string().describe('A description of the student\'s progress in the topic.'),
});
export type AdaptiveQuestionGenerationInput = z.infer<typeof AdaptiveQuestionGenerationInputSchema>;

const AdaptiveQuestionGenerationOutputSchema = z.object({
  question: z.string().describe('A practice question tailored to the student\'s progress.'),
  answer: z.string().describe('The answer to the generated question.'),
});
export type AdaptiveQuestionGenerationOutput = z.infer<typeof AdaptiveQuestionGenerationOutputSchema>;

export async function adaptiveQuestionGeneration(input: AdaptiveQuestionGenerationInput): Promise<AdaptiveQuestionGenerationOutput> {
  return adaptiveQuestionGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adaptiveQuestionGenerationPrompt',
  input: {schema: AdaptiveQuestionGenerationInputSchema},
  output: {schema: AdaptiveQuestionGenerationOutputSchema},
  prompt: `You are an AI tutor that generates practice questions for students.

  Generate a practice question on the topic of {{topic}} with a difficulty of {{difficulty}}.
  The question should be tailored to the student's progress, which can be described as follows: {{studentProgress}}.
  Also provide the answer to the question.

  Question:
  Answer:`,
});

const adaptiveQuestionGenerationFlow = ai.defineFlow(
  {
    name: 'adaptiveQuestionGenerationFlow',
    inputSchema: AdaptiveQuestionGenerationInputSchema,
    outputSchema: AdaptiveQuestionGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
