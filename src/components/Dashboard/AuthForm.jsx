// AuthForm.jsx
import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap, 
  School, 
  Building2, 
  BookOpenText 
} from 'lucide-react';

function AuthForm({ initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    matricNumber: '',
    school: '',
    faculty: '',
    department: '',
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value) => {
    setRole(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let userProfile;

    if (isLogin) {
      // Simulate login success
      alert('Login successful!');

      // On real login, you'd get name/school from backend
      // For demo, we'll use placeholder or previously saved data
      userProfile = {
        name: formData.name || 'Alex Johnson', // fallback if name not provided
        school: formData.school || 'Rivers State University',
        email: formData.email,
      };
    } else {
      // Registration success
      alert('Account created successfully!');

      userProfile = {
        name: formData.name,
        matricNumber: formData.matricNumber,
        school: formData.school,
        faculty: formData.faculty,
        department: formData.department,
        email: formData.email,
        role: role,
      };
    }

    // Save profile to localStorage
    localStorage.setItem('userProfile', JSON.stringify(userProfile));

    // Notify Sidebar and other components to update
    window.dispatchEvent(new Event('userLoggedIn'));

    // Optional: Reset form or close modal
    // You can add onSuccess callback later
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ 
      name: '', 
      matricNumber: '', 
      school: '', 
      faculty: '', 
      department: '', 
      email: '', 
      password: '' 
    });
    setRole('student');
  };

  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="p-8 text-center border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <GraduationCap size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          {isLogin ? 'Sign in to continue' : 'Join WE CONNECT today'}
        </p>
      </div>

      {/* Form */}
      <div className="px-8 py-6 max-h-[65vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection - Register Only */}
          {!isLogin && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['student', 'lecturer', 'tutor'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    className={`py-3 px-4 rounded-xl border-2 font-medium capitalize transition-all ${
                      role === r
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                        : 'border-slate-300 dark:border-slate-600 hover:border-purple-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Email & Password */}
          <div className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Register Extra Fields */}
          {!isLogin && (
            <div className="space-y-5 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="matricNumber"
                  value={formData.matricNumber}
                  onChange={handleInputChange}
                  placeholder="Matric Number"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  placeholder="School"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleInputChange}
                  placeholder="Faculty"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div className="relative">
                <BookOpenText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Department"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>

      {/* Toggle Mode */}
      <div className="px-8 py-6 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthForm;