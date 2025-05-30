import { ProgressPieChart } from '@/components/analytics/progress-chart';
import { TimeUsageChart } from '@/components/analytics/time-usage-chart';
import { EfficiencyScore } from '@/components/analytics/efficiency-score';
import { BurnoutPredictor } from '@/components/analytics/burnout-predictor';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Your Productivity Analytics</CardTitle>
          <CardDescription className="text-lg">
            Gain insights into your work habits, progress, and well-being.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <ProgressPieChart />
        <TimeUsageChart />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <EfficiencyScore />
        <BurnoutPredictor />
      </div>
    </div>
  );
}
