// Material.jsx — With Download Loading Toast
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import Schools from './Schools';
import { Download, Heart, FileText, Video, BookOpen, ScrollText, PersonStanding } from 'lucide-react';

const allUploads = [
  { id: 1, name: 'Damian Clarson', course: 'Pipeline Technology (PTE411)', category: 'Past Questions', school: 'Babcock University', department: 'Petroleum Engineering' },
  { id: 2, name: 'Mahmood Bashiru', course: 'Anthropology (ANT211)', category: 'PDF Notes', school: 'Delta State University', department: 'Anthropology' },
  { id: 3, name: 'Daniel Lawrence', course: 'Engineering Mathematics (MTH310)', category: 'Past Questions', school: 'Rivers State University', department: 'Mathematics' },
  { id: 4, name: 'Vivian Ejiofor', course: 'Economics Statistics (ESC211)', category: 'PDF Notes', school: 'Niger Delta University', department: 'Economics' },
  { id: 5, name: 'Prof. Matthew Sulere', course: 'Biochemistry (BCH401)', category: 'Technical Reviews', school: 'Lagos State University', department: 'Biochemistry' },
  { id: 6, name: 'Engr. Kola Johnson', course: 'Thermodynamics (MEE320)', category: 'Video Tutorials', school: 'Delta State University', department: 'Mechanical Engineering' },
  { id: 7, name: 'Dr. Grace Okafor', course: 'Nursing Ethics (NUR305)', category: 'PDF Notes', school: 'University of Port Harcourt', department: 'Nursing' },
  { id: 8, name: 'Sarah Okonkwo', course: 'Business Law (LAW212)', category: 'Past Questions', school: 'Covenant University', department: 'Law' },
  { id: 9, name: 'Michael Adeyemi', course: 'Data Structures (CSC301)', category: 'Technical Reviews', school: 'Lagos State University', department: 'Computer Science' },
  { id: 10, name: 'Fatima Yusuf', course: 'Organic Chemistry (CHM202)', category: 'Video Tutorials', school: 'Niger Delta University', department: 'Chemistry' },
];

function Material() {
  const [filters, setFilters] = useState({
    category: [],
    school: [],
    department: [],
  });

  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('materialFilters');
    if (saved) {
      try {
        setFilters(JSON.parse(saved));
      } catch (e) {
        console.error('Invalid saved filters');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('materialFilters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    const saved = localStorage.getItem('favoriteUploads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed));
        }
      } catch (e) {
        console.error('Invalid favorites data');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favoriteUploads', JSON.stringify([...favorites]));
  }, [favorites]);

  const handleFiltersChange = ({ field, values }) => {
    setFilters(prev => ({
      ...prev,
      [field]: values,
    }));
  };

  const filteredUploads = useMemo(() => {
    return allUploads.filter(upload => {
      const matchCategory = filters.category.length === 0 || filters.category.includes(upload.category);
      const matchSchool = filters.school.length === 0 || filters.school.includes(upload.school);
      const matchDepartment = filters.department.length === 0 || filters.department.includes(upload.department);

      return matchCategory && matchSchool && matchDepartment;
    });
  }, [filters]);

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  const handleDownload = (upload) => {
    const loadingToast = toast.loading('Downloading material...');

    setTimeout(() => {
      toast.update(loadingToast, {
        render: `"${upload.course}" downloaded successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      const notif = {
        id: Date.now(),
        type: 'download',
        message: `You downloaded "${upload.course}" by ${upload.name}`,
        time: new Date().toLocaleString(),
        read: false,
      };

      const savedNotifs = localStorage.getItem('appNotifications') || '[]';
      const notifs = JSON.parse(savedNotifs);
      notifs.unshift(notif);
      localStorage.setItem('appNotifications', JSON.stringify(notifs));
      window.dispatchEvent(new Event('newNotification'));

      // Save full upload object to downloads
      const downloads = JSON.parse(localStorage.getItem('downloadedMaterials') || '[]');
      downloads.unshift(upload); // Add to beginning
      localStorage.setItem('downloadedMaterials', JSON.stringify(downloads));
    }, 2000); // Simulated delay
  };

  const toggleFavorite = (uploadId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(uploadId)) {
        newFavorites.delete(uploadId);
      } else {
        newFavorites.add(uploadId);
      }
      return newFavorites;
    });
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Past Questions': return { icon: ScrollText, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' };
      case 'PDF Notes': return { icon: FileText, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' };
      case 'Video Tutorials': return { icon: Video, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' };
      case 'Technical Reviews': return { icon: BookOpen, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' };
      default: return { icon: FileText, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Educational Materials
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            {filteredUploads.length} material{filteredUploads.length !== 1 ? 's' : ''} available
            {hasActiveFilters && (
              <span className="ml-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                (filtered)
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <Schools onFiltersChange={handleFiltersChange} />

        {/* Materials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUploads.length === 0 ? (
            <div className="col-span-full bg-white/80 dark:bg-slate-900/80 rounded-3xl p-12 text-center border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <p className="text-xl font-medium text-slate-500 dark:text-slate-400">
                No materials match your filters.
              </p>
              <p className="text-slate-400 dark:text-slate-500 mt-3">
                Try adjusting your selection above.
              </p>
            </div>
          ) : (
            filteredUploads.map(upload => {
              const { icon: CategoryIcon, color: badgeColor } = getCategoryInfo(upload.category);
              const isFavorited = favorites.has(upload.id);

              return (
                <div
                  key={upload.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
                        <PersonStanding size={20} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                          {upload.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                          {upload.course}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {upload.school}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                        <CategoryIcon size={12} />
                        {upload.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => toggleFavorite(upload.id)}
                      className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      <Heart size={16} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
                      <span className="text-sm font-medium">Favorite</span>
                    </button>

                    <button
                      onClick={() => handleDownload(upload)}
                      className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      <Download size={16} />
                      <span className="text-sm font-medium">Download</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Material;