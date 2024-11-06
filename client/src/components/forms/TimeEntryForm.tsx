// src/components/forms/TimeEntryForm.tsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { timeEntriesApi } from '@/api/time-entries';
import { projectsApi } from '@/api/projects';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/Select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/common/Card';

interface TimeEntryFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultValues?: {
    projectId?: number;
    startTime?: string;
    endTime?: string;
  };
  isEdit?: boolean;
  entryId?: number;
}

export const TimeEntryForm = ({
  onSuccess,
  onCancel,
  defaultValues = {},
  isEdit = false,
  entryId,
}: TimeEntryFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    projectId: defaultValues.projectId || 0,
    startTime: defaultValues.startTime || '',
    endTime: defaultValues.endTime || '',
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload = {
        ...data,
        duration: calculateDuration(data.startTime, data.endTime),
      };
      
      if (isEdit && entryId) {
        return timeEntriesApi.update(entryId, payload);
      }
      return timeEntriesApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      onSuccess?.();
    },
  });

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Time Entry' : 'New Time Entry'}</CardTitle>
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
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <Input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <Input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Entry' : 'Create Entry'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};