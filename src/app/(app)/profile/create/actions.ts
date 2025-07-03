'use server';

import { generateProfileSuggestions, type ProfilePromptInput } from '@/ai/flows/profile-prompt-generator';

export async function getProfileSuggestions(input: ProfilePromptInput) {
  try {
    const result = await generateProfileSuggestions(input);
    return { suggestions: result.suggestions, error: null };
  } catch (error) {
    console.error('Error generating profile suggestions:', error);
    return { suggestions: null, error: 'Failed to generate suggestions. Please try again.' };
  }
}
