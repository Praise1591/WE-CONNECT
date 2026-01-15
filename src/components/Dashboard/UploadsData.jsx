// UploadData.jsx — Original design + REAL Supabase Storage upload
import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  Video, 
  BookOpen, 
  ScrollText,
  ArrowRight,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '@/supabase';

function UploadsData() {
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    school: '',
    department: '',
    file: null,
    preview: null,
  });
  const [uploading, setUploading] = useState(false);

  const categories = [
    { value: 'Past Questions', icon: ScrollText, label: 'Past Questions', color: 'from-amber-500 to-orange-600', accept: '.pdf,.doc,.docx' },
    { value: 'PDF Notes', icon: FileText, label: 'PDF Notes', color: 'from-blue-500 to-cyan-600', accept: '.pdf,.doc,.docx' },
    { value: 'Video Tutorials', icon: Video, label: 'Video Tutorials', color: 'from-purple-500 to-pink-600', accept: '.mp4,.avi,.mov' },
    { value: 'Technical Reviews', icon: BookOpen, label: 'Technical Reviews', color: 'from-emerald-500 to-teal-600', accept: '.pdf,.doc,.docx' },
  ];

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setStep(2);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      if (!selectedCategory.accept.split(',').includes(fileExt)) {
        toast.error(`Invalid file type for ${selectedCategory.label}. Allowed: ${selectedCategory.accept}`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, file, preview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!formData.name || !formData.course || !formData.school || !formData.file) {
      toast.error('Please fill all fields and select a file');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to upload');
        return;
      }

      const filePath = `${user.id}/${formData.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, formData.file, {
          contentType: formData.file.type  // ← FIXED: Added contentType to resolve 400 Bad Request
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('materials')
        .insert({
          owner_id: user.id,
          name: formData.name,
          course: formData.course,
          category: selectedCategory.value,
          school: formData.school,
          department: formData.department || 'General',
          file_path: filePath,
          file_url: publicUrl,
          file_type: formData.file.type,
          file_size: formData.file.size,
          preview_url: formData.preview,
          uploaded_at: new Date().toISOString(),
          views: 0,
          downloads: 0,
        });

      if (dbError) throw dbError;

      toast.success('Material uploaded successfully! 🎉');
      setStep(3);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCategory(null);
    setFormData({ name: '', course: '', school: '', department: '', file: null, preview: null });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-6 md:p-12 max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {step > s ? <Check size={24} /> : s}
                </div>
                {s < 3 && <div className={`w-full h-1 mx-4 ${step > s ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Category</span>
            <span>Details</span>
            <span>Upload</span>
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-6">
              What type of material are you uploading?
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">
              Choose the correct category so students can find it easily
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategorySelect(cat)}
                  className={`p-8 rounded-3xl bg-gradient-to-br ${cat.color} text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105`}
                >
                  <cat.icon className="w-16 h-16 mx-auto mb-6" />
                  <span className="text-2xl font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
              Material Details
            </h2>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Material Name"
                required
                className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                placeholder="Course Code/Name"
                required
                className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleInputChange}
                placeholder="School/University"
                required
                className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Department (optional)"
                className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </form>

            <div className="flex justify-center gap-6 mt-12">
              <button
                onClick={() => setStep(1)}
                className="px-8 py-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all flex items-center gap-3 group"
              >
                Next
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: File Upload */}
        {step === 3 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">
              Upload Your File
            </h2>

            <div className="mb-8">
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept={selectedCategory.accept}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className={`border-4 border-dashed rounded-3xl p-12 transition-all hover:border-purple-500 ${
                  formData.file ? 'border-purple-500' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {formData.preview ? (
                    <div className="space-y-4">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold">
                        {formData.file.name.split('.').pop().toUpperCase()}
                      </div>
                      <p className="text-lg font-medium text-slate-800 dark:text-white truncate">
                        {formData.file.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload size={64} className="mx-auto text-slate-400" />
                      <p className="text-xl font-medium text-slate-700 dark:text-slate-300">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Allowed: {selectedCategory.accept.replace(/\./g, '').toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !formData.file}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-3 group"
              >
                {uploading ? 'Uploading...' : 'Upload Material'}
                {!uploading && <ArrowRight className="group-hover:translate-x-2 transition-transform" />}
              </button>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 3 && !uploading && formData.file && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white mb-8">
              <Check size={64} />
            </div>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Upload Successful! 🎉
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-12">
              Your material is now live and helping students
            </p>
            <button
              onClick={resetForm}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl hover:shadow-2xl transition-all"
            >
              Upload Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadsData;