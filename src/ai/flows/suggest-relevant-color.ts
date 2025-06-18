'use server';

/**
 * @fileOverview A flow to suggest a relevant color based on the current day, season, or upcoming holidays.
 *
 * - suggestRelevantColor - A function that suggests a color that may be relevant to the current day, season, or upcoming holidays.
 * - SuggestRelevantColorInput - The input type for the suggestRelevantColor function.
 * - SuggestRelevantColorOutput - The return type for the suggestRelevantColor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantColorInputSchema = z.object({
  currentDate: z.string().describe('The current date.'),
});
export type SuggestRelevantColorInput = z.infer<typeof SuggestRelevantColorInputSchema>;

const SuggestRelevantColorOutputSchema = z.object({
  colorSuggestion: z.string().describe('A color suggestion relevant to the current day, season, or upcoming holidays.'),
  reason: z.string().describe('The reason for the color suggestion.'),
});
export type SuggestRelevantColorOutput = z.infer<typeof SuggestRelevantColorOutputSchema>;

export async function suggestRelevantColor(input: SuggestRelevantColorInput): Promise<SuggestRelevantColorOutput> {
  return suggestRelevantColorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantColorPrompt',
  input: {schema: SuggestRelevantColorInputSchema},
  output: {schema: SuggestRelevantColorOutputSchema},
  prompt: `Suggest a color that may be relevant to the current day, season, or upcoming holidays.

  Today's date is: {{{currentDate}}}

  Respond with a JSON object that contains a colorSuggestion and a reason for the suggestion.
  The colorSuggestion should be a valid CSS color name or a hex code.
  Consider common holidays and seasons when suggesting the color.
  Be concise.
  `,
});

const suggestRelevantColorFlow = ai.defineFlow(
  {
    name: 'suggestRelevantColorFlow',
    inputSchema: SuggestRelevantColorInputSchema,
    outputSchema: SuggestRelevantColorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
