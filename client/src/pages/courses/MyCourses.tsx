import { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-red-500/20 text-red-400',
};

const COURSE_COLORS = ['#F5C518', '#3B82F6', '#EF4444', '#22C55E', '#A855F7', '#F97316'];

export default function MyCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({ code: '', name: '', difficulty: 'medium' });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const result = await courseService.getAll();
      setCourses(result.data || []);
    } catch (err) {
      console.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await courseService.create({
        ...newCourse,
        color: COURSE_COLORS[courses.length % COURSE_COLORS.length],
      });
      setShowForm(false);
      setNewCourse({ code: '', name: '', difficulty: 'medium' });
      loadCourses();
    } catch (err) {
      console.error('Failed to create course');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this course?')) {
      await courseService.delete(id);
      loadCourses();
    }
  };

  const totalCourses = courses.length;
  const hardCourses = courses.filter((c) => c.difficulty === 'hard').length;
  const avgRetention = courses.length > 0
    ? Math.round(courses.reduce((sum, c) => sum + (c.retention_pct || 0), 0) / courses.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Courses</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
          >
            + Add Course
          </button>
        )}
      </div>

      {/* Mastery Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-white">{totalCourses}</div>
          <div className="text-white/50 text-xs mt-1">Active Courses</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-red-400">{hardCourses}</div>
          <div className="text-white/50 text-xs mt-1">Hard Courses</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-[#F5C518]">{avgRetention}%</div>
          <div className="text-white/50 text-xs mt-1">Avg Retention</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <div className="text-3xl font-bold text-green-400">0h</div>
          <div className="text-white/50 text-xs mt-1">Deep Work</div>
        </div>
      </div>

      {/* Add Course Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Add New Course</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-1">Course Code *</label>
                <input
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                  placeholder="e.g. MATH 201"
                  required
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Course Name *</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
                  placeholder="e.g. Calculus II"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1">Difficulty</label>
              <select
                value={newCourse.difficulty}
                onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#F5C518]"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-[#F5C518] text-[#0D0F3C] font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-all"
              >
                Add Course
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

      {/* Course Cards */}
      {loading ? (
        <p className="text-white/50 text-center py-8">Loading courses...</p>
      ) : courses.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-white/50 text-lg">No courses yet. Add your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all flex flex-col justify-between h-48"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: course.color + '20' }}
                    >
                      <span className="text-lg" style={{ color: course.color }}>
                        📘
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium truncate">{course.code}</div>
                      <div className="text-white/40 text-sm truncate">{course.name}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.medium}`}>
                    {course.difficulty}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/50">Retention</span>
                  <span className="text-white">{course.retention_pct || 0}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${course.retention_pct || 0}%`,
                      backgroundColor: course.color || '#F5C518',
                    }}
                  />
                </div>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="mt-3 text-red-400 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}