// AuthForm.jsx — with more vibrant inputs (gradient bg + vivid focus states)
import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, 
  Briefcase, Award, X, Chrome, Apple, Facebook, Phone, Home 
} from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { supabase } from '../../lib/supabaseClient';

function AuthForm({ initialMode = 'login', onClose }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [gender, setGender] = useState(null);
  const [formData, setFormData] = useState({
    name: '', matricNumber: '', school: '', faculty: '', department: '',
    specialization: '', yearsExperience: '', title: '', yearsTeaching: '',
    email: '', password: '', confirmPassword: '', phone: '', address: '',
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
    } catch (error) {
      console.error("[GOOGLE AUTH ERROR]", error);
      let message = 'Google sign-in failed. Please try again.';
      if (error.message?.includes('popup')) message = 'Sign-in cancelled.';
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
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const email = formData.email.trim();
        const password = formData.password.trim();

        if (!email) throw new Error("Please enter your email address");
        if (!password) throw new Error("Password is required");
        if (password.length < 6) throw new Error("Password must be at least 6 characters long");

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

        if (signUpError) throw signUpError;
        if (!signUpData.user?.id || signUpData.user.identities?.length === 0) {
          throw new Error("This email is already registered. Please sign in instead.");
        }

        toast.success('Account created! Check your email to confirm your account. Your profile will be set up automatically after confirmation.');
      } 
      else {
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
        navigate('/dashboard', { replace: true });
      }

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

  return (
    <div className="relative bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full border border-indigo-100/40 dark:border-indigo-900/30">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 px-8 py-10 md:px-12 md:py-14 text-center text-white overflow-hidden rounded-t-3xl">
        <div className="absolute inset-0 bg-[url('/weconnect-logo.png')] bg-[length:140px] opacity-[0.07] mix-blend-multiply pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-2xl mb-3">
          {isLogin ? 'Welcome Back' : 'Join WE CONNECT'}
        </h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
          {isLogin 
            ? 'Continue your academic journey with thousands of shared resources' 
            : 'Create your account and start collaborating smarter today'}
        </p>
      </div>

      <div className="p-6 md:p-10 lg:p-12 space-y-10 max-h-[76vh] overflow-y-auto">

        <form onSubmit={handleSubmit} className="space-y-9">

          {/* Role selection – unchanged logic, slightly more vivid active state */}
          {!isLogin && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">
                Choose your role
              </h3>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {[
                  { value: 'student',  icon: GraduationCap, label: 'Student',  color: 'indigo' },
                  { value: 'tutor',    icon: Briefcase,    label: 'Tutor',    color: 'purple' },
                  { value: 'lecturer', icon: Award,        label: 'Lecturer', color: 'pink'   },
                ].map((r) => (
                  <motion.button
                    key={r.value}
                    type="button"
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.975 }}
                    onClick={() => setRole(r.value)}
                    className={`group relative flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 backdrop-blur-md ${
                      role === r.value
                        ? `border-${r.color}-400 bg-gradient-to-br from-${r.color}-600/90 to-${r.color}-700/90 text-white shadow-xl shadow-${r.color}-500/40`
                        : 'border-slate-200/70 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                    }`}
                  >
                    <r.icon className={`w-9 h-9 transition-colors ${
                      role === r.value ? 'text-white' : 'text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    }`} strokeWidth={2.25} />
                    <span className="font-semibold text-base">{r.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* All inputs – more vibrant version */}
          <div className="grid gap-6 md:grid-cols-2">

            {!isLogin && (
              <div className="relative md:col-span-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required
                  className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                />
              </div>
            )}

            {!isLogin && role === 'student' && (
              <>
                <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleInputChange} placeholder="Matric Number" required className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
                <input type="text" name="school" value={formData.school} onChange={handleInputChange} placeholder="University" required className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
                <input type="text" name="faculty" value={formData.faculty} onChange={handleInputChange} placeholder="Faculty" required className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" required className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
              </>
            )}

            {!isLogin && role === 'tutor' && (
              <>
                <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="Specialization" required className="md:col-span-2 w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
                <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleInputChange} placeholder="Years of Experience" required className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
              </>
            )}

            {!isLogin && role === 'lecturer' && (
              <>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Academic Title (e.g. Dr., Prof.)" required className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
                <input type="text" name="school" value={formData.school} onChange={handleInputChange} placeholder="University" required className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
                <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" required className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
                <input type="number" name="yearsTeaching" value={formData.yearsTeaching} onChange={handleInputChange} placeholder="Years of Teaching" required className="w-full px-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20" />
              </>
            )}

            {!isLogin && (
              <>
                <div className="md:col-span-2">
                  <Select
                    options={genderOptions}
                    value={gender}
                    onChange={setGender}
                    placeholder="Select Gender"
                    classNamePrefix="react-select"
                    isClearable={false}
                    styles={{
                      control: (base) => ({
                        ...base,
                        background: 'linear-gradient(to bottom right, rgba(99,102,241,0.08), rgba(168,85,247,0.07), rgba(244,63,94,0.06))',
                        borderColor: 'rgba(99,102,241,0.4)',
                        borderRadius: '0.75rem',
                        padding: '0.25rem',
                        boxShadow: '0 1px 3px rgba(99,102,241,0.1)',
                        ':hover': { borderColor: 'rgb(168,85,247)' },
                      }),
                      menu: (base) => ({ ...base, borderRadius: '0.75rem', backgroundColor: 'white', boxShadow: '0 10px 25px -5px rgba(99,102,241,0.2)' }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? 'rgb(99,102,241)' : state.isFocused ? 'rgba(168,85,247,0.1)' : 'transparent',
                        color: state.isSelected ? 'white' : 'inherit',
                      }),
                    }}
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/70 w-5 h-5 transition-colors duration-300 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number (optional)"
                    className="group w-full pl-12 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                  />
                </div>

                <div className="relative md:col-span-2">
                  <Home className="absolute left-4 top-4 text-indigo-400/70 w-5 h-5 transition-colors duration-300 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400" />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address (optional)"
                    rows={3}
                    className="group w-full pl-12 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20 resize-none"
                  />
                </div>
              </>
            )}

            <div className="relative md:col-span-2">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/70 w-5 h-5 transition-colors duration-300 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                required
                className="group w-full pl-12 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/70 w-5 h-5 transition-colors duration-300 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className="group w-full pl-12 pr-12 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400/80 hover:text-purple-500 dark:hover:text-purple-400 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400/70 w-5 h-5 transition-colors duration-300 group-focus-within:text-purple-500 dark:group-focus-within:text-purple-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  required
                  className="group w-full pl-12 pr-12 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400/80 hover:text-purple-500 dark:hover:text-purple-400 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            )}
          </div>

          {/* Submit button – keeping previous vivid style */}
          <motion.button
            whileHover={{ scale: 1.025, y: -1 }}
            whileTap={{ scale: 0.985 }}
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2.5">
              {loading ? 'Processing…' : (isLogin ? 'Sign In' : 'Create Free Account')}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </motion.button>
        </form>

        {/* Divider & social buttons – unchanged */}
        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300/60 dark:border-slate-600/50" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-900 px-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
              or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-3 py-4 border border-slate-300/70 dark:border-slate-600/60 rounded-2xl hover:bg-gradient-to-br hover:from-red-50/80 hover:to-orange-50/80 dark:hover:from-slate-800/70 dark:hover:to-slate-700/70 transition-all duration-300 shadow-sm hover:shadow group disabled:opacity-50"
          >
            <Chrome className="w-6 h-6 text-red-600" />
            <span className="font-medium text-slate-700 dark:text-slate-200">Google</span>
          </button>
          <button disabled className="flex items-center justify-center gap-3 py-4 border border-slate-300/70 dark:border-slate-600/60 rounded-2xl opacity-55 cursor-not-allowed">
            <Apple className="w-6 h-6" />
            <span className="font-medium text-slate-700 dark:text-slate-200">Apple</span>
          </button>
          <button disabled className="flex items-center justify-center gap-3 py-4 border border-slate-300/70 dark:border-slate-600/60 rounded-2xl opacity-55 cursor-not-allowed">
            <Facebook className="w-6 h-6 text-blue-600" />
            <span className="font-medium text-slate-700 dark:text-slate-200">Facebook</span>
          </button>
        </div>

        <p className="text-center text-slate-600 dark:text-slate-400 pt-4 text-base">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors ml-1"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>

      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-20 p-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
      >
        <X size={24} className="text-slate-700 dark:text-slate-300" />
      </button>
    </div>
  );
}

export default AuthForm;