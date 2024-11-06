import axios from '@/lib/axios';
import { Project } from '@/types';

interface CreateProjectRequest {
  name: string;
  description: string;
  hourlyRate: number;
}

// Type for the backend response
interface ProjectResponse {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: null;
  name: string;
  description: string;
  hourly_rate: number;
  user_id: number;
  time_entries: any[] | null;
  tasks: any[] | null;
}

// Transform backend response to match our Project interface
const transformResponse = (data: ProjectResponse): Project => ({
  id: data.ID,
  name: data.name,
  description: data.description,
  hourlyRate: data.hourly_rate,
  userId: data.user_id
});

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await axios.get<ProjectResponse[]>('/projects');
    return response.data.map(transformResponse);
  },

  getById: async (id: number): Promise<Project> => {
    const response = await axios.get<ProjectResponse>(`/projects/${id}`);
    return transformResponse(response.data);
  },

  create: async (data: Partial<Project>): Promise<Project> => {
    const response = await axios.post<ProjectResponse>('/projects', {
      name: data.name,
      description: data.description,
      hourly_rate: data.hourlyRate // Convert to snake_case when sending to backend
    });
    return transformResponse(response.data);
  },

  update: async (id: number, data: Partial<Project>): Promise<Project> => {
    const response = await axios.put<ProjectResponse>(`/projects/${id}`, {
      name: data.name,
      description: data.description,
      hourly_rate: data.hourlyRate // Convert to snake_case when sending to backend
    });
    return transformResponse(response.data);
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/projects/${id}`);
  }
};