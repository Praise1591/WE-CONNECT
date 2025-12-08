import React from 'react'
import { Search, Upload } from 'lucide-react'
import Recent from './Recent'
import Uploads from './uploads'


function Schools() {
  return (
    <div className="flex-6 flex-cols-1 md:flex-cols-2 xl:flex-cols-2 gap-4">
        <div className="container mx-aut0 flex justify-between items-center py-4 px-6 md:px-20 lg:px-32 bg-transparent ">
                {/*<img src="" alt="" />
                <ul className="hidden md:flex gap-20 text-white">
                    <a href="#Header" className="cursor-pointer hover:text-gray-400 text-white">Class Notes</a>
                    <a href="#About" className="cursor-pointer hover:text-gray-400 text-white">Video Tutorials</a>
                    <a href="#Projects" className="cursor-pointer hover:text-gray-400 text-white">Past Questions</a>
                    <a href="#Contact" className="cursor-pointer hover:text-gray-400 text-white">Technical Reviews</a>
                    
                </ul>*/}
                <div className='relative'>
                        <Search className='w-4 h-4 absolute left-3 top-1/2 transform  -translate-y-1/2 text-slate-400'/>
                        <select type="text" placeholder='Search Anything' className='w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200  dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'>
                            <option value="">Default Material</option>
                            <option value="">Pdf Note</option>
                            <option value="">Video Tutorial</option>
                            <option value="">Technical Reviews</option>
                            <option value="">Past Questions</option>
                        </select>
                        
                        
                        {/*<button className='absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>8
                            <Filter />
                        </button>*/}
                    </div>
                <div className='max-w-md'>
                    <div className='relative'>
                        <Search className='w-4 h-4 absolute left-3 top-1/2 transform  -translate-y-1/2 text-slate-400'/>
                        <select type="text" placeholder='Search Anything' className='w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200  dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'>
                            <option value="">Default School</option>
                            <option value="">Rivers State University</option>
                            <option value="">Covenant University</option>
                            <option value="">Delta State University</option>
                            <option value="">Lagos State University</option>
                            <option value="">Petroleum Training Institute Effurun</option>
                            <option value="">University of Port-Harcourt</option>
                            <option value="">Niger Delta University</option>
                        </select>
                        
                        {/*<button className='absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>8
                            <Filter />
                        </button>*/}
                    </div>

                </div>
                <div className='max-w-md'>
                    <div className='relative'>
                        <Search className='w-4 h-4 absolute left-3 top-1/2 transform  -translate-y-1/2 text-slate-400'/>
                            <select type="text" placeholder='Search Anything' className='w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200  dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center space-x-3'>
                                <option value="">Dehault Course</option>
                                <option value="">Mathematics</option>
                                <option value="">Antropology</option>
                                <option value="">Petroleum Engineering</option>
                                <option value="">Mechanical Engineering</option>
                                <option value="">Fishery</option>
                                <option value="">Soil Science</option>
                                <option value="">Law</option>
                                <option value="">Biochemistry</option>
                                <option value="">Medical Sciences</option>
                                <option value="">Electrical Engineering</option>
                                <option value="">Marine Engineering</option>
                                <option value="">Public Health</option>
                                <option value="">Business Administration</option>
                                <option value="">Accountancy</option>
                                <option value="">Book keeping</option>
                                <option value="">Nursing</option>
                                <option value="">Agric/Enviromental Engineering</option>
                                <option value="">Mass Communication</option>
                                <option value="">English Studies</option>
                                <option value="">French and Linguistic Studies</option>
                                <option value="">Chemistry</option>
                                <option value="">Libary Studies</option>
                                <option value="">Anatomy</option>
                                <option value="">Petrochemical Engineering</option>
                                <option value="">Civil Engineering</option>
                                <option value="">Pharmacy</option>
                                <option value="">Physics</option>
                                <option value="">Micro Biology</option>
                            </select>
                        {/*<div className="relative">
                            <button className='mx-20'>
                                <Search className='w-4 h-4 absolute left-3 top-1/2 transform  -translate-y-1/2 text-slate-400'/>
                            </button>
                        </div>*/}
                        
                        {/*<button className='absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>8
                            <Filter />
                        </button>*/}
                    </div>
                    

                </div>
                
                    <Search className='w-4 h-4 absolute left-3 top-1/2 transform  -translate-y-1/2 text-slate-400'/>
                
                
        </div>
        
    </div>
  )
}

export default Schools