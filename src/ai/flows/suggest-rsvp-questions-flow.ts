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
      'Le type d\'événement pour lequel suggérer des questions RSVP (par exemple, "fête du 20e anniversaire", "mariage", "conférence").'
    ),
  existingQuestions: z
    .array(z.string())
    .optional()
    .describe(
      'Une liste de questions déjà présentes dans le formulaire RSVP, pour éviter de suggérer des doublons.'
    ),
});
export type SuggestRsvpQuestionsInput = z.infer<
  typeof SuggestRsvpQuestionsInputSchema
>;

const SuggestRsvpQuestionsOutputSchema = z.object({
  suggestedQuestions: z
    .array(z.string())
    .describe('Une liste de questions RSVP suggérées.'),
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
  prompt: `Vous êtes un assistant IA spécialisé dans la planification d'événements. Votre tâche est de suggérer des questions RSVP pertinentes et courantes pour un '{{{eventType}}}'. Concentrez-vous sur des questions pratiques qui aident les organisateurs à planifier l'événement, telles que les restrictions alimentaires, les accompagnants, la confirmation de présence ou les préférences pour les activités.

Veuillez fournir une liste de 5 à 7 questions uniques. Évitez de suggérer des questions déjà présentes dans la liste 'existingQuestions'.

Questions existantes :
{{#if existingQuestions}}
{{#each existingQuestions}}- {{{this}}}
{{/each}}
{{else}}
Aucune.
{{/if}}

Retournez les questions suggérées sous la forme d'un tableau JSON de chaînes de caractères, sous une clé 'suggestedQuestions'.`,
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
