// src/features/projects/ProjectDetails.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { timeEntriesApi } from '@/api/time-entries';
import { tasksApi } from '@/api/tasks';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { Timer } from '@/features/time-entries/Timer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(Number(id))
  });

  const { data: timeEntries } = useQuery({
    queryKey: ['time-entries', id],
    queryFn: () => timeEntriesApi.getAll(Number(id))
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getAll(Number(id))
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    }
  });

  if (isProjectLoading || !project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const totalHours = timeEntries?.reduce((acc, entry) => acc + entry.duration / 3600, 0) || 0;
  const totalEarnings = totalHours * project.hourlyRate;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="flex gap-2">
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Project</Button>
            </DialogTrigger>
            <DialogContent>
              <ProjectForm
                isEdit
                projectId={project.id}
                defaultValues={project}
                onSuccess={() => setIsEditModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Project</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the project
                  and all associated time entries and tasks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Hourly Rate</dt>
                <dd className="text-2xl font-bold">${project.hourlyRate}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Total Hours</dt>
                <dd className="text-2xl font-bold">{totalHours.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Total Earnings</dt>
                <dd className="text-2xl font-bold">${totalEarnings.toFixed(2)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Timer</CardTitle>
          </CardHeader>
          <CardContent>
            <Timer projectId={project.id} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="time-entries">
        <TabsList>
          <TabsTrigger value="time-entries">Time Entries</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="time-entries">
          {/* Time entries table */}
        </TabsContent>
        
        <TabsContent value="tasks">
          {/* Tasks table */}
        </TabsContent>
      </Tabs>
    </div>
  );
}