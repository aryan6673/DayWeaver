
export type TaskStatus = 'todo' | 'inprogress' | 'done' | 'blocked';

export interface SubTask {
  id: string;
  name: string;
  estimatedTime: string; // e.g., "1hr", "30min"
  status: TaskStatus;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  dueDate?: string; // ISO string
  priority?: 'low' | 'medium' | 'high';
  status: TaskStatus;
  subTasks?: SubTask[];
  category?: string; // e.g., "Work", "Personal", "Study"
  startTime?: string; // ISO string for scheduled start
  endTime?: string; // ISO string for scheduled end
}

// For Dynamic Task Reallocation input
export interface CurrentTaskInput {
  name: string;
  dueDate: string; // ISO format (YYYY-MM-DD)
  duration: number; // hours
}

// Firebase User
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}
