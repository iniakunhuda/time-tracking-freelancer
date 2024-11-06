// src/components/forms/ProjectForm.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/common/Card';

interface ProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultValues?: {
    name?: string;
    description?: string;
    hourlyRate?: number;
  };
  isEdit?: boolean;
  projectId?: number;
}

export const ProjectForm = ({
  onSuccess,
  onCancel,
  defaultValues = {},
  isEdit = false,
  projectId,
}: ProjectFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: defaultValues.name || '',
    description: defaultValues.description || '',
    hourlyRate: defaultValues.hourlyRate || 0,
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (isEdit && projectId) {
        return projectsApi.update(projectId, data);
      }
      return projectsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Project' : 'New Project'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Project Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Description
            </label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="hourlyRate">
              Hourly Rate ($)
            </label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
              required
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
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};