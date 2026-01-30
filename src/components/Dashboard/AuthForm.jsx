// AuthForm.jsx — Fully online, production-ready with Supabase
import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  GraduationCap, 
  Briefcase, 
  Award,
  X,
  Chrome,
  Apple,
  Facebook,
  Phone,
  Home
} from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';           // ← ADDED

// Supabase
import { supabase } from '../../lib/supabaseClient'
// or
// import { supabase } from '@/lib/supabaseClient'

function AuthForm({ initialMode = 'login', onClose }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [gender, setGender] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    matricNumber: '',
    school: '',
    faculty: '',
    department: '',
    specialization: '',
    yearsExperience: '',
    title: '',
    yearsTeaching: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();                        // ← ADDED

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-say', label: 'Prefer not to say' },
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error("[GOOGLE AUTH ERROR]", error);
      let message = 'Google sign-in failed. Please try again.';
      if (error.message?.includes('popup')) {
        message = 'Sign-in cancelled.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let profile = null;

      if (!isLogin) {
        // SIGN UP
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const email = formData.email.trim();
        const password = formData.password.trim();

        if (!email) throw new Error("Please enter your email address");
        if (!password) throw new Error("Password is required");
        if (password.length < 6) throw new Error("Password must be at least 6 characters long");

        console.log('Attempting signup with:', { email, passwordLength: password.length });

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: formData.name.trim(),
              role: role,
            }
          }
        });

        if (signUpError) {
          let detailedMsg = signUpError.message;
          if (signUpError.status === 422 && signUpError.data?.msg) {
            detailedMsg = signUpError.data.msg;
          }
          throw new Error(detailedMsg || signUpError.message);
        }

        if (!signUpData.user?.id || signUpData.user.identities?.length === 0) {
          throw new Error("This email is already registered. Please sign in instead.");
        }

        toast.success('Account created! Check your email to confirm your account. Your profile will be set up automatically after confirmation.');
      } 
      else {
        // LOGIN
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (signInError) throw signInError;
        if (!signInData.user) throw new Error("Login failed");

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user.id)
          .maybeSingle();

        profile = profileData || {
          id: signInData.user.id,
          email: signInData.user.email,
          name: 'User',
          role: 'unknown',
          coins: 0,
          diamonds: 0,
        };

        toast.success('Welcome back!');

        // ── ADDED: redirect to dashboard after successful login ────────
        navigate('/dashboard', { replace: true });
      }

      // ── COMMON SUCCESS PATH ───────────────────────────────────────
      if (profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      onClose?.();

    } catch (error) {
      console.error("[AUTH ERROR]", error);

      let message = 'An error occurred. Please try again.';

      if (error.message?.includes('Signup requires a valid password') || 
          error.message?.toLowerCase().includes('password')) {
        message = 'Password is required and must be at least 6 characters.';
      } else if (
        error.message?.includes('User already registered') ||
        error.message?.includes('already registered') ||
        error.message?.includes('This email is already registered')
      ) {
        message = 'This email is already in use. Please sign in or use a different email.';
      } else if (error.message?.includes('invalid') && error.message?.includes('email')) {
        message = 'Please enter a valid email address.';
      } else if (error.message?.includes('Invalid login credentials')) {
        message = 'Incorrect email or password.';
      } else if (error.message?.includes('too many requests')) {
        message = 'Too many attempts. Please try again later.';
      } else if (error.message?.includes('security policy') || error.code === '42501') {
        message = 'Permission issue during signup — profile setup is handled automatically. Try confirming your email and logging in.';
      } else {
        message = error.message || 'Network/server issue – check your inputs.';
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      ...formData,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setGender(null);
  };

  // ────────────────────────────────────────────────────────────────
  // The rest of the component (JSX) remains completely unchanged
  // ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 min-h-screen flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden max-w-4xl w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-all shadow-md"
        >
          <X size={20} className="text-slate-700 dark:text-slate-300" />
        </button>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? 'Welcome Back' : 'Join WE CONNECT'}
          </h1>
          <p className="text-lg opacity-90">
            {isLogin ? 'Sign in to continue your journey' : 'Create your account and connect today'}
          </p>
        </div>

        <div className="p-6 md:p-10 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection - Registration Only */}
            {!isLogin && (
              <div>
                <label className="block text-md font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Select Your Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'student', icon: GraduationCap, label: 'Student' },
                    { value: 'tutor', icon: Briefcase, label: 'Tutor' },
                    { value: 'lecturer', icon: Award, label: 'Lecturer' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 ${
                        role === r.value
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md scale-105'
                          : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      <r.icon className="w-8 h-8" />
                      <span className="font-medium text-sm">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Full Name - Registration Only */}
            {!isLogin && (
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required={!isLogin}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
              </div>
            )}

            {/* Student Fields */}
            {!isLogin && role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleInputChange} placeholder="Matric Number" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                <input type="text" name="school" value={formData.school} onChange={handleInputChange} placeholder="University" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                <input type="text" name="faculty" value={formData.faculty} onChange={handleInputChange} placeholder="Faculty" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
              </div>
            )}

            {/* Tutor Fields */}
            {!isLogin && role === 'tutor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="Specialization" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 md:col-span-2" />
                <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleInputChange} placeholder="Years of Experience" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
              </div>
            )}

            {/* Lecturer Fields */}
            {!isLogin && role === 'lecturer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Academic Title (e.g. Dr., Prof.)" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                <input type="text" name="school" value={formData.school} onChange={handleInputChange} placeholder="University" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
                <input type="number" name="yearsTeaching" value={formData.yearsTeaching} onChange={handleInputChange} placeholder="Years of Teaching" required className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300" />
              </div>
            )}

            {/* Gender - Registration Only */}
            {!isLogin && (
              <div>
                <Select
                  options={genderOptions}
                  value={gender}
                  onChange={setGender}
                  placeholder="Select Gender"
                  classNamePrefix="react-select"
                  isClearable={false}
                />
              </div>
            )}

            {/* Phone and Address - Registration Only, Optional */}
            {!isLogin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number (optional)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  />
                </div>
                <div className="relative md:col-span-2">
                  <Home className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address (optional)"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password - Registration Only */}
            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Social Dividers */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 disabled:opacity-50"
            >
              <Chrome size={20} />
              <span className="font-medium text-sm">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300">
              <Apple size={20} />
              <span className="font-medium text-sm">Apple</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300">
              <Facebook size={20} />
              <span className="font-medium text-sm">Facebook</span>
            </button>
          </div>

          {/* Toggle Mode */}
          <p className="text-center mt-6 text-slate-600 dark:text-slate-400 text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={toggleMode} className="font-bold text-purple-500 dark:text-purple-400 hover:underline">
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;