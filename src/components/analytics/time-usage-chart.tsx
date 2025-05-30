
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { handleAnalyzeTimeUsage } from '@/lib/actions';
import { getTasksFromLocalStorage } from '@/lib/task-storage';
import type { Task } from '@/types';
import { format, parseISO } from 'date-fns';
import { IconSpinner } from '@/components/icons';
import type { AnalyzeTimeUsageOutput } from '@/ai/flows/analyze-time-usage';

const chartConfig = {
  hours: {
    label: "Hours",
  },
  Study: {
    label: "Study",
    color: "hsl(var(--chart-1))",
  },
  Work: {
    label: "Work",
    color: "hsl(var(--chart-2))",
  },
  Personal: { // Added Personal, as it's more derivable from tasks
    label: "Personal",
    color: "hsl(var(--chart-5))",
  },
  Chill: {
    label: "Chill (Est.)", // Indicate estimation
    color: "hsl(var(--chart-3))",
  },
  Sleep: {
    label: "Sleep (Est.)", // Indicate estimation
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

type ChartData = Array<{
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  Study?: number;
  Work?: number;
  Personal?: number;
  Chill?: number;
  Sleep?: number;
}>;

export function TimeUsageChart() {
  const [chartData, setChartData] = useState<ChartData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const tasks = getTasksFromLocalStorage();
      const currentDate = format(new Date(), 'yyyy-MM-dd');

      if (tasks.length === 0) {
        const defaultData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
          day: day as any, Study: 0, Work: 0, Personal: 0, Chill: 1, Sleep: 7
        }));
        setChartData(defaultData);
        setAnalysisSummary("No tasks available for analysis. Showing default estimates for Chill & Sleep.");
        setIsLoading(false);
        return;
      }
      
      try {
        const aiTasks = tasks.map(task => ({
          name: task.name,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          category: task.category,
        }));

        const result: AnalyzeTimeUsageOutput = await handleAnalyzeTimeUsage({ tasks: aiTasks, currentDate });
        setChartData(result.weeklyUsage);
        setAnalysisSummary(result.analysisSummary || "Weekly time usage estimated by AI.");
      } catch (error) {
        console.error("Error fetching time usage analysis:", error);
        // Fallback to mock data structure on error
        const fallbackData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({
            day: d as any, Study: 0, Work: 0, Personal: 0, Chill: 1, Sleep: 7
        }));
        setChartData(fallbackData);
        setAnalysisSummary("Could not analyze time usage. Displaying default estimates.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI-Estimated Weekly Time Usage</CardTitle>
        <CardDescription>
          {isLoading ? "AI is analyzing your time usage..." : (analysisSummary || "How your time might be spent across activities (in hours).")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        {isLoading ? (
          <IconSpinner className="h-12 w-12 text-primary" />
        ) : chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <Tooltip 
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />} 
                />
                <Legend />
                <Bar dataKey="Study" stackId="a" radius={[4, 4, 0, 0]} fill={chartConfig.Study.color}/>
                <Bar dataKey="Work" stackId="a" radius={[4, 4, 0, 0]} fill={chartConfig.Work.color} />
                <Bar dataKey="Personal" stackId="a" radius={[4, 4, 0, 0]} fill={chartConfig.Personal.color} />
                <Bar dataKey="Chill" stackId="a" radius={[4, 4, 0, 0]} fill={chartConfig.Chill.color} />
                <Bar dataKey="Sleep" stackId="a" radius={[4, 4, 0, 0]} fill={chartConfig.Sleep.color} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <p className="text-muted-foreground">No data to display for time usage.</p>
        )}
      </CardContent>
    </Card>
  );
}

    