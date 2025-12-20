// UploadedMaterials.jsx
import React, { useState, useEffect } from 'react';
import {
  Heart,
  Download,
  FileText,
  Video,
  BookOpen,
  ScrollText,
  Calendar,
  User,
} from 'lucide-react';
import p2 from '/Image.jpg';

const defaultUploads = [
  { id: 1, image: p2, name: 'Damian Clarson', course: 'Pipeline Technology (PTE411)', category: 'Past Question', school: 'Babcock University', date: 'Dec 15, 2025' },
  { id: 2, image: null, name: 'Mahmood Bashiru', course: 'Anthropology (ANT211)', category: 'Note/PDF', school: 'Delta State University', date: 'Dec 14, 2025' },
  { id: 3, image: null, name: 'Daniel Lawrence', course: 'Engineering Mathematics (MTH310)', category: 'Past Question', school: 'Rivers State University', date: 'Dec 13, 2025' },
  { id: 4, image: null, name: 'Vivian Ejiofor', course: 'Economics Statistics (ESC211)', category: 'Note/PDF', school: 'Niger Delta University', date: 'Dec 12, 2025' },
  { id: 5, image: null, name: 'Prof. Matthew Sulere', course: 'Biochemistry (BCH401)', category: 'Technical Reviews', school: 'Lagos State University', date: 'Dec 11, 2025' },
  { id: 6, image: null, name: 'Engr. Kola Johnson', course: 'Thermodynamics (MEE320)', category: 'Video Tutorial', school: 'Delta State University', date: 'Dec 10, 2025' },
  { id: 7, image: null, name: 'Dr. Grace Okafor', course: 'Nursing Ethics (NUR305)', category: 'Note/PDF', school: 'University of Port Harcourt', date: 'Dec 9, 2025' },
  { id: 8, image: null, name: 'Prof. Emmanuel Adebayo', course: 'Civil Engineering Design (CVE501)', category: 'Past Question', school: 'Covenant University', date: 'Dec 8, 2025' },
  { id: 9, image: null, name: 'Sarah Okonkwo', course: 'Business Law (LAW212)', category: 'Note/PDF', school: 'Rivers State University', date: 'Dec 7, 2025' },
  { id: 10, image: null, name: 'Michael Adeyemi', course: 'Data Structures (CSC301)', category: 'Technical Reviews', school: 'Lagos State University', date: 'Dec 6, 2025' },
  { id: 11, image: null, name: 'Fatima Yusuf', course: 'Organic Chemistry (CHM202)', category: 'Video Tutorial', school: 'Niger Delta University', date: 'Dec 5, 2025' },
  { id: 12, image: null, name: 'Chinedu Eze', course: 'Microbiology Lab Techniques', category: 'Note/PDF', school: 'Babcock University', date: 'Dec 4, 2025' },
];

function UploadedMaterials({ uploads = defaultUploads }) {
  const data = uploads;

  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('favoriteUploads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFavorites(new Set(parsed));
      } catch (e) {
        localStorage.removeItem('favoriteUploads');
      }
    }
  }, []);

  const updateFavorites = (newSet) => {
    setFavorites(newSet);
    localStorage.setItem('favoriteUploads', JSON.stringify([...newSet]));
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const toggleFavorite = (id) => {
    const newSet = new Set(favorites);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    updateFavorites(newSet);
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Past Questions': return { icon: ScrollText, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' };
      case 'Note/PDF': return { icon: FileText, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' };
      case 'Video Tutorials': return { icon: Video, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' };
      case 'Technical Reviews': return { icon: BookOpen, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' };
      default: return { icon: FileText, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Uploaded Materials ({data.length})
      </h2>

      {data.length === 0 ? (
        <div className="text-center py-16 bg-white/60 dark:bg-slate-800/60 rounded-2xl">
          <p className="text-slate-500 dark:text-slate-400">No materials match your filters.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {data.map((item) => {
            const { icon: CategoryIcon, color: badgeColor } = getCategoryInfo(item.category);
            const isFavorited = favorites.has(item.id);

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-slate-800/90 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden flex flex-col md:flex-row"
              >
                {/* Preview */}
                <div className="md:w-64 h-48 md:h-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.course} className="w-full h-full object-cover" />
                  ) : (
                    <CategoryIcon size={80} className="text-slate-400 dark:text-slate-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                      {item.course}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex items-center gap-2">
                      <User size={16} />
                      Uploaded by {item.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium ${badgeColor}`}>
                        <CategoryIcon size={16} />
                        {item.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Calendar size={16} />
                        {item.date}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.school}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-5">
                    <button className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-2">
                      <Download size={18} />
                      Download
                    </button>
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="p-3 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Heart
                        size={22}
                        className={isFavorited ? 'text-red-500 fill-red-500' : 'text-slate-500 dark:text-slate-400'}
                      />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UploadedMaterials;