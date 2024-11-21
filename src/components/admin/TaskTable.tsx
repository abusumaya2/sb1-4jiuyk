import React from 'react';
import { Edit2, Trash2, Clock, Gift, Users } from 'lucide-react';

interface TaskTableProps {
  tasks: any[];
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
}

export function TaskTable({ tasks, onEdit, onDelete }: TaskTableProps) {
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.toDate()).toLocaleString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'limited':
        return <Clock size={16} className="text-purple-400" />;
      case 'ingame':
        return <Gift size={16} className="text-blue-400" />;
      case 'partner':
        return <Users size={16} className="text-green-400" />;
      default:
        return null;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-[#1E2028] rounded-lg p-8 text-center">
        <p className="text-gray-400">No tasks found</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1E2028] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#2d2d3d]">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Reward</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Duration</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Created</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-[#2d2d3d]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(task.type)}
                    <span className="capitalize">{task.type}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{task.title}</td>
                <td className="px-4 py-3 text-yellow-400">
                  {task.reward.toLocaleString()} PTS
                </td>
                <td className="px-4 py-3">
                  {Math.floor(task.duration / 3600)}h {Math.floor((task.duration % 3600) / 60)}m
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {formatDate(task.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1 hover:bg-blue-600/20 rounded-lg text-blue-400"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="p-1 hover:bg-red-600/20 rounded-lg text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}