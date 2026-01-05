// DownloadsPage.jsx — Redesigned with Professional & Soothing Touch
import React, { useState, useEffect } from 'react';
import {
  Download as DownloadIcon,
  MoreVertical,
  FileText,
  Video,
  BookOpen,
  ScrollText,
  Trash2,
  Calendar,
  University,
  FileDown,
} from 'lucide-react';

function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const loadDownloads = () => {
      const saved = localStorage.getItem('downloadedMaterials');
      if (saved) {
        try {
          setDownloads(JSON.parse(saved));
        } catch (e) {
          console.error('Invalid downloads data');
        }
      }
    };

    loadDownloads();

    window.addEventListener('downloadsUpdated', loadDownloads);

    return () => {
      window.removeEventListener('downloadsUpdated', loadDownloads);
    };
  }, []);

  const removeDownload = (id) => {
    const newDownloads = downloads.filter(item => item.id !== id);
    setDownloads(newDownloads);
    localStorage.setItem('downloadedMaterials', JSON.stringify(newDownloads));
    window.dispatchEvent(new Event('downloadsUpdated'));
    setOpenMenuId(null); // Close menu after delete
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Past Questions': return { icon: ScrollText, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' };
      case 'PDF Notes': return { icon: FileText, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' };
      case 'Video Tutorials': return { icon: Video, color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' };
      case 'Technical Reviews': return { icon: BookOpen, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' };
      default: return { icon: FileText, color: 'bg-gray-50 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400' };
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (downloads.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50/80 to-blue-50/60 dark:from-slate-900/80 dark:to-slate-800/60 rounded-3xl p-12 text-center border border-slate-200/30 dark:border-slate-700/40">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-8 shadow-inner">
          <DownloadIcon size={48} className="text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
          No downloads yet
        </h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md">
          Start exploring materials and your downloaded items will appear here for easy access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-4">
            My Downloads
            <DownloadIcon className="text-blue-600 dark:text-blue-400" size={32} />
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            {downloads.length} {downloads.length === 1 ? 'item' : 'items'} downloaded
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        {downloads.map((item) => {
          const { icon: CategoryIcon, color: badgeColor } = getCategoryInfo(item.category);
          const isMenuOpen = openMenuId === item.id;

          return (
            <div
              key={item.id}
              className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-xl transition-all duration-400 ease-out hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  {/* Category Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${badgeColor} flex items-center justify-center shadow-md`}>
                    <CategoryIcon size={32} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 text-base">
                      {item.course}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <University size={18} />
                        <span>{item.school}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={18} />
                        <span>Downloaded {new Date(item.downloadDate || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-medium ${badgeColor}`}>
                        <CategoryIcon size={16} />
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Menu */}
                <div className="relative ml-4">
                  <button
                    onClick={(e) => toggleMenu(item.id, e)}
                    className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors"
                  >
                    <MoreVertical size={22} className="text-slate-500 dark:text-slate-400" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/70 dark:border-slate-700/70 overflow-hidden z-10">
                      <button
                        onClick={() => removeDownload(item.id)}
                        className="w-full px-5 py-4 flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 size={20} />
                        <div className="text-left">
                          <p className="font-medium">Remove from Downloads</p>
                          <p className="text-xs opacity-80 mt-0.5">This item will no longer appear here</p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DownloadsPage;