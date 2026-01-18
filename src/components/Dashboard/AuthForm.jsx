// AuthForm.jsx — Fully online, production-ready with your real Firebase project
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

// Firebase v9+ modular imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc,
  getDoc,
  enableIndexedDbPersistence 
} from 'firebase/firestore';

// Your real Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBGnjkrRtYA6bsGrmN9zYrhsmlEdd2X8d8",
  authDomain: "we-connect-a473e.firebaseapp.com",
  projectId: "we-connect-a473e",
  storageBucket: "we-connect-a473e.firebasestorage.app",
  messagingSenderId: "165842033302",
  appId: "1:165842033302:web:abd3319b6778a4f3af80b7",
  measurementId: "G-4JEWS0BJRZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => console.log('Firestore offline persistence enabled'))
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported in this browser');
    } else {
      console.error('Persistence error:', err);
    }
  });

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
    const provider = new GoogleAuthProvider();
    
    // Optional: shows account chooser
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("[GOOGLE SIGN-IN] Success →", user.uid, user.email);

      const userDocRef = doc(db, `users/${user.uid}`);
      const userSnap = await getDoc(userDocRef);

      let profile;

      if (!userSnap.exists()) {
        // New user — create basic profile
        console.log("[GOOGLE] New user — creating profile");

        profile = {
          uid: user.uid,
          name: user.displayName || 'Google User',
          email: user.email?.toLowerCase() || '',
          role: 'student',           // default — you can improve later
          gender: 'prefer-not-say',
          photoURL: user.photoURL || null,
          coins: 0,
          diamonds: 0,
          createdAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, profile);
        toast.success('Account created with Google! Welcome 🎉');
      } else {
        // Returning user
        profile = userSnap.data();
        toast.success('Welcome back!');
      }

      localStorage.setItem('userProfile', JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      onClose?.();

      setTimeout(() => {
        console.log("[REDIRECT] Navigating to /dashboard");
        window.location.replace('/dashboard');
      }, 1200);

    } catch (error) {
      console.error("[GOOGLE AUTH ERROR]", {
        code: error.code,
        message: error.message
      });

      let message = 'Google sign-in failed. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in cancelled.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Try again later.';
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("[AUTH START]", { 
      mode: isLogin ? 'login' : 'signup', 
      email: formData.email 
    });

    try {
      let userCredential;
      let profile = null;

      if (!isLogin) {
        // SIGN UP
        console.log("[SIGNUP] Creating user...");
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        console.log("[SIGNUP] User created →", userCredential.user.uid);

        const user = userCredential.user;

        profile = {
          uid: user.uid,
          name: formData.name.trim(),
          email: formData.email.toLowerCase(),
          role,
          gender: gender?.value || 'prefer-not-say',
          matricNumber: formData.matricNumber || null,
          school: formData.school || null,
          faculty: formData.faculty || null,
          department: formData.department || null,
          specialization: formData.specialization || null,
          yearsExperience: formData.yearsExperience ? Number(formData.yearsExperience) : null,
          title: formData.title || null,
          yearsTeaching: formData.yearsTeaching ? Number(formData.yearsTeaching) : null,
          phone: formData.phone || null,
          address: formData.address || null,
          coins: 0,
          diamonds: 0,
          createdAt: new Date().toISOString(),
        };

        console.log("[SIGNUP] Writing profile to Firestore...");
        const userDocRef = doc(db, `users/${user.uid}`);
        await setDoc(userDocRef, profile);
        console.log("[SIGNUP] Profile saved successfully");

        toast.success('Account created successfully! Welcome to WE CONNECT 🎉');
      } else {
        // LOGIN
        console.log("[LOGIN] Signing in...");
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        console.log("[LOGIN] Signed in →", userCredential.user.uid);

        const user = userCredential.user;

        // Create minimal profile for immediate localStorage save
        // Full profile will be loaded in dashboard/context later
        profile = {
          uid: user.uid,
          email: user.email,
          name: formData.name || 'User', // fallback if name was provided
          role: 'unknown', // will be updated when full profile loads
          // Add other defaults as needed
          coins: 0,
          diamonds: 0,
        };

        // Optional: Try to fetch full profile if online (non-blocking)
        // But don't await it to avoid offline errors
        const userDocRef = doc(db, `users/${user.uid}`);
        getDoc(userDocRef)
          .then((userSnap) => {
            if (userSnap.exists()) {
              const fullProfile = userSnap.data();
              localStorage.setItem('userProfile', JSON.stringify(fullProfile));
              console.log("[LOGIN] Full profile fetched and saved async");
            }
          })
          .catch((err) => {
            console.warn("[LOGIN] Async profile fetch skipped (offline or error):", err);
          });

        toast.success('Welcome back!');
      }

      // ── COMMON SUCCESS PATH ───────────────────────────────────────
      if (!profile || !profile.uid) {
        throw new Error("Authentication successful but profile could not be prepared.");
      }

      localStorage.setItem('userProfile', JSON.stringify(profile));
      console.log("[SUCCESS] localStorage saved with profile");

      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      console.log("[SUCCESS] userLoggedIn event dispatched");

      onClose?.();
      console.log("[SUCCESS] onClose called");

      setTimeout(() => {
        console.log("[REDIRECT] Navigating to /dashboard");
        window.location.replace('/dashboard');
      }, 1200);

    } catch (error) {
      console.error("[AUTH ERROR]", {
        code: error.code,
        message: error.message,
        stack: error.stack || 'no stack available'
      });

      let message = 'An error occurred. Please try again.';

      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            message = 'This email is already registered.';
            break;
          case 'auth/weak-password':
            message = 'Password is too weak (minimum 6 characters).';
            break;
          case 'auth/invalid-email':
            message = 'Please enter a valid email address.';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            message = 'Incorrect email or password.';
            break;
          case 'auth/too-many-requests':
            message = 'Too many attempts. Please try again later.';
            break;
          default:
            message = error.message || 'Network error or server issue.';
        }
      } else {
        message = error.message || 'Unknown error';
      }

      toast.error(message);
    } finally {
      console.log("[FINALLY] Cleaning up — loading = false");
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