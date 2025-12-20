// StatsGrid.jsx
import React from "react";
import { ArrowUpRight, ArrowDownRight, BookCopy, Users, Video, Eye } from "lucide-react";

const stats = [
  {
    title: "Total Materials Available",
    value: "124,563",
    change: "+12.5%",
    trend: "up",
    icon: BookCopy,
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    bgDark: "dark:bg-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    progress: 82,
  },
  {
    title: "Active Users",
    value: "8,549",
    change: "+8.2%",
    trend: "up",
    icon: Users,
    gradient: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    bgDark: "dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
    progress: 75,
  },
  {
    title: "Total Video Tutorials",
    value: "2,847",
    change: "+15.3%",
    trend: "up",
    icon: Video,
    gradient: "from-purple-500 to-pink-600",
    bgLight: "bg-purple-50",
    bgDark: "dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
    progress: 88,
  },
  {
    title: "Page Views",
    value: "45,892",
    change: "-2.1%",
    trend: "down",
    icon: Eye,
    gradient: "from-orange-500 to-red-600",
    bgLight: "bg-orange-50",
    bgDark: "dark:bg-orange-900/30",
    textColor: "text-orange-600 dark:text-orange-400",
    progress: 62,
  },
];

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
        const trendColor = stat.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";

        return (
          <div
            key={index}
            className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
          >
            {/* Header: Title + Icon */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.title}
              </p>
              <div className={`p-3 rounded-2xl ${stat.bgLight} ${stat.bgDark} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>

            {/* Value */}
            <p className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
              {stat.value}
            </p>

            {/* Change Indicator */}
            <div className="flex items-center gap-2 mb-6">
              <TrendIcon className={`w-5 h-5 ${trendColor} group-hover:translate-x-1 transition-transform`} />
              <span className={`text-sm font-bold ${trendColor}`}>
                {stat.change}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                vs last month
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${stat.progress}%` }}
              />
              <div className="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-full animate-pulse" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsGrid;