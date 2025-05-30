
// src/ai/flows/create-schedule.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a schedule based on natural language input.
 * It now also extracts actionable tasks from the schedule.
 *
 * - createSchedule - A function that takes a natural language description of a desired schedule
 *                    and returns a structured schedule text and a list of tasks.
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

const AITaskEntrySchema = z.object({
  name: z.string().describe("The name of the task."),
  description: z.string().optional().describe("A brief description of the task."),
  category: z.string().optional().describe("A suggested category for the task (e.g., Work, Study, Personal).")
});

const CreateScheduleOutputSchema = z.object({
  scheduleText: z
    .string()
    .describe(
      'A structured schedule generated based on the input description, including work and rest times. This is the main textual schedule.'
    ),
  tasks: z.array(AITaskEntrySchema).optional().describe("A list of actionable tasks extracted or inferred from the schedule. This might be empty or undefined if no specific tasks are discernible. Focus on main activities.")
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
  Additionally, identify and list key actionable tasks from the schedule.

  User's desired schedule: {{{scheduleDescription}}}

  Instructions:
  1. Generate the overall schedule. This should be returned in the 'scheduleText' field.
  2. From the generated schedule, extract key actionable tasks. For each task, provide:
     - name: A concise name for the task.
     - description: (Optional) A brief description.
     - category: (Optional) A suggested category like "Study", "Work", "Personal", "Exercise".
  3. Return these tasks in the 'tasks' array. If no specific tasks can be identified, the 'tasks' array can be empty or omitted.
  4. Ensure the 'scheduleText' field contains the full, human-readable schedule.
  5. Ensure the 'tasks' field contains the list of extracted tasks.

  Example for 'tasks' array:
  [
    { "name": "Review Physics Chapter 5", "description": "Focus on kinematics formulas.", "category": "Study" },
    { "name": "Morning Jog", "category": "Exercise" }
  ]
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
