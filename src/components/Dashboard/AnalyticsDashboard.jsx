// src/components/Dashboard/AnalyticsDashboard.jsx
// Enhanced mobile responsiveness + CSV & JSON export – 2025–2026 style

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
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'react-toastify';
import { format, subDays, isSameDay } from 'date-fns';
import {
  Trash2,
  AlertCircle,
  TrendingUp,
  Gem,
  DollarSign,
  UploadCloud,
  Eye,
  Download,
  FileText,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function AnalyticsDashboard() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!user) return;

    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMaterials(data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load materials');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();

    const channel = supabase
      .channel(`materials-user-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materials',
          filter: `owner_id=eq.${user.id}`,
        },
        (payload) => {
          setMaterials((prev) => {
            if (payload.eventType === 'INSERT') return [payload.new, ...prev];
            if (payload.eventType === 'UPDATE') return prev.map((m) => (m.id === payload.new.id ? payload.new : m));
            if (payload.eventType === 'DELETE') return prev.filter((m) => m.id !== payload.old.id);
            return prev;
          });
          toast.info('Materials updated in real-time', { autoClose: 3000 });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredMaterials = useMemo(() => {
    if (timeRange === 'all') return materials;
    const days = { '7d': 7, '30d': 30, '90d': 90 }[timeRange] || 30;
    const cutoff = subDays(new Date(), days);
    return materials.filter((m) => new Date(m.created_at) >= cutoff);
  }, [materials, timeRange]);

  const stats = useMemo(
    () => ({
      totalMaterials: filteredMaterials.length,
      totalDiamonds: filteredMaterials.reduce((sum, m) => sum + (m.diamonds ?? 0), 0),
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

      diamondsData.push(dayItems.reduce((sum, m) => sum + (m.diamonds ?? 0), 0));
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
          padding: 16,
          font: { size: window.innerWidth < 640 ? 12 : 13, weight: 500 },
          boxWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 0, font: { size: window.innerWidth < 640 ? 11 : 12 } },
      },
      'y-diamonds': {
        position: 'left',
        title: { display: window.innerWidth >= 768, text: 'Diamonds', color: '#a78bfa', font: { size: 13 } },
        ticks: { font: { size: window.innerWidth < 640 ? 11 : 12 } },
        grid: { color: 'rgba(0,0,0,0.06)' },
        beginAtZero: true,
      },
      'y-earnings': {
        position: 'right',
        title: { display: window.innerWidth >= 768, text: 'Earnings ($)', color: '#34d399', font: { size: 13 } },
        ticks: { font: { size: window.innerWidth < 640 ? 11 : 12 } },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
      },
    },
  };

  const exportToCSV = () => {
    if (!filteredMaterials.length) {
      toast.info('No data to export');
      return;
    }

    const headers = [
      'Title',
      'Category',
      'School',
      'Course',
      'Uploaded At',
      'Views',
      'Downloads',
      'Diamonds',
      'Earnings ($)',
    ];

    const rows = filteredMaterials.map((m) => [
      `"${(m.title || 'Untitled').replace(/"/g, '""')}"`,
      `"${(m.category || '').replace(/"/g, '""')}"`,
      `"${(m.school || '').replace(/"/g, '""')}"`,
      `"${(m.course || '').replace(/"/g, '""')}"`,
      format(new Date(m.created_at), 'yyyy-MM-dd HH:mm:ss'),
      m.views || 0,
      m.downloads || 0,
      m.diamonds || 0,
      (m.earnings ?? 0).toFixed(2),
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-materials-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('CSV file downloaded');
  };

  const exportToJSON = () => {
    if (!filteredMaterials.length) {
      toast.info('No data to export');
      return;
    }

    const data = filteredMaterials.map((m) => ({
      title: m.title || 'Untitled',
      category: m.category || '',
      school: m.school || '',
      course: m.course || '',
      created_at: m.created_at,
      views: m.views || 0,
      downloads: m.downloads || 0,
      diamonds: m.diamonds || 0,
      earnings: m.earnings ?? 0,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-materials-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('JSON file downloaded');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material permanently?')) return;
    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4">
        <div className="w-14 h-14 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300">
          Loading your analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 sm:pb-16 px-3 sm:px-5 lg:px-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sm:gap-6 pt-2 sm:pt-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            Content Analytics
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Track earnings, views & student engagement
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 bg-white/90 dark:bg-slate-800/80 border border-slate-300/70 dark:border-slate-600/60 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500/50 text-sm font-medium transition-all"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        <StatCard icon={UploadCloud} label="Uploads" value={stats.totalMaterials} color="indigo" />
        <StatCard icon={Gem} label="Diamonds" value={stats.totalDiamonds.toLocaleString()} color="violet" />
        <StatCard icon={DollarSign} label="Earnings" value={`$${stats.totalEarnings.toFixed(2)}`} color="emerald" />
        <StatCard icon={Eye} label="Views" value={stats.totalViews.toLocaleString()} color="blue" />
      </div>

      {/* Chart */}
      <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 overflow-hidden">
        <div className="p-5 sm:p-6 lg:p-7">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Performance Trend</h2>
          </div>
          <div className="h-64 sm:h-80 lg:h-[420px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Materials Table + Export buttons */}
      <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/70 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-500" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Your Materials</h2>
          </div>

          {filteredMaterials.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:bg-slate-600 dark:hover:bg-slate-500"
              >
                <Download size={16} />
                Export JSON
              </button>
            </div>
          )}
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="p-10 sm:p-16 text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 sm:h-14 sm:w-14 text-slate-400" />
            <h3 className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-300">No materials yet</h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Upload notes, past questions or summaries to start earning and see analytics here.
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="sm:hidden absolute right-2 top-4 bg-indigo-500/80 text-white text-xs px-2.5 py-1 rounded-full z-10 animate-pulse">
              Swipe ←→
            </div>

            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              <table className="min-w-[900px] w-full divide-y divide-slate-200/70 dark:divide-slate-700/60">
                <thead className="bg-slate-50/90 dark:bg-slate-950/60 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                      Course
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                      Uploaded
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      ↓
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Diamonds
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-3 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Del
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredMaterials.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors duration-150"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900 dark:text-white text-sm sm:text-base truncate max-w-[180px] sm:max-w-xs">
                          {m.title || 'Untitled'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[180px] sm:max-w-xs">
                          {m.category} • {m.school}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300 hidden lg:table-cell">
                        {m.course || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300 hidden md:table-cell whitespace-nowrap">
                        {format(new Date(m.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                        {m.views?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-300">
                        {m.downloads?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-violet-600 dark:text-violet-400">
                        {m.diamonds?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        ${(m.earnings ?? 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-2 rounded-lg text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors touch-manipulation"
                          aria-label="Delete material"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const gradients = {
    indigo: 'from-indigo-50 to-indigo-100/70 dark:from-indigo-950/50 dark:to-indigo-900/40',
    violet: 'from-violet-50 to-violet-100/70 dark:from-violet-950/50 dark:to-violet-900/40',
    emerald: 'from-emerald-50 to-emerald-100/70 dark:from-emerald-950/50 dark:to-emerald-900/40',
    blue: 'from-blue-50 to-blue-100/70 dark:from-blue-950/50 dark:to-blue-900/40',
  };

  const iconColors = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    violet: 'text-violet-600 dark:text-violet-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div
      className={`bg-gradient-to-br ${gradients[color]} rounded-2xl p-4 sm:p-6 shadow-md border border-slate-200/60 dark:border-slate-700/50 hover:shadow-lg transition-all duration-300 group`}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <div
          className={`p-3 sm:p-4 rounded-xl bg-white/60 dark:bg-slate-900/50 ring-1 ring-inset ring-slate-200/70 dark:ring-slate-700/50 group-hover:scale-105 transition-transform`}
        >
          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${iconColors[color]}`} />
        </div>
        <div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;