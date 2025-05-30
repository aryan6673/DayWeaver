import { TaskList } from '@/components/tasks/task-list';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TasksPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">My Tasks</CardTitle>
          <CardDescription className="text-lg">
            Stay organized and focused. Manage your to-do list effectively.
          </CardDescription>
        </CardHeader>
      </Card>
      <TaskList />
    </div>
  );
}
