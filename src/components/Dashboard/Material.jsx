import React from "react";

import Schools from "./Schools";
import Recent from "./Recent";



function Material(){
    return(
        <div className="space-y-6">
            
            <Schools />

            <Recent />

            

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    
                </div>
            </div>
        </div>
    );
}

export default Material;