
'use server';
/**
 * @fileOverview Analyzes task data to estimate time usage across different categories for a weekly view.
 *
 * - analyzeTimeUsage - A function that takes tasks and returns weekly time usage estimates.
 * - AnalyzeTimeUsageInput - The input type for the analyzeTimeUsage function.
 * - AnalyzeTimeUsageOutput - The return type for the analyzeTimeUsage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { format, parseISO, getDay, startOfWeek, addDays } from 'date-fns';

// Simplified Task structure for AI input
const AITaskSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  dueDate: z.string().optional().describe('Task due date in ISO string format, e.g., YYYY-MM-DDTHH:mm:ss.sssZ'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'inprogress', 'done', 'blocked']),
  category: z.string().optional().describe('User-defined category, e.g., Work, Study, Personal'),
});

const AnalyzeTimeUsageInputSchema = z.object({
  tasks: z.array(AITaskSchema).describe('A list of tasks for analysis.'),
  currentDate: z.string().describe('The current date in YYYY-MM-DD format, to help determine the relevant week for analysis.')
});
export type AnalyzeTimeUsageInput = z.infer<typeof AnalyzeTimeUsageInputSchema>;

const DailyTimeUsageSchema = z.object({
  day: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
  Study: z.number().default(0).describe('Estimated hours spent on Study.'),
  Work: z.number().default(0).describe('Estimated hours spent on Work.'),
  Personal: z.number().default(0).describe('Estimated hours spent on Personal tasks/activities.'),
  Chill: z.number().default(0).describe('Estimated hours spent on Chill/Relaxation. This may be an assumption if not directly inferable from tasks.'),
  Sleep: z.number().default(0).describe('Estimated hours spent on Sleep. This may be an assumption if not directly inferable from tasks.'),
});

const AnalyzeTimeUsageOutputSchema = z.object({
  weeklyUsage: z.array(DailyTimeUsageSchema).length(7).describe('An array of 7 objects, one for each day of the week (Mon-Sun), showing estimated time usage.'),
  analysisSummary: z.string().optional().describe('A brief summary or any assumptions made during the analysis.'),
});
export type AnalyzeTimeUsageOutput = z.infer<typeof AnalyzeTimeUsageOutputSchema>;

export async function analyzeTimeUsage(input: AnalyzeTimeUsageInput): Promise<AnalyzeTimeUsageOutput> {
  return analyzeTimeUsageFlow(input);
}

const analyzeTimeUsagePrompt = ai.definePrompt({
  name: 'analyzeTimeUsagePrompt',
  input: {schema: AnalyzeTimeUsageInputSchema},
  output: {schema: AnalyzeTimeUsageOutputSchema},
  prompt: `You are an AI assistant that analyzes a list of tasks to estimate weekly time usage.
The user will provide a list of tasks and the current date. Analyze tasks for the week (Monday to Sunday) that includes the 'currentDate'.

Tasks:
{{#each tasks}}
- Name: {{name}}
  {{#if description}}Description: {{description}}{{/if}}
  {{#if category}}Category: {{category}}{{/if}}
  {{#if dueDate}}Due Date: {{formatISO dueDate}}{{/if}}
  Status: {{status}}
  {{#if priority}}Priority: {{priority}}{{/if}}
{{else}}
No tasks provided.
{{/each}}

Current Date: {{{currentDate}}}

Instructions:
1.  Determine the week (Monday to Sunday) based on the 'currentDate'.
2.  For each day of that week, estimate hours spent on the following categories: "Study", "Work", "Personal".
    *   Use the task's 'category' field primarily. If 'category' is 'Study', 'Learn', etc., map it to "Study". If 'Work', 'Project', 'Client', map to "Work". Other relevant categories like 'Appointment', 'Errand' map to "Personal".
    *   If a task's due date falls on a specific day, consider it for that day's estimation.
    *   Estimate hours: A single task might represent 1-2 hours. Multiple tasks in a category on one day mean more hours. Use your judgment.
3.  For "Chill" and "Sleep" categories:
    *   These are unlikely to be directly represented by tasks.
    *   Provide reasonable default estimates (e.g., Sleep: 7-8 hours/day, Chill: 1-3 hours/day). Clearly state if these are assumptions in the 'analysisSummary'.
4.  The output MUST be an array of 7 objects, one for each day from Monday to Sunday for the identified week, in the format specified by 'DailyTimeUsageSchema'. Each object must contain 'day', 'Study', 'Work', 'Personal', 'Chill', and 'Sleep' fields with estimated hours.
5.  Provide a brief 'analysisSummary' if you made significant assumptions (e.g., about "Chill" and "Sleep" times, or how hours were estimated from tasks).

Example for one day in the output array:
{ "day": "Mon", "Study": 3, "Work": 4, "Personal": 1, "Chill": 2, "Sleep": 8 }

Make sure to return data for all 7 days of the week (Mon-Sun).
If no tasks fall into a specific category for a day, output 0 for that category's hours.
The order of days in the 'weeklyUsage' array should be Mon, Tue, Wed, Thu, Fri, Sat, Sun.
`,
});

const analyzeTimeUsageFlow = ai.defineFlow(
  {
    name: 'analyzeTimeUsageFlow',
    inputSchema: AnalyzeTimeUsageInputSchema,
    outputSchema: AnalyzeTimeUsageOutputSchema,
  },
  async (input) => {
    // Helper function to format ISO date, as Handlebars might not have it.
    // This is not directly used by Handlebars in this version but good for other contexts.
    const formattedInput = {
      ...input,
      tasks: input.tasks.map(task => ({
        ...task,
        // @ts-ignore
        formatISO: (dateString?: string) => dateString ? format(parseISO(dateString), 'yyyy-MM-dd HH:mm') : 'N/A'
      }))
    };

    const {output} = await analyzeTimeUsagePrompt(formattedInput);
    if (!output) {
      // Fallback if AI returns nothing, ensure 7 days structure
      const today = input.currentDate ? parseISO(input.currentDate) : new Date();
      const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
      const fallbackWeeklyUsage = days.map(day => ({
        day: day, Study: 0, Work: 0, Personal: 0, Chill: 2, Sleep: 8
      }));
      return { weeklyUsage: fallbackWeeklyUsage, analysisSummary: "AI analysis failed, showing default estimates." };
    }
     // Ensure the output always has 7 days in the correct order, even if AI misses some
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
    const completeWeeklyUsage = daysOfWeek.map(dayName => {
      const foundDay = output.weeklyUsage.find(d => d.day === dayName);
      if (foundDay) return foundDay;
      return { day: dayName, Study: 0, Work: 0, Personal: 0, Chill: Math.floor(Math.random()*2)+1, Sleep: Math.floor(Math.random()*2)+7 }; // Default if AI missed a day
    });


    return { ...output, weeklyUsage: completeWeeklyUsage };
  }
);

    