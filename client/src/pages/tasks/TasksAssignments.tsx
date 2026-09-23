import { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import { courseService } from '../../services/courseService';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'bg-white/10' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500/20' },
  { key: 'in_review', label: 'In Review', color: 'bg-yellow-500/20' },
  { key: 'completed', label: 'Completed', color: 'bg-green-500/20' },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: 'border-l-red-400',
  mid: 'border-l-yellow-400',
  low: 'border-l-blue-400',
};

export default function TasksAssignments() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    course_id: '',
    priority: 'mid',
    due_date: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [taskRes, courseRes] = await Promise.all([
        taskService.getAll(),
        courseService.getAll(),
      ]);
      setTasks(taskRes.data || []);
      setCourses(courseRes.data || []);
    } catch (err) {
      console.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await taskService.create({
        title: newTask.title,
        course_id: newTask.course_id || undefined,
        priority: newTask.priority,
        due_date: new Date(newTask.due_date).toISOString(),
      });
      setShowForm(false);
      setNewTask({ title: '', course_id: '', priority: 'mid', due_date: '' });
      loadData();
    } catch (err) {
      console.error('Failed to create task');
    }
  };

  const handleMove = async (taskId: string, newStatus: string) => {
    await taskService.updateStatus(taskId, newStatus);
    loadData();
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Delete this task?')) {
      await taskService.delete(taskId);
      loadData();
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((t) => t.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Tasks & Assignments</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
          >
            + New Task
          </button>
        )}
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create New Task</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-1">Title *</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                placeholder="e.g. Calculus Assignment 4"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Course</label>
                <select
                  value={newTask.course_id}
                  onChange={(e) => setNewTask({ ...newTask, course_id: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                >
                  <option value="">No course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                >
                  <option value="low">Low</option>
                  <option value="mid">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Due Date *</label>
              <input
                type="datetime-local"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board - only shown when form is closed */}
      {!showForm && (
        loading ? (
          <p className="text-white/50 text-center py-8">Loading tasks...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((col) => {
              const columnTasks = getTasksByStatus(col.key);
              return (
                <div key={col.key} className={`rounded-2xl p-4 ${col.color} border border-white/10`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold text-sm">{col.label}</h3>
                    <span className="text-white/50 text-xs">{columnTasks.length}</span>
                  </div>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`bg-white/5 border-l-4 ${PRIORITY_COLORS[task.priority] || 'border-l-gray-400'} rounded-xl p-3 relative`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-white text-sm font-medium mb-1 flex-1">{task.title}</div>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-medium flex-shrink-0"
                            title="Delete task"
                          >
                            ✕
                          </button>
                        </div>
                        {task.course_code && (
                          <span className="text-xs text-white/50">{task.course_code}</span>
                        )}
                        <div className="text-white/40 text-xs mt-1">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {COLUMNS.filter((c) => c.key !== col.key).map((otherCol) => (
                            <button
                              key={otherCol.key}
                              onClick={() => handleMove(task.id, otherCol.key)}
                              className="text-xs text-white/50 hover:text-white hover:bg-white/10 px-2 py-1 rounded-lg transition-all"
                            >
                              → {otherCol.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {columnTasks.length === 0 && (
                      <p className="text-white/30 text-sm text-center py-4">No tasks</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}