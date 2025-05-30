'use server';

/**
 * @fileOverview Implements the Speech + Meeting Aware feature: adjusts schedule based on calendar events,
 * compressing tasks and generating reminders/checklists.
 *
 * - speechMeetingAware - Main function to handle schedule adjustments.
 * - SpeechMeetingAwareInput - Input type for the function.
 * - SpeechMeetingAwareOutput - Return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpeechMeetingAwareInputSchema = z.object({
  calendarEvent: z
    .string()
    .describe('The calendar event details, including title and time.'),
  currentTasks: z
    .string()
    .describe('A list of current tasks and their allocated times.'),
});
export type SpeechMeetingAwareInput = z.infer<typeof SpeechMeetingAwareInputSchema>;

const SpeechMeetingAwareOutputSchema = z.object({
  adjustedTasks: z
    .string()
    .describe('The adjusted list of tasks with new allocated times.'),
  reminders: z.string().describe('A list of reminders for the event.'),
  speakerChecklist: z
    .string()
    .describe('A checklist for the speaker before the event.'),
});
export type SpeechMeetingAwareOutput = z.infer<typeof SpeechMeetingAwareOutputSchema>;

export async function speechMeetingAware(input: SpeechMeetingAwareInput): Promise<SpeechMeetingAwareOutput> {
  return speechMeetingAwareFlow(input);
}

const generateChecklist = ai.defineTool({
  name: 'generateChecklist',
  description: 'Generates a speaker checklist based on the event.',
  inputSchema: z.object({
    eventDetails: z.string().describe('Details of the speaking event.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  // This can call any typescript function.
  // In a real implementation, this would generate the checklist.  Returning a placeholder for now.
  return `Speaker Checklist:\n1. Prepare speech notes.\n2. Practice presentation.\n3. Test equipment.`;
}
);


const prompt = ai.definePrompt({
  name: 'speechMeetingAwarePrompt',
  input: {schema: SpeechMeetingAwareInputSchema},
  output: {schema: SpeechMeetingAwareOutputSchema},
  tools: [generateChecklist],
  prompt: `You are an AI assistant designed to help users adjust their schedules based on upcoming calendar events, especially speeches and meetings.

  The user has a calendar event: {{{calendarEvent}}}.
  The user currently has the following tasks scheduled: {{{currentTasks}}}.

  Please adjust the task list to accommodate the calendar event. Compress morning preparation tasks and re-allocate time as needed.
  Also, generate reminders and a speaker checklist using the generateChecklist tool, if appropriate.

  Output the adjusted task list, reminders, and speaker checklist as strings.

  Make sure the "adjustedTasks", "reminders", and "speakerChecklist" fields are populated with the generated content.
`,
});

const speechMeetingAwareFlow = ai.defineFlow(
  {
    name: 'speechMeetingAwareFlow',
    inputSchema: SpeechMeetingAwareInputSchema,
    outputSchema: SpeechMeetingAwareOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
