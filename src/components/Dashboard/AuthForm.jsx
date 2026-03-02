// AuthForm.jsx — Firebase version (fixed serverTimestamp import + navigation reliability)

import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, 
  Briefcase, Award, X, Chrome, Apple, Facebook, Phone, Home 
} from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Firebase imports - modular style
import { 
  auth, 
  db, 
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  doc,
  setDoc
} from '../../firebase';

import { serverTimestamp } from 'firebase/firestore';   // ← Correct modern import location

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

  const googleProvider = new GoogleAuthProvider();

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
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("[Google] Signed in user:", user.uid, user.email);

      if (!auth.currentUser) {
        throw new Error("No authenticated user found after Google sign-in");
      }

      const profileRef = doc(db, 'profiles', user.uid);

      // Small delay to help with potential auth token settlement
      await new Promise(r => setTimeout(r, 300));

      console.log("[Google] Writing profile document for:", user.uid);

      await setDoc(profileRef, {
        name: user.displayName || 'User',
        email: user.email,
        role: 'student',
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        coins: 0,
        diamonds: 0,
      }, { merge: true });

      console.log("[Google] Profile write appeared successful");

      const basicProfile = {
        id: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        role: 'student',
        photoURL: user.photoURL || null,
        coins: 0,
        diamonds: 0,
      };
      localStorage.setItem('userProfile', JSON.stringify(basicProfile));

      toast.success('Welcome! Signed in with Google');

      onClose?.();
      setTimeout(() => {
        console.log('[Google] Navigating — UID:', auth.currentUser?.uid);
        navigate('/dashboard', { replace: true });
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
      }, 150);

    } catch (error) {
      console.error("[GOOGLE AUTH ERROR]", error);
      let message = 'Google sign-in failed. Please try again.';
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        message = 'Sign-in cancelled.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'An account with this email already exists.';
      } else if (error.code === 'permission-denied') {
        message = 'Permission denied – most likely Firestore security rules issue on /profiles';
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
      const email = formData.email.trim();
      const password = formData.password.trim();

      if (!email) throw new Error("Please enter your email address");
      if (!password) throw new Error("Password is required");

      let userCredential;

      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("[Email Signup] Account created:", user.uid, user.email);

        if (!auth.currentUser) {
          throw new Error("No authenticated user after createUserWithEmailAndPassword");
        }

        const profileData = {
          id: user.uid,
          email: user.email,
          name: formData.name.trim() || 'User',
          role: role,
          gender: gender?.value || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          createdAt: serverTimestamp(),
          coins: 0,
          diamonds: 0,
          photoURL: user.photoURL || null,
        };

        if (role === 'student') {
          profileData.matricNumber = formData.matricNumber.trim() || null;
          profileData.school = formData.school.trim() || null;
          profileData.faculty = formData.faculty.trim() || null;
          profileData.department = formData.department.trim() || null;
        } else if (role === 'tutor') {
          profileData.specialization = formData.specialization.trim() || null;
          profileData.yearsExperience = Number(formData.yearsExperience) || 0;
        } else if (role === 'lecturer') {
          profileData.title = formData.title.trim() || null;
          profileData.school = formData.school.trim() || null;
          profileData.department = formData.department.trim() || null;
          profileData.yearsTeaching = Number(formData.yearsTeaching) || 0;
        }

        const profileRef = doc(db, 'profiles', user.uid);

        // Small delay after account creation
        await new Promise(r => setTimeout(r, 300));

        console.log("[Email Signup] Writing profile document for:", user.uid);

        await setDoc(profileRef, profileData);

        console.log("[Email Signup] Profile write appeared successful");

        toast.success('Account created successfully! Welcome to WE CONNECT.');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        toast.success('Welcome back!');
      }

      const user = userCredential.user;

      const basicProfile = {
        id: user.uid,
        email: user.email,
        name: formData.name.trim() || user.displayName || 'User',
        role,
        photoURL: user.photoURL || null,
        coins: 0,
        diamonds: 0,
      };
      localStorage.setItem('userProfile', JSON.stringify(basicProfile));

      onClose?.();

      setTimeout(() => {
        console.log('[Email Auth] Navigating — UID:', auth.currentUser?.uid);
        navigate('/dashboard', { replace: true });
        window.dispatchEvent(new CustomEvent('userLoggedIn'));
      }, 150);

    } catch (error) {
      console.error("[AUTH ERROR]", error);
      let message = 'An error occurred. Please try again.';
      switch (error.code) {
        case 'permission-denied':
          message = 'Permission denied – check Firestore security rules for /profiles collection';
          break;
        case 'auth/email-already-in-use':
          message = 'This email is already in use. Please sign in or use a different email.';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = 'Incorrect email or password.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Please try again later.';
          break;
        case 'auth/operation-not-allowed':
          message = 'This operation is not allowed at the moment.';
          break;
        default:
          message = error.message || 'Network or server issue – please check your connection.';
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
                      role === r.value 
                        ? 'text-white' 
                        : 'text-indigo-500 dark:text-indigo-300 group-hover:text-purple-500 dark:group-hover:text-purple-400'
                    }`} />
                    <span className="text-lg font-bold">
                      {r.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    required
                    className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                  />
                </div>

                <Select
                  value={gender}
                  onChange={setGender}
                  options={genderOptions}
                  placeholder="Gender (optional)"
                  classNamePrefix="select"
                  className="text-left"
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 12,
                    colors: {
                      ...theme.colors,
                      primary: 'rgba(139,92,246,0.8)',
                      primary25: 'rgba(236,72,153,0.15)',
                      neutral0: 'rgba(248,250,252,0.8)',
                      neutral80: '#0f172a',
                      neutral20: 'rgba(165,180,252,0.3)',
                    },
                  })}
                />

                {role === 'student' && (
                  <>
                    <input
                      type="text"
                      name="matricNumber"
                      value={formData.matricNumber}
                      onChange={handleInputChange}
                      placeholder="Matric Number"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      placeholder="School"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                    <input
                      type="text"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleInputChange}
                      placeholder="Faculty"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Department"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                  </>
                )}

                {role === 'tutor' && (
                  <>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      placeholder="Specialization"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                    <input
                      type="number"
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      placeholder="Years of Experience"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                  </>
                )}

                {role === 'lecturer' && (
                  <>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Title (e.g., Dr., Prof.)"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      placeholder="School"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Department"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                    <input
                      type="number"
                      name="yearsTeaching"
                      value={formData.yearsTeaching}
                      onChange={handleInputChange}
                      placeholder="Years of Teaching"
                      required
                      className="group w-full pl-5 pr-5 py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-xl shadow-sm text-slate-900 dark:text-white transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40 dark:focus:border-purple-400 dark:focus:ring-purple-500/35 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20"
                    />
                  </>
                )}

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
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
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