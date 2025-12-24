// Material.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Schools from './Schools'; // Your custom multi-select component
import UploadedMaterials from './UploadedMaterials';

const allUploads = [
  { id: 1, image: null, name: 'Damian Clarson', course: 'Pipeline Technology (PTE411)', category: 'Past Questions', school: 'Babcock University'},
  { id: 2, image: null, name: 'Mahmood Bashiru', course: 'Anthropology (ANT211)', category: 'PDF Notes', school: 'Delta State University'},
  { id: 3, image: null, name: 'Daniel Lawrence', course: 'Engineering Mathematics (MTH310)', category: 'Past Questions', school: 'Rivers State University' },
  { id: 4, image: null, name: 'Vivian Ejiofor', course: 'Economics Statistics (ESC211)', category: 'PDF Notes', school: 'Niger Delta University' },
  { id: 5, image: null, name: 'Prof. Matthew Sulere', course: 'Biochemistry (BCH401)', category: 'Technical Reviews', school: 'Lagos State University' },
  { id: 6, image: null, name: 'Engr. Kola Johnson', course: 'Thermodynamics (MEE320)', category: 'Video Tutorials', school: 'Delta State University' },
  { id: 7, image: null, name: 'Dr. Grace Okafor', course: 'Nursing Ethics (NUR305)', category: 'PDF Notes', school: 'University of Port Harcourt' },
  { id: 8, image: null, name: 'Sarah Okonkwo', course: 'Business Law (LAW212)', category: 'Past Questions', school: 'Covenant University' },
  { id: 9, image: null, name: 'Michael Adeyemi', course: 'Data Structures (CSC301)', category: 'Technical Reviews', school: 'Lagos State University' },
  { id: 10, image: null, name: 'Fatima Yusuf', course: 'Organic Chemistry (CHM202)', category: 'Video Tutorials', school: 'Niger Delta University' },
];

function Material() {
  const [filters, setFilters] = useState({
    category: [],
    school: [],
    course: [],
  });

  // Load saved filters on mount
  useEffect(() => {
    const saved = localStorage.getItem('materialFilters');
    if (saved) {
      try {
        setFilters(JSON.parse(saved));
      } catch (e) {
        console.error('Invalid saved filters');
      }
    }
  }, []);

  // Save filters whenever they change
  useEffect(() => {
    localStorage.setItem('materialFilters', JSON.stringify(filters));
  }, [filters]);

  const handleFiltersChange = ({ field, values }) => {
    setFilters(prev => ({
      ...prev,
      [field]: values,
    }));
  };

  const filteredUploads = useMemo(() => {
    return allUploads.filter(upload => {
      const matchCategory = filters.category.length === 0 || filters.category.includes(upload.category);
      const matchSchool = filters.school.length === 0 || filters.school.includes(upload.school);
      const matchCourse = filters.course.length === 0 || 
        filters.course.some(keyword => 
          upload.course.toLowerCase().includes(keyword.toLowerCase())
        );

      return matchCategory && matchSchool && matchCourse;
    });
  }, [filters]);

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-3">
            Educational Materials
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {filteredUploads.length} material{filteredUploads.length !== 1 ? 's' : ''} available
            {hasActiveFilters && (
              <span className="ml-3 text-sm font-medium text-purple-600 dark:text-purple-400">
                (filtered)
              </span>
            )}
          </p>
        </div>

        {/* Custom Multi-Select Filters from Schools.jsx */}
        <Schools onFiltersChange={handleFiltersChange} />

        {/* Materials List */}
        <div className="space-y-6">
          {filteredUploads.length === 0 ? (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-20 text-center border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
              <p className="text-2xl font-medium text-slate-500 dark:text-slate-400">
                No materials match your current filters.
              </p>
              <p className="text-slate-400 dark:text-slate-500 mt-3">
                Try adjusting your selection in the filters above.
              </p>
            </div>
          ) : (
            <UploadedMaterials uploads={filteredUploads} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Material;