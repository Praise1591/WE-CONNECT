// SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  Shield, 
  User, 
  Trash2, 
  ChevronRight,
  Edit3,
  Save,
  X
} from 'lucide-react';

// Top 20 most spoken languages in the world (2025 estimates)
const majorLanguages = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: 'Mandarin Chinese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'ar', label: 'Arabic' },
  { value: 'bn', label: 'Bengali' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ur', label: 'Urdu' },
  { value: 'id', label: 'Indonesian' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'sw', label: 'Swahili' },
  { value: 'mr', label: 'Marathi' },
  { value: 'te', label: 'Telugu' },
  { value: 'tr', label: 'Turkish' },
  { value: 'ta', label: 'Tamil' },
  { value: 'ko', label: 'Korean' },
  { value: 'vi', label: 'Vietnamese' },
];

// Complete list of countries with ISO code and nationality (demonym) - sorted alphabetically
const countries = [
  { code: 'AF', name: 'Afghanistan', nationality: 'Afghan' },
  { code: 'AL', name: 'Albania', nationality: 'Albanian' },
  { code: 'DZ', name: 'Algeria', nationality: 'Algerian' },
  { code: 'AD', name: 'Andorra', nationality: 'Andorran' },
  { code: 'AO', name: 'Angola', nationality: 'Angolan' },
  { code: 'AG', name: 'Antigua and Barbuda', nationality: 'Antiguan' },
  { code: 'AR', name: 'Argentina', nationality: 'Argentine' },
  { code: 'AM', name: 'Armenia', nationality: 'Armenian' },
  { code: 'AU', name: 'Australia', nationality: 'Australian' },
  { code: 'AT', name: 'Austria', nationality: 'Austrian' },
  { code: 'AZ', name: 'Azerbaijan', nationality: 'Azerbaijani' },
  { code: 'BS', name: 'Bahamas', nationality: 'Bahamian' },
  { code: 'BH', name: 'Bahrain', nationality: 'Bahraini' },
  { code: 'BD', name: 'Bangladesh', nationality: 'Bangladeshi' },
  { code: 'BB', name: 'Barbados', nationality: 'Barbadian' },
  { code: 'BY', name: 'Belarus', nationality: 'Belarusian' },
  { code: 'BE', name: 'Belgium', nationality: 'Belgian' },
  { code: 'BZ', name: 'Belize', nationality: 'Belizean' },
  { code: 'BJ', name: 'Benin', nationality: 'Beninese' },
  { code: 'BT', name: 'Bhutan', nationality: 'Bhutanese' },
  { code: 'BO', name: 'Bolivia', nationality: 'Bolivian' },
  { code: 'BA', name: 'Bosnia and Herzegovina', nationality: 'Bosnian' },
  { code: 'BW', name: 'Botswana', nationality: 'Motswana' },
  { code: 'BR', name: 'Brazil', nationality: 'Brazilian' },
  { code: 'BN', name: 'Brunei', nationality: 'Bruneian' },
  { code: 'BG', name: 'Bulgaria', nationality: 'Bulgarian' },
  { code: 'BF', name: 'Burkina Faso', nationality: 'Burkinabe' },
  { code: 'BI', name: 'Burundi', nationality: 'Burundian' },
  { code: 'KH', name: 'Cambodia', nationality: 'Cambodian' },
  { code: 'CM', name: 'Cameroon', nationality: 'Cameroonian' },
  { code: 'CA', name: 'Canada', nationality: 'Canadian' },
  { code: 'CV', name: 'Cape Verde', nationality: 'Cape Verdean' },
  { code: 'CF', name: 'Central African Republic', nationality: 'Central African' },
  { code: 'TD', name: 'Chad', nationality: 'Chadian' },
  { code: 'CL', name: 'Chile', nationality: 'Chilean' },
  { code: 'CN', name: 'China', nationality: 'Chinese' },
  { code: 'CO', name: 'Colombia', nationality: 'Colombian' },
  { code: 'KM', name: 'Comoros', nationality: 'Comoran' },
  { code: 'CG', name: 'Congo', nationality: 'Congolese' },
  { code: 'CR', name: 'Costa Rica', nationality: 'Costa Rican' },
  { code: 'HR', name: 'Croatia', nationality: 'Croatian' },
  { code: 'CU', name: 'Cuba', nationality: 'Cuban' },
  { code: 'CY', name: 'Cyprus', nationality: 'Cypriot' },
  { code: 'CZ', name: 'Czech Republic', nationality: 'Czech' },
  { code: 'DK', name: 'Denmark', nationality: 'Danish' },
  { code: 'DJ', name: 'Djibouti', nationality: 'Djiboutian' },
  { code: 'DM', name: 'Dominica', nationality: 'Dominican' },
  { code: 'DO', name: 'Dominican Republic', nationality: 'Dominican' },
  { code: 'EC', name: 'Ecuador', nationality: 'Ecuadorian' },
  { code: 'EG', name: 'Egypt', nationality: 'Egyptian' },
  { code: 'SV', name: 'El Salvador', nationality: 'Salvadoran' },
  { code: 'GQ', name: 'Equatorial Guinea', nationality: 'Equatorial Guinean' },
  { code: 'ER', name: 'Eritrea', nationality: 'Eritrean' },
  { code: 'EE', name: 'Estonia', nationality: 'Estonian' },
  { code: 'SZ', name: 'Eswatini', nationality: 'Swazi' },
  { code: 'ET', name: 'Ethiopia', nationality: 'Ethiopian' },
  { code: 'FJ', name: 'Fiji', nationality: 'Fijian' },
  { code: 'FI', name: 'Finland', nationality: 'Finnish' },
  { code: 'FR', name: 'France', nationality: 'French' },
  { code: 'GA', name: 'Gabon', nationality: 'Gabonese' },
  { code: 'GM', name: 'Gambia', nationality: 'Gambian' },
  { code: 'GE', name: 'Georgia', nationality: 'Georgian' },
  { code: 'DE', name: 'Germany', nationality: 'German' },
  { code: 'GH', name: 'Ghana', nationality: 'Ghanaian' },
  { code: 'GR', name: 'Greece', nationality: 'Greek' },
  { code: 'GD', name: 'Grenada', nationality: 'Grenadian' },
  { code: 'GT', name: 'Guatemala', nationality: 'Guatemalan' },
  { code: 'GN', name: 'Guinea', nationality: 'Guinean' },
  { code: 'GW', name: 'Guinea-Bissau', nationality: 'Bissau-Guinean' },
  { code: 'GY', name: 'Guyana', nationality: 'Guyanese' },
  { code: 'HT', name: 'Haiti', nationality: 'Haitian' },
  { code: 'HN', name: 'Honduras', nationality: 'Honduran' },
  { code: 'HU', name: 'Hungary', nationality: 'Hungarian' },
  { code: 'IS', name: 'Iceland', nationality: 'Icelandic' },
  { code: 'IN', name: 'India', nationality: 'Indian' },
  { code: 'ID', name: 'Indonesia', nationality: 'Indonesian' },
  { code: 'IR', name: 'Iran', nationality: 'Iranian' },
  { code: 'IQ', name: 'Iraq', nationality: 'Iraqi' },
  { code: 'IE', name: 'Ireland', nationality: 'Irish' },
  { code: 'IL', name: 'Israel', nationality: 'Israeli' },
  { code: 'IT', name: 'Italy', nationality: 'Italian' },
  { code: 'JM', name: 'Jamaica', nationality: 'Jamaican' },
  { code: 'JP', name: 'Japan', nationality: 'Japanese' },
  { code: 'JO', name: 'Jordan', nationality: 'Jordanian' },
  { code: 'KZ', name: 'Kazakhstan', nationality: 'Kazakh' },
  { code: 'KE', name: 'Kenya', nationality: 'Kenyan' },
  { code: 'KI', name: 'Kiribati', nationality: 'I-Kiribati' },
  { code: 'KP', name: 'North Korea', nationality: 'North Korean' },
  { code: 'KR', name: 'South Korea', nationality: 'South Korean' },
  { code: 'KW', name: 'Kuwait', nationality: 'Kuwaiti' },
  { code: 'KG', name: 'Kyrgyzstan', nationality: 'Kyrgyz' },
  { code: 'LA', name: 'Laos', nationality: 'Laotian' },
  { code: 'LV', name: 'Latvia', nationality: 'Latvian' },
  { code: 'LB', name: 'Lebanon', nationality: 'Lebanese' },
  { code: 'LS', name: 'Lesotho', nationality: 'Basotho' },
  { code: 'LR', name: 'Liberia', nationality: 'Liberian' },
  { code: 'LY', name: 'Libya', nationality: 'Libyan' },
  { code: 'LI', name: 'Liechtenstein', nationality: 'Liechtensteiner' },
  { code: 'LT', name: 'Lithuania', nationality: 'Lithuanian' },
  { code: 'LU', name: 'Luxembourg', nationality: 'Luxembourger' },
  { code: 'MG', name: 'Madagascar', nationality: 'Malagasy' },
  { code: 'MW', name: 'Malawi', nationality: 'Malawian' },
  { code: 'MY', name: 'Malaysia', nationality: 'Malaysian' },
  { code: 'MV', name: 'Maldives', nationality: 'Maldivian' },
  { code: 'ML', name: 'Mali', nationality: 'Malian' },
  { code: 'MT', name: 'Malta', nationality: 'Maltese' },
  { code: 'MH', name: 'Marshall Islands', nationality: 'Marshallese' },
  { code: 'MR', name: 'Mauritania', nationality: 'Mauritanian' },
  { code: 'MU', name: 'Mauritius', nationality: 'Mauritian' },
  { code: 'MX', name: 'Mexico', nationality: 'Mexican' },
  { code: 'FM', name: 'Micronesia', nationality: 'Micronesian' },
  { code: 'MD', name: 'Moldova', nationality: 'Moldovan' },
  { code: 'MC', name: 'Monaco', nationality: 'Monégasque' },
  { code: 'MN', name: 'Mongolia', nationality: 'Mongolian' },
  { code: 'ME', name: 'Montenegro', nationality: 'Montenegrin' },
  { code: 'MA', name: 'Morocco', nationality: 'Moroccan' },
  { code: 'MZ', name: 'Mozambique', nationality: 'Mozambican' },
  { code: 'MM', name: 'Myanmar', nationality: 'Burmese' },
  { code: 'NA', name: 'Namibia', nationality: 'Namibian' },
  { code: 'NR', name: 'Nauru', nationality: 'Nauruan' },
  { code: 'NP', name: 'Nepal', nationality: 'Nepali' },
  { code: 'NL', name: 'Netherlands', nationality: 'Dutch' },
  { code: 'NZ', name: 'New Zealand', nationality: 'New Zealander' },
  { code: 'NI', name: 'Nicaragua', nationality: 'Nicaraguan' },
  { code: 'NE', name: 'Niger', nationality: 'Nigerien' },
  { code: 'NG', name: 'Nigeria', nationality: 'Nigerian' },
  { code: 'MK', name: 'North Macedonia', nationality: 'Macedonian' },
  { code: 'NO', name: 'Norway', nationality: 'Norwegian' },
  { code: 'OM', name: 'Oman', nationality: 'Omani' },
  { code: 'PK', name: 'Pakistan', nationality: 'Pakistani' },
  { code: 'PW', name: 'Palau', nationality: 'Palauan' },
  { code: 'PA', name: 'Panama', nationality: 'Panamanian' },
  { code: 'PG', name: 'Papua New Guinea', nationality: 'Papua New Guinean' },
  { code: 'PY', name: 'Paraguay', nationality: 'Paraguayan' },
  { code: 'PE', name: 'Peru', nationality: 'Peruvian' },
  { code: 'PH', name: 'Philippines', nationality: 'Filipino' },
  { code: 'PL', name: 'Poland', nationality: 'Polish' },
  { code: 'PT', name: 'Portugal', nationality: 'Portuguese' },
  { code: 'QA', name: 'Qatar', nationality: 'Qatari' },
  { code: 'RO', name: 'Romania', nationality: 'Romanian' },
  { code: 'RU', name: 'Russia', nationality: 'Russian' },
  { code: 'RW', name: 'Rwanda', nationality: 'Rwandan' },
  { code: 'KN', name: 'Saint Kitts and Nevis', nationality: 'Kittitian' },
  { code: 'LC', name: 'Saint Lucia', nationality: 'Saint Lucian' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines', nationality: 'Vincentian' },
  { code: 'WS', name: 'Samoa', nationality: 'Samoan' },
  { code: 'SM', name: 'San Marino', nationality: 'Sammarinese' },
  { code: 'ST', name: 'São Tomé and Príncipe', nationality: 'São Tomean' },
  { code: 'SA', name: 'Saudi Arabia', nationality: 'Saudi' },
  { code: 'SN', name: 'Senegal', nationality: 'Senegalese' },
  { code: 'RS', name: 'Serbia', nationality: 'Serbian' },
  { code: 'SC', name: 'Seychelles', nationality: 'Seychellois' },
  { code: 'SL', name: 'Sierra Leone', nationality: 'Sierra Leonean' },
  { code: 'SG', name: 'Singapore', nationality: 'Singaporean' },
  { code: 'SK', name: 'Slovakia', nationality: 'Slovak' },
  { code: 'SI', name: 'Slovenia', nationality: 'Slovenian' },
  { code: 'SB', name: 'Solomon Islands', nationality: 'Solomon Islander' },
  { code: 'SO', name: 'Somalia', nationality: 'Somali' },
  { code: 'ZA', name: 'South Africa', nationality: 'South African' },
  { code: 'SS', name: 'South Sudan', nationality: 'South Sudanese' },
  { code: 'ES', name: 'Spain', nationality: 'Spanish' },
  { code: 'LK', name: 'Sri Lanka', nationality: 'Sri Lankan' },
  { code: 'SD', name: 'Sudan', nationality: 'Sudanese' },
  { code: 'SR', name: 'Suriname', nationality: 'Surinamese' },
  { code: 'SE', name: 'Sweden', nationality: 'Swedish' },
  { code: 'CH', name: 'Switzerland', nationality: 'Swiss' },
  { code: 'SY', name: 'Syria', nationality: 'Syrian' },
  { code: 'TW', name: 'Taiwan', nationality: 'Taiwanese' },
  { code: 'TJ', name: 'Tajikistan', nationality: 'Tajik' },
  { code: 'TZ', name: 'Tanzania', nationality: 'Tanzanian' },
  { code: 'TH', name: 'Thailand', nationality: 'Thai' },
  { code: 'TL', name: 'Timor-Leste', nationality: 'Timorese' },
  { code: 'TG', name: 'Togo', nationality: 'Togolese' },
  { code: 'TO', name: 'Tonga', nationality: 'Tongan' },
  { code: 'TT', name: 'Trinidad and Tobago', nationality: 'Trinidadian' },
  { code: 'TN', name: 'Tunisia', nationality: 'Tunisian' },
  { code: 'TR', name: 'Turkey', nationality: 'Turkish' },
  { code: 'TM', name: 'Turkmenistan', nationality: 'Turkmen' },
  { code: 'TV', name: 'Tuvalu', nationality: 'Tuvaluan' },
  { code: 'UG', name: 'Uganda', nationality: 'Ugandan' },
  { code: 'UA', name: 'Ukraine', nationality: 'Ukrainian' },
  { code: 'AE', name: 'United Arab Emirates', nationality: 'Emirati' },
  { code: 'GB', name: 'United Kingdom', nationality: 'British' },
  { code: 'US', name: 'United States', nationality: 'American' },
  { code: 'UY', name: 'Uruguay', nationality: 'Uruguayan' },
  { code: 'UZ', name: 'Uzbekistan', nationality: 'Uzbek' },
  { code: 'VU', name: 'Vanuatu', nationality: 'Ni-Vanuatu' },
  { code: 'VA', name: 'Vatican City', nationality: 'Vatican' },
  { code: 'VE', name: 'Venezuela', nationality: 'Venezuelan' },
  { code: 'VN', name: 'Vietnam', nationality: 'Vietnamese' },
  { code: 'YE', name: 'Yemen', nationality: 'Yemeni' },
  { code: 'ZM', name: 'Zambia', nationality: 'Zambian' },
  { code: 'ZW', name: 'Zimbabwe', nationality: 'Zimbabwean' },
].sort((a, b) => a.name.localeCompare(b.name));

function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [nationality, setNationality] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    matricNumber: '',
    school: '',
    faculty: '',
    department: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showOnlineStatus: true,
    allowSearch: false,
    dataForAds: true,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    window.dispatchEvent(new Event('themeChanged'));
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = () => {
    setIsEditingProfile(false);
    console.log('Profile saved:', profile);
  };

  const togglePrivacy = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  const settingsSections = [
    {
      title: "Appearance",
      items: [
        {
          icon: darkMode ? Moon : Sun,
          label: "Dark Mode",
          value: darkMode,
          action: toggleDarkMode,
          type: "toggle",
        },
      ],
    },
    {
      title: "Language Preferences",
      items: [
        {
          icon: Globe,
          label: "Preferred Languages",
          type: "multi-select",
          options: majorLanguages,
          selected: selectedLanguages,
          onChange: setSelectedLanguages,
          description: "Select multiple languages for better content recommendation",
        },
      ],
    },
    {
      title: "Region & Nationality",
      items: [
        {
          icon: Globe,
          label: "Nationality",
          type: "select",
          options: countries.map(c => ({ value: c.code, label: `${c.name} (${c.nationality})` })),
          selected: nationality,
          onChange: (e) => setNationality(e.target.value),
          description: "Choose your nationality",
        },
      ],
    },
    {
      title: "Profile Settings",
      items: [
        {
          type: "profile-edit",
          isEditing: isEditingProfile,
          profile,
          onChange: handleProfileChange,
          onSave: saveProfile,
          onEdit: () => setIsEditingProfile(true),
          onCancel: () => setIsEditingProfile(false),
        },
      ],
    },
    {
      title: "Privacy Settings",
      items: [
        {
          label: "Public Profile",
          description: "Allow others to view your profile",
          type: "toggle",
          value: privacy.profilePublic,
          action: () => togglePrivacy('profilePublic'),
        },
        {
          label: "Show Online Status",
          description: "Let friends see when you're online",
          type: "toggle",
          value: privacy.showOnlineStatus,
          action: () => togglePrivacy('showOnlineStatus'),
        },
        {
          label: "Allow Search Engines",
          description: "Make your profile discoverable on search engines",
          type: "toggle",
          value: privacy.allowSearch,
          action: () => togglePrivacy('allowSearch'),
        },
        {
          label: "Personalized Ads",
          description: "Use your data for targeted advertising",
          type: "toggle",
          value: privacy.dataForAds,
          action: () => togglePrivacy('dataForAds'),
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: Trash2,
          label: "Delete Account",
          type: "danger",
          action: () => setShowDeleteConfirm(true),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white mb-8">
          Settings
        </h1>

        <div className="space-y-8">
          {settingsSections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {section.title}
                </h2>
              </div>

              <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {section.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="px-8 py-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {item.icon && (
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mt-1">
                            <item.icon size={20} />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-slate-800 dark:text-white">
                            {item.label}
                          </p>
                          {item.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        {item.type === "toggle" && (
                          <button
                            onClick={item.action}
                            className={`relative w-14 h-8 rounded-full transition-colors ${
                              item.value
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                                : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <div
                              className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                                item.value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}

                        {item.type === "multi-select" && (
                          <select
                            multiple
                            size="5"
                            value={item.selected}
                            onChange={(e) => item.onChange(Array.from(e.target.selectedOptions, o => o.value))}
                            className="w-64 py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                          >
                            {item.options.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {item.type === "select" && (
                          <select
                            value={item.selected}
                            onChange={item.onChange}
                            className="w-64 py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                          >
                            <option value="">Select your nationality</option>
                            {item.options.map(opt => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {item.type === "profile-edit" && (
                        <div className="space-y-4 w-full">
                          {item.isEditing ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <input
                                name="name"
                                value={item.profile.name}
                                onChange={item.onChange}
                                placeholder="Full Name"
                                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600"
                              />
                              <input
                                name="email"
                                value={item.profile.email}
                                onChange={item.onChange}
                                placeholder="Email"
                                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600"
                              />
                              <input
                                name="matricNumber"
                                value={item.profile.matricNumber}
                                onChange={item.onChange}
                                placeholder="Matric Number"
                                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600"
                              />
                              <input
                                name="school"
                                value={item.profile.school}
                                onChange={item.onChange}
                                placeholder="School"
                                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600"
                              />
                              <input
                                name="faculty"
                                value={item.profile.faculty}
                                onChange={item.onChange}
                                placeholder="Faculty"
                                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600"
                              />
                              <input
                                name="department"
                                value={item.profile.department}
                                onChange={item.onChange}
                                placeholder="Department"
                                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600"
                              />
                              <input
                                name="password"
                                type="password"
                                value={item.profile.password}
                                onChange={item.onChange}
                                placeholder="New Password"
                                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600"
                              />
                              <input
                                name="role"
                                value={item.profile.role}
                                onChange={item.onChange}
                                placeholder="Role"
                                className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600"
                              />
                            </div>
                          ) : (
                            <button onClick={item.onEdit} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl">
                              <Edit3 size={18} /> Edit Profile
                            </button>
                          )}
                          {item.isEditing && (
                            <div className="flex gap-3 mt-4">
                              <button onClick={item.onSave} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl">
                                <Save size={18} /> Save
                              </button>
                              <button onClick={item.onCancel} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-xl">
                                <X size={18} /> Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                        {item.type === "danger" && (
                          <button onClick={item.action} className="text-red-600 dark:text-red-400 font-medium">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Delete Account Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                Delete Account?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                This action is permanent and cannot be undone. All your data will be deleted.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 bg-gray-300 dark:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Account deleted');
                    setShowDeleteConfirm(false);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;