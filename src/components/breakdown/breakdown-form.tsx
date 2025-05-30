'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { handleIntelligentTaskBreakdown } from '@/lib/actions';
import type { IntelligentTaskBreakdownOutput } from '@/ai/flows/intelligent-task-breakdown';
import { IconSpinner } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

const formSchema = z.object({
  task: z.string().min(10, {
    message: 'Please describe your task in at least 10 characters.',
  }),
});

export function BreakdownTaskForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [breakdownOutput, setBreakdownOutput] = useState<IntelligentTaskBreakdownOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setBreakdownOutput(null);
    try {
      const result = await handleIntelligentTaskBreakdown(values);
      setBreakdownOutput(result);
      toast({
        title: 'Task Broken Down!',
        description: 'Your task has been intelligently broken into sub-tasks.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Breaking Down Task',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Intelligent Task Breakdown</CardTitle>
        <CardDescription>
          Enter a task and its deadline (e.g., "Write a 1000-word blog post on AI ethics due by Friday 6 PM"), and AI will break it into manageable sub-tasks with time estimates.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="task" className="text-lg">Task Description (including deadline)</FormLabel>
                  <FormControl>
                    <Input
                      id="task"
                      placeholder="e.g., I have a blog due at 6 PM."
                      className="text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <IconSpinner className="mr-2 h-5 w-5" />
                  Breaking Down...
                </>
              ) : (
                'Breakdown Task with AI'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {breakdownOutput && breakdownOutput.subTasks.length > 0 && (
        <Card className="mt-8 bg-accent/10">
          <CardHeader>
            <CardTitle>Sub-tasks & Time Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {breakdownOutput.subTasks.map((subTask, index) => (
                <li key={index} className="p-3 bg-background rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-primary-foreground">{subTask.name}</span>
                    <Badge variant="secondary" className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      {subTask.estimatedTime}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}
