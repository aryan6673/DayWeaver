
'use server';

import { 
  createSchedule as createScheduleFlow, 
  type CreateScheduleInput,
  type CreateScheduleOutput
} from '@/ai/flows/create-schedule';

// Removed handleDynamicTaskReallocation, handleIntelligentTaskBreakdown, and handleSpeechMeetingAware functions

export async function handleCreateSchedule(input: CreateScheduleInput): Promise<CreateScheduleOutput> {
  try {
    const result = await createScheduleFlow(input);
    // Ensure tasks is at least an empty array if undefined/null from AI
    return { ...result, tasks: result.tasks || [] };
  } catch (error) {
    console.error('Error in handleCreateSchedule:', error);
    throw new Error('Failed to create schedule. Please try again.');
  }
}
