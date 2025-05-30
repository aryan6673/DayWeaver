// 'use server';

/**
 * @fileOverview Breaks down a task into smaller sub-tasks and allocates time slots.
 *
 * - intelligentTaskBreakdown - A function that handles the task breakdown process.
 * - IntelligentTaskBreakdownInput - The input type for the intelligentTaskBreakdown function.
 * - IntelligentTaskBreakdownOutput - The return type for the intelligentTaskBreakdown function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentTaskBreakdownInputSchema = z.object({
  task: z.string().describe('The task to be broken down, including the deadline.'),
});
export type IntelligentTaskBreakdownInput = z.infer<
  typeof IntelligentTaskBreakdownInputSchema
>;

const IntelligentTaskBreakdownOutputSchema = z.object({
  subTasks: z.array(
    z.object({
      name: z.string().describe('The name of the sub-task.'),
      estimatedTime: z
        .string()
        .describe('The estimated time to complete the sub-task (e.g., 1hr, 2hr).'),
    })
  ).describe('The list of sub-tasks with estimated times.'),
});
export type IntelligentTaskBreakdownOutput = z.infer<
  typeof IntelligentTaskBreakdownOutputSchema
>;

export async function intelligentTaskBreakdown(
  input: IntelligentTaskBreakdownInput
): Promise<IntelligentTaskBreakdownOutput> {
  return intelligentTaskBreakdownFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentTaskBreakdownPrompt',
  input: {schema: IntelligentTaskBreakdownInputSchema},
  output: {schema: IntelligentTaskBreakdownOutputSchema},
  prompt: `You are a personal assistant who specializes in breaking down tasks into smaller, manageable sub-tasks and estimating the time required for each.

  Given the following task and deadline, create a list of sub-tasks and estimate the time required for each sub-task.

  Task: {{{task}}}

  Respond in a JSON format.
  `,
});

const intelligentTaskBreakdownFlow = ai.defineFlow(
  {
    name: 'intelligentTaskBreakdownFlow',
    inputSchema: IntelligentTaskBreakdownInputSchema,
    outputSchema: IntelligentTaskBreakdownOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
