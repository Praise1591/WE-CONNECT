// UploadsData.jsx
// Features: multi-step upload form, direct Storj S3 multipart upload, progress bar, pause/resume/cancel
// Authentication: Firebase | Metadata: Firestore | Storage: Storj (S3 gateway)

import React, { useState, useRef } from 'react';
import { 
  Upload, X, FileText, Video, BookOpen, ScrollText,
  ArrowRight, Check, Loader2, ArrowLeft 
} from 'lucide-react';
import { toast } from 'react-toastify';

// ── Firebase imports ────────────────────────────────────────────────────────
import { db, auth } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ── AWS SDK for Storj S3 compatibility ──────────────────────────────────────
import {
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload as ManagedUpload } from '@aws-sdk/lib-storage';

// Storj S3 gateway config (MOVE TO BACKEND IN PRODUCTION!)
const STORJ_ENDPOINT = 'https://gateway.storjshare.io';
const STORJ_ACCESS_KEY = 'jwsaexj637gtrgje6g4andnm5rkq';     // ← Replace with real key
const STORJ_SECRET_KEY = 'j372lssi5bxkmqfu4nkzhg476kohlqa7plgmvqgpkgjiaujrsvvyg'; // ← Replace with real secret
const BUCKET_NAME = 'weconnect';

const s3Client = new S3Client({
  endpoint: STORJ_ENDPOINT,
  region: 'eu1',                    // EU-oriented dummy region
  credentials: {
    accessKeyId: STORJ_ACCESS_KEY,
    secretAccessKey: STORJ_SECRET_KEY,
  },
  forcePathStyle: true,
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
    file: null,
    preview: null,
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const uploadRef = useRef(null);

  const categories = [
    { value: 'Past Questions', icon: ScrollText, label: 'Past Questions', color: 'from-amber-500 to-orange-600', accept: '.pdf,.doc,.docx' },
    { value: 'PDF Notes',       icon: FileText,   label: 'PDF Notes',       color: 'from-blue-500 to-cyan-600',   accept: '.pdf,.doc,.docx' },
    { value: 'Video Tutorials', icon: Video,      label: 'Video Tutorials', color: 'from-purple-500 to-pink-600',  accept: '.mp4,.avi,.mov,.webm' },
    { value: 'Technical Reviews', icon: BookOpen, label: 'Technical Reviews', color: 'from-emerald-500 to-teal-600', accept: '.pdf,.doc,.docx' },
  ];

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  const startUpload = async () => {
    if (!formData.file || !selectedCategory) {
      toast.error("Please select a file and category");
      return;
    }

    setUploading(true);
    setProgress(0);
    setIsPaused(false);

    const file = formData.file;
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
    const filePath = `${uniqueSuffix}.${fileExt}`;

    try {
      const parallelUploads3 = new ManagedUpload({
        client: s3Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: filePath,
          Body: file,
          ContentType: file.type || 'application/octet-stream',
        },
        queueSize: 4,
        partSize: 6 * 1024 * 1024,
        leavePartsOnError: true,
      });

      parallelUploads3.on('httpUploadProgress', (progressEvent) => {
        if (progressEvent.loaded && progressEvent.total) {
          const percent = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
          setProgress(percent);
        }
      });

      uploadRef.current = parallelUploads3;

      await parallelUploads3.done();

      const publicUrl = `https://link.storjshare.io/s/${BUCKET_NAME}/${filePath}`;

      // ── Save to Firestore instead of Supabase ───────────────────────────────
      await addDoc(collection(db, 'materials'), {
        name: formData.title.trim(),
        title: formData.title.trim(),
        course: formData.course.trim(),
        school: formData.school.trim(),
        department: formData.department?.trim() || null,
        description: formData.description?.trim() || null,
        category: selectedCategory.value,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        public_url: publicUrl,
        uid: auth.currentUser?.uid || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Material uploaded successfully!");
      setStep(4);

    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed: " + (err.message || "Unknown error"));
    } finally {
      cleanupUpload();
    }
  };

  const togglePauseResume = async () => {
    if (!uploadRef.current) return;

    if (isPaused) {
      toast.info("Resume not fully supported – restarting upload");
      setIsPaused(false);
      startUpload();
    } else {
      try {
        await uploadRef.current.abort();
        setIsPaused(true);
        toast.info("Upload paused (parts preserved on Storj)");
      } catch (err) {
        console.warn("Abort failed:", err);
      }
    }
  };

  const cancelUpload = async () => {
    if (uploadRef.current) {
      try {
        await uploadRef.current.abort();
      } catch {}
    }
    cleanupUpload();
    toast.info("Upload cancelled");
  };

  const cleanupUpload = () => {
    setUploading(false);
    setIsPaused(false);
    setProgress(0);
    uploadRef.current = null;
  };

  const resetForm = () => {
    if (uploading) cancelUpload();
    setStep(1);
    setSelectedCategory(null);
    setFormData({
      title: '', course: '', school: '', department: '', description: '',
      file: null, preview: null,
    });
  };

  // ────────────────────────────────────────────────
  //  RENDER (unchanged)
  // ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-4 sm:p-6 md:p-10 lg:p-12 max-w-4xl mx-auto">

        {/* Progress indicator */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all shrink-0 text-sm sm:text-base ${
                  step >= s
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {step > s ? <Check size={18} className="sm:size-6" /> : s}
                </div>
                {s < 4 && (
                  <div className={`h-1 flex-1 mx-2 sm:mx-4 ${
                    step >= s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-slate-300 dark:bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 sm:mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-1">
            <span>Category</span><span>Details</span><span>File</span><span>Done</span>
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 md:p-9 lg:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6 text-center">
              What are you uploading?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategorySelect(cat)}
                  className={`group relative overflow-hidden rounded-2xl p-6 sm:p-8 text-left transition-all hover:shadow-xl hover:scale-[1.02] bg-gradient-to-br ${cat.color} text-white`}
                >
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-black/10" />
                  <cat.icon size={40} className="mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold">{cat.label}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details Form */}
        {step === 2 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 md:p-9 lg:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">
              Enter Material Details
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">
              {selectedCategory?.label} → Fill in the information below
            </p>

            <form className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. CHE 101 Organic Chemistry 2023/2024 Past Questions"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Code / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="e.g. CHE 101, Introduction to Organic Chemistry"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    School / University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleInputChange}
                    placeholder="e.g. University of Port Harcourt"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Pure and Industrial Chemistry"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any extra notes, semester/year, special instructions..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-y"
                />
              </div>
            </form>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8 sm:mt-12">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <button
                onClick={() => {
                  if (!formData.title.trim() || !formData.course.trim() || !formData.school.trim()) {
                    toast.error("Please fill in all required fields (Title, Course, School)");
                    return;
                  }
                  setStep(3);
                }}
                className="px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Continue to File Upload <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: File upload + progress */}
        {step === 3 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 md:p-9 lg:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">
              Upload Your File to Storj
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">
              {selectedCategory?.label} — multipart upload via S3 gateway
            </p>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 sm:p-10 text-center">
                <input
                  type="file"
                  accept={selectedCategory?.accept}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Upload size={48} className="text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-lg font-medium text-slate-800 dark:text-white">
                      Click to select file or drag & drop
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {selectedCategory?.accept.replace(/,/g, ', ')}
                    </p>
                  </div>
                </label>
              </div>

              {formData.file && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex items-center gap-4">
                  {formData.preview?.startsWith('data:video') ? (
                    <video src={formData.preview} className="w-20 h-20 object-cover rounded" />
                  ) : formData.preview ? (
                    <img src={formData.preview} alt="preview" className="w-20 h-20 object-cover rounded" />
                  ) : (
                    <FileText size={48} className="text-blue-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{formData.file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, file: null, preview: null }))}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8 sm:mt-12">
              <button
                onClick={() => setStep(2)}
                disabled={uploading && !isPaused}
                className="px-6 py-3 sm:px-8 sm:py-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <ArrowLeft size={16} /> Back
              </button>

              {uploading ? (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto flex-1">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-4">
                    <div className="w-full bg-slate-300 dark:bg-slate-600 rounded-full h-3 mb-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>{progress}%</span>
                      <span>Uploading...</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={togglePauseResume}
                      className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 min-w-[110px] ${
                        isPaused ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      onClick={cancelUpload}
                      className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-w-[110px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={startUpload}
                  disabled={!formData.file}
                  className="px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Start Upload <Upload size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 text-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check size={48} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-4">
              Upload Complete!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
              Your {selectedCategory?.label.toLowerCase()} has been successfully uploaded and saved.
            </p>
            <button
              onClick={resetForm}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-xl transition-all inline-flex items-center gap-2"
            >
              Upload Another File <Upload size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default UploadsData;