// components/Dashboard/AuthForm.jsx - Fixed Import Path
import React, { useState, useEffect } from 'react';
import {
  Mail, Lock, User, Eye, EyeOff, Sparkles, BookOpen,
  GraduationCap, Users, School, Bookmark, Calendar,
  Phone, MapPin, Briefcase, Award, Globe, Linkedin,
  Twitter, Github, CheckCircle, AlertCircle, ChevronRight,
  UserCheck, Video, FileText, MessageCircle, Star,
  Trophy, Target, Compass, Zap, Shield, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext'; // FIXED: Changed from '../contexts/AuthContext' to '../../contexts/AuthContext'

const ROLES = [
  { 
    id: 'student', 
    label: 'Student', 
    icon: GraduationCap, 
    color: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Access study materials, past questions, and video tutorials'
  },
  { 
    id: 'tutor', 
    label: 'Tutor', 
    icon: Users, 
    color: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'Create and share educational content, host study sessions'
  },
  { 
    id: 'lecturer', 
    label: 'Lecturer', 
    icon: Award, 
    color: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Upload course materials, manage classes, and assess students'
  },
];

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt',
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Other'
];

const NIGERIAN_UNIVERSITIES = [
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'Ahmadu Bello University (ABU)',
  'University of Nigeria, Nsukka (UNN)',
  'University of Port Harcourt (UNIPORT)',
  'Covenant University',
  'Babcock University',
  'Federal University of Technology, Akure (FUTA)',
  'University of Ilorin (UNILORIN)',
  'University of Benin (UNIBEN)',
  'Lagos State University (LASU)',
  'Nnamdi Azikiwe University (UNIZIK)',
  'Federal University of Technology, Minna',
  'University of Abuja',
  'Other'
];

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Petroleum Engineering',
  'Business Administration',
  'Accounting',
  'Economics',
  'Mass Communication',
  'Law',
  'Medicine',
  'Pharmacy',
  'Biochemistry',
  'Microbiology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Statistics',
  'English',
  'History',
  'Political Science',
  'Psychology',
  'Sociology',
  'Other'
];

const EXPERTISE_AREAS = [
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Cloud Computing',
  'Cybersecurity',
  'Database Management',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'Business Strategy',
  'Leadership',
  'Communication',
  'Research Methods',
  'Academic Writing',
  'Test Preparation',
  'Language Learning',
  'Other'
];

const COURSES = [
  'Mathematics',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Economics',
  'Accounting',
  'Business Studies',
  'History',
  'Geography',
  'Government',
  'Literature',
  'French',
  'Arabic',
  'Islamic Studies',
  'Christian Religious Studies',
  'Agricultural Science',
  'Technical Drawing',
  'Other'
];

function AuthForm() {
  const { signIn, signUp, loading: authLoading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');
  const [step, setStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    // Common fields
    phone: '',
    country: 'Nigeria',
    state: '',
    city: '',
    bio: '',
    // Student specific
    studentId: '',
    level: '',
    department: '',
    school: '',
    matricNumber: '',
    graduationYear: '',
    courses: [],
    // Tutor specific
    expertise: [],
    yearsOfExperience: '',
    hourlyRate: '',
    qualifications: [],
    availability: '',
    teachingStyle: '',
    portfolio: '',
    // Lecturer specific
    staffId: '',
    faculty: '',
    rank: '',
    researchAreas: [],
    publications: '',
    officeHours: '',
    coursesTeaching: [],
  });
  
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...(prev[name] || []), value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: (prev[name] || []).filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Full name is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      // Role-specific validations
      if (selectedRole === 'student') {
        if (!formData.school) newErrors.school = 'School/University is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.level) newErrors.level = 'Level/Year is required';
      } else if (selectedRole === 'tutor') {
        if (!formData.expertise?.length) newErrors.expertise = 'At least one expertise area is required';
        if (!formData.qualifications?.length) newErrors.qualifications = 'At least one qualification is required';
      } else if (selectedRole === 'lecturer') {
        if (!formData.staffId) newErrors.staffId = 'Staff ID is required';
        if (!formData.faculty) newErrors.faculty = 'Faculty is required';
        if (!formData.rank) newErrors.rank = 'Academic rank is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const userData = {
        role: selectedRole,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVerified: false,
        profileComplete: true,
      };
      
      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await signUp(formData.email, formData.password, userData);
        toast.success('Account created successfully! Please complete your profile.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (!isLogin && formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      setStep(2);
    }
  };

  const prevStep = () => setStep(1);

  // Student Form Fields
  const StudentFields = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            School / University <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="school"
              value={formData.school}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.school ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
            >
              <option value="">Select University</option>
              {NIGERIAN_UNIVERSITIES.map(uni => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>
          </div>
          {errors.school && <p className="text-xs text-red-500 mt-1">{errors.school}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.department ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Level/Year <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.level ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
            >
              <option value="">Select Level</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>
          {errors.level && <p className="text-xs text-red-500 mt-1">{errors.level}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Matriculation Number
          </label>
          <div className="relative">
            <HashIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="matricNumber"
              value={formData.matricNumber}
              onChange={handleChange}
              placeholder="e.g., U2023/123456"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Courses/Subjects
        </label>
        <div className="relative">
          <Bookmark className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            multiple
            name="courses"
            value={formData.courses}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[100px]"
            size={4}
          >
            {COURSES.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple courses</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Expected Graduation Year
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              name="graduationYear"
              value={formData.graduationYear}
              onChange={handleChange}
              placeholder="e.g., 2027"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Student ID
          </label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="Your student ID number"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Tutor Form Fields
  const TutorFields = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Areas of Expertise <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Star className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            multiple
            name="expertise"
            value={formData.expertise}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.expertise ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[120px]`}
            size={5}
          >
            {EXPERTISE_AREAS.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        {errors.expertise && <p className="text-xs text-red-500 mt-1">{errors.expertise}</p>}
        <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple areas</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Years of Experience
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              placeholder="e.g., 3"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Hourly Rate (USD)
          </label>
          <div className="relative">
            <DollarSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              placeholder="e.g., 25"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Qualifications/Certifications <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Award className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            multiple
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.qualifications ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[100px]`}
            size={4}
          >
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Master's Degree">Master's Degree</option>
            <option value="PhD">PhD</option>
            <option value="Professional Certification">Professional Certification</option>
            <option value="Teaching License">Teaching License</option>
            <option value="TEFL/TESOL">TEFL/TESOL</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {errors.qualifications && <p className="text-xs text-red-500 mt-1">{errors.qualifications}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Teaching Style / Methodology
        </label>
        <textarea
          name="teachingStyle"
          value={formData.teachingStyle}
          onChange={handleChange}
          rows={2}
          placeholder="Describe your teaching approach, methods, and philosophy..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Availability
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            placeholder="e.g., Weekdays 4PM-8PM, Weekends 9AM-5PM"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Portfolio / Website
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="url"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleChange}
            placeholder="https://your-portfolio.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
          />
        </div>
      </div>
    </motion.div>
  );

  // Lecturer Form Fields
  const LecturerFields = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Staff ID <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="staffId"
              value={formData.staffId}
              onChange={handleChange}
              placeholder="e.g., UNN/STAFF/2023/001"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.staffId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
            />
          </div>
          {errors.staffId && <p className="text-xs text-red-500 mt-1">{errors.staffId}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Faculty <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              placeholder="e.g., Faculty of Science"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.faculty ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
            />
          </div>
          {errors.faculty && <p className="text-xs text-red-500 mt-1">{errors.faculty}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Academic Rank <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.rank ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
            >
              <option value="">Select Rank</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Senior Lecturer">Senior Lecturer</option>
              <option value="Lecturer I">Lecturer I</option>
              <option value="Lecturer II">Lecturer II</option>
              <option value="Assistant Lecturer">Assistant Lecturer</option>
              <option value="Graduate Assistant">Graduate Assistant</option>
            </select>
          </div>
          {errors.rank && <p className="text-xs text-red-500 mt-1">{errors.rank}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Department
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Research Areas
        </label>
        <div className="relative">
          <Target className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            multiple
            name="researchAreas"
            value={formData.researchAreas}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[100px]"
            size={4}
          >
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Data Science">Data Science</option>
            <option value="Renewable Energy">Renewable Energy</option>
            <option value="Biotechnology">Biotechnology</option>
            <option value="Nanotechnology">Nanotechnology</option>
            <option value="Climate Change">Climate Change</option>
            <option value="Public Health">Public Health</option>
            <option value="Educational Technology">Educational Technology</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Courses Teaching
        </label>
        <div className="relative">
          <Bookmark className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            multiple
            name="coursesTeaching"
            value={formData.coursesTeaching}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition min-h-[100px]"
            size={4}
          >
            {COURSES.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple courses</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Office Hours
          </label>
          <div className="relative">
            <ClockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="officeHours"
              value={formData.officeHours}
              onChange={handleChange}
              placeholder="e.g., Mondays & Wednesdays 2PM-4PM"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Publications (Count)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              name="publications"
              value={formData.publications}
              onChange={handleChange}
              placeholder="Number of publications"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Common Fields (for all roles)
  const CommonFields = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Full Name {!isLogin && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email Address {!isLogin && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234 123 456 7890"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Country
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            >
              {COUNTRIES.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Bio / About
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={3}
          placeholder="Tell us about yourself, your interests, and what you hope to achieve..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
        />
      </div>
    </motion.div>
  );

  // Role Selection Component
  const RoleSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {ROLES.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.id;
        return (
          <motion.button
            key={role.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole(role.id)}
            className={`relative p-4 rounded-2xl text-left transition-all ${
              isSelected
                ? `bg-gradient-to-br ${role.color} text-white shadow-lg`
                : `bg-white dark:bg-slate-800 border-2 ${role.borderColor} hover:shadow-md`
            }`}
          >
            <div className={`p-2 rounded-xl mb-3 inline-block ${
              isSelected ? 'bg-white/20' : `bg-gradient-to-br ${role.color}`
            }`}>
              <Icon size={24} className={isSelected ? 'text-white' : 'text-white'} />
            </div>
            <h3 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
              {role.label}
            </h3>
            <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
              {role.description}
            </p>
            {isSelected && (
              <CheckCircle size={16} className="absolute top-4 right-4 text-white" />
            )}
          </motion.button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-white" />
                <h1 className="text-2xl font-bold text-white">
                  {isLogin ? 'Welcome Back!' : 'Join WeConnect'}
                </h1>
              </div>
              <p className="text-indigo-100">
                {isLogin 
                  ? 'Sign in to continue your learning journey' 
                  : 'Create an account to access premium educational resources'}
              </p>
            </div>
          </div>
          
          <div className="p-8">
            {!isLogin && <RoleSelection />}
            
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <CommonFields key="common" />
                ) : (
                  <div key="role-specific">
                    {selectedRole === 'student' && <StudentFields />}
                    {selectedRole === 'tutor' && <TutorFields />}
                    {selectedRole === 'lecturer' && <LecturerFields />}
                  </div>
                )}
              </AnimatePresence>
              
              {/* Password Fields */}
              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password {!isLogin && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-2.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-slate-400" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                  </div>
                )}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {!isLogin && step === 2 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 transition"
                  >
                    Back
                  </button>
                )}
                
                {!isLogin && step === 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    Continue <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || authLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading || authLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                )}
              </div>
            </form>
            
            {/* Toggle between Login and Signup */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setStep(1);
                  setErrors({});
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Helper components for icons
const HashIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const DollarSignIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ClockIcon = ({ size = 16, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default AuthForm;