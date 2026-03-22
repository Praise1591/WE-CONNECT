// Dashboard.jsx
import React from "react";
import StatsGrid from './StatsGrid';
import Recent from "./Recent";

function Dashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <StatsGrid />
                <Recent />
            </div>
        </div>
    );
}

export default Dashboard;