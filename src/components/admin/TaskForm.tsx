import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { createTask, updateTask } from '../../lib/firebase/admin/tasks';
import { toast } from 'react-hot-toast';
import * as Icons from 'lucide-react';

interface TaskFormProps {
  task?: any;
  onClose: () => void;
  onSubmit: () => void;
  userId?: string;
}

const TASK_TYPES = [
  { id: 'limited', label: 'Limited Time' },
  { id: 'ingame', label: 'In-game' },
  { id: 'partner', label: 'Partner' }
];

const GAME_CONDITIONS = [
  { id: 'mining_streak', label: 'Mining Streak' },
  { id: 'mining_daily', label: 'Daily Mining Count' },
  { id: 'referrals', label: 'Total Referrals' },
  { id: 'trades', label: 'Total Trades' }
];

export function TaskForm({ task, onClose, onSubmit, userId }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    type: task?.type || 'limited',
    reward: task?.reward || 1000,
    duration: task?.duration || 3600,
    icon: task?.icon || 'Star',
    condition: task?.condition || {
      type: 'mining_streak',
      target: 1
    },
    link: task?.link || '',
    linkType: task?.linkType || 'telegram'
  });

  const [submitting, setSubmitting] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setSubmitting(true);
      const taskData = {
        ...formData,
        userId,
        // Only include condition for in-game tasks
        ...(formData.type === 'ingame' ? { condition: formData.condition } : {})
      };
      
      if (task) {
        await updateTask(task.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await createTask(taskData);
        toast.success('Task created successfully');
      }
      onSubmit();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E2028] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1E2028] flex justify-between items-center p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold">
            {task ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Task Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full bg-[#2d2d3d] text-white px-3 py-2 rounded-lg"
            >
              {TASK_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {formData.type === 'ingame' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Condition Type
                </label>
                <select
                  value={formData.condition.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    condition: {
                      ...prev.condition,
                      type: e.target.value
                    }
                  }))}
                  className="w-full bg-[#2d2d3d] text-white px-3 py-2 rounded-lg"
                >
                  {GAME_CONDITIONS.map(condition => (
                    <option key={condition.id} value={condition.id}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Target Value
                </label>
                <input
                  type="number"
                  value={formData.condition.target}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    condition: {
                      ...prev.condition,
                      target: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full bg-[#2d2d3d] text-white px-3 py-2 rounded-lg"
                  min="1"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-[#2d2d3d] text-white px-3 py-2 rounded-lg"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-[#2d2d3d] text-white px-3 py-2 rounded-lg min-h-[100px]"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Reward (PTS)
            </label>
            <input
              type="number"
              value={formData.reward}
              onChange={(e) => setFormData(prev => ({ ...prev, reward: parseInt(e.target.value) }))}
              className="w-full bg-[#2d2d3d] text-white px-3 py-2 rounded-lg"
              min="1"
            />
          </div>

          {formData.type === 'limited' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full bg-[#2d2d3d] text-white px-3 py-2 rounded-lg"
                min="1"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Icon
            </label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full bg-[#2d2d3d] text-white px-3 py-2 rounded-lg"
            >
              {Object.keys(Icons).map(iconName => (
                <option key={iconName} value={iconName}>
                  {iconName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}