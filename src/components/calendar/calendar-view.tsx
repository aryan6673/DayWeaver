
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Task, ImportantDate } from '@/types';
import { getTasksFromLocalStorage } from '@/lib/task-storage';
import { getImportantDatesFromLocalStorage, saveImportantDatesToLocalStorage } from '@/lib/important-date-storage';
import { format, parseISO, isSameDay, isValid, startOfDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, CalendarDays, CheckCircle2, CircleSlash, ListChecks, Zap, Star, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

type CalendarItem = (Task & { itemType: 'task' }) | (ImportantDate & { itemType: 'importantDate' });

export function CalendarView() {
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isImportantDateModalOpen, setIsImportantDateModalOpen] = useState(false);
  const [newImportantDateDesc, setNewImportantDateDesc] = useState('');
  const [newImportantDateDate, setNewImportantDateDate] = useState<Date | undefined>(new Date());

  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const loadedTasks = getTasksFromLocalStorage();
    setTasks(loadedTasks);
    const loadedImportantDates = getImportantDatesFromLocalStorage();
    setImportantDates(loadedImportantDates);
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

  const importantDatesByDay = useMemo(() => {
    const map = new Map<string, ImportantDate[]>();
    importantDates.forEach(impDate => {
      if (impDate.date && isValid(parseISO(impDate.date))) {
        const dayStr = format(parseISO(impDate.date), 'yyyy-MM-dd');
        if (!map.has(dayStr)) {
          map.set(dayStr, []);
        }
        map.get(dayStr)?.push(impDate);
      }
    });
    return map;
  }, [importantDates]);

  const selectedDayItems: CalendarItem[] = useMemo(() => {
    if (!currentCalendarDate) return [];
    const dayStr = format(currentCalendarDate, 'yyyy-MM-dd');
    const dayTasks = (tasksByDay.get(dayStr) || []).map(task => ({ ...task, itemType: 'task' as const }));
    const dayImportantDates = (importantDatesByDay.get(dayStr) || []).map(impDate => ({ ...impDate, itemType: 'importantDate' as const }));
    return [...dayTasks, ...dayImportantDates].sort((a, b) => {
      const dateA = parseISO(a.itemType === 'task' ? a.dueDate! : a.date);
      const dateB = parseISO(b.itemType === 'task' ? b.dueDate! : b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [currentCalendarDate, tasksByDay, importantDatesByDay]);

  const calendarModifiers = useMemo(() => {
    const modifiers: Record<string, Date[]> = {
      taskLow: [],
      taskMedium: [],
      taskHigh: [],
      taskOther: [],
      important: [],
    };

    tasks.forEach(task => {
      if (task.dueDate && isValid(parseISO(task.dueDate))) {
        const taskDate = startOfDay(parseISO(task.dueDate));
        const priorityKey = `task${task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'Other'}` as keyof typeof modifiers;
        if (modifiers[priorityKey]) {
           modifiers[priorityKey].push(taskDate);
        } else {
            modifiers.taskOther.push(taskDate);
        }
      }
    });
    importantDates.forEach(impDate => {
       if (impDate.date && isValid(parseISO(impDate.date))) {
        modifiers.important.push(startOfDay(parseISO(impDate.date)));
       }
    });
    return modifiers;
  }, [tasks, importantDates]);

  const calendarModifierStyles = {
    taskLow: { backgroundColor: 'hsl(var(--chart-5))', color: 'hsl(var(--foreground))' },
    taskMedium: { backgroundColor: 'hsl(var(--chart-3))', color: 'hsl(var(--foreground))'},
    taskHigh: { backgroundColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' },
    taskOther: {textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '2px' },
    important: { borderColor: 'hsl(var(--accent))', borderWidth: '2px', borderRadius: 'var(--radius)' }
  };

  const handleAddImportantDate = () => {
    if (!newImportantDateDesc.trim() || !newImportantDateDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a description and select a date for the important event.',
      });
      return;
    }
    const newDate: ImportantDate = {
      id: `imp-${Date.now()}`,
      date: newImportantDateDate.toISOString(), // Store full ISO string
      description: newImportantDateDesc.trim(),
      type: 'importantDate',
    };
    const updatedImportantDates = [...importantDates, newDate];
    setImportantDates(updatedImportantDates);
    saveImportantDatesToLocalStorage(updatedImportantDates);
    toast({
      title: 'Important Date Added',
      description: `"${newDate.description}" on ${format(newImportantDateDate, 'PPP')} added.`,
    });
    setIsImportantDateModalOpen(false);
    setNewImportantDateDesc('');
    setNewImportantDateDate(new Date());
  };
  
  if (!isMounted) {
    return <div className="text-center p-8">Loading calendar...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Calendar</CardTitle>
           <Dialog open={isImportantDateModalOpen} onOpenChange={setIsImportantDateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Important Date
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Important Date</DialogTitle>
                <DialogDescription>
                  Specify the date and description for your important event.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="impDateDesc" className="text-right">Description</Label>
                  <Input 
                    id="impDateDesc" 
                    value={newImportantDateDesc} 
                    onChange={(e) => setNewImportantDateDesc(e.target.value)} 
                    className="col-span-3" 
                    placeholder="e.g., Mom's Birthday"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="impDateDate" className="text-right">Date</Label>
                  <div className="col-span-3">
                    <Calendar
                        mode="single"
                        selected={newImportantDateDate}
                        onSelect={setNewImportantDateDate}
                        initialFocus
                        className="rounded-md border p-0 [&_button]:h-8 [&_button]:w-8 [&_caption_label]:text-sm [&_caption_label]:font-medium"
                      />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportantDateModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddImportantDate}>Add Date</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Calendar
            mode="single"
            selected={currentCalendarDate}
            onSelect={setCurrentCalendarDate}
            className="rounded-md border w-full"
            modifiers={calendarModifiers}
            modifiersStyles={calendarModifierStyles}
            footer={
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs p-2 border-t">
                <div className="flex items-center"><span className="h-3 w-3 rounded-full mr-1.5" style={{backgroundColor: calendarModifierStyles.taskLow.backgroundColor}}></span> Low Prio Task</div>
                <div className="flex items-center"><span className="h-3 w-3 rounded-full mr-1.5" style={{backgroundColor: calendarModifierStyles.taskMedium.backgroundColor}}></span> Medium Prio Task</div>
                <div className="flex items-center"><span className="h-3 w-3 rounded-full mr-1.5" style={{backgroundColor: calendarModifierStyles.taskHigh.backgroundColor}}></span> High Prio Task</div>
                <div className="flex items-center"><span className="h-3 w-3 rounded-md border-2 mr-1.5" style={{borderColor: calendarModifierStyles.important.borderColor}}></span> Important Date</div>
              </div>
            }
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg h-fit">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarDays className="h-6 w-6 mr-2 text-primary" />
            Events for {currentCalendarDate ? format(currentCalendarDate, 'PPP') : 'Selected Day'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDayItems.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-20rem)] max-h-[450px] pr-3"> {/* Adjusted height */}
              <ul className="space-y-3">
                {selectedDayItems.map(item => (
                  <li key={item.id} className="p-3 bg-muted/50 rounded-md shadow-sm">
                    {item.itemType === 'task' ? (
                      <>
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm">{item.name}</span>
                          {item.priority && (
                            <Badge 
                              variant={item.priority === 'high' ? 'destructive' : item.priority === 'medium' ? 'secondary' : 'outline'}
                              className="capitalize text-xs whitespace-nowrap"
                            >
                              {item.priority}
                            </Badge>
                          )}
                        </div>
                        {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                        <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                            {statusIconMap[item.status]}
                            <span className="capitalize">{item.status}</span>
                        </div>
                      </>
                    ) : ( // ImportantDate
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-2 text-accent" />
                        <span className="font-medium text-sm text-accent-foreground">{item.description}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {currentCalendarDate ? "No events scheduled for this day." : "Select a day to see events."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
