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
  Facebook
} from 'lucide-react';
import Select from 'react-select';
import { toast } from 'react-toastify';

// Firebase v9+ modular imports
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
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

  // ── UI remains EXACTLY the same ───────────────────────────────────────────
  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-all shadow-lg"
          >
            <X size={24} className="text-slate-700 dark:text-slate-300" />
          </button>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-10 text-center text-white">
            <h1 className="text-4xl font-bold mb-3">
              {isLogin ? 'Welcome Back' : 'Join WE CONNECT'}
            </h1>
            <p className="text-xl opacity-90">
              {isLogin ? 'Sign in to your account' : 'Create your free account'}
            </p>
          </div>

          <div className="p-8 md:p-12 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Selection - Registration Only */}
              {!isLogin && (
                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">
                    Who are you?
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'student', icon: GraduationCap, label: 'Student' },
                      { value: 'tutor', icon: Briefcase, label: 'Tutor' },
                      { value: 'lecturer', icon: Award, label: 'Lecturer' },
                    ].map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`p-6 rounded-2xl flex flex-col items-center gap-3 transition-all ${
                          role === r.value
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        <r.icon className="w-10 h-10" />
                        <span className="font-semibold">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Name - Registration Only */}
              {!isLogin && (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required={!isLogin}
                  className="md:col-span-2 px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              )}

              {/* Student Fields */}
              {!isLogin && role === 'student' && (
                <>
                  <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleInputChange} placeholder="Matric Number" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="school" value={formData.school} onChange={handleInputChange} placeholder="University" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="faculty" value={formData.faculty} onChange={handleInputChange} placeholder="Faculty" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </>
              )}

              {/* Tutor Fields */}
              {!isLogin && role === 'tutor' && (
                <>
                  <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="Specialization" required className="md:col-span-2 px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleInputChange} placeholder="Years of Experience" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </>
              )}

              {/* Lecturer Fields */}
              {!isLogin && role === 'lecturer' && (
                <>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Academic Title (e.g. Dr., Prof.)" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="school" value={formData.school} onChange={handleInputChange} placeholder="University" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="number" name="yearsTeaching" value={formData.yearsTeaching} onChange={handleInputChange} placeholder="Years of Teaching" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </>
              )}

              {/* Gender - Registration Only */}
              {!isLogin && (
                <div className="md:col-span-2">
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

              {/* Email */}
              <div className="md:col-span-2 relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  required
                  className="w-full pl-14 pr-5 py-5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-lg"
                />
              </div>

              {/* Password */}
              <div className="md:col-span-2 relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>

              {/* Confirm Password - Registration Only */}
              {!isLogin && (
                <div className="md:col-span-2 relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    required
                    className="w-full pl-14 pr-14 py-5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-lg"
                  />
                </div>
              )}

              {/* Submit Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  {!loading && <ArrowRight className="w-7 h-7 group-hover:translate-x-3 transition-transform" />}
                </button>
              </div>
            </form>

            {/* Social Dividers */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <button className="flex items-center justify-center gap-3 py-4 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Chrome size={24} />
                <span className="font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-4 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Apple size={24} />
                <span className="font-medium">Apple</span>
              </button>
              <button className="flex items-center justify-center gap-3 py-4 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Facebook size={24} />
                <span className="font-medium">Facebook</span>
              </button>
            </div>

            {/* Toggle Mode */}
            <p className="text-center mt-8 text-slate-600 dark:text-slate-400 text-lg">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={toggleMode} className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;