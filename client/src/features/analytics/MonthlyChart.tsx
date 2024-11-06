// src/features/analytics/MonthlyChart.tsx
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';

interface MonthlyChartProps {
  data: Array<{
    date: string;
    hours: number;
    totalTasks?: number;
    completedTasks?: number;
  }>;
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
  }));

  const totalHours = data.reduce((acc, curr) => acc + curr.hours, 0);
  const monthlyAverage = totalHours / data.length;
  const peakHours = Math.max(...data.map(d => d.hours));
  const monthlyGrowth = data.length >= 2
    ? ((data[data.length - 1].hours - data[0].hours) / data[0].hours * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Hours']}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#3b82f6"
                fill="#93c5fd"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">Total Hours</div>
            <div className="text-2xl font-bold">
              {totalHours.toFixed(1)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Monthly Average</div>
            <div className="text-2xl font-bold">
              {monthlyAverage.toFixed(1)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Peak Hours</div>
            <div className="text-2xl font-bold">
              {peakHours.toFixed(1)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Growth</div>
            <div className="text-2xl font-bold">
              {monthlyGrowth.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}