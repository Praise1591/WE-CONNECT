import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({
  options = [], // [{ label: string, value: any }]
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  noOptionsText = "No options found",
  onChange = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close when clicking outside
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option) => {
    const newSelected = selectedOptions.find((item) => item.value === option.value)
      ? selectedOptions.filter((item) => item.value !== option.value)
      : [...selectedOptions, option];

    setSelectedOptions(newSelected);
    onChange(newSelected.map((item) => item.value));
  };

  const removeTag = (optionToRemove) => {
    const newSelected = selectedOptions.filter((item) => item.value !== optionToRemove.value);
    setSelectedOptions(newSelected);
    onChange(newSelected.map((item) => item.value));
  };

  const clearAll = () => {
    setSelectedOptions([]);
    onChange([]);
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {/* Trigger / Selected Tags */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between min-h-11 px-4 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition"
      >
        <div className="flex flex-wrap gap-2 flex-1">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
              >
                {option.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(option);
                  }}
                  className="ml-1 hover:text-blue-900 font-bold"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 ml-2">
          {selectedOptions.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          )}
          <span className="text-gray-500 text-sm">
            {isOpen ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Search Input */}
          <input
            ref={searchInputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-4 py-3 text-sm border-b border-gray-200 outline-none focus:bg-gray-50"
          />

          {/* Options List */}
          <ul className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-gray-500 text-center">
                {noOptionsText}
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedOptions.some(
                  (item) => item.value === option.value
                );
                return (
                  <li
                    key={option.value}
                    onClick={() => toggleOption(option)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <span className="text-sm">{option.label}</span>
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

// Example Usage
const App = () => {
  const sampleOptions = [
    { label: 'JavaScript', value: 'js' },
    { label: 'TypeScript', value: 'ts' },
    { label: 'Python', value: 'py' },
    { label: 'Java', value: 'java' },
    { label: 'Go', value: 'go' },
    { label: 'Rust', value: 'rust' },
    { label: 'PHP', value: 'php' },
    { label: 'C#', value: 'csharp' },
  ];

  const handleChange = (selectedValues) => {
    console.log('Selected:', selectedValues);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Multi-Select Dropdown (Tailwind CSS)
        </h2>
        <MultiSelectDropdown
          options={sampleOptions}
          placeholder="Select programming languages..."
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default App;