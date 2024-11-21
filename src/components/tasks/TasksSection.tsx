import React from 'react';
import { TaskCard } from './TaskCard';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: React.ReactNode;
  timeLeft?: number;
  progress?: number;
  total?: number;
  status: 'available' | 'active' | 'completed';
}

interface TasksSectionProps {
  title: string;
  icon: React.ReactNode;
  tasks: Task[];
}

export function TasksSection({ title, icon, tasks }: TasksSectionProps) {
  if (tasks.length === 0) return null;

  return (
    <div className="bg-[#1E2028] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="font-bold">{title}</h2>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            {...task}
            onStart={() => console.log('Start task:', task.id)}
            onClaim={() => console.log('Claim task:', task.id)}
          />
        ))}
      </div>
    </div>
  );
}