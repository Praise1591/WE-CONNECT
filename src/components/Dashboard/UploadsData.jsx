// UploadsData.jsx
// Multi-step upload form with Firebase Storage (resumable), progress, pause/resume/cancel
// All input fields in Step 2 now fully implemented
// ── ADDED: Debug logging + auth check before addDoc to help diagnose permissions error
// ── ADDED: preview screenshots upload (3-5 images required for non-video)

import React, { useState, useRef } from 'react';
import { 
  Upload, X, FileText, Video, BookOpen, ScrollText,
  ArrowRight, Check, ArrowLeft 
} from 'lucide-react';
import { toast } from 'react-toastify';

// ── Firebase ────────────────────────────────────────────────────────────────
import { db, storage, auth } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

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
  const [previewImages, setPreviewImages] = useState([]);             // File[]
  const [previewImagePreviews, setPreviewImagePreviews] = useState([]); // string[] data urls
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const uploadTaskRef = useRef(null);

  const categories = [
    { value: 'Past Questions',    icon: ScrollText, label: 'Past Questions',    color: 'from-amber-500 to-orange-600',  accept: '.pdf,.doc,.docx' },
    { value: 'PDF Notes',         icon: FileText,   label: 'PDF Notes',         color: 'from-blue-500 to-cyan-600',    accept: '.pdf,.doc,.docx' },
    { value: 'Video Tutorials',   icon: Video,      label: 'Video Tutorials',   color: 'from-purple-500 to-pink-600',  accept: '.mp4,.avi,.mov,.webm' },
    { value: 'Technical Reviews', icon: BookOpen,   label: 'Technical Reviews', color: 'from-emerald-500 to-teal-600',  accept: '.pdf,.doc,.docx' },
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

          // Upload preview images
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

          // ── Debug logging to confirm auth state right before Firestore write ──
          console.log("Saving to Firestore — current user:", auth.currentUser?.uid || "(no user!)");
          console.log("Document data preview:", {
            title: formData.title,
            course: formData.course,
            school: formData.school,
            uid: auth.currentUser?.uid,
          });

          if (!auth.currentUser) {
            throw new Error("User no longer authenticated at save time");
          }

          await addDoc(collection(db, 'materials'), {
            name: formData.title.trim(),
            title: formData.title.trim(),
            course: formData.course.trim(),
            school: formData.school.trim(),
            department: formData.department?.trim() || null,
            description: formData.description?.trim() || null,
            category: selectedCategory.value,
            file_name: fileName,
            file_path: storagePath,
            file_size: file.size,
            mime_type: file.type,
            public_url: publicUrl,
            previewImages: previewUrls, // added field
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
      file: null, preview: null,
    });
    setPreviewImages([]);
    setPreviewImagePreviews([]);
  };

  // ────────────────────────────────────────────────
  //  RENDER
  // ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-4 sm:p-6 md:p-10 lg:p-12 max-w-4xl mx-auto">

        {/* Progress Steps */}
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

        {/* STEP 1 – Category Selection */}
        {step === 1 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 md:p-9 lg:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-6 text-center">
              What are you uploading?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {categories.map(cat => (
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

        {/* STEP 2 – Material Details */}
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
                    toast.error("Please fill in all required fields: Title, Course, School");
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

        {/* STEP 3 – File Upload */}
        {step === 3 && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-7 md:p-9 lg:p-12 border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">
              Upload Your File
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">
              {selectedCategory?.label} — resumable upload to Firebase Storage
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
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
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
                    <video src={formData.preview} className="w-20 h-20 object-cover rounded" controlsList="nodownload" />
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

              {/* ── Added: Preview screenshots upload UI ── */}
              <div className="mt-8">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {selectedCategory?.value === 'Video Tutorials' ? 'Optional' : 'Required'}: Upload 3–5 preview screenshots
                  {selectedCategory?.value !== 'Video Tutorials' && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handlePreviewImagesChange}
                  className="hidden"
                  id="preview-images"
                />
                <label htmlFor="preview-images" className="cursor-pointer block border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <Upload size={32} className="mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-600 dark:text-slate-300">Click to select screenshots or drag & drop</p>
                  <p className="text-xs text-slate-500 mt-1">JPEG, PNG, WebP • max 5</p>
                </label>

                {previewImagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {previewImagePreviews.map((src, idx) => (
                      <div key={idx} className="relative">
                        <img src={src} alt={`preview ${idx + 1}`} className="w-full h-24 object-cover rounded border border-slate-200 dark:border-slate-700" />
                        <button
                          onClick={() => removePreviewImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                      <span>{isPaused ? 'Paused' : 'Uploading...'}</span>
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
                  disabled={!formData.file || (selectedCategory?.value !== 'Video Tutorials' && previewImages.length < 3)}
                  className="px-8 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Start Upload <Upload size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4 – Success */}
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