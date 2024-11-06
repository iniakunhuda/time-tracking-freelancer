
export interface User {
  id: number;
  email: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  hourlyRate: number;
  userId: number;
}

export interface TimeEntry {
  id: number;
  startTime: string;
  endTime: string;
  duration: number;
  projectId: number;
  taskId?: number;
  userId: number;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: string;
  tags: string[];
  userId: number;
}

export interface Analytics {
  date: string;
  hours: number;
  totalTasks?: number;
  completedTasks?: number;
  totalProjects?: number;
}

export interface Invoice {
  id: string;
  projectId: number;
  userId: number;
  startDate: string;
  endDate: string;
  totalHours: number;
  hourlyRate: number;
  totalAmount: number;
  entries: TimeEntry[];
}