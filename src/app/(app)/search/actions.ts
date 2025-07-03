
'use server';

import { searchUsers as searchUsersInDb } from '@/services/user-service';

export async function searchProfiles(formData: FormData) {
  try {
    const filters: { [key: string]: any } = {};

    const currentUserId = formData.get('currentUserId') as string;
    if (!currentUserId) {
      return { users: [], error: 'You must be logged in to search.' };
    }

    const addFilter = (key: string, value: FormDataEntryValue | null) => {
        if (value && value !== '') {
            filters[key] = value;
        }
    };

    addFilter('gender', formData.get('gender'));
    addFilter('minAge', formData.get('minAge'));
    addFilter('maxAge', formData.get('maxAge'));
    addFilter('maritalStatus', formData.get('maritalStatus'));
    addFilter('country', formData.get('country'));
    addFilter('city', formData.get('city'));
    addFilter('nationality', formData.get('nationality'));
    addFilter('appearance', formData.get('appearance'));
    addFilter('minHeight', formData.get('minHeight'));
    addFilter('maxHeight', formData.get('maxHeight'));
    addFilter('minWeight', formData.get('minWeight'));
    addFilter('maxWeight', formData.get('maxWeight'));
    addFilter('ethnicity', formData.get('ethnicity'));
    addFilter('lifestyle', formData.get('lifestyle'));
    addFilter('smoking', formData.get('smoking'));
    addFilter('drinking', formData.get('drinking'));
    addFilter('children', formData.get('children'));
    addFilter('occupation', formData.get('occupation'));
    addFilter('homeStatus', formData.get('homeStatus'));
    addFilter('education', formData.get('education'));
    addFilter('languages', formData.get('languages'));
    addFilter('polygamy', formData.get('polygamy'));
    addFilter('denomination', formData.get('denomination'));
    addFilter('description', formData.get('description'));
    
    const users = await searchUsersInDb(currentUserId, filters);
    return { users };
  } catch (error) {
    console.error('Search failed:', error);
    return { error: 'An unexpected error occurred during the search. Please try again.' };
  }
}
