import React from 'react';
import { Search } from 'lucide-react';

const MultiSelectDropdown = ({
  options = [],
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  onChange = () => {},
  initialSelected = [],
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedOptions, setSelectedOptions] = React.useState(initialSelected);
  const dropdownRef = React.useRef(null);
  const searchInputRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
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
        className="flex items-center justify-between min-h-11 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 cursor-pointer hover:border-purple-400 transition-all duration-200 shadow-sm hover:shadow"
      >
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {selectedOptions.length === 0 ? (
            <span className="text-slate-500 text-sm">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 rounded-lg"
              >
                {option.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(option);
                  }}
                  className="hover:text-purple-900 font-bold text-sm leading-none"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          {selectedOptions.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-slate-500 hover:text-slate-700 text-lg leading-none"
            >
              ×
            </button>
          )}
          <span className="text-slate-500 text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-10 pr-4 py-2.5 text-sm border-b border-slate-200 dark:border-slate-700 outline-none focus:bg-slate-50 dark:focus:bg-slate-700"
            />
          </div>

          <ul className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-2.5 text-slate-500 text-center text-sm">No options found</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedOptions.some((item) => item.value === option.value);
                return (
                  <li
                    key={option.value}
                    onClick={() => toggleOption(option)}
                    className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-slate-700 dark:text-slate-200">{option.label}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

function Schools({ onFiltersChange }) {
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
    { label: 'Rivers State University', value: 'rsu' },
    { label: 'Covenant University', value: 'cu' },
    { label: 'Delta State University', value: 'delsu' },
    { label: 'Lagos State University', value: 'lasu' },
    { label: 'Petroleum Training Institute Effurun', value: 'pti' },
    { label: 'University of Port Harcourt', value: 'uniport' },
    { label: 'Niger Delta University', value: 'ndu' },
    { label: 'Babcock University', value: 'babcock' },
  ];

  const courses = [
    { label: 'Mathematics', value: 'math' },
    { label: 'Petroleum Engineering', value: 'pet-eng' },
    { label: 'Mechanical Engineering', value: 'mech-eng' },
    { label: 'Biochemistry', value: 'biochem' },
    { label: 'Electrical Engineering', value: 'elect-eng' },
    { label: 'Law', value: 'law' },
    { label: 'Nursing', value: 'nursing' },
    { label: 'Business Administration', value: 'bus-admin' },
    { label: 'Mass Communication', value: 'mass-comm' },
    { label: 'Chemistry', value: 'chem' },
    { label: 'Civil Engineering', value: 'civil-eng' },
    { label: 'Physics', value: 'physics' },
    { label: 'Accountancy', value: 'acct' },
    { label: 'Medicine and Surgery', value: 'medicine' },
  ];

  const getInitialSelected = (optionsList, savedLabels) => {
    return optionsList.filter(opt => savedLabels.includes(opt.label));
  };

  const handleFilterChange = (field) => (selected) => {
    const values = selected.map(item => item.label);
    onFiltersChange({ field, values });
  };

  return (
    <div className="w-full py-8 px-4 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Title - Responsive */}
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white text-center mb-8">
          Browse Educational Materials
        </h2>

        {/* Filters Grid - Highly Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <MultiSelectDropdown
            options={materialTypes}
            placeholder="Material Type"
            searchPlaceholder="Search types..."
            onChange={handleFilterChange('category')}
            initialSelected={getInitialSelected(materialTypes, getSavedSelections('category'))}
          />

          <MultiSelectDropdown
            options={universities}
            placeholder="University"
            searchPlaceholder="Search universities..."
            onChange={handleFilterChange('school')}
            initialSelected={getInitialSelected(universities, getSavedSelections('school'))}
          />

          <MultiSelectDropdown
            options={courses}
            placeholder="Course"
            searchPlaceholder="Search courses..."
            onChange={handleFilterChange('course')}
            initialSelected={getInitialSelected(courses, getSavedSelections('course'))}
          />
        </div>
      </div>
    </div>
  );
}

export default Schools;