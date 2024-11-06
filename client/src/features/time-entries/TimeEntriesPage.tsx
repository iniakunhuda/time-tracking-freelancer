// src/features/time-entries/TimeEntriesPage.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeEntriesApi } from '@/api/time-entries';
import { projectsApi } from '@/api/projects';
import { tasksApi } from '@/api/tasks';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/Select';
import { Timer } from './Timer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDuration } from '@/lib/utils';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

export default function TimeEntriesPage() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: timeEntries, isLoading: isEntriesLoading } = useQuery({
    queryKey: ['time-entries', selectedProjectId],
    queryFn: () => timeEntriesApi.getAll(selectedProjectId ? Number(selectedProjectId) : undefined)
  });

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll
  });

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll()
  });

  const deleteMutation = useMutation({
    mutationFn: timeEntriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    }
  });

  const handleFilterChange = (value: string) => {
    setSelectedProjectId(value === "all" ? null : value);
  };

  const getProjectName = (projectId: number) => {
    return projects?.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const getTaskName = (taskId: number) => {
    return tasks?.find(t => t.id === taskId)?.title || 'Unknown Task';
  };

  if (isEntriesLoading || isProjectsLoading || isTasksLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // Calculate total duration for filtered entries
  const totalDuration = timeEntries?.reduce((acc, entry) => acc + entry.duration, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Time Entries</h1>
      </div>

      <Card className="p-6">
        <Timer />
      </Card>

      <Card>
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Select
              value={selectedProjectId || "all"}
              onValueChange={handleFilterChange}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500">
              Total Time: {formatDuration(totalDuration)}
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries?.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{getProjectName(entry.projectId)}</TableCell>
                <TableCell>{entry.taskId ? getTaskName(entry.taskId) : '-'}</TableCell>
                <TableCell>{format(new Date(entry.startTime), 'PPp')}</TableCell>
                <TableCell>{format(new Date(entry.endTime), 'PPp')}</TableCell>
                <TableCell>{formatDuration(entry.duration)}</TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Time Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this time entry? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(entry.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {(!timeEntries || timeEntries.length === 0) && (
              <TableRow>
                <TableCell 
                  colSpan={6} 
                  className="text-center py-8 text-gray-500"
                >
                  No time entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}