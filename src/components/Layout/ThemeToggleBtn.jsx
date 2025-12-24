// components/Layout/ThemeToggleBtn.jsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggleBtn = () => {
  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 shadow-md flex items-center justify-center"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </button>
  );
};

export default ThemeToggleBtn;