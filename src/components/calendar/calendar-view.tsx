'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task } from '@/types';
import { getTasksFromLocalStorage } from '@/lib/task-storage';
import { format, parseISO, isSameDay, isValid } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CalendarDays, CheckCircle2, CircleSlash, ListChecks, Zap } from 'lucide-react';

const priorityColorMap = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
};

const statusIconMap: Record<Task['status'], React.ReactElement> = {
  todo: <AlertTriangle className="h-4 w-4 mr-1.5" />,
  inprogress: <Zap className="h-4 w-4 mr-1.5" />,
  done: <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-600" />,
  blocked: <CircleSlash className="h-4 w-4 mr-1.5" />,
};


export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadedTasks = getTasksFromLocalStorage();
    setTasks(loadedTasks);
  }, []);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (task.dueDate && isValid(parseISO(task.dueDate))) {
        const dayStr = format(parseISO(task.dueDate), 'yyyy-MM-dd');
        if (!map.has(dayStr)) {
          map.set(dayStr, []);
        }
        map.get(dayStr)?.push(task);
      }
    });
    return map;
  }, [tasks]);

  const selectedDayTasks = useMemo(() => {
    if (!date) return [];
    const dayStr = format(date, 'yyyy-MM-dd');
    return tasksByDay.get(dayStr) || [];
  }, [date, tasksByDay]);

  const calendarModifiers = useMemo(() => {
    const daysWithTasks: Record<string, Date[]> = {
      low: [],
      medium: [],
      high: [],
      other: [], // For tasks without priority or due date mismatch
    };

    tasks.forEach(task => {
      if (task.dueDate && isValid(parseISO(task.dueDate))) {
        const taskDate = parseISO(task.dueDate);
        const priorityKey = task.priority || 'other';
        if (daysWithTasks[priorityKey as keyof typeof daysWithTasks]) {
           daysWithTasks[priorityKey as keyof typeof daysWithTasks].push(taskDate);
        } else {
            daysWithTasks.other.push(taskDate);
        }
      }
    });
    return daysWithTasks;
  }, [tasks]);

  const calendarModifierStyles = {
    low: { backgroundColor: 'hsl(var(--chart-5))', color: 'hsl(var(--foreground))' },
    medium: { backgroundColor: 'hsl(var(--chart-3))', color: 'hsl(var(--foreground))'},
    high: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' },
    other: {textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '2px' }
  };
  
  if (!isMounted) {
    // Prevent hydration mismatch by not rendering calendar until client-side mounted
    // You could show a Skeleton loader here
    return <div className="text-center p-8">Loading calendar...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 shadow-lg">
        <CardContent className="p-2 sm:p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border w-full"
            modifiers={calendarModifiers}
            modifiersStyles={calendarModifierStyles}
            footer={
              <div className="flex justify-center space-x-2 text-xs p-2 border-t">
                <div className="flex items-center"><span className="h-3 w-3 rounded-full mr-1.5" style={calendarModifierStyles.low}></span> Low Priority</div>
                <div className="flex items-center"><span className="h-3 w-3 rounded-full mr-1.5" style={calendarModifierStyles.medium}></span> Medium Priority</div>
                <div className="flex items-center"><span className="h-3 w-3 rounded-full mr-1.5" style={calendarModifierStyles.high}></span> High Priority</div>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg h-fit">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="h-6 w-6 mr-2 text-primary" />
            Tasks for {date ? format(date, 'PPP') : 'Selected Day'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDayTasks.length > 0 ? (
            <ScrollArea className="h-[300px] pr-3">
              <ul className="space-y-3">
                {selectedDayTasks.map(task => (
                  <li key={task.id} className="p-3 bg-muted/50 rounded-md shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{task.name}</span>
                       {task.priority && (
                        <Badge 
                          variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}
                          className="capitalize text-xs whitespace-nowrap"
                        >
                          {task.priority}
                        </Badge>
                      )}
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}
                     <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                        {statusIconMap[task.status]}
                        <span className="capitalize">{task.status}</span>
                     </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {date ? "No tasks scheduled for this day." : "Select a day to see tasks."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
