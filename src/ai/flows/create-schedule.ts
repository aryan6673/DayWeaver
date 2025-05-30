// src/ai/flows/create-schedule.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a schedule based on natural language input.
 *
 * - createSchedule - A function that takes a natural language description of a desired schedule and returns a structured schedule.
 * - CreateScheduleInput - The input type for the createSchedule function.
 * - CreateScheduleOutput - The return type for the createSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateScheduleInputSchema = z.object({
  scheduleDescription: z
    .string()
    .describe(
      'A natural language description of the desired schedule, e.g., \'Create a daily routine for JEE prep.\''
    ),
});
export type CreateScheduleInput = z.infer<typeof CreateScheduleInputSchema>;

const CreateScheduleOutputSchema = z.object({
  schedule: z
    .string()
    .describe(
      'A structured schedule generated based on the input description, including work and rest times.'
    ),
});
export type CreateScheduleOutput = z.infer<typeof CreateScheduleOutputSchema>;

export async function createSchedule(input: CreateScheduleInput): Promise<CreateScheduleOutput> {
  return createScheduleFlow(input);
}

const createSchedulePrompt = ai.definePrompt({
  name: 'createSchedulePrompt',
  input: {schema: CreateScheduleInputSchema},
  output: {schema: CreateScheduleOutputSchema},
  prompt: `You are an AI-powered schedule assistant. Your job is to create a smart, segmented schedule with work and rest times based on the user's input.

  User's desired schedule: {{{scheduleDescription}}}
  Remember to segment the schedule into work and rest times.
  Return the schedule as a plain text string.
  `,
});

const createScheduleFlow = ai.defineFlow(
  {
    name: 'createScheduleFlow',
    inputSchema: CreateScheduleInputSchema,
    outputSchema: CreateScheduleOutputSchema,
  },
  async input => {
    const {output} = await createSchedulePrompt(input);
    return output!;
  }
);
