'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { handleDynamicTaskReallocation } from '@/lib/actions';
import type { DynamicTaskReallocationOutput } from '@/ai/flows/dynamic-task-reallocation';
import { IconSpinner } from '@/components/icons';
import { PlusCircle, Trash2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required.'),
  dueDate: z.string().refine((val) => isValid(parseISO(val)), { message: 'Invalid date format. Use YYYY-MM-DD.' }),
  duration: z.coerce.number().min(0.1, 'Duration must be at least 0.1 hours.'),
});

const formSchema = z.object({
  reason: z.string().min(5, 'Please provide a reason (min 5 characters).'),
  currentTasks: z.array(taskSchema).min(1, 'At least one task is required.'),
});

type ReallocateFormValues = z.infer<typeof formSchema>;

export function ReallocateTasksForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [reallocationOutput, setReallocationOutput] = useState<DynamicTaskReallocationOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<ReallocateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: '',
      currentTasks: [{ name: '', dueDate: format(new Date(), 'yyyy-MM-dd'), duration: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'currentTasks',
  });
  
  // Ensure dates are correctly formatted for display
  useEffect(() => {
    fields.forEach((field, index) => {
      if (field.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(field.dueDate)) {
        try {
          form.setValue(`currentTasks.${index}.dueDate`, format(parseISO(field.dueDate), 'yyyy-MM-dd'));
        } catch (e) {
          // if parseISO fails, it's not a valid ISO string, might be already yyyy-MM-dd or invalid
        }
      }
    });
  }, [fields, form]);


  async function onSubmit(values: ReallocateFormValues) {
    setIsLoading(true);
    setReallocationOutput(null);
    try {
      // Ensure dates are in ISO string format for the AI flow if they are not already
      const tasksForAI = values.currentTasks.map(task => ({
        ...task,
        dueDate: task.dueDate.includes('T') ? task.dueDate : parseISO(task.dueDate).toISOString().split('T')[0],
      }));

      const result = await handleDynamicTaskReallocation({ ...values, currentTasks: tasksForAI });
      setReallocationOutput(result);
      toast({
        title: 'Tasks Reallocated!',
        description: result.summary || 'Your tasks have been rescheduled by AI.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Reallocating Tasks',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Dynamic Task Reallocation</CardTitle>
        <CardDescription>
          Need to reschedule? Tell AI why, list your current tasks, and let it find the best new slots.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="reason" className="text-lg">Reason for Rescheduling</FormLabel>
                  <FormControl>
                    <Input id="reason" placeholder="e.g., I have a fever today." {...field} className="text-base"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-lg">Current Tasks</FormLabel>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <FormField
                        control={form.control}
                        name={`currentTasks.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Name</FormLabel>
                            <FormControl><Input placeholder="Task name" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`currentTasks.${index}.dueDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`currentTasks.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (hrs)</FormLabel>
                            <FormControl><Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                       <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="mt-2 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 mr-1" /> Remove Task
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', dueDate: format(new Date(), 'yyyy-MM-dd'), duration: 1 })}
                className="mt-4"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <IconSpinner className="mr-2 h-5 w-5" />
                  Reallocating...
                </>
              ) : (
                'Reallocate Tasks with AI'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {reallocationOutput && (
        <Card className="mt-8 bg-accent/10">
          <CardHeader>
            <CardTitle>Reallocation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold mb-2">Summary:</h4>
            <p className="mb-4 text-sm p-3 bg-background rounded-md">{reallocationOutput.summary}</p>
            <h4 className="font-semibold mb-2">Rescheduled Tasks:</h4>
            {reallocationOutput.rescheduledTasks.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {reallocationOutput.rescheduledTasks.map((task, index) => (
                  <li key={index}>
                    <strong>{task.name}</strong> - New Due Date: {format(parseISO(task.newDueDate), 'MMM dd, yyyy')}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks were rescheduled, or AI couldn't find suitable slots.</p>
            )}
          </CardContent>
        </Card>
      )}
    </Card>
  );
}
