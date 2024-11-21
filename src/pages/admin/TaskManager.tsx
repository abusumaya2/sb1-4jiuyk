import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { TaskForm } from '../../components/admin/TaskForm';
import { TaskTable } from '../../components/admin/TaskTable';
import { AuthRequired } from '../../components/AuthRequired';
import { getAllTasks, deleteTask } from '../../lib/firebase/admin/tasks';
import { toast } from 'react-hot-toast';
import { useStore } from '../../store/useStore';

export function TaskManager() {
  const { user } = useStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const tasksData = await getAllTasks(user.uid);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(taskId, user.uid);
      toast.success('Task deleted');
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingTask(null);
    loadTasks();
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthRequired requireAdmin>
      <div className="min-h-screen bg-[#13141b] p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Task Manager</h1>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 font-medium active-state"
            >
              <Plus size={20} />
              Create Task
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E2028] text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Task Table */}
          {loading ? (
            <div className="bg-[#1E2028] rounded-lg p-4">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-[#2d2d3d] rounded" />
                ))}
              </div>
            </div>
          ) : (
            <TaskTable
              tasks={filteredTasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            task={editingTask}
            onClose={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
            onSubmit={handleFormSubmit}
            userId={user?.uid}
          />
        )}
      </div>
    </AuthRequired>
  );
}