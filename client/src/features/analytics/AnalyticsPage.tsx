// src/features/analytics/AnalyticsPage.tsx
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyChart } from './DailyChart';
import { WeeklyChart } from './WeeklyChart';
import { MonthlyChart } from './MonthlyChart';

export default function AnalyticsPage() {
  const { data: dailyData, isLoading: isDailyLoading } = useQuery({
    queryKey: ['analytics', 'daily'],
    queryFn: analyticsApi.getDaily
  });

  const { data: weeklyData, isLoading: isWeeklyLoading } = useQuery({
    queryKey: ['analytics', 'weekly'],
    queryFn: analyticsApi.getWeekly
  });

  const { data: monthlyData, isLoading: isMonthlyLoading } = useQuery({
    queryKey: ['analytics', 'monthly'],
    queryFn: analyticsApi.getMonthly
  });

  if (isDailyLoading || isWeeklyLoading || isMonthlyLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {dailyData?.[dailyData.length - 1]?.hours.toFixed(1) || '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {weeklyData && (
                (weeklyData.reduce((acc, curr) => acc + curr.hours, 0) / 
                weeklyData.length).toFixed(1)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {monthlyData && 
                monthlyData.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1)
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Tabs defaultValue="daily" className="p-6">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <DailyChart data={dailyData || []} />
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyChart data={weeklyData || []} />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyChart data={monthlyData || []} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}