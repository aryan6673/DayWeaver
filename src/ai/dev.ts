import { config } from 'dotenv';
config();

import '@/ai/flows/create-schedule.ts';
import '@/ai/flows/speech-meeting-aware.ts';
import '@/ai/flows/intelligent-task-breakdown.ts';
import '@/ai/flows/dynamic-task-reallocation.ts';