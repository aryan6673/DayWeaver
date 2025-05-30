'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const mockData = [
  { name: 'To Do', value: 8, fill: 'hsl(var(--chart-3))' },
  { name: 'In Progress', value: 5, fill: 'hsl(var(--chart-4))' },
  { name: 'Done', value: 12, fill: 'hsl(var(--chart-1))' },
  { name: 'Blocked', value: 2, fill: 'hsl(var(--destructive))' },
];

const chartConfig = {
  tasks: {
    label: 'Tasks',
  },
  todo: {
    label: 'To Do',
    color: 'hsl(var(--chart-3))',
  },
  inprogress: {
    label: 'In Progress',
    color: 'hsl(var(--chart-4))',
  },
  done: {
    label: 'Done',
    color: 'hsl(var(--chart-1))',
  },
   blocked: {
    label: 'Blocked',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;


export function ProgressPieChart() {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>Task Progress</CardTitle>
        <CardDescription>Overview of your task completion status.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
         <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="name" />}
              />
              <Pie
                data={mockData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                        <text x={x} y={y} fill="hsl(var(--card-foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                        {`${mockData[index].name} (${(percent * 100).toFixed(0)}%)`}
                        </text>
                    );
                }}
              >
                {mockData.map((entry) => (
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
                        {entry.value}
                      </li>
                    ))}
                  </ul>
                );
              }}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
