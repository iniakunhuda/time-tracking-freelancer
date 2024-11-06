import axios from '@/lib/axios';
import { Analytics } from '@/types';

interface AnalyticsResponse {
  date: string;
  hours: number;
  totalTasks?: number;
  completedTasks?: number;
  totalProjects?: number;
}

export const analyticsApi = {
  getDaily: async (): Promise<AnalyticsResponse[]> => {
    const response = await axios.get('/analytics/daily');
    return response.data;
  },

  getWeekly: async (): Promise<AnalyticsResponse[]> => {
    const response = await axios.get('/analytics/weekly');
    return response.data;
  },

  getMonthly: async (): Promise<AnalyticsResponse[]> => {
    const response = await axios.get('/analytics/monthly');
    return response.data;
  },
};