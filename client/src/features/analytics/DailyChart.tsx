// src/features/analytics/DailyChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';

interface DailyChartProps {
  data: Array<{
    date: string;
    hours: number;
    totalTasks?: number;
    completedTasks?: number;
  }>;
}

export function DailyChart({ data }: DailyChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Time Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Hours']}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">Total Hours</div>
            <div className="text-2xl font-bold">
              {data.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Daily Average</div>
            <div className="text-2xl font-bold">
              {(data.reduce((acc, curr) => acc + curr.hours, 0) / data.length).toFixed(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}