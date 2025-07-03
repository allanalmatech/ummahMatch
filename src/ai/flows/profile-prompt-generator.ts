'use server';

/**
 * @fileOverview Generates AI-powered suggestions for improving a user's profile description.
 *
 * - generateProfileSuggestions - A function that generates profile description suggestions.
 * - ProfilePromptInput - The input type for the generateProfileSuggestions function.
 * - ProfilePromptOutput - The return type for the generateProfileSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfilePromptInputSchema = z.object({
  currentDescription: z
    .string()
    .describe('The user’s current profile description.'),
  relationshipGoals: z.string().describe('The user’s relationship goals.'),
  lifestyle: z.string().describe('The user’s lifestyle.'),
  moods: z.string().describe('The user’s current moods.'),
  interests: z.string().describe('The user’s interests.'),
});
export type ProfilePromptInput = z.infer<typeof ProfilePromptInputSchema>;

const ProfilePromptOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('AI-powered suggestions for improving the profile description.'),
});
export type ProfilePromptOutput = z.infer<typeof ProfilePromptOutputSchema>;

export async function generateProfileSuggestions(
  input: ProfilePromptInput
): Promise<ProfilePromptOutput> {
  return profilePromptGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'profilePromptGeneratorPrompt',
  input: {schema: ProfilePromptInputSchema},
  output: {schema: ProfilePromptOutputSchema},
  prompt: `You are an AI assistant designed to help users improve their dating profile descriptions.

  Provide three distinct suggestions for improving the user's profile description, based on the
  information provided. The suggestions should be creative, engaging, and tailored to attract compatible matches.
  The output should be an array of strings, each representing a suggestion. Each suggestion should be different, unique, and not redundant.

  Here is the user's current profile information:

  Current Description: {{{currentDescription}}}
  Relationship Goals: {{{relationshipGoals}}}
  Lifestyle: {{{lifestyle}}}
  Moods: {{{moods}}}
  Interests: {{{interests}}}

  Suggestions:
  `,
});

const profilePromptGeneratorFlow = ai.defineFlow(
  {
    name: 'profilePromptGeneratorFlow',
    inputSchema: ProfilePromptInputSchema,
    outputSchema: ProfilePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
