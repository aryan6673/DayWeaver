
'use server';
/**
 * @fileOverview Calculates an efficiency score based on task data.
 *
 * - calculateEfficiencyScore - A function that takes tasks and returns an efficiency score and message.
 * - CalculateEfficiencyScoreInput - The input type for the function.
 * - CalculateEfficiencyScoreOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { isPast, parseISO } from 'date-fns';

const AITaskSchema = z.object({
  name: z.string(),
  dueDate: z.string().optional().describe('Task due date in ISO string format'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'inprogress', 'done', 'blocked']),
  category: z.string().optional(),
});

const CalculateEfficiencyScoreInputSchema = z.object({
  tasks: z.array(AITaskSchema).describe('A list of tasks for analysis.'),
  currentDate: z.string().describe('The current date in YYYY-MM-DD format, to help determine if tasks are overdue.')
});
export type CalculateEfficiencyScoreInput = z.infer<typeof CalculateEfficiencyScoreInputSchema>;

const CalculateEfficiencyScoreOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('An efficiency score between 0 and 100.'),
  message: z.string().describe('A qualitative message about the efficiency.'),
  positiveFeedback: z.string().optional().describe('Specific positive feedback or encouragement.'),
  improvementSuggestion: z.string().optional().describe('A suggestion for improvement if applicable.'),
});
export type CalculateEfficiencyScoreOutput = z.infer<typeof CalculateEfficiencyScoreOutputSchema>;

export async function calculateEfficiencyScore(input: CalculateEfficiencyScoreInput): Promise<CalculateEfficiencyScoreOutput> {
  return calculateEfficiencyScoreFlow(input);
}

const calculateEfficiencyScorePrompt = ai.definePrompt({
  name: 'calculateEfficiencyScorePrompt',
  input: {schema: CalculateEfficiencyScoreInputSchema},
  output: {schema: CalculateEfficiencyScoreOutputSchema},
  prompt: `You are an AI assistant that calculates an efficiency score based on a user's task list and the current date.

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
1.  Calculate an efficiency score from 0 to 100.
2.  Consider the following factors:
    *   Completion Rate: Higher percentage of 'done' tasks increases the score.
    *   Overdue Tasks: Tasks with past 'dueDate' that are not 'done' should significantly lower the score. More overdue tasks = lower score.
    *   Blocked Tasks: 'blocked' tasks can slightly lower the score or be mentioned as a factor.
    *   High-Priority Tasks: Timely completion of 'high' priority tasks could boost the score, while overdue high-priority tasks should heavily penalize it.
3.  Provide a 'message' summarizing the efficiency (e.g., "Excellent work!", "Good progress, but some tasks are overdue.", "Needs improvement, many tasks overdue.").
4.  Optionally, provide 'positiveFeedback' (e.g., "Great job completing all high-priority items!") or 'improvementSuggestion' (e.g., "Focus on clearing overdue tasks.").
5.  If no tasks are provided, return a score of 0 and a message like "No tasks available to calculate efficiency."

Base Score Logic (Example, you can refine):
- Start with a base related to completion rate (e.g., (done / total) * 100).
- Penalize for overdue tasks (e.g., -10 points for each overdue task, -20 for overdue high-priority).
- Penalize slightly for blocked tasks.
- Ensure score stays within 0-100.

Return the score, message, and optional feedback/suggestions.
`,
});

const calculateEfficiencyScoreFlow = ai.defineFlow(
  {
    name: 'calculateEfficiencyScoreFlow',
    inputSchema: CalculateEfficiencyScoreInputSchema,
    outputSchema: CalculateEfficiencyScoreOutputSchema,
  },
  async (input) => {
    if (input.tasks.length === 0) {
      return {
        score: 0,
        message: "No tasks available to calculate efficiency.",
      };
    }
    const {output} = await calculateEfficiencyScorePrompt(input);
     if (!output) {
      return { score: 50, message: "Could not analyze efficiency score at this time.", improvementSuggestion: "Please try again later." };
    }
    return output;
  }
);

    