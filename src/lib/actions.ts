
'use server';

import { 
  createSchedule as createScheduleFlow, 
  type CreateScheduleInput,
  type CreateScheduleOutput
} from '@/ai/flows/create-schedule';

import {
  analyzeTimeUsage as analyzeTimeUsageFlow,
  type AnalyzeTimeUsageInput,
  type AnalyzeTimeUsageOutput
} from '@/ai/flows/analyze-time-usage';

import {
  calculateEfficiencyScore as calculateEfficiencyScoreFlow,
  type CalculateEfficiencyScoreInput,
  type CalculateEfficiencyScoreOutput
} from '@/ai/flows/calculate-efficiency-score';

import {
  predictBurnout as predictBurnoutFlow,
  type PredictBurnoutInput,
  type PredictBurnoutOutput
} from '@/ai/flows/predict-burnout';


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

export async function handleAnalyzeTimeUsage(input: AnalyzeTimeUsageInput): Promise<AnalyzeTimeUsageOutput> {
  try {
    const result = await analyzeTimeUsageFlow(input);
    return result;
  } catch (error) {
    console.error('Error in handleAnalyzeTimeUsage:', error);
    // Provide a structured fallback
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
    const fallbackWeeklyUsage = days.map(day => ({
      day: day, Study: 0, Work: 0, Personal: 0, Chill: 1, Sleep: 7
    }));
    return { 
      weeklyUsage: fallbackWeeklyUsage, 
      analysisSummary: "Error analyzing time usage. Displaying default estimates." 
    };
  }
}

export async function handleCalculateEfficiencyScore(input: CalculateEfficiencyScoreInput): Promise<CalculateEfficiencyScoreOutput> {
  try {
    const result = await calculateEfficiencyScoreFlow(input);
    return result;
  } catch (error) {
    console.error('Error in handleCalculateEfficiencyScore:', error);
    return { 
      score: 0, 
      message: "Error calculating efficiency score.",
      improvementSuggestion: "Please try again later."
    };
  }
}

export async function handlePredictBurnout(input: PredictBurnoutInput): Promise<PredictBurnoutOutput> {
  try {
    const result = await predictBurnoutFlow(input);
    return result;
  } catch (error) {
    console.error('Error in handlePredictBurnout:', error);
    return { 
      riskLevel: 'medium', 
      progressValue: 50,
      message: "Error predicting burnout risk. Please monitor your well-being.",
      contributingFactors: ["Analysis service unavailable"]
    };
  }
}

    