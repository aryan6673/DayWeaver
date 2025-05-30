
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ShieldCheck, Coffee } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { handlePredictBurnout } from '@/lib/actions';
import { getTasksFromLocalStorage } from '@/lib/task-storage';
import type { Task } from '@/types';
import { format } from 'date-fns';
import { IconSpinner } from '@/components/icons';
import type { PredictBurnoutOutput } from '@/ai/flows/predict-burnout';


const riskConfig = {
  low: {
    text: "Low Risk",
    icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
    progressColorClass: "bg-green-500", // For custom styling if needed beyond primary
  },
  medium: {
    text: "Medium Risk",
    icon: <Coffee className="h-5 w-5 text-yellow-500" />,
    progressColorClass: "bg-yellow-500",
  },
  high: {
    text: "High Risk",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    progressColorClass: "bg-red-500",
  },
};

export function BurnoutPredictor() {
  const [burnoutData, setBurnoutData] = useState<PredictBurnoutOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const tasks = getTasksFromLocalStorage();
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      
      if (tasks.length === 0) {
         setBurnoutData({
          riskLevel: 'low',
          progressValue: 10,
          message: "No tasks to analyze. Enjoy your free time!",
        });
        setIsLoading(false);
        return;
      }

      try {
        const aiTasks = tasks.map(task => ({
          name: task.name,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          category: task.category,
        }));
        const result = await handlePredictBurnout({ tasks: aiTasks, currentDate });
        setBurnoutData(result);
      } catch (error) {
        console.error("Error fetching burnout prediction:", error);
        setBurnoutData({ riskLevel: 'medium', progressValue: 50, message: "Error predicting burnout. Please monitor your well-being." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const currentConfig = burnoutData ? riskConfig[burnoutData.riskLevel] : riskConfig.medium; // Default to medium if data not loaded
  const progressValue = burnoutData ? burnoutData.progressValue : 50;
  const message = burnoutData ? burnoutData.message : "Loading burnout prediction...";

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="pb-2">
         <div className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-medium">AI Burnout Predictor</CardTitle>
            {isLoading ? <IconSpinner className="h-5 w-5 text-primary" /> : currentConfig.icon}
        </div>
        {!isLoading && burnoutData?.contributingFactors && burnoutData.contributingFactors.length > 0 && (
            <CardDescription className="text-xs pt-1">
                Key factors: {burnoutData.contributingFactors.join(', ')}.
            </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="text-center py-4">
                <IconSpinner className="h-8 w-8 text-primary mb-2 mx-auto" />
                <p className="text-muted-foreground">AI is analyzing your risk...</p>
            </div>
        ) : burnoutData ? (
          <>
            <div className="text-3xl font-bold mb-1">{currentConfig.text}</div>
            <Progress 
              value={progressValue} 
              aria-label={`Burnout risk: ${currentConfig.text}`} 
              className="h-3 my-2"
              // Use Tailwind CSS for progress bar color based on risk level via theme if possible
              // For direct styling via ShadCN's CSS variables, ensure they are defined in globals.css for chart-1, chart-2 etc.
              // Or pass a specific class if Progress component supports it. For now, rely on theme.
            />
            {/* The progress bar color is typically handled by --primary in shadcn. 
                If you want specific colors for low/medium/high, you might need to
                add conditional classes to the Progress component itself or its indicator
                or adjust the --primary CSS variable dynamically if that's feasible,
                or accept that it will use the primary theme color.
                Using [&>div]:bg-red-500 etc. for the indicator:
            */}
            <style jsx>{`
              .progress-indicator-low > div { background-color: hsl(var(--chart-1)) !important; } /* Or a green variable */
              .progress-indicator-medium > div { background-color: hsl(var(--chart-2)) !important; } /* Or a yellow variable */
              .progress-indicator-high > div { background-color: hsl(var(--destructive)) !important; }
            `}</style>
             {/* <Progress value={progressValue} className={cn("h-3 my-2", 
                burnoutData.riskLevel === 'low' ? 'progress-indicator-low' :
                burnoutData.riskLevel === 'medium' ? 'progress-indicator-medium' :
                'progress-indicator-high'
             )} /> */}


            <p className="text-sm text-muted-foreground mt-2">
              {message}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on AI analysis of your current task patterns.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Could not load burnout prediction.</p>
        )}
      </CardContent>
    </Card>
  );
}

    