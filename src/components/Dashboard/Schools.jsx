// Schools.jsx — Professional Design with Comprehensive Nigerian Universities & Departments
import React from 'react';
import { Search, School, BookOpen } from 'lucide-react';

const MultiSelectDropdown = ({
  options = [],
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  onChange = () => {},
  initialSelected = [],
  icon: IconComponent,
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
        className="flex items-center justify-between min-h-[52px] px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 cursor-pointer hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {IconComponent && <IconComponent className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {selectedOptions.length === 0 ? (
              <span className="text-slate-500 dark:text-slate-400 text-base">{placeholder}</span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full font-medium"
                >
                  {option.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(option);
                    }}
                    className="hover:text-blue-900 font-bold text-base leading-none"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-3">
          {selectedOptions.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xl leading-none"
            >
              ×
            </button>
          )}
          <span className="text-slate-500 dark:text-slate-400 text-base">{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="relative px-3 py-2 border-b border-slate-200 dark:border-slate-700">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-12 pr-4 py-2.5 text-base bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-400"
            />
          </div>

          <ul className="max-h-72 overflow-y-auto py-2">
            {filteredOptions.length === 0 ? (
              <li className="px-5 py-3 text-slate-500 dark:text-slate-400 text-center text-base">No options found</li>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedOptions.some((item) => item.value === option.value);
                return (
                  <li
                    key={option.value}
                    onClick={() => toggleOption(option)}
                    className="px-5 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 text-base transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
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
    // Federal Universities
    { label: 'Abubakar Tafawa Balewa University, Bauchi', value: 'abubakar-tafawa-balewa-university-bauchi' },
    { label: 'Ahmadu Bello University, Zaria', value: 'ahmadu-bello-university-zaria' },
    { label: 'Alex Ekwueme Federal University Ndufu Alike Ikwo, Ikwo', value: 'alex-ekwueme-federal-university-ndufu-alike-ikwo' },
    { label: 'Bayero University, Kano', value: 'bayero-university-kano' },
    { label: 'Federal University of Agriculture, Abeokuta', value: 'federal-university-of-agriculture-abeokuta' },
    { label: 'Federal University of Applied Sciences Kachia, Kachia', value: 'federal-university-of-applied-sciences-kachia' },
    { label: 'Federal University Birnin Kebbi, Birnin Kebbi', value: 'federal-university-birnin-kebbi' },
    { label: 'Federal University Dutse, Dutse', value: 'federal-university-dutse' },
    { label: 'Federal University Dutsin-Ma, Dutsin-Ma', value: 'federal-university-dutsin-ma' },
    { label: 'Federal University Gashua, Gashua', value: 'federal-university-gashua' },
    { label: 'Federal University Gusau, Gusau', value: 'federal-university-gusau' },
    { label: 'Federal University Kashere, Kashere', value: 'federal-university-kashere' },
    { label: 'Federal University Lokoja, Lokoja', value: 'federal-university-lokoja' },
    { label: 'Federal University of Lafia, Lafia', value: 'federal-university-of-lafia' },
    { label: 'Federal University of Petroleum Resources Effurun, Effurun', value: 'federal-university-of-petroleum-resources-effurun' },
    { label: 'Federal University of Technology Akure, Akure', value: 'federal-university-of-technology-akure' },
    { label: 'Federal University of Technology Minna, Minna', value: 'federal-university-of-technology-minna' },
    { label: 'Federal University of Technology Owerri, Owerri', value: 'federal-university-of-technology-owerri' },
    { label: 'Federal University Otuoke, Otuoke', value: 'federal-university-otuoke' },
    { label: 'Federal University Oye-Ekiti, Oye-Ekiti', value: 'federal-university-oye-ekiti' },
    { label: 'Federal University Wukari, Wukari', value: 'federal-university-wukari' },
    { label: 'Michael Okpara University of Agriculture, Umudike', value: 'michael-okpara-university-of-agriculture-umudike' },
    { label: 'Modibbo Adama University, Yola', value: 'modibbo-adama-university-yola' },
    { label: 'National Open University of Nigeria, Victoria Island', value: 'national-open-university-of-nigeria' },
    { label: 'Nnamdi Azikiwe University, Awka', value: 'nnamdi-azikiwe-university' },
    { label: 'Obafemi Awolowo University, Ile Ife', value: 'obafemi-awolowo-university' },
    { label: 'University of Abuja, Gwagwalada', value: 'university-of-abuja' },
    { label: 'University of Agriculture, Makurdi', value: 'university-of-agriculture-makurdi' },
    { label: 'University of Benin, Benin City', value: 'university-of-benin' },
    { label: 'University of Calabar, Calabar', value: 'university-of-calabar' },
    { label: 'University of Ibadan, Ibadan', value: 'university-of-ibadan' },
    { label: 'University of Ilorin, Ilorin', value: 'university-of-ilorin' },
    { label: 'University of Jos, Jos', value: 'university-of-jos' },
    { label: 'University of Lagos, Akoka', value: 'university-of-lagos' },
    { label: 'University of Maiduguri, Maiduguri', value: 'university-of-maiduguri' },
    { label: 'University of Nigeria, Nsukka', value: 'university-of-nigeria' },
    { label: 'University of Port Harcourt, Port Harcourt', value: 'university-of-port-harcourt' },
    { label: 'University of Uyo, Uyo', value: 'university-of-uyo' },
    { label: 'Usmanu Danfodiyo University, Sokoto', value: 'usmanu-danfodiyo-university' },

    // State Universities
    { label: 'Abdulkadir Kure University, Minna', value: 'abdulkadir-kure-university' },
    { label: 'Abia State University, Uturu', value: 'abia-state-university' },
    { label: 'Adamawa State University, Mubi', value: 'adamawa-state-university' },
    { label: 'Adekunle Ajasin University, Akungba-Akoko', value: 'adekunle-ajasin-university' },
    { label: 'Akwa Ibom State University, Uyo', value: 'akwa-ibom-state-university' },
    { label: 'Aliko Dangote University of Science and Technology, Wudil', value: 'aliko-dangote-university-of-science-and-technology' },
    { label: 'Ambrose Alli University, Ekpoma', value: 'ambrose-alli-university' },
    { label: 'Bauchi State University, Gadau', value: 'bauchi-state-university' },
    { label: 'Bayelsa Medical University, Yenagoa', value: 'bayelsa-medical-university' },
    { label: 'Benue State University, Makurdi', value: 'benue-state-university' },
    { label: 'Borno State University, Maiduguri', value: 'borno-state-university' },
    { label: 'Bukar Abba Ibrahim University, Damaturu', value: 'bukar-abba-ibrahim-university' },
    { label: 'Chukwuemeka Odumegwu Ojukwu University, Uli', value: 'chukwuemeka-odumegwu-ojukwu-university' },
    { label: 'University of Cross River State, Ekpo-Abasi', value: 'university-of-cross-river-state' },
    { label: 'Delta State University, Abraka', value: 'delta-state-university' },
    { label: 'Delta State University of Science and Technology, Ozoro', value: 'delta-state-university-of-science-and-technology' },
    { label: 'Dennis Osadebay University, Asaba', value: 'dennis-osadebay-university' },
    { label: 'Ebonyi State University, Abakaliki', value: 'ebonyi-state-university' },
    { label: 'Edo State University, Uzairue', value: 'edo-state-university' },
    { label: 'Ekiti State University, Ado Ekiti', value: 'ekiti-state-university' },
    { label: 'Enugu State University of Science and Technology, Enugu', value: 'enugu-state-university-of-science-and-technology' },
    { label: 'Gombe State University, Gombe', value: 'gombe-state-university' },
    { label: 'Gombe State University of Science and Technology, Kumo', value: 'gombe-state-university-of-science-and-technology' },
    { label: 'Ibrahim Badamasi Babangida University, Lapai', value: 'ibrahim-badamasi-babangida-university' },
    { label: 'Ignatius Ajuru University of Education, Port Harcourt', value: 'ignatius-ajuru-university-of-education' },
    { label: 'Imo State University, Owerri', value: 'imo-state-university' },
    { label: 'Kaduna State University, Kaduna', value: 'kaduna-state-university' },
    { label: 'Kebbi State University of Science and Technology, Aliero', value: 'kebbi-state-university-of-science-and-technology' },
    { label: 'Prince Abubakar Audu University, Anyigba', value: 'prince-abubakar-audu-university' },
    { label: 'Kwara State University, Malete', value: 'kwara-state-university' },
    { label: 'Ladoke Akintola University of Technology, Ogbomoso', value: 'ladoke-akintola-university-of-technology' },
    { label: 'Lagos State University, Ojo', value: 'lagos-state-university' },
    { label: 'Lagos State University of Education, Ijanikin', value: 'lagos-state-university-of-education' },
    { label: 'Lagos State University of Science and Technology, Ikorodu', value: 'lagos-state-university-of-science-and-technology' },
    { label: 'Nasarawa State University, Keffi', value: 'nasarawa-state-university' },
    { label: 'Niger Delta University, Amassoma', value: 'niger-delta-university' },
    { label: 'Olabisi Onabanjo University, Ago-Iwoye', value: 'olabisi-onabanjo-university' },
    { label: 'Olusegun Agagu University of Science and Technology, Okitipupa', value: 'olusegun-agagu-university-of-science-and-technology' },
    { label: 'Osun State University, Osogbo', value: 'osun-state-university' },
    { label: 'Plateau State University, Bokkos', value: 'plateau-state-university' },
    { label: 'Rivers State University, Port Harcourt', value: 'rivers-state-university' },
    { label: 'Sule Lamido University, Kafin-Hausa', value: 'sule-lamido-university' },
    { label: 'Tai Solarin University of Education, Ijebu Ode', value: 'tai-solarin-university-of-education' },
    { label: 'Taraba State University, Jalingo', value: 'taraba-state-university' },
    { label: "Umaru Musa Yar'adua University, Katsina", value: "umaru-musa-yaradua-university" },
    { label: 'Sokoto State University, Sokoto', value: 'sokoto-state-university' },
    { label: 'University of Delta, Agbor', value: 'university-of-delta' },
    { label: 'Yusuf Maitama Sule University Kano, Kano', value: 'yusuf-maitama-sule-university-kano' },
    { label: 'Zamfara State University, Talata Mafara', value: 'zamfara-state-university' },

    // Private Universities
    { label: 'Achievers University, Owo', value: 'achievers-university' },
    { label: 'Adeleke University, Ede', value: 'adeleke-university' },
    { label: 'Afe Babalola University, Ado-Ekiti', value: 'afe-babalola-university' },
    { label: 'African University of Science and Technology, Abuja', value: 'african-university-of-science-and-technology' },
    { label: 'Ahman Pategi University, Pategi', value: 'ahman-pategi-university' },
    { label: 'Ajayi Crowther University, Oyo', value: 'ajayi-crowther-university' },
    { label: 'Al-Ansar University Maiduguri, Maiduguri', value: 'al-ansar-university-maiduguri' },
    { label: 'Al-Hikmah University, Ilorin', value: 'al-hikmah-university' },
    { label: 'Al-Qalam University, Katsina', value: 'al-qalam-university' },
    { label: 'American University of Nigeria, Yola', value: 'american-university-of-nigeria' },
    { label: 'Anchor University, Ayobo', value: 'anchor-university' },
    { label: 'Arthur Jarvis University, Akpabuyo', value: 'arthur-jarvis-university' },
    { label: 'Ave Maria University, Piyanko', value: 'ave-maria-university' },
    { label: 'Babcock University, Ilishan-Remo', value: 'babcock-university' },
    { label: 'Baze University, Abuja', value: 'baze-university' },
    { label: 'Bells University of Technology, Ota', value: 'bells-university-of-technology' },
    { label: 'Benson Idahosa University, Benin City', value: 'benson-idahosa-university' },
    { label: 'Bowen University, Iwo', value: 'bowen-university' },
    { label: 'Bingham University, Karu', value: 'bingham-university' },
    { label: 'Caleb University, Ikorodu', value: 'caleb-university' },
    { label: 'Caritas University, Enugu', value: 'caritas-university' },
    { label: 'CETEP City University, Yaba', value: 'cetep-city-university' },
    { label: 'Chrisland University, Abeokuta', value: 'chrisland-university' },
    { label: 'Christopher University, Mowe', value: 'christopher-university' },
    { label: 'Clifford University, Owerrinta', value: 'clifford-university' },
    { label: 'Coal City University, Enugu', value: 'coal-city-university' },
    { label: 'Covenant University, Ota', value: 'covenant-university' },
    { label: 'Crawford University, Igbesa', value: 'crawford-university' },
    { label: 'Crescent University, Abeokuta', value: 'crescent-university' },
    { label: 'Dominican University Ibadan, Ibadan', value: 'dominican-university-ibadan' },
    { label: 'Edwin Clark University, Kiagbodo', value: 'edwin-clark-university' },
    { label: 'Elizade University, Ilara-Mokin', value: 'elizade-university' },
    { label: 'Evangel University, Akaeze', value: 'evangel-university' },
    { label: 'Fountain University, Osogbo', value: 'fountain-university' },
    { label: 'Godfrey Okoye University, Enugu', value: 'godfrey-okoye-university' },
    { label: 'Greenfield University, Kaduna', value: 'greenfield-university' },
    { label: 'Gregory University, Uturu', value: 'gregory-university' },
    { label: 'Hallmark University, Ijebu-Itele', value: 'hallmark-university' },
    { label: 'Hezekiah University, Umudi', value: 'hezekiah-university' },
    { label: 'Igbinedion University, Okada', value: 'igbinedion-university' },
    { label: 'Joseph Ayo Babalola University, Ikeji-Arakeji', value: 'joseph-ayo-babalola-university' },
    { label: 'Khadija University, Majia', value: 'khadija-university' },
    { label: 'Kings University, Odeomu', value: 'kings-university' },
    { label: 'Koladaisi University, Ibadan', value: 'koladaisi-university' },
    { label: 'Kwararafa University, Wukari', value: 'kwararafa-university' },
    { label: 'Landmark University, Omu-Aran', value: 'landmark-university' },
    { label: 'Lead City University, Ibadan', value: 'lead-city-university' },
    { label: 'Madonna University, Elele', value: 'madonna-university' },
    { label: 'McPherson University, Seriki-Setayo', value: 'mcpherson-university' },
    { label: 'Mewar University, Masaka', value: 'mewar-university' },
    { label: 'Michael and Cecilia Ibru University, Agbara-Otor', value: 'michael-and-cecilia-ibru-university' },
    { label: 'Mountain Top University, Makogi Oba', value: 'mountain-top-university' },
    { label: 'Mudiame University, Irrua', value: 'mudiame-university' },
    { label: 'Nile University of Nigeria, Abuja', value: 'nile-university-of-nigeria' },
    { label: 'Nok University Kachia, Kachia', value: 'nok-university-kachia' },
    { label: 'Novena University, Ogume', value: 'novena-university' },
    { label: 'Obong University, Obong Ntak', value: 'obong-university' },
    { label: 'Oduduwa University, Ipetumodu', value: 'oduduwa-university' },
    { label: 'PAMO University of Medical Sciences, Port Harcourt', value: 'pamo-university-of-medical-sciences' },
    { label: 'Pan-Atlantic University, Lekki', value: 'pan-atlantic-university' },
    { label: 'Paul University, Awka', value: 'paul-university' },
    { label: 'Peaceland University, Enugu', value: 'peaceland-university' },
    { label: 'Precious Cornerstone University, Ibadan', value: 'precious-cornerstone-university' },
    { label: 'Redeemer\'s University Nigeria, Ede', value: 'redeemers-university-nigeria' },
    { label: 'Renaissance University, Ugbawka', value: 'renaissance-university' },
    { label: 'Rhema University, Aba', value: 'rhema-university' },
    { label: 'Ritman University, Ikot Ekpene', value: 'ritman-university' },
    { label: 'Salem University, Lokoja', value: 'salem-university' },
    { label: 'Sam Maris University, Supare Akoko', value: 'sam-maris-university' },
    { label: 'Samuel Adegboyega University, Ogwa', value: 'samuel-adegboyega-university' },
    { label: 'Skyline University, Kano', value: 'skyline-university' },
    { label: 'Summit University, Offa', value: 'summit-university' },
    { label: 'Veritas University, Bwari', value: 'veritas-university' },
    { label: 'Wesley University, Ondo', value: 'wesley-university' },
    { label: 'Western Delta University, Oghara', value: 'western-delta-university' },
    { label: 'Westland University, Iwo', value: 'westland-university' },
    { label: 'University of Mkar, Mkar', value: 'university-of-mkar' },
    { label: 'James Hope University, Lekki', value: 'james-hope-university' },
  ];

  const departments = [
    { label: 'Accounting', value: 'accounting' },
    { label: 'Agriculture', value: 'agriculture' },
    { label: 'Anatomy', value: 'anatomy' },
    { label: 'Animal Science', value: 'animal-science' },
    { label: 'Anthropology', value: 'anthropology' },
    { label: 'Architecture', value: 'architecture' },
    { label: 'Banking and Finance', value: 'banking-and-finance' },
    { label: 'Biochemistry', value: 'biochemistry' },
    { label: 'Biological Sciences', value: 'biological-sciences' },
    { label: 'Building Technology', value: 'building-technology' },
    { label: 'Business Administration', value: 'business-administration' },
    { label: 'Chemical Engineering', value: 'chemical-engineering' },
    { label: 'Chemistry', value: 'chemistry' },
    { label: 'Civil Engineering', value: 'civil-engineering' },
    { label: 'Clinical Sciences', value: 'clinical-sciences' },
    { label: 'Communication and Media Studies', value: 'communication-and-media-studies' },
    { label: 'Computer Science', value: 'computer-science' },
    { label: 'Computing and Informatics', value: 'computing-and-informatics' },
    { label: 'Creative Arts', value: 'creative-arts' },
    { label: 'Criminology and Security Studies', value: 'criminology-and-security-studies' },
    { label: 'Cyber Security', value: 'cyber-security' },
    { label: 'Data Management', value: 'data-management' },
    { label: 'Dentistry', value: 'dentistry' },
    { label: 'Economics', value: 'economics' },
    { label: 'Education', value: 'education' },
    { label: 'Electrical Engineering', value: 'electrical-engineering' },
    { label: 'Engineering Mathematics', value: 'engineering-mathematics' },
    { label: 'English', value: 'english' },
    { label: 'Environmental Health Science', value: 'environmental-health-science' },
    { label: 'Environmental Management', value: 'environmental-management' },
    { label: 'Environmental Sciences', value: 'environmental-sciences' },
    { label: 'Estate Management', value: 'estate-management' },
    { label: 'Financial Studies', value: 'financial-studies' },
    { label: 'Foreign Languages', value: 'foreign-languages' },
    { label: 'Geology', value: 'geology' },
    { label: 'History and International Studies', value: 'history-and-international-studies' },
    { label: 'Law', value: 'law' },
    { label: 'Linguistics', value: 'linguistics' },
    { label: 'Management Sciences', value: 'management-sciences' },
    { label: 'Mass Communication', value: 'mass-communication' },
    { label: 'Mathematics', value: 'mathematics' },
    { label: 'Mechanical Engineering', value: 'mechanical-engineering' },
    { label: 'Medicine and Surgery', value: 'medicine-and-surgery' },
    { label: 'Metallurgical and Materials Engineering', value: 'metallurgical-and-materials-engineering' },
    { label: 'Microbiology', value: 'microbiology' },
    { label: 'Nursing', value: 'nursing' },
    { label: 'Organic Chemistry', value: 'organic-chemistry' },
    { label: 'Petroleum Engineering', value: 'petroleum-engineering' },
    { label: 'Pharmaceutical Sciences', value: 'pharmaceutical-sciences' },
    { label: 'Pharmacy', value: 'pharmacy' },
    { label: 'Philosophy', value: 'philosophy' },
    { label: 'Physics', value: 'physics' },
    { label: 'Political Science', value: 'political-science' },
    { label: 'Psychology', value: 'psychology' },
    { label: 'Public Administration', value: 'public-administration' },
    { label: 'Quantity Surveying', value: 'quantity-surveying' },
    { label: 'Sociology', value: 'sociology' },
    { label: 'Surveying and Geoinformatics', value: 'surveying-and-geoinformatics' },
    { label: 'Theatre Arts', value: 'theatre-arts' },
    { label: 'Thermodynamics', value: 'thermodynamics' },
    { label: 'Veterinary Medicine', value: 'veterinary-medicine' },
  ];

  const getInitialSelected = (optionsList, savedLabels) => {
    return optionsList.filter(opt => savedLabels.includes(opt.label));
  };

  const handleFilterChange = (field) => (selected) => {
    const values = selected.map(item => item.label);
    onFiltersChange({ field, values });
  };

  return (
    <div className="w-full py-12 px-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white text-center mb-10">
          Browse Educational Materials
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MultiSelectDropdown
            options={materialTypes}
            placeholder="Select Material Types"
            searchPlaceholder="Search types..."
            onChange={handleFilterChange('category')}
            initialSelected={getInitialSelected(materialTypes, getSavedSelections('category'))}
            icon={BookOpen}
          />

          <MultiSelectDropdown
            options={universities}
            placeholder="Select Universities"
            searchPlaceholder="Search universities..."
            onChange={handleFilterChange('school')}
            initialSelected={getInitialSelected(universities, getSavedSelections('school'))}
            icon={School}
          />

          <MultiSelectDropdown
            options={departments}
            placeholder="Select Departments"
            searchPlaceholder="Search departments..."
            onChange={handleFilterChange('department')}
            initialSelected={getInitialSelected(departments, getSavedSelections('department'))}
            icon={BookOpen}
          />
        </div>
      </div>
    </div>
  );
}

export default Schools;