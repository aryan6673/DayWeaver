'use server';

import { 
  createSchedule as createScheduleFlow, 
  type CreateScheduleInput,
  type CreateScheduleOutput
} from '@/ai/flows/create-schedule';
import { 
  dynamicTaskReallocation as dynamicTaskReallocationFlow,
  type DynamicTaskReallocationInput,
  type DynamicTaskReallocationOutput
} from '@/ai/flows/dynamic-task-reallocation';
import { 
  intelligentTaskBreakdown as intelligentTaskBreakdownFlow,
  type IntelligentTaskBreakdownInput,
  type IntelligentTaskBreakdownOutput
} from '@/ai/flows/intelligent-task-breakdown';
import { 
  speechMeetingAware as speechMeetingAwareFlow,
  type SpeechMeetingAwareInput,
  type SpeechMeetingAwareOutput
} from '@/ai/flows/speech-meeting-aware';

export async function handleCreateSchedule(input: CreateScheduleInput): Promise<CreateScheduleOutput> {
  try {
    const result = await createScheduleFlow(input);
    return result;
  } catch (error) {
    console.error('Error in handleCreateSchedule:', error);
    throw new Error('Failed to create schedule. Please try again.');
  }
}

export async function handleDynamicTaskReallocation(input: DynamicTaskReallocationInput): Promise<DynamicTaskReallocationOutput> {
  try {
    const result = await dynamicTaskReallocationFlow(input);
    return result;
  } catch (error) {
    console.error('Error in handleDynamicTaskReallocation:', error);
    throw new Error('Failed to reallocate tasks. Please try again.');
  }
}

export async function handleIntelligentTaskBreakdown(input: IntelligentTaskBreakdownInput): Promise<IntelligentTaskBreakdownOutput> {
  try {
    const result = await intelligentTaskBreakdownFlow(input);
    return result;
  } catch (error) {
    console.error('Error in handleIntelligentTaskBreakdown:', error);
    throw new Error('Failed to breakdown task. Please try again.');
  }
}

export async function handleSpeechMeetingAware(input: SpeechMeetingAwareInput): Promise<SpeechMeetingAwareOutput> {
  try {
    const result = await speechMeetingAwareFlow(input);
    return result;
  } catch (error) {
    console.error('Error in handleSpeechMeetingAware:', error);
    throw new Error('Failed to prepare for meeting. Please try again.');
  }
}
