'use server';

/**
 * @fileOverview This file defines a Genkit flow for dynamically reallocating tasks based on user input.
 *
 * - dynamicTaskReallocation - A function that handles the task reallocation process.
 * - DynamicTaskReallocationInput - The input type for the dynamicTaskReallocation function.
 * - DynamicTaskReallocationOutput - The return type for the dynamicTaskReallocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DynamicTaskReallocationInputSchema = z.object({
  reason: z.string().describe('The reason for rescheduling tasks (e.g., I have a fever today).'),
  currentTasks: z.array(z.object({
    name: z.string().describe('The name of the task.'),
    dueDate: z.string().describe('The due date of the task in ISO format (YYYY-MM-DD).'),
    duration: z.number().describe('The estimated duration of the task in hours.'),
  })).describe('A list of current tasks to be reallocated.'),
});

export type DynamicTaskReallocationInput = z.infer<typeof DynamicTaskReallocationInputSchema>;

const DynamicTaskReallocationOutputSchema = z.object({
  rescheduledTasks: z.array(z.object({
    name: z.string().describe('The name of the rescheduled task.'),
    newDueDate: z.string().describe('The new due date of the task in ISO format (YYYY-MM-DD).'),
  })).describe('A list of tasks that have been rescheduled with their new due dates.'),
  summary: z.string().describe('A summary of the rescheduling changes made.'),
});

export type DynamicTaskReallocationOutput = z.infer<typeof DynamicTaskReallocationOutputSchema>;

export async function dynamicTaskReallocation(input: DynamicTaskReallocationInput): Promise<DynamicTaskReallocationOutput> {
  return dynamicTaskReallocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dynamicTaskReallocationPrompt',
  input: {schema: DynamicTaskReallocationInputSchema},
  output: {schema: DynamicTaskReallocationOutputSchema},
  prompt: `You are an AI assistant specialized in dynamically reallocating tasks.

  The user is rescheduling tasks because of the following reason: {{{reason}}}.

  Here are the current tasks:
  {{#each currentTasks}}
  - Name: {{{name}}}, Due Date: {{{dueDate}}}, Duration: {{{duration}}} hours
  {{/each}}

  Reschedule the tasks considering the reason and try to balance the load across future free slots.
  Provide a summary of the changes made.

  Output the rescheduled tasks with their new due dates and a summary of changes.
  Ensure that the new due dates are in ISO format (YYYY-MM-DD).
  Be as concise as possible in the summary.`,
});

const dynamicTaskReallocationFlow = ai.defineFlow(
  {
    name: 'dynamicTaskReallocationFlow',
    inputSchema: DynamicTaskReallocationInputSchema,
    outputSchema: DynamicTaskReallocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
