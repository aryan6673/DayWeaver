
import { CalendarView } from '@/components/calendar/calendar-view';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CalendarPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">My Calendar</CardTitle>
          <CardDescription className="text-lg">
            View and manage your important dates.
          </CardDescription>
        </CardHeader>
      </Card>
      <CalendarView />
    </div>
  );
}
