// StatsGrid.jsx — Clean, Personalized & Balanced (Welcoming + Stats)
import React from 'react';
import { BookOpen, Users, Video, Download, Heart, TrendingUp } from 'lucide-react';

function StatsGrid() {
  const user = JSON.parse(localStorage.getItem('userProfile')) || { name: 'Student' };

  const stats = [
    { icon: BookOpen, label: 'Materials Available', value: '124,563', color: 'text-indigo-600' },
    { icon: Users, label: 'Active Users', value: '8,549', color: 'text-emerald-600' },
    { icon: Video, label: 'Video Tutorials', value: '2,847', color: 'text-purple-600' },
    { icon: Download, label: 'Total Downloads', value: '456K+', color: 'text-teal-600' },
    { icon: Heart, label: 'Favorites Saved', value: '32,145', color: 'text-pink-600' },
    { icon: TrendingUp, label: 'Growth This Month', value: '+15.3%', color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Simple Personalized Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white text-center shadow-xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          Welcome back, {user.name.split(' ')[0]}! 👋
        </h2>
        <p className="text-lg opacity-90">
          Ready to learn and connect today?
        </p>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 text-center hover:shadow-xl transition-shadow"
          >
            <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
            <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StatsGrid;