import React from "react";
import StatsGrid from './StatsGrid'
import Recent from "./Recent";
import Schools from "./Schools";
import Uploads from "./uploads";



function Material(){
    return(
        <div className="space-y-6">
            
            <Schools />

            <Uploads />

            

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    
                </div>
            </div>
        </div>
    );
}

export default Material;