'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Zap } from 'lucide-react';

export function EfficiencyScore() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Mock score generation
    setScore(Math.floor(Math.random() * 30) + 70); // Score between 70 and 100
  }, []);

  let scoreColor = 'text-green-500';
  if (score < 80) scoreColor = 'text-yellow-500';
  if (score < 70) scoreColor = 'text-red-500'; // Though current mock is >= 70

  return (
    <Card className="shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Efficiency Score</CardTitle>
        <Zap className={`h-5 w-5 ${scoreColor}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold ${scoreColor}`}>{score}%</div>
        <p className="text-xs text-muted-foreground mt-1">
          Based on task completion rates and deferments.
        </p>
        {score >= 85 && (
           <div className="mt-3 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Excellent work! Keep up the momentum.</span>
          </div>
        )}
         {score < 85 && score >=75 && (
           <div className="mt-3 flex items-center text-sm text-yellow-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Good job! Room for a little boost.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
