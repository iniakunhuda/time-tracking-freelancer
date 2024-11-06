import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { timeEntriesApi } from '@/api/time-entries';

export function useTimer(projectId?: number) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const queryClient = useQueryClient();

  const createEntry = useMutation({
    mutationFn: timeEntriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });

  useEffect(() => {
    let intervalId: number;
    if (isRunning && startTime) {
      intervalId = window.setInterval(() => {
        setElapsed(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, startTime]);

  const start = () => {
    if (!projectId) return;
    setIsRunning(true);
    setStartTime(new Date());
  };

  const stop = async () => {
    if (!projectId || !startTime) return;
    setIsRunning(false);
    
    const endTime = new Date();
    
    await createEntry.mutateAsync({
      projectId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: elapsed
    });
    
    setStartTime(null);
    setElapsed(0);
  };

  return {
    isRunning,
    elapsed,
    start,
    stop,
    isLoading: createEntry.isPending
  };
}