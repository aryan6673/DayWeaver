
'use client';

import { useState, useEffect } from 'react';
import type { Task, TaskStatus } from '@/types';
import { TaskItem } from './task-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Search, Filter, ListChecksIcon } from 'lucide-react'; // Changed ListChecks import for clarity
import { useToast } from '@/hooks/use-toast';
import { getTasksFromLocalStorage, saveTasksToLocalStorage } from '@/lib/task-storage';
import { Card, CardContent } from '@/components/ui/card'; // Added Card imports

// Sample initial tasks for demonstration - will be overridden by localStorage if present
const fallbackInitialTasks: Task[] = [
  { id: 'fallback-1', name: 'Welcome to Dey Weaver!', description: 'Add your first task using the "Add Task" button.', dueDate: new Date().toISOString(), priority: 'medium', status: 'todo', category: 'General' },
];

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // To prevent flicker with localStorage
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({ name: '', description: '', priority: 'medium', status: 'todo' });

  const { toast } = useToast();

  useEffect(() => {
    const loadedTasks = getTasksFromLocalStorage();
    setTasks(loadedTasks.length > 0 ? loadedTasks : fallbackInitialTasks);
    setIsLoaded(true);
  }, []);

  // Persist tasks to localStorage whenever the tasks array changes
  useEffect(() => {
    if (isLoaded) { // Only save after initial load to avoid overwriting
      saveTasksToLocalStorage(tasks);
    }
  }, [tasks, isLoaded]);


  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status } : task
      )
    );
    toast({ title: "Task Updated", description: `Task status changed to ${status}.` });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    toast({ title: "Task Deleted", description: "The task has been removed." });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTask(task);
    setIsModalOpen(true);
  };

  const handleOpenModalForNew = () => {
    setEditingTask(null);
    setNewTask({ name: '', description: '', priority: 'medium', status: 'todo', dueDate: new Date().toISOString().split('T')[0] });
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!newTask.name?.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Task name is required.' });
      return;
    }

    if (editingTask) {
      setTasks(prevTasks => prevTasks.map(t => t.id === editingTask.id ? { ...t, ...newTask } as Task : t));
      toast({ title: 'Task Updated', description: 'Your task has been successfully updated.'});
    } else {
      const taskToAdd: Task = {
        id: String(Date.now()), // Simple unique ID
        ...newTask,
        name: newTask.name.trim(),
        status: newTask.status || 'todo',
      };
      setTasks(prevTasks => [taskToAdd, ...prevTasks]);
      toast({ title: 'Task Added', description: 'New task successfully created.'});
    }
    setIsModalOpen(false);
    setNewTask({ name: '', description: '', priority: 'medium', status: 'todo' }); // Reset form
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearchTerm = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearchTerm && matchesStatus && matchesPriority;
  });

  if (!isLoaded) {
    // You can show a loader here if preferred
    return <div className="text-center p-8">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
           <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as 'all' | 'low' | 'medium' | 'high')}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleOpenModalForNew} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Task
        </Button>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <ListChecksIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No tasks found</h3>
            <p className="text-muted-foreground">
              {tasks.length > 0 ? "Try adjusting your filters or search term." : "Get started by adding a new task or creating an AI schedule!"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update the details of your task.' : 'Fill in the details for your new task.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskName" className="text-right">Name</Label>
              <Input id="taskName" value={newTask.name || ''} onChange={(e) => setNewTask(prev => ({...prev, name: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskDescription" className="text-right">Description</Label>
              <Textarea id="taskDescription" value={newTask.description || ''} onChange={(e) => setNewTask(prev => ({...prev, description: e.target.value}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskDueDate" className="text-right">Due Date</Label>
              <Input type="date" id="taskDueDate" value={newTask.dueDate ? newTask.dueDate.split('T')[0] : ''} onChange={(e) => setNewTask(prev => ({...prev, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined}))} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskPriority" className="text-right">Priority</Label>
              <Select value={newTask.priority || 'medium'} onValueChange={(value) => setNewTask(prev => ({...prev, priority: value as 'low' | 'medium' | 'high'}))}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskCategory" className="text-right">Category</Label>
              <Input id="taskCategory" value={newTask.category || ''} onChange={(e) => setNewTask(prev => ({...prev, category: e.target.value}))} className="col-span-3" placeholder="e.g., Work, Study"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="taskStatus" className="text-right">Status</Label>
                <Select value={newTask.status || 'todo'} onValueChange={(value) => setNewTask(prev => ({...prev, status: value as TaskStatus}))}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="inprogress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsModalOpen(false); setNewTask({}); setEditingTask(null); } }>Cancel</Button>
            <Button onClick={handleSaveTask}>Save Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
