import React from "react";
import StatsGrid from './StatsGrid'
import Recent from "./Recent";



function Dashboard(){
    return(
        <div className="space-y-6">
            
            <StatsGrid />

            <Recent />

            

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    
                </div>
            </div>
        </div>
    );
}

export default Dashboard;