'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ShieldCheck, Coffee } from 'lucide-react';
import { Progress } from "@/components/ui/progress"


export function BurnoutPredictor() {
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    // Mock risk level generation
    const random = Math.random();
    if (random < 0.6) {
      setRiskLevel('low');
      setProgressValue(Math.floor(Math.random() * 30) + 10); // 10-39
    } else if (random < 0.85) {
      setRiskLevel('medium');
      setProgressValue(Math.floor(Math.random() * 30) + 40); // 40-69
    } else {
      setRiskLevel('high');
      setProgressValue(Math.floor(Math.random() * 30) + 70); // 70-99
    }
  }, []);

  const config = {
    low: {
      text: "Low Risk",
      message: "You're maintaining a healthy balance. Keep it up!",
      icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
      progressColor: "bg-green-500",
    },
    medium: {
      text: "Medium Risk",
      message: "Consider taking short breaks. Watch your workload.",
      icon: <Coffee className="h-5 w-5 text-yellow-500" />,
      progressColor: "bg-yellow-500",
    },
    high: {
      text: "High Risk",
      message: "You might be overworking. Prioritize rest and breaks.",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      progressColor: "bg-red-500",
    },
  };

  const currentConfig = config[riskLevel];

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Burnout Predictor</CardTitle>
        {currentConfig.icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-1">{currentConfig.text}</div>
        <Progress value={progressValue} aria-label={`Burnout risk: ${currentConfig.text}`} className="h-3 my-2 [&>div]:bg-primary" />
        <p className="text-xs text-muted-foreground mt-2">
          {currentConfig.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Based on work patterns and task load.
        </p>
      </CardContent>
    </Card>
  );
}
