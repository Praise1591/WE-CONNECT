// WelcomeStats.jsx
import React from 'react';
import { BookOpen, DownloadCloud, Users, Video, Heart, ArrowUpRight } from 'lucide-react';
import CountUp from 'react-countup';

function WelcomeStats() {
  const user = JSON.parse(localStorage.getItem('userProfile')) || { name: 'Praise' };

  const stats = [
    { icon: BookOpen,       label: 'Total Materials',     value: 124563,    color: 'from-indigo-500 to-indigo-600' },
    { icon: DownloadCloud,  label: 'Downloads',           value: 456720,    color: 'from-teal-500 to-teal-600'    },
    { icon: Users,          label: 'Active Learners',     value: 8549,      color: 'from-emerald-500 to-emerald-600' },
    { icon: Video,          label: 'Video Lessons',       value: 2847,      color: 'from-purple-500 to-purple-600'  },
    { icon: Heart,          label: 'Favorites Created',   value: 32145,     color: 'from-pink-500 to-rose-600'     },
  ];

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Hey Praise 👋
          </h1>
          <p className="mt-3 text-indigo-100 text-lg font-light">
            Discover, learn, and grow — your next favorite material is waiting.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/15 backdrop-blur-sm px-5 py-3 rounded-2xl flex items-center gap-3">
              <ArrowUpRight className="w-5 h-5" />
              <div>
                <p className="text-xs opacity-80">This week</p>
                <p className="font-semibold">+184 materials</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-8 h-8 opacity-90" />
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold">
                  <CountUp end={stat.value} separator="," duration={2.2} />
                  {stat.value > 10000 ? '+' : ''}
                </p>
                <p className="text-xs md:text-sm mt-1 opacity-90 font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WelcomeStats;