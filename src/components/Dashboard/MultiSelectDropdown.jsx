import React, { useState, useRef, useEffect } from 'react';

const options = [
  { id: 1, name: 'JavaScript' },
  { id: 2, name: 'TypeScript' },
  { id: 3, name: 'React' },
  { id: 4, name: 'Vue' },
  { id: 5, name: 'Angular' },
  { id: 6, name: 'Node.js' },
  { id: 7, name: 'Python' },
  { id: 8, name: 'Tailwind CSS' },
  { id: 9, name: 'Next.js' },
  { id: 10, name: 'Svelte' },
];

export default function MultiSelectDropdown() {
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter options based on search query
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(query.toLowerCase())
  );

  // Toggle selection of an option
  const toggleOption = (option) => {
    setSelected((prev) =>
      prev.some((item) => item.id === option.id)
        ? prev.filter((item) => item.id !== option.id)
        : [...prev, option]
    );
  };

  // Remove a selected tag
  const removeTag = (option) => {
    setSelected((prev) => prev.filter((item) => item.id !== option.id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-lg" ref={dropdownRef}>
      {/* Trigger + Selected Tags */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-12 flex-wrap items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 cursor-pointer transition-all hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      >
        {/* Selected Tags */}
        {selected.length > 0 ? (
          selected.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800"
            >
              {item.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(item);
                }}
                className="hover:text-blue-900 focus:outline-none"
              >
                {/* Close (X) SVG */}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-500">Select options...</span>
        )}

        {/* Chevron Icon */}
        <svg
          className={`ml-auto h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg z-20">
          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()} // Prevent closing when typing
            placeholder="Search options..."
            className="w-full border-b border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            autoFocus
          />

          {/* Options List */}
          <ul className="max-h-64 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-gray-500 text-sm">
                No options found
              </li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.some(
                  (item) => item.id === option.id
                );

                return (
                  <li
                    key={option.id}
                    onClick={() => toggleOption(option)}
                    className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span>{option.name}</span>
                    {isSelected && (
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        
                        
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}