
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
      'A natural language description of the desired schedule, e.g., \'Create a daily routine for JEE prep.\' or \'I have a meeting at 4 PM tomorrow.\''
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
  tasks: z.array(AITaskEntrySchema).optional().describe("A list of distinct, actionable tasks extracted or inferred from the schedule. For complex inputs, this list should contain multiple tasks. For simple inputs (e.g., a single meeting), it might contain only one task or be empty if no specific actionable item is identified.")
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
  From the generated schedule, you should identify and extract distinct, actionable tasks.

  User's desired schedule: {{{scheduleDescription}}}

  Instructions:
  1. Generate the overall schedule. This should be returned in the 'scheduleText' field.
  2. From the generated schedule, extract distinct and actionable tasks.
     - If the user's input describes a complex plan or multiple activities (e.g., "Plan my study day for JEE"), break down the schedule into several smaller, specific tasks.
     - If the user's input describes a single event (e.g., "Meeting at 4 PM"), you might generate a single task for that event.
     - Avoid creating one large task that simply mirrors the schedule text. Instead, aim for granularity where appropriate.
     - Do not just copy large parts of the schedule text for a task name or description.
     For each task, provide:
     - name: A concise and specific name for the task (e.g., "Complete Chapter 3 Math exercises", "Attend Project Phoenix Meeting").
     - description: (Optional) A brief, helpful description (e.g., "Focus on kinematics formulas.", "Discuss Q3 roadmap.").
     - category: (Optional) A suggested category like "Study", "Work", "Personal", "Exercise".
     - priority: (Optional) The priority of the task: 'low', 'medium', or 'high'. Default to 'medium' if unsure.
     - dueDate: (Optional) A suggested due date in YYYY-MM-DD format if it can be clearly inferred from the schedule description (e.g., if the user mentions "for tomorrow" or "by Friday"). Omit if not clear.
  3. Return these tasks in the 'tasks' array. This array should contain tasks reflecting the complexity of the input. If no specific tasks can be identified, the 'tasks' array can be empty or omitted.
  4. Ensure the 'scheduleText' field contains the full, human-readable schedule.
  5. Ensure the 'tasks' field contains the list of extracted tasks with the specified properties.

  Example for 'tasks' array when input is complex (e.g., "Daily routine for JEE prep"):
  [
    { "name": "Review Physics Chapter 5", "description": "Focus on kinematics formulas.", "category": "Study", "priority": "high", "dueDate": "2024-08-15" },
    { "name": "Practice Math Problems - Algebra", "category": "Study", "priority": "high" },
    { "name": "Chemistry Revision - Organic", "category": "Study", "priority": "medium", "dueDate": "2024-08-16" },
    { "name": "Short Break - Walk", "category": "Personal", "priority": "low" }
  ]

  Example for 'tasks' array when input is simple (e.g., "Team meeting tomorrow at 10 AM about project Alpha"):
  [
    { "name": "Team Meeting: Project Alpha", "description": "Discuss project Alpha status.", "category": "Work", "priority": "medium", "dueDate": "YYYY-MM-DD (inferred date)" }
  ]

  Focus on creating tasks that are specific and actionable items that can be checked off a to-do list. The granularity of tasks should match the user's input.
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

