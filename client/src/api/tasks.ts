// src/api/tasks.ts
import axios from '@/lib/axios';
import { Task } from '@/types';

interface TaskResponse {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: null;
  title: string;
  description: string;
  status: string;
  tags: string[];
  project_id: number;
  user_id: number;
  time_entries: any[];
}

const transformResponse = (data: TaskResponse): Task => ({
  id: data.ID,
  title: data.title,
  description: data.description,
  status: data.status,
  tags: Array.isArray(data.tags) ? data.tags : [],
  projectId: data.project_id,
  userId: data.user_id
});

export const tasksApi = {
  getAll: async (projectId?: number): Promise<Task[]> => {
    const params = projectId ? { project_id: projectId } : undefined;
    const response = await axios.get<TaskResponse[]>('/tasks', { params });
    return response.data.map(transformResponse);
  },

  getById: async (id: number): Promise<Task> => {
    const response = await axios.get<TaskResponse>(`/tasks/${id}`);
    return transformResponse(response.data);
  },

  create: async (data: Partial<Task>): Promise<Task> => {
    // Ensure tags is an array
    const tags = Array.isArray(data.tags) ? data.tags : [];
    
    const response = await axios.post<TaskResponse>('/tasks', {
      title: data.title,
      description: data.description,
      status: data.status,
      tags: tags, // Send as array
      project_id: data.projectId
    });
    return transformResponse(response.data);
  },

  update: async (id: number, data: Partial<Task>): Promise<Task> => {
    // Ensure tags is an array
    const tags = Array.isArray(data.tags) ? data.tags : [];

    const response = await axios.put<TaskResponse>(`/tasks/${id}`, {
      title: data.title,
      description: data.description,
      status: data.status,
      tags: tags, // Send as array
      project_id: data.projectId
    });
    return transformResponse(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/tasks/${id}`);
  }
};