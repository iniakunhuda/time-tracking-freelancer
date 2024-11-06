// src/features/time-entries/Timer.tsx
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { tasksApi } from '@/api/tasks';
import { Button } from '@/components/common/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/common/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Play, Square } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { useTimer } from '@/contexts/TimerContext';
import { useEffect, useState } from 'react';

interface TimerProps {
  projectId?: number;
  taskId?: number;
}

export function Timer({ projectId: defaultProjectId, taskId: defaultTaskId }: TimerProps) {
  const {
    isRunning,
    elapsed,
    selectedProjectId,
    selectedTaskId,
    startTimer,
    stopTimer
  } = useTimer();

  const [localProjectId, setLocalProjectId] = useState(
    defaultProjectId?.toString() || selectedProjectId || null
  );
  const [localTaskId, setLocalTaskId] = useState(
    defaultTaskId?.toString() || selectedTaskId || null
  );

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', localProjectId],
    queryFn: () => localProjectId ? tasksApi.getAll(parseInt(localProjectId)) : Promise.resolve([]),
    enabled: !!localProjectId
  });

  const handleProjectChange = (value: string) => {
    setLocalProjectId(value);
    setLocalTaskId(null);
  };

  const handleStart = () => {
    if (!localProjectId || !localTaskId) return;
    startTimer(localProjectId, localTaskId);
  };

  useEffect(() => {
    if (defaultProjectId) setLocalProjectId(defaultProjectId.toString());
    if (defaultTaskId) setLocalTaskId(defaultTaskId.toString());
  }, [defaultProjectId, defaultTaskId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-4">
          {!defaultProjectId && (
            <div className="w-full md:w-64">
              <Select
                value={localProjectId || ""}
                onValueChange={handleProjectChange}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Project" />
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
          )}

          {localProjectId && !defaultTaskId && (
            <div className="w-full md:w-64">
              <Select
                value={localTaskId || ""}
                onValueChange={setLocalTaskId}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks?.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="font-mono text-3xl min-w-[180px] text-center">
            {formatDuration(elapsed)}
          </div>

          <Button
            onClick={isRunning ? stopTimer : handleStart}
            disabled={!localProjectId || !localTaskId}
            variant={isRunning ? "destructive" : "default"}
            className="w-[100px]"
          >
            {isRunning ? (
              <><Square className="h-4 w-4 mr-2" /> Stop</>
            ) : (
              <><Play className="h-4 w-4 mr-2" /> Start</>
            )}
          </Button>
        </div>

        {localProjectId && !localTaskId && tasks?.length === 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            No tasks available for this project. Please create a task first.
          </div>
        )}
      </CardContent>
    </Card>
  );
}