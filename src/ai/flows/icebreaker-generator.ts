'use server';
/**
 * @fileOverview An AI flow that generates conversation starters (icebreakers).
 *
 * - generateIcebreakers - A function that suggests icebreakers for a user to send.
 * - IcebreakerInput - The input type for the icebreaker generator function.
 * - IcebreakerOutput - The return type for the icebreaker generator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// A simplified user profile schema for the prompt context
const SimpleUserSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  interests: z.string().optional(),
  occupation: z.string().optional(),
});

export const IcebreakerInputSchema = z.object({
  sender: SimpleUserSchema.describe("The profile of the user sending the message."),
  receiver: SimpleUserSchema.describe("The profile of the user receiving the message."),
});
export type IcebreakerInput = z.infer<typeof IcebreakerInputSchema>;

export const IcebreakerOutputSchema = z.object({
  icebreakers: z.array(z.string()).describe('A list of 3-4 creative and respectful icebreaker messages.'),
});
export type IcebreakerOutput = z.infer<typeof IcebreakerOutputSchema>;

export async function generateIcebreakers(
  input: IcebreakerInput
): Promise<IcebreakerOutput> {
  return icebreakerGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'icebreakerPrompt',
  input: {schema: IcebreakerInputSchema},
  output: {schema: IcebreakerOutputSchema},
  prompt: `You are a helpful and creative assistant for a Muslim dating app called UmmahMatch. Your task is to generate thoughtful and engaging icebreaker messages for a user to send to someone they've matched with.

The messages should be respectful, friendly, and personalized based on the profiles provided. Avoid generic compliments about looks. Instead, focus on shared interests, intriguing details in their bio, or common goals.

Here is the sender's profile:
- Name: {{{sender.name}}}
- About Me: {{{sender.description}}}
- Interests: {{{sender.interests}}}
- Occupation: {{{sender.occupation}}}

Here is the receiver's profile:
- Name: {{{receiver.name}}}
- About Me: {{{receiver.description}}}
- Interests: {{{receiver.interests}}}
- Occupation: {{{receiver.occupation}}}

Generate 3 unique icebreaker suggestions. The suggestions should be short, one or two sentences at most. They should be framed as if "{{{sender.name}}}" is speaking.`,
});

const icebreakerGeneratorFlow = ai.defineFlow(
  {
    name: 'icebreakerGeneratorFlow',
    inputSchema: IcebreakerInputSchema,
    outputSchema: IcebreakerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
