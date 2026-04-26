// Dashboard.jsx - Enhanced Version (No Enclosing Box)
import React from "react";
import StatsGrid from './StatsGrid';
import Recent from "./Recent";
import { motion } from "framer-motion";

function Dashboard() {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
        >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                <StatsGrid />
                <Recent />
            </div>
        </motion.div>
    );
}

export default Dashboard;