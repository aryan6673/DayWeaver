
import type { Task } from '@/types';

const TASKS_STORAGE_KEY = 'dayWeaverTasks';

export function getTasksFromLocalStorage(): Task[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
    if (tasksJson) {
      const parsedTasks = JSON.parse(tasksJson) as Task[];
      // Basic validation: check if it's an array and tasks have ids
      if (Array.isArray(parsedTasks) && parsedTasks.every(task => typeof task.id === 'string')) {
        return parsedTasks;
      }
      console.warn("Invalid task data found in localStorage, returning empty array.");
      localStorage.removeItem(TASKS_STORAGE_KEY); // Clear invalid data
      return [];
    }
    return [];
  } catch (error) {
    console.error("Error reading tasks from localStorage:", error);
    // If parsing fails, it might be corrupted data
    try {
      localStorage.removeItem(TASKS_STORAGE_KEY);
    } catch (removeError) {
      console.error("Error removing corrupted tasks from localStorage:", removeError);
    }
    return []; 
  }
}

export function saveTasksToLocalStorage(tasks: Task[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks to localStorage:", error);
    // Consider notifying user if quota is exceeded, etc.
  }
}
