
// src/ai/flows/create-schedule.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for creating a schedule based on natural language input.
 * It now also extracts actionable tasks with more structured properties from the schedule.
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
  name: z.string().describe("A concise name for the actionable task. Should be distinct and not a copy of large schedule text."),
  description: z.string().optional().describe("A brief description of the task."),
  category: z.string().optional().describe("A suggested category for the task (e.g., Work, Study, Personal, Exercise)."),
  priority: z.enum(['low', 'medium', 'high']).optional().describe("The priority of the task ('low', 'medium', 'high'). Default to 'medium' if unsure."),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("The suggested due date for the task in YYYY-MM-DD format, if inferable. Omit if not applicable or too general.")
});

const CreateScheduleOutputSchema = z.object({
  scheduleText: z
    .string()
    .describe(
      'A structured schedule generated based on the input description, including work and rest times. This is the main textual schedule.'
    ),
  tasks: z.array(AITaskEntrySchema).optional().describe("A list of distinct, actionable tasks extracted or inferred from the schedule. Focus on main activities and break them down if necessary.")
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
  Crucially, from the generated schedule, you MUST identify and extract **multiple distinct, actionable tasks**. Break down broader activities into smaller, manageable sub-tasks if necessary to achieve this. Each task should represent a specific, checkable item.

  User's desired schedule: {{{scheduleDescription}}}

  Instructions:
  1. Generate the overall schedule. This should be returned in the 'scheduleText' field.
  2. From the generated schedule, extract **multiple, distinct, and actionable tasks**. Avoid creating one large task that simply mirrors the schedule. Instead, break down the schedule into several smaller, specific tasks. Do not just copy large parts of the schedule text for a task name or description.
     For each task, provide:
     - name: A concise and specific name for the task (e.g., "Complete Chapter 3 Math exercises", "Draft introduction for report").
     - description: (Optional) A brief, helpful description (e.g., "Focus on kinematics formulas.", "Cover key findings from Q1.").
     - category: (Optional) A suggested category like "Study", "Work", "Personal", "Exercise".
     - priority: (Optional) The priority of the task: 'low', 'medium', or 'high'. Default to 'medium' if unsure.
     - dueDate: (Optional) A suggested due date in YYYY-MM-DD format if it can be clearly inferred from the schedule description (e.g., if the user mentions "for tomorrow" or "by Friday"). Omit if not clear.
  3. Return these tasks in the 'tasks' array. This array should ideally contain several tasks. If no specific tasks can be identified (which should be rare for a schedule), the 'tasks' array can be empty or omitted.
  4. Ensure the 'scheduleText' field contains the full, human-readable schedule.
  5. Ensure the 'tasks' field contains the list of extracted tasks with the specified properties.

  Example for 'tasks' array (notice multiple distinct tasks):
  [
    { "name": "Review Physics Chapter 5", "description": "Focus on kinematics formulas.", "category": "Study", "priority": "high", "dueDate": "2024-08-15" },
    { "name": "Morning Jog", "category": "Exercise", "priority": "medium" },
    { "name": "Outline blog post", "description": "Draft main sections for the new article.", "category": "Work", "priority": "medium", "dueDate": "2024-08-16" },
    { "name": "Client Call Prep", "description": "Review notes for Acme Corp meeting.", "category": "Work", "priority": "high" }
  ]

  Focus on creating tasks that are specific and actionable items that can be checked off a to-do list. The more granular and distinct the tasks, the better.
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

