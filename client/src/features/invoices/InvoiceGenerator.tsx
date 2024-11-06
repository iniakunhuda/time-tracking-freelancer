// src/features/invoices/InvoiceGenerator.tsx
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { invoicesApi } from '@/api/invoices';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/Select';
import { FileDown } from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface InvoiceEntry {
  date: string;
  hours: number;
  description?: string;
}

const generatePDF = (data: any) => {
  const doc = new jsPDF();
  
  // Add company logo/header
  doc.setFontSize(20);
  doc.text('INVOICE', 105, 20, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(12);
  doc.text('Invoice Details:', 14, 40);
  doc.setFontSize(10);
  doc.text(`Project: ${data.projectName}`, 14, 50);
  doc.text(`Period: ${format(new Date(data.startDate), 'PP')} - ${format(new Date(data.endDate), 'PP')}`, 14, 60);
  doc.text(`Rate: $${data.hourlyRate}/hour`, 14, 70);

  // Add client details on the right
  doc.setFontSize(10);
  const rightColumn = 140;
  doc.text('Invoice Date:', rightColumn, 50);
  doc.text(format(new Date(), 'PP'), rightColumn + 30, 50);
  doc.text('Invoice #:', rightColumn, 60);
  doc.text(Math.random().toString(36).substr(2, 9).toUpperCase(), rightColumn + 30, 60);

  // Add time entries table
  const tableHeaders = [['Date', 'Hours', 'Amount']];
  const tableData = data.entries.map((entry: InvoiceEntry) => [
    format(new Date(entry.date), 'PP'),
    entry.hours.toFixed(2),
    `$${(entry.hours * data.hourlyRate).toFixed(2)}`
  ]);

  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: 80,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  });

  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(10);
  doc.setFont('', 'bold');
  doc.text('Total Hours:', 120, finalY + 20);
  doc.text(data.totalHours.toFixed(2), 170, finalY + 20);
  doc.text('Total Amount:', 120, finalY + 30);
  doc.text(`$${data.totalAmount.toFixed(2)}`, 170, finalY + 30);

  // Add footer
  doc.setFont('', 'normal');
  doc.setFontSize(8);
  const footerText = 'Thank you for your business!';
  doc.text(footerText, 105, 280, { align: 'center' });

  // Save the PDF
  doc.save(`invoice-${data.projectName}-${format(new Date(data.startDate), 'yyyy-MM-dd')}.pdf`);
};

export default function InvoiceGenerator() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll
  });

  // const generateMutation = useMutation({
  //   mutationFn: invoicesApi.generate,
  //   onSuccess: (data) => {
  //     // Handle invoice data - could download as PDF or display
  //     console.log('Invoice generated:', data);
  //   }
  // });

  // Update generateMutation to include PDF generation
  const generateMutation = useMutation({
    mutationFn: invoicesApi.generate,
    onSuccess: (data) => {
      console.log('Invoice generated:', data);
    }
  });

  // Add handleDownloadPDF function
  const handleDownloadPDF = () => {
    if (generateMutation.data) {
      generatePDF(generateMutation.data);
    }
  };

  const handleGenerate = () => {
    if (!selectedProjectId || !dateRange.startDate || !dateRange.endDate) return;

    generateMutation.mutate({
      projectId: selectedProjectId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  };

  if (isProjectsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Generate Invoice</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <Select
              value={selectedProjectId?.toString() || ''}
              onValueChange={(value) => setSelectedProjectId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={!selectedProjectId || !dateRange.startDate || !dateRange.endDate || generateMutation.isPending}
          >
            <FileDown className="w-4 h-4 mr-2" />
            {generateMutation.isPending ? 'Generating...' : 'Generate Invoice'}
          </Button>

          {generateMutation.error && (
            <div className="text-sm text-red-500">
              Error generating invoice. Please try again.
            </div>
          )}
        </CardContent>
      </Card>

      {generateMutation.data && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Project:</span>{' '}
                {generateMutation.data.projectName}
              </div>
              <div>
                <span className="font-medium">Period:</span>{' '}
                {new Date(generateMutation.data.startDate).toLocaleDateString()} -{' '}
                {new Date(generateMutation.data.endDate).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Total Hours:</span>{' '}
                {generateMutation.data.totalHours.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Rate:</span>{' '}
                ${generateMutation.data.hourlyRate}/hour
              </div>
              <div>
                <span className="font-medium">Total Amount:</span>{' '}
                ${generateMutation.data.totalAmount.toFixed(2)}
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleDownloadPDF}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}