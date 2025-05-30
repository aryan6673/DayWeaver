'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const mockData = [
  { day: 'Mon', Study: 4, Work: 2, Chill: 3, Sleep: 8 },
  { day: 'Tue', Study: 5, Work: 3, Chill: 2, Sleep: 7 },
  { day: 'Wed', Study: 3, Work: 4, Chill: 3, Sleep: 8 },
  { day: 'Thu', Study: 6, Work: 2, Chill: 2, Sleep: 7 },
  { day: 'Fri', Study: 4, Work: 5, Chill: 4, Sleep: 6 },
  { day: 'Sat', Study: 2, Work: 1, Chill: 6, Sleep: 9 },
  { day: 'Sun', Study: 1, Work: 0, Chill: 7, Sleep: 10 },
];

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
  Chill: {
    label: "Chill",
    color: "hsl(var(--chart-3))",
  },
  Sleep: {
    label: "Sleep",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function TimeUsageChart() {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>Weekly Time Usage</CardTitle>
        <CardDescription>How you're spending your time across activities (in hours).</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip 
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />} 
              />
              <Legend />
              <Bar dataKey="Study" stackId="a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Work" stackId="a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Chill" stackId="a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Sleep" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
