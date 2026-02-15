'use server';
/**
 * @fileOverview A Genkit flow for suggesting relevant RSVP questions based on event type.
 *
 * - suggestRsvpQuestions - A function that suggests RSVP questions.
 * - SuggestRsvpQuestionsInput - The input type for the suggestRsvpQuestions function.
 * - SuggestRsvpQuestionsOutput - The return type for the suggestRsvpQuestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestRsvpQuestionsInputSchema = z.object({
  eventType: z
    .string()
    .describe(
      'The type of event for which to suggest RSVP questions (e.g., "20th birthday celebration", "wedding", "conference").'
    ),
  existingQuestions: z
    .array(z.string())
    .optional()
    .describe(
      'A list of questions already present in the RSVP form, to avoid suggesting duplicates.'
    ),
});
export type SuggestRsvpQuestionsInput = z.infer<
  typeof SuggestRsvpQuestionsInputSchema
>;

const SuggestRsvpQuestionsOutputSchema = z.object({
  suggestedQuestions: z
    .array(z.string())
    .describe('A list of suggested RSVP questions.'),
});
export type SuggestRsvpQuestionsOutput = z.infer<
  typeof SuggestRsvpQuestionsOutputSchema
>;

export async function suggestRsvpQuestions(
  input: SuggestRsvpQuestionsInput
): Promise<SuggestRsvpQuestionsOutput> {
  return suggestRsvpQuestionsFlow(input);
}

const suggestRsvpQuestionsPrompt = ai.definePrompt({
  name: 'suggestRsvpQuestionsPrompt',
  input: { schema: SuggestRsvpQuestionsInputSchema },
  output: { schema: SuggestRsvpQuestionsOutputSchema },
  prompt: `You are an AI assistant specialized in event planning. Your task is to suggest relevant and common RSVP questions for a '{{{eventType}}}'. Focus on practical questions that help organizers plan the event, such as dietary restrictions, plus-ones, attendance confirmation, or preference for activities.

Please provide a list of 5-7 unique questions. Avoid suggesting questions already present in the 'existingQuestions' list.

Existing Questions:
{{#if existingQuestions}}
{{#each existingQuestions}}- {{{this}}}
{{/each}}
{{else}}
None.
{{/if}}

Output the suggested questions as a JSON array of strings, under a 'suggestedQuestions' key.`,
});

const suggestRsvpQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestRsvpQuestionsFlow',
    inputSchema: SuggestRsvpQuestionsInputSchema,
    outputSchema: SuggestRsvpQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await suggestRsvpQuestionsPrompt(input);
    return output!;
  }
);
