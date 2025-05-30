'use client';

import type { Task, TaskStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit3, MoreVertical, Trash2, CalendarDays, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
}

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-500', icon: <AlertTriangle className="h-3 w-3 mr-1" /> },
  inprogress: { label: 'In Progress', color: 'bg-blue-500', icon: <Zap className="h-3 w-3 mr-1" /> },
  done: { label: 'Done', color: 'bg-green-500', icon: <ListChecks className="h-3 w-3 mr-1" /> },
  blocked: { label: 'Blocked', color: 'bg-red-500', icon: <CircleSlash className="h-3 w-3 mr-1" /> },
};

// Placeholder icons if not available in lucide-react
const ListChecks = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17l-4-4"/><path d="M15 7l-5 5"/><path d="M21 7l-9 9"/></svg>;
const CircleSlash = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>;

export function TaskItem({ task, onStatusChange, onDelete, onEdit }: TaskItemProps) {
  const handleCheckboxChange = (checked: boolean) => {
    onStatusChange(task.id, checked ? 'done' : 'todo');
  };

  const currentStatusConfig = statusConfig[task.status] || statusConfig.todo;

  const formattedDueDate = task.dueDate && isValid(parseISO(task.dueDate))
    ? format(parseISO(task.dueDate), 'MMM dd, yyyy')
    : 'No due date';

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      task.status === 'done' && 'opacity-70'
    )}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.status === 'done'}
              onCheckedChange={handleCheckboxChange}
              className="mr-3 h-5 w-5"
              aria-label={`Mark task ${task.name} as ${task.status === 'done' ? 'not done' : 'done'}`}
            />
            <label htmlFor={`task-${task.id}`} className={cn("cursor-pointer", task.status === 'done' && 'line-through text-muted-foreground')}>
              {task.name}
            </label>
          </CardTitle>
          {task.description && <CardDescription className="text-sm ml-8">{task.description}</CardDescription>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Task options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="ml-8 pt-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <Badge
            variant="outline"
            className={cn("text-xs", task.status === 'done' ? 'border-green-500/50 text-green-600' : 'border-blue-500/50 text-blue-600')}
          >
             {currentStatusConfig.icon}
            {currentStatusConfig.label}
          </Badge>
          {task.priority && (
            <Badge
              variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}
              className="capitalize"
            >
              {task.priority} Priority
            </Badge>
          )}
          {task.dueDate && (
            <div className="flex items-center">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              <span>{formattedDueDate}</span>
            </div>
          )}
          {task.category && (
             <Badge variant="outline" className="text-xs">{task.category}</Badge>
          )}
        </div>
        {task.subTasks && task.subTasks.length > 0 && (
          <div className="mt-3 space-y-1 pl-4 border-l ml-1">
            <p className="text-xs font-medium text-muted-foreground mb-1">Sub-tasks:</p>
            {task.subTasks.map(subTask => (
              <div key={subTask.id} className="flex items-center text-xs">
                <Checkbox
                  id={`subtask-${subTask.id}`}
                  checked={subTask.status === 'done'}
                  // onCheckedChange={(checked) => handleSubTaskStatusChange(subTask.id, checked)}
                  className="mr-2 h-3.5 w-3.5"
                  aria-label={`Mark sub-task ${subTask.name} as ${subTask.status === 'done' ? 'not done' : 'done'}`}
                />
                <label htmlFor={`subtask-${subTask.id}`} className={cn("text-muted-foreground", subTask.status === 'done' && "line-through")}>
                  {subTask.name} ({subTask.estimatedTime})
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
