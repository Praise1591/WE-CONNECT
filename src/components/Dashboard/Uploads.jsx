import React from 'react';
import { PersonStanding, MoreVertical } from 'lucide-react';

const teachers = [
  {
    id: 1,
    name: 'Damian Clarson',
    course: 'Pipeline Technology (PTE411)',
    category: 'Past Question',
    school: 'Babcock University',
  },
  {
    id: 2,
    name: 'Mahmood Bashiru',
    course: 'Anthropology (ANT211)',
    category: 'Note/PDF',
    school: 'Delta State University',
  },
  {
    id: 3,
    name: 'Daniel Lawrence',
    course: 'Engineering Mathematics (MTH310)',
    category: 'Past Question',
    school: 'Rivers State University',
  },
  {
    id: 4,
    name: 'Vivian Ejiofor',
    course: 'Economics Statistics (ESC211)',
    category: 'Note/PDF',
    school: 'Niger Delta University',
  },
  {
    id: 5,
    name: 'Prof. Matthew Sulere',
    course: 'Biochemistry',
    category: 'Technical Reviews',
    school: 'Lagos State University',
  },
  {
    id: 6,
    name: 'Engr. Kola Johnson',
    course: 'Thermodynamics',
    category: 'Video Tutorial',
    school: 'Delta State University',
  },
  // Add more as needed...
];

function Uploads() {
  return (
    <div className="teacher--list bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Recent Uploads
        </h2>
      </div>

      <div className="space-y-4">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200 border border-slate-200/30 dark:border-slate-700/30"
          >
            {/* Left: Avatar + Details */}
            <div className="flex items-center gap-4 flex-1">
              {/* Avatar with Icon */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <PersonStanding size={24} />
              </div>

              {/* Teacher Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 dark:text-white truncate">
                  {teacher.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                  {teacher.course}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-500">
                  <span>{teacher.school}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    {teacher.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: More Options */}
            <button
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="More options"
            >
              <MoreVertical size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Uploads;