// src/contexts/TimerContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { timeEntriesApi } from '@/api/time-entries';

interface TimerContextType {
  isRunning: boolean;
  startTime: Date | null;
  elapsed: number;
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  startTimer: (projectId: string, taskId: string) => void;
  stopTimer: () => Promise<void>;
  resetTimer: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: timeEntriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    }
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

  const startTimer = (projectId: string, taskId: string) => {
    setIsRunning(true);
    setStartTime(new Date());
    setSelectedProjectId(projectId);
    setSelectedTaskId(taskId);
  };

  const stopTimer = async () => {
    if (!selectedProjectId || !selectedTaskId || !startTime) return;
    
    setIsRunning(false);
    const endTime = new Date();
    
    await createMutation.mutateAsync({
      projectId: parseInt(selectedProjectId),
      taskId: parseInt(selectedTaskId),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: elapsed
    });
    
    resetTimer();
  };

  const resetTimer = () => {
    setStartTime(null);
    setElapsed(0);
    setSelectedProjectId(null);
    setSelectedTaskId(null);
  };

  // Safety: Stop timer when user closes/refreshes the page
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (isRunning) {
        await stopTimer();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning]);

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        startTime,
        elapsed,
        selectedProjectId,
        selectedTaskId,
        startTimer,
        stopTimer,
        resetTimer
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}