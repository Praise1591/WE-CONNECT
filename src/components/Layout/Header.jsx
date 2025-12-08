import { Menu } from 'lucide-react';
import { Search } from 'lucide-react';
import { Filter } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Sun } from 'lucide-react';
import { Bell } from 'lucide-react'
import { Settings } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import React from "react";
import { SunIcon, MoonIcon } from 'lucide-react';
import { Coins, CoinsIcon } from 'lucide-react';
import { Diamond, DiamondPlusIcon } from 'lucide-react';


function Header({sidebarCollapsed, onToggleSidebar}){
    return(
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center space-x-4">
                    <button className="p-2 rounded-lg text-slate-600 
                    dark:text-slate-300 hover:bg-slate-100 
                    dark:hover:bg-slate-800 transition-colors"
                    onClick={onToggleSidebar}>
                        <Menu className='w-5 h-5' />
                    </button>

                    <div className='hidden md:block'>
                        <h1 className='text-2xl font-black text-slate-800 dark:text-white'>Dashboard</h1>
                        <p className='text-white'>Welcome back, Alex! here's what's happening today</p>
                    </div>
                </div>

                {/* Center */}
                {/* <div className='flex-1 max-w-md mx-8'>
                    <div className='relative'>
                        <Search className='w-4 h-4 absolute left-3 top-1/2 transform  -translate-y-1/2 text-slate-400'/>
                        <select type="text" placeholder='Search Anything' className='w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200  dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all'>
                            <option value="">Default</option>
                            <option value="">Rivers State University</option>
                            <option value="">Covenant University</option>
                            <option value="">Delta State University</option>
                            <option value="">Lagos State University</option>
                            <option value="">Petroleum Training Institute Effurun</option>
                            <option value="">University of Port-Harcourt</option>
                            <option value="">Niger Delta University</option>
                        </select>
                        
                        <button className='absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'>8
                            <Filter />
                        </button>
                    </div>

                </div> */}
                {/* Right */}
                <div className='flex items-center space-x-3'>
                    <button className='hidden lg:flex items-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all'>
                        <DiamondPlusIcon className='4-4 h-4'/>
                        <span className='text-sm font-medium'>Diamonds</span>
                        <span className='px-2 py-1 text-xs bg-emerald-600 text-white rounded-full'>12</span>
                    </button>
                    <button className='hidden lg:flex items-center space-x-2 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all'>
                        <CoinsIcon className='4-4 h-4'/>
                        <span className='text-sm font-medium'>Coin</span>
                        <span className='px-2 py-1 text-xs bg-orange-500 text-white rounded-full'>20</span>
                    </button>
                    {/* Toggle */}
                    <button className='p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'>
                        <Sun className='w-5 h-5'/>
                        
                    </button>

                    {/* Notification */}
                    <button className='relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-800 transition-colors'>
                        <Bell className='w-5 h-5'/>
                        <span className='absolute -top-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center'>3</span>
                    </button>

                    {/* Setting */}
                    <button className='relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-800 transition-colors'>
                        <Settings className='w-5 h-5' />
                    </button>

                    {/* User Profile */}
                    <div className='flex items-center space-x-3 pl-3 border-l border-b-slate-200 dark:border-slate-700'>
                        <img src="" alt="User" className='w-8 h-8 rounded-full ring-2 ring-blue-500' />
                        <div className='hidden md:block'>
                            <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>Alex Johnson</p>
                            <p className='text-xs text-slate-500 dark:text-slate-400'>Rivers State University</p>
                        </div>
                        <ChevronDown className='w-4 h-4 text-slate-400' />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;