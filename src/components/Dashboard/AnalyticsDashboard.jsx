// AnalyticsDashboard.jsx - Complete Redesign with Modern UI/UX
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
import { motion, AnimatePresence } from 'framer-motion';
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
  Banknote,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Sparkles,
  Award,
  Target,
  Clock,
  CheckCircle,
  FileSymlink,
  Share2,
  MoreVertical,
  Layers,
  Zap,
  Infinity,
  Coins,
  Wallet,
  TrendingDown,
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const VALUE_PER_DIAMOND = 60;

function AnalyticsDashboard() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 768);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [hoveredStat, setHoveredStat] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 768);
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

  const stats = useMemo(() => {
    const totalDiamondsEarned = filteredMaterials.reduce(
      (sum, m) => sum + (Number(m.diamonds_earned) || 0),
      0
    );

    const totalViews = filteredMaterials.reduce((sum, m) => sum + (Number(m.views) || 0), 0);
    const totalDownloads = filteredMaterials.reduce((sum, m) => sum + (Number(m.downloads) || 0), 0);

    // Calculate growth percentages (compare with previous period)
    const previousPeriodDays = { '7d': 7, '30d': 30, '90d': 90, 'all': 90 }[timeRange] || 30;
    const previousCutoff = subDays(new Date(), previousPeriodDays * 2);
    const previousMaterials = materials.filter((m) => {
      const date = new Date(m.created_at);
      return date >= previousCutoff && date < subDays(new Date(), previousPeriodDays);
    });

    const previousDiamonds = previousMaterials.reduce((sum, m) => sum + (Number(m.diamonds_earned) || 0), 0);
    const diamondGrowth = previousDiamonds === 0 ? 100 : ((totalDiamondsEarned - previousDiamonds) / previousDiamonds) * 100;

    return {
      totalMaterials: filteredMaterials.length,
      totalDiamondsEarned,
      totalAvailableValue: totalDiamondsEarned * VALUE_PER_DIAMOND,
      totalViews,
      totalDownloads,
      diamondGrowth,
      avgValuePerMaterial: filteredMaterials.length > 0 ? (totalDiamondsEarned * VALUE_PER_DIAMOND) / filteredMaterials.length : 0,
    };
  }, [filteredMaterials, materials, timeRange]);

  const chartData = useMemo(() => {
    const days = { '7d': 7, '30d': 30, '90d': 90, 'all': 90 }[timeRange] || 30;
    const labels = [];
    const diamondsData = [];
    const earningsData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      labels.push(format(date, days <= 14 ? 'MMM d' : 'MMM d'));

      const dayItems = filteredMaterials.filter((m) => isSameDay(new Date(m.created_at), date));

      diamondsData.push(dayItems.reduce((sum, m) => sum + (Number(m.diamonds_earned) || 0), 0));
      earningsData.push(dayItems.reduce((sum, m) => sum + (Number(m.diamonds_earned || 0) * VALUE_PER_DIAMOND), 0));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Diamonds Earned',
          data: diamondsData,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#8b5cf6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          yAxisID: 'y-diamonds',
        },
        {
          label: `Value Earned (₦${VALUE_PER_DIAMOND}/diamond)`,
          data: earningsData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#10b981',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
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
          padding: 15,
          font: { size: isNarrowScreen ? 11 : 12, weight: 500 },
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (context.dataset.label?.includes('Value')) {
              return `${label}: ₦${value.toLocaleString()}`;
            }
            return `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { size: isNarrowScreen ? 9 : 11 },
          maxTicksLimit: isNarrowScreen ? 6 : 12,
        },
      },
      'y-diamonds': {
        position: 'left',
        title: {
          display: true,
          text: 'Diamonds',
          font: { size: 11, weight: 500 },
          color: '#8b5cf6',
        },
        ticks: { font: { size: isNarrowScreen ? 10 : 11 }, precision: 0 },
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        beginAtZero: true,
      },
      'y-earnings': {
        position: 'right',
        title: {
          display: true,
          text: 'Value (₦)',
          font: { size: 11, weight: 500 },
          color: '#10b981',
        },
        ticks: {
          font: { size: isNarrowScreen ? 10 : 11 },
          precision: 0,
          callback: (value) => `₦${value.toLocaleString()}`,
        },
        grid: { drawOnChartArea: false },
        beginAtZero: true,
      },
    },
    layout: {
      padding: { top: 10, bottom: 10, left: 5, right: 10 },
    },
    elements: {
      line: {
        borderJoin: 'round',
        borderCap: 'round',
      },
    },
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
      toast.success('Material deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error(err.code === 'permission-denied' ? 'You can only delete your own materials' : 'Failed to delete material');
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  const exportToCSV = () => {
    if (!filteredMaterials.length) {
      toast.info('No data to export');
      return;
    }

    const headers = [
      'Title', 'Category', 'School', 'Course', 'Uploaded At',
      'Views', 'Downloads', 'Diamonds Earned', 'Total Value Earned (₦)',
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
      ((m.diamonds_earned || 0) * VALUE_PER_DIAMOND).toLocaleString(),
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-materials-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
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
      total_value_earned_naira: (m.diamonds_earned || 0) * VALUE_PER_DIAMOND,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-materials-${timeRange}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    toast.success('JSON exported');
  };

  const statCards = [
    {
      icon: FileText,
      label: 'Materials',
      value: stats.totalMaterials,
      color: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/50',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Total uploaded',
    },
    {
      icon: Eye,
      label: 'Views',
      value: stats.totalViews,
      color: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: 'Total views',
    },
    {
      icon: Download,
      label: 'Downloads',
      value: stats.totalDownloads,
      color: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      description: 'Total downloads',
    },
    {
      icon: Gem,
      label: 'Diamonds',
      value: stats.totalDiamondsEarned,
      color: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20',
      iconBg: 'bg-violet-100 dark:bg-violet-900/50',
      iconColor: 'text-violet-600 dark:text-violet-400',
      description: 'Lifetime earned',
      suffix: '💎',
      growth: stats.diamondGrowth,
    },
    {
      icon: Wallet,
      label: 'Total Value',
      value: `₦${stats.totalAvailableValue.toLocaleString()}`,
      color: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
      iconColor: 'text-amber-600 dark:text-amber-400',
      description: `${stats.totalDiamondsEarned.toLocaleString()} diamonds × ₦${VALUE_PER_DIAMOND}`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-950 dark:to-indigo-950/20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Loader2 className="w-12 h-12 text-indigo-600" />
        </motion.div>
        <p className="text-slate-600 dark:text-slate-400">Loading your analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Content Analytics
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 ml-1">
              Track your content performance and earnings
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              onMouseEnter={() => setHoveredStat(idx)}
              onMouseLeave={() => setHoveredStat(null)}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  {stat.growth !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                      stat.growth >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.growth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(stat.growth).toFixed(1)}%
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    {stat.suffix && <span className="text-lg ml-1">{stat.suffix}</span>}
                  </p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{stat.description}</p>
                </div>
              </div>
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
            </motion.div>
          ))}
        </motion.div>

        {/* Average Value Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-indigo-100">Average Value Per Material</p>
                <p className="text-2xl font-bold text-white">
                  ₦{stats.avgValuePerMaterial.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-indigo-100">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Based on {stats.totalMaterials} materials</span>
            </div>
          </div>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Trend</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              <span>Updated in real-time</span>
            </div>
          </div>
          <div className="h-72 sm:h-80 lg:h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </motion.div>

        {/* Materials Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
        >
          <div className="p-5 sm:p-6 border-b border-slate-200/70 dark:border-slate-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Materials</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {filteredMaterials.length} {filteredMaterials.length === 1 ? 'material' : 'materials'} in this period
                  </p>
                </div>
              </div>

              {filteredMaterials.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl shadow-md transition-all"
                  >
                    <Download size={16} />
                    Export Data
                    <ChevronDown size={14} />
                  </button>
                  
                  <AnimatePresence>
                    {showExportMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-10"
                      >
                        <button
                          onClick={exportToCSV}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                          <FileText size={14} />
                          CSV Format
                        </button>
                        <button
                          onClick={exportToJSON}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                          <FileSymlink size={14} />
                          JSON Format
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No materials yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Upload your notes, past questions, or study materials to start earning diamonds and track your performance.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Material</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Views</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Downloads</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Diamonds</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value (₦)</th>
                    <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  <AnimatePresence>
                    {filteredMaterials.map((material, idx) => {
                      const isDeleting = deletingId === material.id;
                      return (
                        <motion.tr
                          key={material.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white line-clamp-1">
                                {material.title || 'Untitled'}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {material.category || 'Uncategorized'} • {material.course || 'No course'}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Eye className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">
                                {material.views?.toLocaleString() || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Download className="w-3 h-3 text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">
                                {material.downloads?.toLocaleString() || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Gem className="w-3 h-3 text-violet-500" />
                              <span className="font-semibold text-violet-600 dark:text-violet-400">
                                {(material.diamonds_earned || 0).toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              ₦{((material.diamonds_earned || 0) * VALUE_PER_DIAMOND).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => requestDelete(material.id, material.file_path)}
                              disabled={isDeleting}
                              className={`p-2 rounded-lg transition-all ${
                                isDeleting
                                  ? 'text-slate-400 cursor-wait'
                                  : 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                            >
                              {isDeleting ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelDelete} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-950/50 rounded-full">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Delete this material?
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      This action cannot be undone. The material and its associated file will be permanently removed.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AnalyticsDashboard;