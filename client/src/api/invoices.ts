import axios from '@/lib/axios';

interface GenerateInvoiceRequest {
  projectId: number;
  startDate: string;
  endDate: string;
}

interface InvoiceResponse {
  id: string;
  projectName: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  hourlyRate: number;
  totalAmount: number;
  entries: Array<{
    date: string;
    hours: number;
    description?: string;
  }>;
}

export const invoicesApi = {
  generate: async (data: GenerateInvoiceRequest): Promise<InvoiceResponse> => {
    const response = await axios.post('/invoices/generate', data);
    return response.data;
  },
};