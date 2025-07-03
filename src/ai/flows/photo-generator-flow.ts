'use server';
/**
 * @fileOverview An AI flow that generates a new profile picture.
 *
 * - generateProfilePhoto - A function that generates a new photo based on an input image.
 * - PhotoGeneratorInput - The input type for the photo generator function.
 * - PhotoGeneratorOutput - The return type for the photo generator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const PhotoGeneratorInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PhotoGeneratorInput = z.infer<typeof PhotoGeneratorInputSchema>;

export const PhotoGeneratorOutputSchema = z.object({
  generatedPhotoDataUri: z.string().describe('The generated photo as a data URI.'),
});
export type PhotoGeneratorOutput = z.infer<typeof PhotoGeneratorOutputSchema>;

export async function generateProfilePhoto(
  input: PhotoGeneratorInput
): Promise<PhotoGeneratorOutput> {
  return photoGeneratorFlow(input);
}

const photoGeneratorFlow = ai.defineFlow(
  {
    name: 'photoGeneratorFlow',
    inputSchema: PhotoGeneratorInputSchema,
    outputSchema: PhotoGeneratorOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        { media: { url: input.photoDataUri } },
        { text: 'Generate a professional, high-quality, friendly headshot for a dating profile based on the person in the provided image. The style should be photorealistic. The person should be smiling warmly. The background should be simple and not distracting, like a soft-focus outdoor setting or a neutral studio background.' },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error('Image generation failed.');
    }

    return { generatedPhotoDataUri: media.url };
  }
);
