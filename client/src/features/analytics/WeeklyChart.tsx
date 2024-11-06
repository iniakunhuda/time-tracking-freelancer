// src/features/analytics/WeeklyChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';

interface WeeklyChartProps {
  data: Array<{
    date: string;
    hours: number;
    totalTasks?: number;
    completedTasks?: number;
  }>;
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Hours']}
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">Total Hours</div>
            <div className="text-2xl font-bold">
              {data.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Weekly Average</div>
            <div className="text-2xl font-bold">
              {(data.reduce((acc, curr) => acc + curr.hours, 0) / data.length).toFixed(1)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Peak Hours</div>
            <div className="text-2xl font-bold">
              {Math.max(...data.map(d => d.hours)).toFixed(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}