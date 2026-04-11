// Schools.jsx - Enhanced Version with Better UI/UX
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, X, Check, Layers, BookOpen, Building2, GraduationCap, School } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MultiSelectDropdown = ({
  options = [],
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  icon: IconComponent,
  onChange = () => {},
  initialSelected = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState(initialSelected);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    const newSelected = selectedOptions.find((item) => item.value === option.value)
      ? selectedOptions.filter((item) => item.value !== option.value)
      : [...selectedOptions, option];

    setSelectedOptions(newSelected);
    onChange(newSelected);
  };

  const removeTag = (optionToRemove) => {
    const newSelected = selectedOptions.filter((item) => item.value !== optionToRemove.value);
    setSelectedOptions(newSelected);
    onChange(newSelected);
  };

  const clearAll = () => {
    setSelectedOptions([]);
    onChange([]);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between min-h-12 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {IconComponent && <IconComponent size={16} className="text-slate-400 flex-shrink-0" />}
          <div className="flex flex-wrap gap-1.5 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-slate-500 dark:text-slate-400 text-sm">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full"
                >
                  {option.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(option);
                    }}
                    className="hover:text-indigo-900 font-bold text-sm leading-none ml-1"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          {selectedOptions.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg leading-none p-1"
              title="Clear all"
            >
              <X size={14} />
            </button>
          )}
          {isOpen ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="relative border-b border-slate-100 dark:border-slate-700">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-slate-800 outline-none focus:ring-0"
              />
            </div>

            <ul className="max-h-60 overflow-y-auto py-2">
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-slate-500 text-center text-sm">No options found</li>
              ) : (
                filteredOptions.map((option, idx) => {
                  const isSelected = selectedOptions.some((item) => item.value === option.value);
                  return (
                    <motion.li
                      key={option.value}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.01 }}
                      onClick={() => toggleOption(option)}
                      className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex items-center gap-3 text-sm transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      <span className="text-slate-700 dark:text-slate-200">{option.label}</span>
                    </motion.li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function Schools({ onFiltersChange }) {
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  const getSavedSelections = (field) => {
    const savedFilters = localStorage.getItem('materialFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        return filters[field] || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const materialTypes = [
    { label: 'PDF Notes', value: 'pdf' },
    { label: 'Video Tutorials', value: 'video' },
    { label: 'Past Questions', value: 'past-question' },
    { label: 'Technical Reviews', value: 'review' },
  ];

  const universities = [
    { label: 'University of Ibadan', value: 'ui' },
    { label: 'University of Lagos', value: 'unilag' },
    { label: 'University of Nigeria, Nsukka', value: 'unn' },
    { label: 'Obafemi Awolowo University', value: 'oau' },
    { label: 'Ahmadu Bello University', value: 'abu' },
    { label: 'University of Benin', value: 'uniben' },
    { label: 'University of Ilorin', value: 'unilorin' },
    { label: 'University of Port Harcourt', value: 'uniport' },
    { label: 'University of Calabar', value: 'unical' },
    { label: 'University of Maiduguri', value: 'unimaid' },
    { label: 'University of Jos', value: 'unijos' },
    { label: 'Usmanu Danfodiyo University', value: 'udusok' },
    { label: 'Bayero University Kano', value: 'buk' },
    { label: 'University of Abuja', value: 'uniabuja' },
    { label: 'Nnamdi Azikiwe University', value: 'unizik' },
    { label: 'Federal University of Technology Akure', value: 'futa' },
    { label: 'Federal University of Technology Minna', value: 'futminna' },
    { label: 'Federal University of Technology Owerri', value: 'futo' },
    { label: 'Michael Okpara University of Agriculture', value: 'mouau' },
    { label: 'Federal University of Agriculture Abeokuta', value: 'funaab' },
    { label: 'Abubakar Tafawa Balewa University', value: 'atbu' },
    { label: 'Modibbo Adama University', value: 'mau' },
    { label: 'National Open University of Nigeria', value: 'noun' },
    { label: 'Nigerian Defence Academy', value: 'nda' },
    { label: 'Federal University Gashua', value: 'fugashua' },
    { label: 'Federal University Dutse', value: 'fud' },
    { label: 'Federal University Lafia', value: 'fulafia' },
    { label: 'Federal University Oye-Ekiti', value: 'fuoye' },
    { label: 'Federal University Dutsin-Ma', value: 'fudma' },
    { label: 'Federal University of Petroleum Resources Effurun', value: 'fupre' },
    { label: 'Rivers State University', value: 'rsu' },
    { label: 'Delta State University', value: 'delsu' },
    { label: 'Lagos State University', value: 'lasu' },
    { label: 'Abia State University', value: 'absu' },
    { label: 'Imo State University', value: 'imsu' },
    { label: 'Ebonyi State University', value: 'ebsu' },
    { label: 'Enugu State University of Science and Technology', value: 'esut' },
    { label: 'Ambrose Alli University', value: 'aau' },
    { label: 'Ekiti State University', value: 'eksu' },
    { label: 'Olabisi Onabanjo University', value: 'oou' },
    { label: 'Adekunle Ajasin University', value: 'aaua' },
    { label: 'Tai Solarin University of Education', value: 'tasued' },
    { label: 'Nasarawa State University', value: 'nsuk' },
    { label: 'Kogi State University', value: 'ksu' },
    { label: 'Ibrahim Badamasi Babangida University', value: 'ibbu' },
    { label: 'Covenant University', value: 'cu' },
    { label: 'Babcock University', value: 'babcock' },
    { label: 'Afe Babalola University', value: 'abuad' },
    { label: 'Bowen University', value: 'bowen' },
    { label: "Redeemer's University", value: 'run' },
    { label: 'Igbinedion University', value: 'iuokada' },
    { label: 'American University of Nigeria', value: 'aun' },
    { label: 'Ajayi Crowther University', value: 'acu' },
    { label: 'Al-Hikmah University', value: 'alhikmah' },
    { label: 'Bells University of Technology', value: 'bells' },
    { label: 'Pan-Atlantic University', value: 'pau' },
    { label: 'Madonna University', value: 'madonna' },
    { label: 'Benson Idahosa University', value: 'biu' },
    { label: 'Caleb University', value: 'caleb' },
    { label: 'Achievers University', value: 'achievers' },
    { label: 'Adeleke University', value: 'adeleke' },
    { label: 'Lead City University', value: 'lcu' },
    { label: 'Crawford University', value: 'crawford' },
    { label: 'Crescent University', value: 'crescent' },
    { label: 'Elizade University', value: 'elizade' },
    { label: 'Godfrey Okoye University', value: 'gouni' },
    { label: 'Nile University of Nigeria', value: 'nile' },
  ];

  const departments = [
    { label: 'Accounting', value: 'accounting' },
    { label: 'Agricultural Economics', value: 'agric-economics' },
    { label: 'Agricultural Engineering', value: 'agric-engineering' },
    { label: 'Architecture', value: 'architecture' },
    { label: 'Biochemistry', value: 'biochemistry' },
    { label: 'Business Administration', value: 'business-admin' },
    { label: 'Chemical Engineering', value: 'chemical-engineering' },
    { label: 'Chemistry', value: 'chemistry' },
    { label: 'Civil Engineering', value: 'civil-engineering' },
    { label: 'Computer Engineering', value: 'computer-engineering' },
    { label: 'Computer Science', value: 'computer-science' },
    { label: 'Dentistry', value: 'dentistry' },
    { label: 'Economics', value: 'economics' },
    { label: 'Electrical / Electronic Engineering', value: 'electrical-engineering' },
    { label: 'English Language', value: 'english' },
    { label: 'Law', value: 'law' },
    { label: 'Mass Communication', value: 'mass-communication' },
    { label: 'Mathematics', value: 'mathematics' },
    { label: 'Mechanical Engineering', value: 'mechanical-engineering' },
    { label: 'Medicine & Surgery', value: 'medicine-surgery' },
    { label: 'Microbiology', value: 'microbiology' },
    { label: 'Nursing', value: 'nursing' },
    { label: 'Petroleum Engineering', value: 'petroleum-engineering' },
    { label: 'Pharmacy', value: 'pharmacy' },
    { label: 'Physics', value: 'physics' },
    { label: 'Political Science', value: 'political-science' },
    { label: 'Public Administration', value: 'public-admin' },
    { label: 'Sociology', value: 'sociology' },
  ];

  const getInitialSelected = (optionsList, savedLabels) => {
    return optionsList.filter(opt => savedLabels.includes(opt.label));
  };

  const handleFilterChange = (field) => (selected) => {
    const values = selected.map(item => item.label);
    onFiltersChange({ field, values });
    const savedFilters = localStorage.getItem('materialFilters');
    const filters = savedFilters ? JSON.parse(savedFilters) : {};
    filters[field] = values;
    localStorage.setItem('materialFilters', JSON.stringify(filters));
    
    // Update active filter count
    const totalActive = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);
    setActiveFilterCount(totalActive);
  };

  useEffect(() => {
    const savedFilters = localStorage.getItem('materialFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        const totalActive = Object.values(filters).reduce((sum, arr) => sum + arr.length, 0);
        setActiveFilterCount(totalActive);
      } catch (e) {}
    }
  }, []);

  const clearAllFilters = () => {
    onFiltersChange({ field: 'category', values: [] });
    onFiltersChange({ field: 'school', values: [] });
    onFiltersChange({ field: 'department', values: [] });
    localStorage.removeItem('materialFilters');
    setActiveFilterCount(0);
    toast?.success('All filters cleared');
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-indigo-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter Materials</span>
          {activeFilterCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              {activeFilterCount} active
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-600 transition flex items-center gap-1">
            <X size={12} />
            Clear all
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MultiSelectDropdown
          options={materialTypes}
          placeholder="Material Type"
          searchPlaceholder="Search types..."
          icon={Layers}
          onChange={handleFilterChange('category')}
          initialSelected={getInitialSelected(materialTypes, getSavedSelections('category'))}
        />

        <MultiSelectDropdown
          options={universities}
          placeholder="University"
          searchPlaceholder="Search universities..."
          icon={GraduationCap}
          onChange={handleFilterChange('school')}
          initialSelected={getInitialSelected(universities, getSavedSelections('school'))}
        />

        <MultiSelectDropdown
          options={departments}
          placeholder="Department / Course"
          searchPlaceholder="Search departments..."
          icon={BookOpen}
          onChange={handleFilterChange('department')}
          initialSelected={getInitialSelected(departments, getSavedSelections('department'))}
        />
      </div>
    </div>
  );
}

export default Schools;