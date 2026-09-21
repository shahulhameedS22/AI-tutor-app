'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized study plans based on a student's learning style and goals.
 *
 * - generatePersonalizedStudyPlan - A function that generates a personalized study plan.
 * - PersonalizedStudyPlanInput - The input type for the generatePersonalizedStudyPlan function.
 * - PersonalizedStudyPlanOutput - The output type for the generatePersonalizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedStudyPlanInputSchema = z.object({
  learningStyle: z.string().describe('The student\'s preferred learning style (e.g., visual, auditory, kinesthetic).'),
  goals: z.string().describe('The student\'s learning goals (e.g., improve grades, learn a new skill).'),
  subject: z.string().describe('The subject for which the study plan is being generated (e.g., math, science, history).'),
  timeAvailable: z.string().describe('The amount of time the student has available to study per week (e.g., 5 hours, 10 hours).'),
});
export type PersonalizedStudyPlanInput = z.infer<typeof PersonalizedStudyPlanInputSchema>;

const PersonalizedStudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe('The generated personalized study plan.'),
});
export type PersonalizedStudyPlanOutput = z.infer<typeof PersonalizedStudyPlanOutputSchema>;

export async function generatePersonalizedStudyPlan(input: PersonalizedStudyPlanInput): Promise<PersonalizedStudyPlanOutput> {
  return personalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedStudyPlanPrompt',
  input: {schema: PersonalizedStudyPlanInputSchema},
  output: {schema: PersonalizedStudyPlanOutputSchema},
  prompt: `You are an AI tutor specializing in creating personalized study plans.

  Based on the student's learning style, goals, subject, and time available, generate a detailed and effective study plan.

  Learning Style: {{{learningStyle}}}
  Goals: {{{goals}}}
  Subject: {{{subject}}}
  Time Available: {{{timeAvailable}}}

  Study Plan:`,
});

const personalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'personalizedStudyPlanFlow',
    inputSchema: PersonalizedStudyPlanInputSchema,
    outputSchema: PersonalizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
