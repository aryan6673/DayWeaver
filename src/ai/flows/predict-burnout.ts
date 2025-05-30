
'use server';
/**
 * @fileOverview Predicts burnout risk based on task data.
 *
 * - predictBurnout - A function that takes tasks and returns a burnout risk assessment.
 * - PredictBurnoutInput - The input type for the function.
 * - PredictBurnoutOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { isPast, parseISO, differenceInDays } from 'date-fns';

const AITaskSchema = z.object({
  name: z.string(),
  dueDate: z.string().optional().describe('Task due date in ISO string format'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'inprogress', 'done', 'blocked']),
  category: z.string().optional(),
});

const PredictBurnoutInputSchema = z.object({
  tasks: z.array(AITaskSchema).describe('A list of tasks for analysis.'),
  currentDate: z.string().describe('The current date in YYYY-MM-DD format, to help assess task urgency and overdue status.')
});
export type PredictBurnoutInput = z.infer<typeof PredictBurnoutInputSchema>;

const PredictBurnoutOutputSchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high']).describe('The predicted burnout risk level.'),
  progressValue: z.number().min(0).max(100).describe('A numerical value (0-100) representing the risk, for UI progress bar (higher means higher risk).'),
  message: z.string().describe('A message explaining the risk level and offering advice.'),
  contributingFactors: z.array(z.string()).optional().describe('List of key factors contributing to the risk assessment.'),
});
export type PredictBurnoutOutput = z.infer<typeof PredictBurnoutOutputSchema>;

export async function predictBurnout(input: PredictBurnoutInput): Promise<PredictBurnoutOutput> {
  return predictBurnoutFlow(input);
}

const predictBurnoutPrompt = ai.definePrompt({
  name: 'predictBurnoutPrompt',
  input: {schema: PredictBurnoutInputSchema},
  output: {schema: PredictBurnoutOutputSchema},
  prompt: `You are an AI assistant that predicts potential burnout risk based on a user's task list and the current date.

Tasks:
{{#each tasks}}
- Name: {{name}}
  Status: {{status}}
  {{#if dueDate}}Due Date: {{dueDate}}{{/if}}
  {{#if priority}}Priority: {{priority}}{{/if}}
{{else}}
No tasks provided.
{{/each}}

Current Date: {{{currentDate}}}

Instructions:
1.  Assess the burnout risk as 'low', 'medium', or 'high'.
2.  Provide a 'progressValue' (0-100) reflecting this risk: Low (10-39), Medium (40-69), High (70-99).
3.  Consider these factors for risk assessment:
    *   Task Load: A large number of 'todo' or 'inprogress' tasks increases risk.
    *   Overdue Tasks: Many tasks with past 'dueDate' that are not 'done' significantly increase risk.
    *   Deadline Density: Many tasks due soon (e.g., within next few days) increases risk.
    *   High-Priority Load: A high number of 'high' priority tasks, especially if overdue or imminent, increases risk.
    *   Blocked Tasks: Many 'blocked' tasks can contribute to frustration and risk.
    *   Lack of 'Done' Tasks: A low proportion of 'done' tasks compared to active ones can indicate falling behind.
4.  Provide a 'message' explaining the risk level. For 'low' risk, be encouraging. For 'medium', suggest caution and breaks. For 'high', strongly advise rest, reprioritization, or seeking help.
5.  Optionally, list key 'contributingFactors' (e.g., "High number of overdue tasks", "Many high-priority items due this week").
6.  If no tasks are provided or very few low-priority tasks, typically it's 'low' risk.

Example for high risk:
{ "riskLevel": "high", "progressValue": 85, "message": "Warning: Your current task load and upcoming deadlines indicate a high risk of burnout. Prioritize rest, consider deferring non-essential tasks, and break down larger tasks.", "contributingFactors": ["Large number of high-priority tasks due soon", "Several tasks are already overdue"] }

Example for low risk:
{ "riskLevel": "low", "progressValue": 20, "message": "You're maintaining a healthy balance with your tasks. Keep up the great work and remember to take regular breaks!", "contributingFactors": ["Manageable task load", "Most tasks are on schedule"] }

Return the riskLevel, progressValue, and message.
`,
});

const predictBurnoutFlow = ai.defineFlow(
  {
    name: 'predictBurnoutFlow',
    inputSchema: PredictBurnoutInputSchema,
    outputSchema: PredictBurnoutOutputSchema,
  },
  async (input) => {
    if (input.tasks.length === 0) {
      return {
        riskLevel: 'low',
        progressValue: 10,
        message: "No tasks to analyze. Enjoy your free time, but remember to plan ahead!",
      };
    }
    const {output} = await predictBurnoutPrompt(input);
    if (!output) {
      return { riskLevel: 'medium', progressValue: 50, message: "Could not analyze burnout risk at this time. Please ensure you are managing your workload effectively.", contributingFactors: ["AI analysis unavailable"] };
    }
    return output;
  }
);

    