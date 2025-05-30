'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { handleSpeechMeetingAware } from '@/lib/actions';
import type { SpeechMeetingAwareOutput } from '@/ai/flows/speech-meeting-aware';
import { IconSpinner } from '@/components/icons';

const formSchema = z.object({
  calendarEvent: z.string().min(10, 'Event details must be at least 10 characters.'),
  currentTasks: z.string().min(10, 'Current tasks must be at least 10 characters.'),
});

export function MeetingPrepForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [prepOutput, setPrepOutput] = useState<SpeechMeetingAwareOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calendarEvent: '',
      currentTasks: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPrepOutput(null);
    try {
      const result = await handleSpeechMeetingAware(values);
      setPrepOutput(result);
      toast({
        title: 'Meeting Prep Ready!',
        description: 'AI has adjusted your schedule and generated prep materials.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Preparing for Meeting',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">AI Meeting & Speech Preparation</CardTitle>
        <CardDescription>
          Input your upcoming event (e.g., "Speech at 9 AM tomorrow on Q2 Marketing Results") and your current task list. AI will help adjust your schedule and generate reminders.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="calendarEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="calendarEvent" className="text-lg">Calendar Event Details</FormLabel>
                  <FormControl>
                    <Input
                      id="calendarEvent"
                      placeholder="e.g., Presentation on Project Phoenix, 10 AM Tuesday"
                      className="text-base"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentTasks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="currentTasks" className="text-lg">Current Tasks List</FormLabel>
                  <FormControl>
                    <Textarea
                      id="currentTasks"
                      placeholder="e.g., 1. Finalize report (2hrs)&#x0a;2. Email stakeholders (30min)&#x0a;3. Prepare presentation slides (3hrs)"
                      className="min-h-[100px] resize-none text-base"
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
                  Preparing...
                </>
              ) : (
                'Prepare with AI'
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>

      {prepOutput && (
        <Card className="mt-8 bg-accent/10">
          <CardHeader>
            <CardTitle>AI Preparation Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-primary-foreground mb-1">Adjusted Tasks:</h4>
              <pre className="whitespace-pre-wrap p-3 bg-background rounded-md text-sm font-mono overflow-x-auto">{prepOutput.adjustedTasks}</pre>
            </div>
            <div>
              <h4 className="font-semibold text-primary-foreground mb-1">Reminders:</h4>
              <pre className="whitespace-pre-wrap p-3 bg-background rounded-md text-sm font-mono overflow-x-auto">{prepOutput.reminders}</pre>
            </div>
            <div>
              <h4 className="font-semibold text-primary-foreground mb-1">Speaker Checklist:</h4>
              <pre className="whitespace-pre-wrap p-3 bg-background rounded-md text-sm font-mono overflow-x-auto">{prepOutput.speakerChecklist}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </Card>
  );
}
