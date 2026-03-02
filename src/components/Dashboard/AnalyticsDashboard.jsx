// src/components/Dashboard/AnalyticsDashboard.jsx
// Enhanced mobile experience — card view on narrow screens, better chart scaling

import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { db, auth, storage } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { toast } from 'react-toastify';
import { format, subDays, isSameDay } from 'date-fns';
import {
  Trash2,
  AlertCircle,
  TrendingUp,
  Gem,
  Eye,
  Download,
  FileText,
  Loader2,
  X,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function AnalyticsDashboard() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null); // id of material awaiting confirmation

  // Simple client-side width check
  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 480);

  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 480);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'materials'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      setMaterials(data || []);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Failed to load materials');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredMaterials = useMemo(() => {
    if (timeRange === 'all') return materials;
    const days = { '7d': 7, '30d': 30, '90d': 90 }[timeRange] || 30;
    const cutoff = subDays(new Date(), days);
    return materials.filter((m) => new Date(m.created_at) >= cutoff);
  }, [materials, timeRange]);

  const stats = useMemo(
    () => ({
      totalMaterials: filteredMaterials.length,
      totalDiamonds: filteredMaterials.reduce((sum, m) => sum + (m.diamonds_earned ?? 0), 0),
      totalEarnings: filteredMaterials.reduce((sum, m) => sum + (m.earnings ?? 0), 0),
      totalViews: filteredMaterials.reduce((sum, m) => sum + (m.views ?? 0), 0),
      totalDownloads: filteredMaterials.reduce((sum, m) => sum + (m.downloads ?? 0), 0),
    }),
    [filteredMaterials]
  );

  const chartData = useMemo(() => {
    const days = { '7d': 7, '30d': 30, '90d': 90, 'all': 90 }[timeRange] || 30;
    const labels = [];
    const diamondsData = [];
    const earningsData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      labels.push(format(date, days <= 14 ? 'MMM d' : 'MMM d'));

      const dayItems = filteredMaterials.filter((m) => isSameDay(new Date(m.created_at), date));

      diamondsData.push(dayItems.reduce((sum, m) => sum + (m.diamonds_earned ?? 0), 0));
      earningsData.push(dayItems.reduce((sum, m) => sum + (m.earnings ?? 0), 0));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Diamonds',
          data: diamondsData,
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.16)',
          tension: 0.38,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
          yAxisID: 'y-diamonds',
        },
        {
          label: 'Earnings ($)',
          data: earningsData,
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.16)',
          tension: 0.38,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5,
          yAxisID: 'y-earnings',
        },
      ],
    };
  }, [filteredMaterials, timeRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 10,
          font: { size: isNarrowScreen ? 11 : 12, weight: 500 },
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 50,
          minRotation: 50,
          font: { size: isNarrowScreen ? 10 : 11 },
          maxTicksLimit: isNarrowScreen ? 6 : 12,
        },
      },
      'y-diamonds': {
        position: 'left',
        ticks: { font: { size: isNarrowScreen ? 10 : 11 }, precision: 0 },
        grid: { color: 'rgba(0,0,0,0.05)' },
        beginAtZero: true,
      },
      'y-earnings': {
        position: 'right',
        ticks: { font: { size: isNarrowScreen ? 10 : 11 }, precision: 2 },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
      },
    },
    layout: {
      padding: { top: 6, bottom: isNarrowScreen ? 12 : 16, left: 4, right: 10 }
    }
  };

  const requestDelete = (id, filePath) => {
    setConfirmDeleteId({ id, filePath });
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    const { id, filePath } = confirmDeleteId;

    setConfirmDeleteId(null);
    setDeletingId(id);

    try {
      if (filePath) {
        const fileRef = ref(storage, filePath);
        try {
          await deleteObject(fileRef);
        } catch (storageErr) {
          if (storageErr.code !== 'storage/object-not-found') {
            console.warn('Storage deletion issue:', storageErr);
          }
        }
      }

      await deleteDoc(doc(db, 'materials', id));

      setMaterials(prev => prev.filter(m => m.id !== id));

      toast.success('Material deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      let message = 'Failed to delete material';
      if (err.code === 'permission-denied') {
        message = 'You can only delete your own materials';
      }
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const exportToCSV = () => {
    if (!filteredMaterials.length) {
      toast.info('No data to export');
      return;
    }

    const headers = [
      'Title', 'Category', 'School', 'Course', 'Uploaded At',
      'Views', 'Downloads', 'Diamonds Earned', 'Earnings ($)',
    ];

    const rows = filteredMaterials.map((m) => [
      `"${(m.title || 'Untitled').replace(/"/g, '""')}"`,
      `"${(m.category || '').replace(/"/g, '""')}"`,
      `"${(m.school || '').replace(/"/g, '""')}"`,
      `"${(m.course || '').replace(/"/g, '""')}"`,
      format(new Date(m.created_at), 'yyyy-MM-dd HH:mm:ss'),
      m.views || 0,
      m.downloads || 0,
      m.diamonds_earned || 0,
      (m.earnings ?? 0).toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-materials-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('CSV exported');
  };

  const exportToJSON = () => {
    if (!filteredMaterials.length) {
      toast.info('No data to export');
      return;
    }

    const data = filteredMaterials.map(m => ({
      title: m.title || 'Untitled',
      category: m.category || '',
      school: m.school || '',
      course: m.course || '',
      created_at: m.created_at.toISOString(),
      views: m.views || 0,
      downloads: m.downloads || 0,
      diamonds_earned: m.diamonds_earned || 0,
      earnings: m.earnings ?? 0,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-materials-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('JSON exported');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4">
        <div className="w-14 h-14 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-base font-medium text-slate-600 dark:text-slate-300">
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-16 px-3 sm:px-5 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            Content Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track earnings, views & student engagement
          </p>
        </div>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 
                     rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                     w-full sm:w-auto min-w-[140px] h-10 touch-manipulation"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* ... your stats cards remain unchanged ... */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/70 dark:from-indigo-950/50 dark:to-indigo-900/40 rounded-xl p-4 shadow-md border border-slate-200/60 dark:border-slate-700/50 min-h-[94px] flex items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 ring-1 ring-slate-200/70 dark:ring-slate-700/50">
              <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Materials</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalMaterials.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/70 dark:from-blue-950/50 dark:to-blue-900/40 rounded-xl p-4 shadow-md border border-slate-200/60 dark:border-slate-700/50 min-h-[94px] flex items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 ring-1 ring-slate-200/70 dark:ring-slate-700/50">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Views</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 dark:from-emerald-950/50 dark:to-emerald-900/40 rounded-xl p-4 shadow-md border border-slate-200/60 dark:border-slate-700/50 min-h-[94px] flex items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 ring-1 ring-slate-200/70 dark:ring-slate-700/50">
              <Download className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Downloads</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalDownloads.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100/70 dark:from-violet-950/50 dark:to-violet-900/40 rounded-xl p-4 shadow-md border border-slate-200/60 dark:border-slate-700/50 min-h-[94px] flex items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/50 ring-1 ring-slate-200/70 dark:ring-slate-700/50">
              <Gem className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Diamonds</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {stats.totalDiamonds.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-4 sm:p-6 h-64 sm:h-80 lg:h-96">
        <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2.5 text-slate-900 dark:text-white">
          <TrendingUp className="h-5 w-5 text-indigo-500" />
          Performance Trend
        </h2>
        <div className="h-[calc(100%-40px)]">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Materials Section */}
      <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200/70 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Materials</h2>
          </div>

          {filteredMaterials.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 min-h-[44px]"
              >
                <Download size={16} />
                CSV
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 min-h-[44px] dark:bg-slate-600 dark:hover:bg-slate-800"
              >
                <Download size={16} />
                JSON
              </button>
            </div>
          )}
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="p-10 sm:p-16 text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No materials yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Upload your notes, questions or summaries to start earning and track performance here.
            </p>
          </div>
        ) : isNarrowScreen ? (
          <div className="divide-y divide-slate-200/60 dark:divide-slate-700/50">
            {filteredMaterials.map((m) => {
              const isDeleting = deletingId === m.id;
              return (
                <div
                  key={m.id}
                  className="p-4 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                        {m.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {m.course || m.category || '—'}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-600 dark:text-slate-300">Views:</span>{' '}
                          {m.views?.toLocaleString() || 0}
                        </div>
                        <div>
                          <span className="text-slate-600 dark:text-slate-300">Downloads:</span>{' '}
                          {m.downloads?.toLocaleString() || 0}
                        </div>
                        <div>
                          <span className="text-violet-600 dark:text-violet-400">Diamonds:</span>{' '}
                          {(m.diamonds_earned || 0).toLocaleString()}
                        </div>
                        <div>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Earnings: ${(m.earnings ?? 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => requestDelete(m.id, m.file_path)}
                      disabled={isDeleting}
                      className={`p-3 -mr-2 -mt-1 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center ${
                        isDeleting
                          ? 'text-slate-400 cursor-wait'
                          : 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30'
                      }`}
                      aria-label="Delete material"
                    >
                      {isDeleting ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-400/60 dark:scrollbar-thumb-slate-600/70 scrollbar-track-transparent pb-3">
              <table className="min-w-[680px] w-full divide-y divide-slate-200/60 dark:divide-slate-700/50 text-sm">
                <thead className="bg-slate-50/90 dark:bg-slate-950/70 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Material
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Diamonds
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      Earnings
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {filteredMaterials.map((m) => {
                    const isDeleting = deletingId === m.id;
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors even:bg-slate-50/30 dark:even:bg-slate-800/10"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 dark:text-white max-w-[220px] truncate">
                            {m.title || 'Untitled'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[220px]">
                            {m.course || m.category || '—'}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">
                          {m.views?.toLocaleString() || '0'}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">
                          {m.downloads?.toLocaleString() || '0'}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-violet-600 dark:text-violet-400">
                          {(m.diamonds_earned || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ${(m.earnings ?? 0).toFixed(2)}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <button
                            onClick={() => requestDelete(m.id, m.file_path)}
                            disabled={isDeleting}
                            className={`p-2.5 rounded-full transition-colors ${
                              isDeleting
                                ? 'text-slate-400 cursor-wait'
                                : 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30'
                            }`}
                            aria-label="Delete material"
                          >
                            {isDeleting ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modern Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            onClick={cancelDelete}
          />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-3 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Delete this material?
                  </h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    This will permanently remove the material and its associated file. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={cancelDelete}
                  className="px-5 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors min-w-[100px]"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium rounded-lg shadow-md transition-colors min-w-[100px] flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;