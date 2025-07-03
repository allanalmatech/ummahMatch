'use server';

import { generateProfilePhoto, type PhotoGeneratorInput } from '@/ai/flows/photo-generator-flow';
import { setUserProfile } from '@/services/user-service';
import { revalidatePath } from 'next/cache';

export async function generateAiPhotoAction(input: PhotoGeneratorInput) {
    try {
        const result = await generateProfilePhoto(input);
        return { success: true, photo: result.generatedPhotoDataUri, error: null };
    } catch (error) {
        console.error("Error generating AI photo:", error);
        return { success: false, photo: null, error: 'Failed to generate the photo. Please try again.' };
    }
}

export async function setProfilePictureAction(userId: string, photoDataUri: string) {
    if (!userId || !photoDataUri) {
        return { success: false, error: 'User ID and photo are required.' };
    }
    try {
        await setUserProfile(userId, { imageUrl: photoDataUri });
        revalidatePath(`/profile/edit`);
        revalidatePath(`/users/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("Error setting profile picture:", error);
        return { success: false, error: 'Failed to update your profile picture.' };
    }
}
