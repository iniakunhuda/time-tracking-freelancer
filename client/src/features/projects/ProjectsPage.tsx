// src/features/projects/ProjectsPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { PlusIcon } from 'lucide-react';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function ProjectsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ProjectForm onSuccess={() => setIsCreateModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{project.description}</p>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">Rate:</span> ${project.hourlyRate}/hr
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`/projects/${project.id}`}>View Details</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {projects?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No projects found. Create your first project to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}