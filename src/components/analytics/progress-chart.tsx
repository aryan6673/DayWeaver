
'use client';

import { useEffect, useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { getTasksFromLocalStorage } from '@/lib/task-storage';
import type { Task, TaskStatus } from '@/types';
import { IconSpinner } from '@/components/icons';

const chartConfig = {
  tasks: {
    label: 'Tasks',
  },
  todo: {
    label: 'To Do',
    color: 'hsl(var(--chart-3))', // Muted gold
  },
  inprogress: {
    label: 'In Progress',
    color: 'hsl(var(--chart-4))', // Lighter orange
  },
  done: {
    label: 'Done',
    color: 'hsl(var(--chart-1))', // Primary gold
  },
   blocked: {
    label: 'Blocked',
    color: 'hsl(var(--destructive))', // Destructive red
  },
} satisfies ChartConfig;

interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

export function ProgressPieChart() {
  const [taskData, setTaskData] = useState<ChartDataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const tasks = getTasksFromLocalStorage();
    setTotalTasks(tasks.length);

    const counts: Record<TaskStatus, number> = {
      todo: 0,
      inprogress: 0,
      done: 0,
      blocked: 0,
    };

    tasks.forEach(task => {
      counts[task.status]++;
    });

    const dataForChart: ChartDataItem[] = [
      { name: chartConfig.todo.label as string, value: counts.todo, fill: chartConfig.todo.color as string },
      { name: chartConfig.inprogress.label as string, value: counts.inprogress, fill: chartConfig.inprogress.color as string },
      { name: chartConfig.done.label as string, value: counts.done, fill: chartConfig.done.color as string },
      { name: chartConfig.blocked.label as string, value: counts.blocked, fill: chartConfig.blocked.color as string },
    ].filter(item => item.value > 0); // Only include categories with tasks

    setTaskData(dataForChart);
    setIsLoading(false);
  }, []);

  const chartDescription = useMemo(() => {
    if (totalTasks === 0) return "No tasks found. Add some tasks to see your progress!";
    return `Overview of your ${totalTasks} task(s) by completion status.`;
  }, [totalTasks]);

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>Task Progress</CardTitle>
        <CardDescription>{isLoading ? "Loading task data..." : chartDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        {isLoading ? (
          <IconSpinner className="h-12 w-12 text-primary" />
        ) : taskData.length === 0 && totalTasks > 0 ? (
          <p className="text-muted-foreground">No tasks with relevant statuses to display in chart.</p>
        ) : totalTasks === 0 ? (
            <p className="text-muted-foreground text-center px-4">Add tasks via the "My Tasks" page or by creating an AI schedule to see your progress distribution.</p>
        ) : (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="name" />}
                />
                <Pie
                  data={taskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      if (percent === 0) return null;
                      return (
                          <text x={x} y={y} fill="hsl(var(--card-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                          {`${name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                      );
                  }}
                >
                  {taskData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend content={({ payload }) => {
                  if (!payload) return null;
                  return (
                    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-4 text-sm">
                      {payload.map((entry, index) => (
                        <li key={`item-${index}`} className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          {entry.value} ({entry.payload?.value} tasks)
                        </li>
                      ))}
                    </ul>
                  );
                }}/>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

    