'use server';
/**
 * @fileOverview A cryptography chatbot flow.
 *
 * - cryptographyChatbot - A function that powers the cryptography chatbot.
 * - CryptographyChatbotInput - The input type for the cryptographyChatbot function.
 * - CryptographyChatbotOutput - The return type for the cryptographyChatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const CryptographyChatbotInputSchema = z.object({
  history: z.array(ChatMessageSchema).describe('The chat history.'),
  question: z.string().describe('The user\'s question about cryptography.'),
});
export type CryptographyChatbotInput = z.infer<typeof CryptographyChatbotInputSchema>;

const CryptographyChatbotOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user\'s question.'),
});
export type CryptographyChatbotOutput = z.infer<typeof CryptographyChatbotOutputSchema>;

export async function cryptographyChatbot(input: CryptographyChatbotInput): Promise<CryptographyChatbotOutput> {
  return cryptographyChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cryptographyChatbotPrompt',
  input: { schema: CryptographyChatbotInputSchema },
  output: { schema: CryptographyChatbotOutputSchema },
  prompt: `You are a highly specialized AI assistant with deep expertise in the engineering course subject of 'cryptography'. Your sole purpose is to answer questions, explain complex concepts, and provide information strictly within the domain of cryptography.

  You must adhere to the following rules:
  1.  Only answer questions related to cryptography. This includes topics like encryption, decryption, hash functions, digital signatures, public key infrastructure, block ciphers, stream ciphers, cryptographic protocols, and the history of cryptography.
  2.  If a user asks a question that is not related to cryptography, you must politely decline to answer. State that your expertise is strictly limited to cryptography and you cannot answer questions outside of this subject. Do not attempt to answer the unrelated question.
  3.  Provide accurate, detailed, and clear explanations.
  4.  Do not engage in generic conversation or small talk.

  Here is the chat history, for context:
  {{#each history}}
  {{this.role}}: {{{this.content}}}
  {{/each}}

  User's new question: {{{question}}}

  Your response:`,
});

const cryptographyChatbotFlow = ai.defineFlow(
  {
    name: 'cryptographyChatbotFlow',
    inputSchema: CryptographyChatbotInputSchema,
    outputSchema: CryptographyChatbotOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
