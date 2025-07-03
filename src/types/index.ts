
import type { Timestamp } from 'firebase/firestore';

export type UserProfile = {
  id: string;
  name?: string;
  email?: string;
  age?: number;
  location?: string;
  imageUrl?: string;
  aiHint?: string;
  occupation?: string;
  nationality?: string;
  homeStatus?: string;
  children?: number;
  education?: string;
  languages?: string;
  height?: number;
  weight?: number;
  drinking?: string;
  smoking?: string;
  religion?: string;
  denomination?: string;
  tribe?: string;
  lifestyle?: string;
  relationshipGoals?: string;
  moods?: string;
  appearance?: string;
  interests?: string;
  description?: string;
  photos?: string[];
  city?: string;
  country?: string;
  gender?: 'male' | 'female';
  maritalStatus?: string;
  acceptsPolygamy?: string;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationPhotoUrl?: string; // For admin review
  role?: 'user' | 'admin';
  status?: 'Active' | 'Suspended' | 'Flagged';
  subscription?: 'Free' | 'Premium' | 'Gold' | 'Platinum';
  boosts?: number;
  boostActiveUntil?: Timestamp;
  notifications?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy?: {
    showInSearch: boolean;
    onlyMatchesCanMessage: boolean;
    profileVisibility: 'everyone' | 'subscribers' | 'matches';
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};
