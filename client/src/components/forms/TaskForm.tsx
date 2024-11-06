// src/components/forms/TaskForm.tsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks';
import { projectsApi } from '@/api/projects';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/Select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/common/Card';

interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultValues?: {
    projectId?: number;
    title?: string;
    description?: string;
    status?: string;
    tags?: string[];
  };
  isEdit?: boolean;
  taskId?: number;
}

const STATUS_OPTIONS = [
  'TODO',
  'IN_PROGRESS',
  'COMPLETED',
  'ON_HOLD'
];

export const TaskForm = ({
  onSuccess,
  onCancel,
  defaultValues = {},
  isEdit = false,
  taskId,
}: TaskFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    projectId: defaultValues.projectId || 0,
    title: defaultValues.title || '',
    description: defaultValues.description || '',
    status: defaultValues.status || 'TODO',
    tags: defaultValues.tags || [],
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (isEdit && taskId) {
        return tasksApi.update(taskId, data);
      }
      return tasksApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Task' : 'New Task'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project</label>
            <Select
              value={formData.projectId.toString()}
              onValueChange={(value) => setFormData({ ...formData, projectId: parseInt(value) })}
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
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
            <Input
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="e.g., urgent, frontend, bug"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};