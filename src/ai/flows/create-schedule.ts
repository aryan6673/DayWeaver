
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
  From the generated schedule, you MUST identify and extract distinct, actionable tasks.

  User's desired schedule: {{{scheduleDescription}}}

  Instructions for Task Generation:
  1.  **Critically analyze the user's 'scheduleDescription'.**
      *   If the input describes a complex plan, multiple activities, or a request to plan a day/period (e.g., "Plan my study day for JEE", "write tasks for my JEE prep of today", "create a workout schedule for the week"), you MUST break down the overall goal into several smaller, specific, and actionable tasks. For example, a "JEE prep" request like "write tasks for my jee prep of today" should result in tasks like "Study Physics - Mechanics for 2 hours", "Solve Chemistry Problems - Stoichiometry (10 problems)", "Revise Math - Algebra chapter 5", etc., NOT a single task named "JEE Prep".
      *   If the input describes a single event but implies multiple steps (e.g., "I have a conference at 6 PM, I have to reach there and then prepare speech"), create separate tasks for each distinct action (e.g., Task 1: "Travel to conference venue", Task 2: "Prepare speech for conference").
      *   If the user explicitly requests a certain number of tasks (e.g., "...write 2 tasks"), make a strong effort to identify and create that many distinct and meaningful tasks if feasible from the description. Do not ignore this request.
      *   For very simple, single-action inputs (e.g., "Meeting at 4 PM"), a single task is appropriate.
  2.  **Task Details:** For each task, provide:
      *   \\\`name\\\`: A concise and specific name for the task (e.g., "Study Physics - Mechanics", "Attend Project Phoenix Meeting", "Travel to conference").
      *   \\\`description\\\`: (Optional) A brief, helpful description (e.g., "Focus on Newton's laws.", "Discuss Q3 roadmap.", "Allow 30 mins for travel").
      *   \\\`category\\\`: (Optional) A suggested category like "Study", "Work", "Personal", "Exercise", "Travel".
      *   \\\`priority\\\`: (Optional) The priority of the task: 'low', 'medium', or 'high'. Default to 'medium' if unsure.
      *   \\\`dueDate\\\`: (Optional) A suggested due date in YYYY-MM-DD format if it can be clearly inferred from the schedule description. Omit if not clear.
  3.  **Output Structure:**
      *   The overall schedule text should be returned in the \\\`scheduleText\\\` field.
      *   The extracted tasks MUST be returned in the \\\`tasks\\\` array. This array's length should reflect the complexity and distinct actions implied by the user's input. If no specific actionable items are identified despite the user's request, the \\\`tasks\\\` array can be empty or omitted.

  Example for \\\`tasks\\\` array when input is "Plan my JEE prep for today. I need to cover Physics, Chemistry, and Math. Give me 3 tasks.":
  [
    { "name": "Study Physics - Kinematics", "description": "Cover chapters 1-3 and solve 10 example problems.", "category": "Study", "priority": "high", "dueDate": "YYYY-MM-DD (today)" },
    { "name": "Practice Chemistry - Chemical Bonding", "description": "Review VBT and MOT, practice 15 MCQs.", "category": "Study", "priority": "high", "dueDate": "YYYY-MM-DD (today)" },
    { "name": "Solve Math Problems - Calculus", "description": "Work through differentiation exercises from chapter 2.", "category": "Study", "priority": "medium", "dueDate": "YYYY-MM-DD (today)" }
  ]

  Example for \\\`tasks\\\` array when input is "Team meeting tomorrow at 10 AM about project Alpha":
  [
    { "name": "Team Meeting: Project Alpha", "description": "Discuss project Alpha status.", "category": "Work", "priority": "medium", "dueDate": "YYYY-MM-DD (inferred date)" }
  ]

  Focus on creating tasks that are specific and actionable items that can be checked off a to-do list.
  Do not just copy large parts of the schedule text for a task name or description.
  `
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
