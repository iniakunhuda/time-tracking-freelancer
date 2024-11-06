// src/api/time-entries.ts
import axios from '@/lib/axios';
import { TimeEntry } from '@/types';

interface TimeEntryResponse {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: null;
  start_time: string;
  end_time: string;
  duration: number;
  project_id: number;
  task_id: number | null;
  user_id: number;
}

const transformResponse = (data: TimeEntryResponse): TimeEntry => ({
  id: data.ID,
  startTime: data.start_time,
  endTime: data.end_time,
  duration: data.duration,
  projectId: data.project_id,
  taskId: data.task_id || undefined,
  userId: data.user_id
});

export const timeEntriesApi = {
  getAll: async (projectId?: number): Promise<TimeEntry[]> => {
    const params = projectId ? { project_id: projectId } : undefined;
    const response = await axios.get<TimeEntryResponse[]>('/time-entries', { params });
    return response.data.map(transformResponse);
  },

  create: async (data: Pick<TimeEntry, 'startTime' | 'endTime' | 'duration' | 'projectId' | 'taskId'>): Promise<TimeEntry> => {
    const response = await axios.post<TimeEntryResponse>('/time-entries', {
      start_time: data.startTime,
      end_time: data.endTime,
      duration: data.duration,
      project_id: data.projectId,
      task_id: data.taskId || null
    });
    return transformResponse(response.data);
  },

  update: async (id: number, data: Partial<TimeEntry>): Promise<TimeEntry> => {
    const response = await axios.put<TimeEntryResponse>(`/time-entries/${id}`, {
      start_time: data.startTime,
      end_time: data.endTime,
      duration: data.duration,
      project_id: data.projectId,
      task_id: data.taskId || null
    });
    return transformResponse(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/time-entries/${id}`);
  }
};