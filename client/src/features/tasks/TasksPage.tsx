// src/features/tasks/TasksPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks';
import { projectsApi } from '@/api/projects';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { PlusIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/Select';
import { TaskForm } from '@/components/forms/TaskForm';
import { TaskList } from './TaskList';

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: tasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: () => tasksApi.getAll(selectedProjectId ? Number(selectedProjectId) : undefined)
  });

  const { data: projects, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll
  });

  if (isTasksLoading || isProjectsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <TaskForm 
              onSuccess={() => setIsCreateModalOpen(false)}
              defaultValues={{ projectId: selectedProjectId ? Number(selectedProjectId) : undefined }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <div className="p-4">
          <Select
            value={selectedProjectId || "all"}
            onValueChange={(value) => setSelectedProjectId(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Project" />
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
        </div>

        <TaskList 
          tasks={tasks || []} 
          projects={projects || []}
          selectedProjectId={selectedProjectId ? Number(selectedProjectId) : null}
        />
      </Card>
    </div>
  );
}