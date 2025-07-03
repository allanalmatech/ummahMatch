'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/profile-prompt-generator.ts';
import '@/ai/flows/matchmaking-flow.ts';
import '@/ai/flows/icebreaker-generator.ts';
import '@/ai/flows/photo-generator-flow.ts';
