// UploadsData.jsx - Fixed with proper data sanitization (No Enclosing Box)

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
    showCourseField: false,
    specificFields: [
      { name: 'semester', label: 'Semester', type: 'select', required: true, options: ['First Semester', 'Second Semester', 'Both Semesters'], icon: Calendar },
      { name: 'level', label: 'Level/Year', type: 'select', required: true, options: ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Postgraduate'], icon: GraduationCap },
      { name: 'examType', label: 'Exam Type', type: 'select', required: true, options: ['Mid-Semester', 'End of Semester', 'Supplementary', 'Mock Exam'], icon: Target },
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
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                scale: step === s ? 1.1 : 1,
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
            className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all bg-gradient-to-br ${cat.bgGradient} border-2 ${cat.borderColor} hover:shadow-2xl cursor-pointer`}
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
const DynamicField = React.memo(({ field, value, onChange, name }) => {
  const Icon = field.icon;
  const fieldName = name || field.name;
  
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(fieldName, newValue);
  };
  
  if (field.type === 'select') {
    return (
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={value || ''}
            onChange={handleChange}
            required={field.required}
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
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
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Icon className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
          <textarea
            value={value || ''}
            onChange={handleChange}
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
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="date"
            value={value || ''}
            onChange={handleChange}
            required={field.required}
            className="w-full pl-12 pr-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={value || ''}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
          className="w-full pl-12 pr-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>
    </div>
  );
});

// Details Form Step Component
const DetailsStep = React.memo(({ formData, onInputChange, onSpecificFieldChange, onNext, onBack, selectedCategory }) => {
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    onInputChange(name, value);
  }, [onInputChange]);

  const handleSpecificFieldChangeWrapper = useCallback((fieldName, value) => {
    onSpecificFieldChange(fieldName, value);
  }, [onSpecificFieldChange]);

  const handleNext = useCallback(() => {
    if (!formData.title?.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    if (selectedCategory?.showCourseField && !formData.course?.trim()) {
      toast.error("Please enter the course code/name");
      return;
    }
    
    if (!formData.school?.trim()) {
      toast.error("Please enter your school/university");
      return;
    }
    
    if (selectedCategory?.specificFields) {
      const missingFields = selectedCategory.specificFields
        .filter(field => field.required && !formData.specificData?.[field.name]?.trim())
        .map(field => field.label);
      
      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    onNext();
  }, [formData, selectedCategory, onNext]);

  const showCourseField = selectedCategory?.showCourseField !== false;

  if (!selectedCategory) return null;

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
            {React.createElement(selectedCategory.icon, { size: 20 })}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            Material Details
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Provide comprehensive information about your {selectedCategory.label.toLowerCase()}
        </p>
      </div>

      <div className="space-y-6">
        {/* Title Field */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={handleInputChange}
            placeholder={`e.g., ${selectedCategory.value === 'Past Questions' ? 'CHE 101 Organic Chemistry 2023/2024 Past Questions' : selectedCategory.value === 'Video Tutorials' ? 'Complete Guide to Organic Chemistry Reactions' : 'Introduction to Organic Chemistry Notes'}`}
            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Course Field - Only for categories that need it */}
        {showCourseField && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Course Code / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="course"
              value={formData.course || ''}
              onChange={handleInputChange}
              placeholder="e.g., CHE 101, Introduction to Organic Chemistry"
              className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        )}

        {/* School and Department Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              School / University <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="school"
              value={formData.school || ''}
              onChange={handleInputChange}
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
              value={formData.department || ''}
              onChange={handleInputChange}
              placeholder="e.g., Pure and Industrial Chemistry"
              className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Category Specific Fields */}
        {selectedCategory.specificFields && selectedCategory.specificFields.length > 0 && (
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
                  name={field.name}
                  value={formData.specificData?.[field.name] || ''}
                  onChange={handleSpecificFieldChangeWrapper}
                />
              ))}
            </div>
          </div>
        )}

        {/* Description Field */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
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
          className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={18} /> Back
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          Continue to Upload <ArrowRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
});

// Upload Step Component
const UploadStep = React.memo(({ 
  selectedCategory, 
  formData, 
  uploading, 
  progress, 
  isPaused, 
  dragActive,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDragEnter,
  onDrop,
  onRemoveFile,
  onStartUpload,
  onTogglePauseResume,
  onCancelUpload,
  onBack,
  fileInputRef
}) => {
  if (!selectedCategory) return null;
  
  const CategoryIcon = selectedCategory.icon;
  
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
            <CategoryIcon size={20} />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            Upload File
          </h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Upload your file to share with the community
        </p>
      </div>

      <div className="space-y-8">
        {/* Main File Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            File <span className="text-red-500">*</span>
          </label>
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDragEnter={onDragEnter}
            onDrop={onDrop}
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
              accept={selectedCategory.accept}
              onChange={onFileChange}
              className="hidden"
            />
            
            {formData.file ? (
              <div className="flex items-center gap-4 text-left">
                {formData.preview?.startsWith('data:video') ? (
                  <video src={formData.preview} className="w-20 h-20 object-cover rounded" controlsList="nodownload" />
                ) : formData.preview?.startsWith('data:image') ? (
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
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile();
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ) : (
              <div>
                <CloudUpload className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Click or drag & drop to upload</p>
                <p className="text-sm text-slate-500 mt-1">
                  Supports: {selectedCategory.accept.toUpperCase()}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Max size: {selectedCategory.value === 'Video Tutorials' ? '500MB' : '100MB'}
                </p>
              </div>
            )}
          </div>
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
                Uploading {formData.file?.name}...
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
                onClick={onTogglePauseResume}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition cursor-pointer"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={onCancelUpload}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition cursor-pointer"
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
          onClick={onBack}
          disabled={uploading}
          className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeft size={18} /> Back
        </motion.button>

        {!uploading ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartUpload}
            disabled={!formData.file}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CloudUpload size={18} />
            Start Upload
          </motion.button>
        ) : (
          <div className="px-8 py-3 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-xl flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
            Uploading...
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Success Step Component
const SuccessStep = React.memo(({ selectedCategory, onReset, onGoToDashboard }) => {
  if (!selectedCategory) return null;
  
  return (
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
        Your {selectedCategory.label.toLowerCase()} has been successfully uploaded and shared with the community.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Upload size={18} />
          Upload Another File
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGoToDashboard}
          className="px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          Go to Dashboard
        </motion.button>
      </div>
    </motion.div>
  );
});

// Helper function to sanitize data before sending to Firestore
const sanitizeData = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    // Remove undefined, null, and empty string values
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        const nested = sanitizeData(value);
        if (Object.keys(nested).length > 0) {
          sanitized[key] = nested;
        }
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
};

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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const uploadTaskRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

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

  const validateFile = useCallback((file) => {
    if (!selectedCategory) {
      toast.error("Please select a category first");
      return false;
    }

    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    const allowedExtensions = selectedCategory.accept.split(',');
    
    if (!allowedExtensions.includes(fileExt)) {
      toast.error(`Invalid file type. Allowed: ${selectedCategory.accept}`);
      return false;
    }

    const maxSize = selectedCategory.value === 'Video Tutorials' ? 500 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    return true;
  }, [selectedCategory]);

  const processFile = useCallback((file) => {
    if (!validateFile(file)) return;

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, file, preview: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, file, preview: null }));
    }
  }, [validateFile]);

  const handleFileChange = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFile]);

  const handleRemoveFile = useCallback(() => {
    setFormData(prev => ({ ...prev, file: null, preview: null }));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setDragActive(false);
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setDragActive(true);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounterRef.current = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const startUpload = useCallback(async () => {
    if (!auth.currentUser) {
      toast.error("You must be signed in to upload materials");
      return;
    }
    if (!formData.file || !selectedCategory) {
      toast.error("Please select a file and category");
      return;
    }

    setUploading(true);
    setProgress(0);
    setIsPaused(false);

    const file = formData.file;
    const fileName = file.name;
    const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2,10)}_${fileName}`;
    const storagePath = `users/${auth.currentUser.uid}/materials/${uniqueName}`;
    const storageReference = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageReference, file);
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
          const publicUrl = await getDownloadURL(storageReference);

          if (!auth.currentUser) {
            throw new Error("User no longer authenticated at save time");
          }

          // Sanitize specificData - remove empty values
          const sanitizedSpecificData = {};
          if (formData.specificData) {
            Object.keys(formData.specificData).forEach(key => {
              const value = formData.specificData[key];
              if (value && typeof value === 'string' && value.trim() !== '') {
                sanitizedSpecificData[key] = value.trim();
              } else if (value && typeof value !== 'string') {
                sanitizedSpecificData[key] = value;
              }
            });
          }

          // Prepare data for Firestore - only include non-empty fields
          const materialData = {
            name: formData.title.trim(),
            title: formData.title.trim(),
            category: selectedCategory.value,
            file_name: fileName,
            file_path: storagePath,
            file_size: file.size,
            mime_type: file.type,
            public_url: publicUrl,
            uid: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          // Add optional fields only if they have values
          if (formData.course?.trim()) materialData.course = formData.course.trim();
          if (formData.school?.trim()) materialData.school = formData.school.trim();
          if (formData.department?.trim()) materialData.department = formData.department.trim();
          if (formData.description?.trim()) materialData.description = formData.description.trim();
          
          // Add specificData only if it has values
          if (Object.keys(sanitizedSpecificData).length > 0) {
            materialData.specificData = sanitizedSpecificData;
          }

          await addDoc(collection(db, 'materials'), materialData);

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
  }, [formData, selectedCategory]);

  const togglePauseResume = useCallback(() => {
    if (!uploadTaskRef.current) return;
    if (isPaused) {
      uploadTaskRef.current.resume();
    } else {
      uploadTaskRef.current.pause();
    }
  }, [isPaused]);

  const cancelUpload = useCallback(() => {
    if (uploadTaskRef.current) {
      uploadTaskRef.current.cancel();
    }
    setUploading(false);
    setIsPaused(false);
    setProgress(0);
    uploadTaskRef.current = null;
    toast.info("Upload cancelled");
  }, []);

  const resetForm = useCallback(() => {
    if (uploading) cancelUpload();
    setStep(1);
    setSelectedCategory(null);
    setFormData({
      title: '', course: '', school: '', department: '', description: '',
      specificData: {},
      file: null, preview: null,
    });
  }, [uploading, cancelUpload]);

  const goToDashboard = useCallback(() => {
    window.location.href = '/dashboard';
  }, []);

  // Memoize the upload step props
  const uploadStepProps = useMemo(() => ({
    selectedCategory,
    formData,
    uploading,
    progress,
    isPaused,
    dragActive,
    onFileChange: handleFileChange,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDragEnter: handleDragEnter,
    onDrop: handleDrop,
    onRemoveFile: handleRemoveFile,
    onStartUpload: startUpload,
    onTogglePauseResume: togglePauseResume,
    onCancelUpload: cancelUpload,
    onBack: handleBackStep,
    fileInputRef
  }), [selectedCategory, formData, uploading, progress, isPaused, dragActive, handleFileChange, handleDragOver, handleDragLeave, handleDragEnter, handleDrop, handleRemoveFile, startUpload, togglePauseResume, cancelUpload, handleBackStep]);

  return (
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
        {step === 3 && <UploadStep key="upload" {...uploadStepProps} />}
        {step === 4 && (
          <SuccessStep 
            key="success" 
            selectedCategory={selectedCategory}
            onReset={resetForm}
            onGoToDashboard={goToDashboard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default UploadsData;