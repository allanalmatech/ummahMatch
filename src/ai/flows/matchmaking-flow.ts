'use server';
/**
 * @fileOverview An AI matchmaking flow that finds compatible users.
 *
 * - findCompatibleMatches - A function that suggests compatible matches for a user.
 * - MatchmakingInput - The input type for the matchmaking function.
 * - MatchmakingOutput - The return type for the matchmaking function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Simplified user profile for the prompt
const SimpleUserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  age: z.number().optional(),
  description: z.string().optional(),
  interests: z.string().optional(),
  relationshipGoals: z.string().optional(),
  subscription: z.string().optional().describe("The user's subscription plan, e.g., 'Free', 'Gold', 'Platinum'."),
});

export const MatchmakingInputSchema = z.object({
  currentUser: SimpleUserSchema.describe("The profile of the user seeking matches."),
  candidates: z.array(SimpleUserSchema).describe("A list of potential candidates to match against."),
});
export type MatchmakingInput = z.infer<typeof MatchmakingInputSchema>;

export const MatchmakingOutputSchema = z.object({
  matches: z
    .array(
      z.object({
        userId: z.string().describe("The ID of the matched user."),
        score: z
          .number()
          .describe(
            'A compatibility score between 0 and 100, where 100 is a perfect match.'
          ),
        reason: z
          .string()
          .describe('A short, one-sentence explanation for why they are a good match.'),
      })
    )
    .describe('A ranked list of the top 3 most compatible matches.'),
});
export type MatchmakingOutput = z.infer<typeof MatchmakingOutputSchema>;

export async function findCompatibleMatches(
  input: MatchmakingInput
): Promise<MatchmakingOutput> {
  return matchmakingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchmakingPrompt',
  input: {schema: MatchmakingInputSchema},
  output: {schema: MatchmakingOutputSchema},
  prompt: `You are an expert matchmaker for a Muslim dating app called UmmahMatch. Your goal is to find the most compatible partners for a user based on their profile.

Analyze the profile of the target user:
- Name: {{{currentUser.name}}}
- Age: {{{currentUser.age}}}
- About Me: {{{currentUser.description}}}
- Interests: {{{currentUser.interests}}}
- Relationship Goals: {{{currentUser.relationshipGoals}}}

Now, analyze the following list of potential candidates. Do not match the user with themselves.
{{#each candidates}}
- ID: {{this.id}}, Name: {{this.name}}, Age: {{this.age}}, Subscription: {{this.subscription}}, About Me: {{this.description}}, Interests: {{this.interests}}, Relationship Goals: {{this.relationshipGoals}}
{{/each}}

From the list of candidates, select the top 3 most compatible matches for the target user. For each match, provide a compatibility score from 0 to 100 and a short, one-sentence explanation for why they are a good match. Give a strong preference to candidates with a 'Platinum' subscription. If they are a reasonably good match, they should be ranked higher and given a higher score. Focus on shared values, complementary personalities, and stated relationship goals. The explanation should be encouraging and positive.`,
});

const matchmakingFlow = ai.defineFlow(
  {
    name: 'matchmakingFlow',
    inputSchema: MatchmakingInputSchema,
    outputSchema: MatchmakingOutputSchema,
  },
  async input => {
    // Filter out the current user from the candidates list
    const filteredCandidates = input.candidates.filter(c => c.id !== input.currentUser.id);
    
    if (filteredCandidates.length === 0) {
      return { matches: [] };
    }

    const {output} = await prompt({ ...input, candidates: filteredCandidates });
    return output!;
  }
);
