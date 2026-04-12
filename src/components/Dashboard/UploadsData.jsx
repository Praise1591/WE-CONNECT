// UploadsData.jsx - Updated with conditional fields for Past Questions
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Upload, X, FileText, Video, BookOpen, ScrollText,
  ArrowRight, Check, ArrowLeft, CloudUpload, FileCheck,
  Image, PlayCircle, File, AlertCircle, ChevronRight,
  ChevronLeft, Download, Eye, Layers, Sparkles, Trash2,
  Calendar, Bookmark, GraduationCap, Clock, Monitor, Award,
  UserCheck, Users, Target, Hash, CalendarDays, ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase imports
import { db, storage, auth } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Category configuration with specific fields
const CATEGORIES = [
  { 
    value: 'Past Questions', 
    icon: ScrollText, 
    label: 'Past Questions', 
    color: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-600',
    accept: '.pdf,.doc,.docx',
    description: 'Share past exam papers and practice questions',
    // Past Questions don't need course field - they already have subject in title
    showCourseField: false,
    specificFields: [
      { name: 'semester', label: 'Semester', type: 'select', required: true, options: ['First Semester', 'Second Semester', 'Both Semesters'], icon: Calendar },
      { name: 'level', label: 'Level/Year', type: 'select', required: true, options: ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Postgraduate'], icon: GraduationCap },
      { name: 'examType', label: 'Exam Type', type: 'select', required: true, options: ['Mid-Semester', 'End of Semester', 'Supplementary', 'Mock Exam'], icon: Target },
      //{ name: 'academicYear', label: 'Academic Year', type: 'text', required: true, placeholder: 'e.g., 2023/2024', icon: CalendarDays }//
    ]
  },
  { 
    value: 'PDF Notes', 
    icon: FileText, 
    label: 'PDF Notes', 
    color: 'from-blue-500 to-cyan-600',
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600',
    accept: '.pdf,.doc,.docx',
    description: 'Share lecture notes, summaries, and study guides',
    showCourseField: true,
    specificFields: [
      { name: 'semester', label: 'Semester', type: 'select', required: true, options: ['First Semester', 'Second Semester'], icon: Calendar },
      { name: 'lectureType', label: 'Lecture Type', type: 'select', required: true, options: ['Lecture Notes', 'Summary', 'Revision Guide', 'Practical Guide', 'Lab Manual'], icon: BookOpen },
      { name: 'topic', label: 'Topic/Chapter', type: 'text', required: false, placeholder: 'e.g., Chapter 1 - Introduction to Organic Chemistry', icon: Bookmark }
    ]
  },
  { 
    value: 'Video Tutorials', 
    icon: Video, 
    label: 'Video Tutorials', 
    color: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600',
    accept: '.mp4,.avi,.mov,.webm',
    description: 'Upload educational video content and tutorials',
    showCourseField: true,
    specificFields: [
      { name: 'duration', label: 'Duration', type: 'text', required: true, placeholder: 'e.g., 45 minutes, 1 hour 30 mins', icon: Clock },
      { name: 'resolution', label: 'Resolution', type: 'select', required: true, options: ['720p (HD)', '1080p (Full HD)', '4K', 'Auto'], icon: Monitor },
      { name: 'instructor', label: 'Instructor/Tutor', type: 'text', required: false, placeholder: 'e.g., Dr. John Smith', icon: UserCheck },
      { name: 'topics', label: 'Topics Covered', type: 'textarea', required: false, placeholder: 'List the main topics covered in this video...', icon: Target }
    ]
  },
  { 
    value: 'Technical Reviews', 
    icon: BookOpen, 
    label: 'Technical Reviews', 
    color: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconColor: 'text-emerald-600',
    accept: '.pdf,.doc,.docx',
    description: 'Share research papers, reviews, and technical articles',
    showCourseField: true,
    specificFields: [
      { name: 'publicationDate', label: 'Publication Date', type: 'date', required: true, icon: Calendar },
      { name: 'reviewer', label: 'Reviewer/Analyst', type: 'text', required: true, placeholder: 'e.g., Dr. Jane Doe', icon: Award },
      { name: 'journal', label: 'Journal/Publisher', type: 'text', required: false, placeholder: 'e.g., Nigerian Journal of Science', icon: BookOpen },
      { name: 'doi', label: 'DOI/Reference ID', type: 'text', required: false, placeholder: 'e.g., 10.1234/example', icon: Hash }
    ]
  },
];

// Step Indicator Component
const StepIndicator = React.memo(({ step }) => (
  <div className="mb-12">
    <div className="flex items-center justify-between max-w-2xl mx-auto">
      {[1, 2, 3, 4].map((s, idx) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                scale: step === s ? 1.1 : 1,
                backgroundColor: step >= s ? '#4F46E5' : '#E2E8F0'
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {step > s ? <Check size={20} /> : s}
            </motion.div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 hidden sm:block">
              {s === 1 ? 'Category' : s === 2 ? 'Details' : s === 3 ? 'Upload' : 'Complete'}
            </p>
          </div>
          {s < 4 && (
            <div className={`flex-1 h-1 mx-4 rounded-full transition-all ${
              step > s ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
));

// Category Selection Step
const CategoryStep = React.memo(({ onSelectCategory }) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.3 }}
  >
    <div className="text-center mb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Share Knowledge
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Choose what type of educational material you want to share with the community
        </p>
      </motion.div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {CATEGORIES.map((cat, idx) => {
        const Icon = cat.icon;
        return (
          <motion.button
            key={cat.value}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onSelectCategory(cat)}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all bg-gradient-to-br ${cat.bgGradient} border-2 ${cat.borderColor} hover:shadow-2xl`}
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-6 h-6 text-slate-400" />
            </div>
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${cat.color} text-white mb-4 shadow-lg`}>
              <Icon size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{cat.label}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{cat.description}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <File size={12} />
              <span>Supports: {cat.accept.toUpperCase()}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  </motion.div>
));

// Dynamic Field Renderer
const DynamicField = ({ field, value, onChange }) => {
  const Icon = field.icon;
  
  if (field.type === 'select') {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            name={field.name}
            value={value || ''}
            onChange={onChange}
            required={field.required}
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
          >
            <option value="">Select {field.label}</option>
            {field.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
    );
  }
  
  if (field.type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Icon className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
          <textarea
            name={field.name}
            value={value || ''}
            onChange={onChange}
            placeholder={field.placeholder}
            rows={3}
            required={field.required}
            className="w-full pl-12 pr-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
          />
        </div>
      </div>
    );
  }
  
  if (field.type === 'date') {
    return (
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="date"
            name={field.name}
            value={value || ''}
            onChange={onChange}
            required={field.required}
            className="w-full pl-12 pr-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          name={field.name}
          value={value || ''}
          onChange={onChange}
          placeholder={field.placeholder}
          required={field.required}
          className="w-full pl-12 pr-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>
    </div>
  );
};

// Details Form Step Component
const DetailsStep = React.memo(({ formData, onInputChange, onSpecificFieldChange, onNext, onBack, selectedCategory }) => {
  const handleChange = useCallback((e) => {
    onInputChange(e.target.name, e.target.value);
  }, [onInputChange]);

  const handleSpecificFieldChange = useCallback((e) => {
    onSpecificFieldChange(e.target.name, e.target.value);
  }, [onSpecificFieldChange]);

  const handleNext = useCallback(() => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    // For non-Past Questions, validate course field
    if (selectedCategory?.showCourseField && !formData.course.trim()) {
      toast.error("Please enter the course code/name");
      return;
    }
    
    if (!formData.school.trim()) {
      toast.error("Please enter your school/university");
      return;
    }
    
    // Validate category-specific required fields
    if (selectedCategory?.specificFields) {
      const missingFields = selectedCategory.specificFields
        .filter(field => field.required && !formData.specificData?.[field.name])
        .map(field => field.label);
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    onNext();
  }, [formData, selectedCategory, onNext]);

  const showCourseField = selectedCategory?.showCourseField !== false;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedCategory?.color} text-white`}>
            {selectedCategory && <selectedCategory.icon size={20} />}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            Material Details
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Provide comprehensive information about your {selectedCategory?.label.toLowerCase()}
        </p>
      </div>

      <div className="space-y-6">
        {/* Title Field - Always required */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder={`e.g., ${selectedCategory?.value === 'Past Questions' ? 'CHE 101 Organic Chemistry 2023/2024 Past Questions' : selectedCategory?.value === 'Video Tutorials' ? 'Complete Guide to Organic Chemistry Reactions' : 'Introduction to Organic Chemistry Notes'}`}
            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Course Field - Only show for non-Past Questions */}
        {showCourseField && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Course Code / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g., CHE 101, Introduction to Organic Chemistry"
              className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              School / University <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="school"
              value={formData.school}
              onChange={handleChange}
              placeholder="e.g., University of Port Harcourt"
              className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Pure and Industrial Chemistry"
              className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Category-Specific Fields */}
        {selectedCategory?.specificFields && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Layers size={18} className="text-indigo-500" />
              {selectedCategory.label} Specific Information
            </h3>
            <div className="space-y-4">
              {selectedCategory.specificFields.map((field) => (
                <DynamicField
                  key={field.name}
                  field={field}
                  value={formData.specificData?.[field.name]}
                  onChange={handleSpecificFieldChange}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Add any additional notes, requirements, or special instructions..."
            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
          />
        </div>
      </div>

      <div className="flex justify-between gap-4 mt-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center gap-2"
        >
          Continue to Upload <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
});

function UploadsData() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    school: '',
    department: '',
    description: '',
    specificData: {},
    file: null,
    preview: null,
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [previewImagePreviews, setPreviewImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [dragPreviewActive, setDragPreviewActive] = useState(false);
  const uploadTaskRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewInputRef = useRef(null);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSpecificFieldChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      specificData: { ...prev.specificData, [field]: value }
    }));
  }, []);

  const handleCategorySelect = useCallback((cat) => {
    setSelectedCategory(cat);
    setFormData(prev => ({
      ...prev,
      specificData: {},
      // Reset course field when switching to Past Questions (since they don't need it)
      course: cat.showCourseField ? prev.course : ''
    }));
    setStep(2);
  }, []);

  const handleNextStep = useCallback(() => {
    setStep(3);
  }, []);

  const handleBackStep = useCallback(() => {
    setStep(2);
  }, []);

  const handleBackToCategory = useCallback(() => {
    setStep(1);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCategory) return;

    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!selectedCategory.accept.split(',').includes(fileExt)) {
      toast.error(`Invalid file type. Allowed: ${selectedCategory.accept}`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, file, preview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e, type = 'file') => {
    e.preventDefault();
    if (type === 'file') setDragActive(true);
    else setDragPreviewActive(true);
  };

  const handleDragLeave = (e, type = 'file') => {
    e.preventDefault();
    if (type === 'file') setDragActive(false);
    else setDragPreviewActive(false);
  };

  const handleDrop = (e, type = 'file') => {
    e.preventDefault();
    if (type === 'file') setDragActive(false);
    else setDragPreviewActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (type === 'file') {
      const file = files[0];
      if (!selectedCategory) return;

      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!selectedCategory.accept.split(',').includes(fileExt)) {
        toast.error(`Invalid file type. Allowed: ${selectedCategory.accept}`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, file, preview: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      const validFiles = files.filter(f => f.type.startsWith('image/'));
      if (validFiles.length !== files.length) {
        toast.error("Only image files (.jpg, .png, .webp) allowed for previews");
        return;
      }

      const previews = validFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...validFiles].slice(0, 5));
      setPreviewImagePreviews(prev => [...prev, ...previews].slice(0, 5));
    }
  };

  const handlePreviewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error("Only image files (.jpg, .png, .webp) allowed for previews");
      return;
    }

    const previews = validFiles.map(file => URL.createObjectURL(file));

    setPreviewImages(prev => [...prev, ...validFiles].slice(0, 5));
    setPreviewImagePreviews(prev => [...prev, ...previews].slice(0, 5));
  };

  const removePreviewImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const startUpload = async () => {
    if (!auth.currentUser) {
      toast.error("You must be signed in to upload materials");
      return;
    }
    if (!formData.file || !selectedCategory) {
      toast.error("Please select a file and category");
      return;
    }

    const isVideo = selectedCategory.value === 'Video Tutorials';
    if (!isVideo && previewImages.length < 3) {
      toast.error("Please upload at least 3 preview screenshots for this category");
      return;
    }

    setUploading(true);
    setProgress(0);
    setIsPaused(false);

    const file = formData.file;
    const fileName = file.name;
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2,10)}_${fileName}`;
    const storagePath = `users/${auth.currentUser.uid}/materials/${uniqueName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTaskRef.current = uploadTask;

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);

        if (snapshot.state === 'paused') setIsPaused(true);
        if (snapshot.state === 'running') setIsPaused(false);
      },
      (error) => {
        console.error("Upload error:", error);
        const msg = error.code === 'storage/unauthorized'
          ? "Permission denied — check Firebase Storage rules"
          : error.code === 'storage/canceled'
            ? "Upload cancelled"
            : "Upload failed";
        toast.error(msg);
        setUploading(false);
        uploadTaskRef.current = null;
      },
      async () => {
        try {
          const publicUrl = await getDownloadURL(storageRef);

          let previewUrls = [];
          if (previewImages.length > 0) {
            previewUrls = await Promise.all(
              previewImages.map(async (imgFile, idx) => {
                const imgName = `preview-${idx + 1}_${uuidv4().slice(0,8)}.${imgFile.name.split('.').pop()}`;
                const imgPath = `users/${auth.currentUser.uid}/materials/previews/${uniqueName}/${imgName}`;
                const imgRef = ref(storage, imgPath);
                await uploadBytesResumable(imgRef, imgFile);
                return getDownloadURL(imgRef);
              })
            );
          }

          if (!auth.currentUser) {
            throw new Error("User no longer authenticated at save time");
          }

          await addDoc(collection(db, 'materials'), {
            name: formData.title.trim(),
            title: formData.title.trim(),
            // For Past Questions, course is not required - use title as fallback
            course: formData.course.trim() || formData.title.trim(),
            school: formData.school.trim(),
            department: formData.department?.trim() || null,
            description: formData.description?.trim() || null,
            category: selectedCategory.value,
            specificData: formData.specificData,
            file_name: fileName,
            file_path: storagePath,
            file_size: file.size,
            mime_type: file.type,
            public_url: publicUrl,
            previewImages: previewUrls,
            uid: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          toast.success("Material uploaded and saved successfully!");
          setStep(4);
        } catch (err) {
          console.error("Metadata save error:", err);
          const msg = err.code === 'permission-denied'
            ? "Firestore permission denied — check your security rules"
            : err.message || "Failed to save material info";
          toast.error(msg);
        } finally {
          setUploading(false);
          uploadTaskRef.current = null;
        }
      }
    );
  };

  const togglePauseResume = () => {
    if (!uploadTaskRef.current) return;
    isPaused ? uploadTaskRef.current.resume() : uploadTaskRef.current.pause();
  };

  const cancelUpload = () => {
    if (uploadTaskRef.current) uploadTaskRef.current.cancel();
    setUploading(false);
    setIsPaused(false);
    setProgress(0);
    uploadTaskRef.current = null;
    toast.info("Upload cancelled");
  };

  const resetForm = () => {
    if (uploading) cancelUpload();
    setStep(1);
    setSelectedCategory(null);
    setFormData({
      title: '', course: '', school: '', department: '', description: '',
      specificData: {},
      file: null, preview: null,
    });
    setPreviewImages([]);
    setPreviewImagePreviews([]);
  };

  // Success Step Component
  const SuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-28 h-28 mx-auto mb-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl"
      >
        <Check size={48} className="text-white" />
      </motion.div>
      
      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
        Upload Complete! 🎉
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Your {selectedCategory?.label.toLowerCase()} has been successfully uploaded and shared with the community.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetForm}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all inline-flex items-center gap-2"
        >
          <Upload size={18} />
          Upload Another File
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/dashboard'}
          className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all inline-flex items-center gap-2"
        >
          Go to Dashboard
        </motion.button>
      </div>
    </motion.div>
  );

  // Upload Step Component
  const UploadStep = () => {
    const isVideo = selectedCategory?.value === 'Video Tutorials';
    const previewRequired = !isVideo && previewImages.length < 3;

    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${selectedCategory.color} text-white`}>
              {selectedCategory && <selectedCategory.icon size={20} />}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              Upload Files
            </h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Upload your main file and preview images
          </p>
        </div>

        <div className="space-y-8">
          {/* Main File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Main File <span className="text-red-500">*</span>
            </label>
            <div
              onDragOver={(e) => handleDragOver(e, 'file')}
              onDragLeave={(e) => handleDragLeave(e, 'file')}
              onDrop={(e) => handleDrop(e, 'file')}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={selectedCategory?.accept}
                onChange={handleFileChange}
                className="hidden"
              />
              
              {formData.file ? (
                <div className="flex items-center gap-4 text-left">
                  {formData.preview?.startsWith('data:video') ? (
                    <video src={formData.preview} className="w-20 h-20 object-cover rounded" controlsList="nodownload" />
                  ) : formData.preview ? (
                    <img src={formData.preview} alt="preview" className="w-20 h-20 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-lg flex items-center justify-center">
                      <FileText size={32} className="text-indigo-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-800 dark:text-white truncate">{formData.file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, file: null, preview: null }));
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div>
                  <CloudUpload className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">Click or drag & drop to upload</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Supports: {selectedCategory?.accept.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview Images Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Preview Screenshots
              {!isVideo && <span className="text-red-500 ml-1">* (3-5 images)</span>}
              {isVideo && <span className="text-slate-500 ml-1">(Optional)</span>}
            </label>
            <div
              onDragOver={(e) => handleDragOver(e, 'preview')}
              onDragLeave={(e) => handleDragLeave(e, 'preview')}
              onDrop={(e) => handleDrop(e, 'preview')}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                dragPreviewActive
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                  : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
              }`}
              onClick={() => previewInputRef.current?.click()}
            >
              <input
                ref={previewInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePreviewImagesChange}
                className="hidden"
              />
              <div>
                <Image className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400">Click or drag images here</p>
                <p className="text-sm text-slate-500">JPEG, PNG, WebP • Up to 5 images</p>
              </div>
            </div>

            {previewImagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Selected Images ({previewImagePreviews.length}/5)
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {previewImagePreviews.map((src, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img
                        src={src}
                        alt={`preview ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        onClick={() => removePreviewImage(idx)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Uploading...
                </span>
                <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={togglePauseResume}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={cancelUpload}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex justify-between gap-4 mt-10">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBackStep}
            disabled={uploading && !isPaused}
            className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <ArrowLeft size={18} /> Back
          </motion.button>

          {!uploading ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startUpload}
              disabled={!formData.file || previewRequired}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CloudUpload size={18} />
              Start Upload
            </motion.button>
          ) : (
            <div className="px-8 py-3 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-xl">
              Upload in progress...
            </div>
          )}
        </div>

        {previewRequired && !uploading && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Please upload at least 3 preview screenshots to continue
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 lg:py-16">
        <StepIndicator step={step} />
        
        <AnimatePresence mode="wait">
          {step === 1 && <CategoryStep key="category" onSelectCategory={handleCategorySelect} />}
          {step === 2 && (
            <DetailsStep 
              key="details" 
              formData={formData}
              onInputChange={handleInputChange}
              onSpecificFieldChange={handleSpecificFieldChange}
              onNext={handleNextStep}
              onBack={handleBackToCategory}
              selectedCategory={selectedCategory}
            />
          )}
          {step === 3 && <UploadStep key="upload" />}
          {step === 4 && <SuccessStep key="success" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default UploadsData;