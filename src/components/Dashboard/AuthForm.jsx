// src/components/Dashboard/AuthForm.jsx
import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, 
  Briefcase, Award, X, Chrome, Phone, Home 
} from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Firebase imports
import { 
  auth, 
  db, 
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from '../../firebase';

function AuthForm({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
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

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const email = resetEmail.trim();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      console.error("Password reset error:", error);
      let message = 'Failed to send reset email.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userProfile) => {
    console.log("Auth success, navigating to dashboard...", userProfile);
    
    // Close modal if it exists
    if (onClose) {
      onClose();
    }
    
    // Call the success callback if provided
    if (onLoginSuccess) {
      onLoginSuccess(userProfile);
    }
    
    // Navigate to dashboard
    navigate('/dashboard', { replace: true });
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userProfile }));
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);

      let userProfile;

      if (!profileDoc.exists()) {
        const profileData = {
          name: user.displayName || 'User',
          email: user.email,
          role: 'student',
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
          coins: 0,
          diamonds: 0,
          emailVerified: user.emailVerified,
        };
        await setDoc(profileRef, profileData);
        
        userProfile = {
          id: user.uid,
          email: user.email,
          name: user.displayName || 'User',
          role: 'student',
          photoURL: user.photoURL || null,
          coins: 0,
          diamonds: 0,
          emailVerified: user.emailVerified,
        };
      } else {
        const profileData = profileDoc.data();
        userProfile = {
          id: user.uid,
          email: user.email,
          name: profileData.name || user.displayName || 'User',
          role: profileData.role || 'student',
          photoURL: user.photoURL || profileData.photoURL,
          coins: profileData.coins || 0,
          diamonds: profileData.diamonds || 0,
          emailVerified: user.emailVerified,
        };
      }

      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      toast.success('Welcome! Signed in with Google');
      handleAuthSuccess(userProfile);

    } catch (error) {
      console.error("Google auth error:", error);
      toast.error('Google sign-in failed. Please try again.');
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
        // SIGNUP
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

        // Create profile
        const profileData = {
          name: formData.name.trim() || 'User',
          email: user.email,
          role: role,
          gender: gender?.value || null,
          phone: formData.phone.trim() || null,
          address: formData.address.trim() || null,
          createdAt: serverTimestamp(),
          coins: 0,
          diamonds: 0,
          photoURL: user.photoURL || null,
          emailVerified: false,
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
        await setDoc(profileRef, profileData);

        const userProfile = {
          id: user.uid,
          email: user.email,
          name: formData.name.trim() || 'User',
          role: role,
          photoURL: user.photoURL || null,
          coins: 0,
          diamonds: 0,
          emailVerified: false,
        };
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        toast.success('Account created! Please verify your email.');
        toast.info('Check your inbox for verification link');
        
        handleAuthSuccess(userProfile);
        
      } else {
        // LOGIN
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check email verification
        await user.reload();
        
        if (!user.emailVerified) {
          toast.error('Please verify your email before logging in.');
          toast.info('Check your inbox for the verification link');
          setLoading(false);
          return;
        }
        
        const profileRef = doc(db, 'profiles', user.uid);
        const profileDoc = await getDoc(profileRef);
        
        let userProfile;
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          userProfile = {
            id: user.uid,
            email: user.email,
            name: profileData.name || user.displayName || 'User',
            role: profileData.role || 'student',
            photoURL: user.photoURL || profileData.photoURL,
            coins: profileData.coins || 0,
            diamonds: profileData.diamonds || 0,
            school: profileData.school,
            department: profileData.department,
            emailVerified: user.emailVerified,
          };
        } else {
          const defaultProfile = {
            name: user.displayName || 'User',
            email: user.email,
            role: 'student',
            createdAt: serverTimestamp(),
            coins: 0,
            diamonds: 0,
            photoURL: user.photoURL || null,
            emailVerified: user.emailVerified,
          };
          await setDoc(profileRef, defaultProfile);
          
          userProfile = {
            id: user.uid,
            email: user.email,
            name: defaultProfile.name,
            role: defaultProfile.role,
            coins: 0,
            diamonds: 0,
            emailVerified: user.emailVerified,
          };
        }
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        toast.success('Welcome back!');
        
        handleAuthSuccess(userProfile);
      }

    } catch (error) {
      console.error("Auth error:", error);
      let message = 'An error occurred. Please try again.';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          message = 'Invalid email or password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Please sign in.';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email. Please sign up.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again.';
          break;
        default:
          message = error.message || 'Authentication failed.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowResetPassword(false);
    setResetSent(false);
    setResetEmail('');
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
    <div className="relative bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full border border-indigo-100/40 dark:border-indigo-900/30">
      
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 px-5 sm:px-8 md:px-12 py-6 sm:py-8 md:py-14 text-center text-white overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
        <div className="absolute inset-0 bg-[url('/weconnect-logo.png')] bg-[length:100px] sm:bg-[length:140px] opacity-[0.07] mix-blend-multiply pointer-events-none" />
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight drop-shadow-2xl mb-2 sm:mb-3">
          {showResetPassword 
            ? 'Reset Password' 
            : isLogin ? 'Welcome Back' : 'Join WE CONNECT'}
        </h1>
        <p className="text-sm sm:text-base md:text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed px-2">
          {showResetPassword 
            ? 'Enter your email to receive a password reset link' 
            : isLogin 
              ? 'Continue your academic journey with thousands of shared resources' 
              : 'Create your account and start collaborating smarter today'}
        </p>
      </div>

      <div className="p-4 sm:p-6 md:p-10 lg:p-12 space-y-6 sm:space-y-10 max-h-[70vh] sm:max-h-[76vh] overflow-y-auto">
        
        {showResetPassword ? (
          <form onSubmit={handlePasswordReset} className="space-y-5 sm:space-y-7">
            {resetSent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Check Your Email
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We've sent a password reset link to <strong className="text-indigo-600 dark:text-indigo-400">{resetEmail}</strong>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setResetSent(false);
                    setResetEmail('');
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Try another email
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-indigo-400/70 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full pl-9 sm:pl-12 pr-4 sm:pr-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-4 md:py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 group relative overflow-hidden"
                >
                  <span className="relative z-10">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetSent(false);
                    setResetEmail('');
                  }}
                  className="w-full py-2 text-center text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm sm:text-base"
                >
                  ← Back to Sign In
                </button>
              </>
            )}
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7 md:space-y-9">
              
              {!isLogin && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-center text-slate-800 dark:text-slate-100">
                    Choose your role
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                    {[
                      { value: 'student', icon: GraduationCap, label: 'Student', color: 'indigo' },
                      { value: 'tutor', icon: Briefcase, label: 'Tutor', color: 'purple' },
                      { value: 'lecturer', icon: Award, label: 'Lecturer', color: 'pink' },
                    ].map((r) => (
                      <motion.button
                        key={r.value}
                        type="button"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRole(r.value)}
                        className={`group relative flex flex-col items-center gap-2 sm:gap-4 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 backdrop-blur-md ${
                          role === r.value
                            ? `border-${r.color}-400 bg-gradient-to-br from-${r.color}-600/90 to-${r.color}-700/90 text-white shadow-xl`
                            : 'border-slate-200/70 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                        }`}
                      >
                        <r.icon className={`w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 transition-colors ${
                          role === r.value 
                            ? 'text-white' 
                            : 'text-indigo-500 dark:text-indigo-300 group-hover:text-purple-500'
                        }`} />
                        <span className="text-xs sm:text-sm md:text-lg font-bold">
                          {r.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        required
                        className="group w-full pl-4 sm:pl-5 pr-4 sm:pr-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl shadow-sm text-slate-900 dark:text-white text-sm sm:text-base transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-400/40"
                      />
                    </div>

                    <Select
                      value={gender}
                      onChange={setGender}
                      options={genderOptions}
                      placeholder="Gender (optional)"
                      classNamePrefix="select"
                      className="text-left text-sm"
                      theme={(theme) => ({
                        ...theme,
                        borderRadius: 10,
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
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          onChange={handleInputChange}
                          placeholder="School"
                          required
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                        <input
                          type="text"
                          name="faculty"
                          value={formData.faculty}
                          onChange={handleInputChange}
                          placeholder="Faculty"
                          required
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="Department"
                          required
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
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
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                        <input
                          type="number"
                          name="yearsExperience"
                          value={formData.yearsExperience}
                          onChange={handleInputChange}
                          placeholder="Years of Experience"
                          required
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
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
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          onChange={handleInputChange}
                          placeholder="School"
                          required
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          placeholder="Department"
                          required
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                        <input
                          type="number"
                          name="yearsTeaching"
                          value={formData.yearsTeaching}
                          onChange={handleInputChange}
                          placeholder="Years of Teaching"
                          required
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                        />
                      </>
                    )}

                    <div className="relative">
                      <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-indigo-400/70 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number (optional)"
                        className="w-full pl-9 sm:pl-12 pr-4 sm:pr-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                      />
                    </div>

                    <div className="relative sm:col-span-2">
                      <Home className="absolute left-3 sm:left-4 top-3 sm:top-4 text-indigo-400/70 w-4 h-4 sm:w-5 sm:h-5" />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Address (optional)"
                        rows={2}
                        className="w-full pl-9 sm:pl-12 pr-4 sm:pr-5 py-2.5 sm:py-3 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-indigo-400/70 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    required
                    className="w-full pl-9 sm:pl-12 pr-4 sm:pr-5 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-indigo-400/70 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    required
                    className="w-full pl-9 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-indigo-400/80 hover:text-purple-500 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>

                {!isLogin && (
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-indigo-400/70 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm Password"
                      required
                      className="w-full pl-9 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-indigo-50/80 via-purple-50/70 to-pink-50/60 dark:from-indigo-950/50 dark:via-purple-950/45 dark:to-pink-950/40 border border-indigo-200/70 dark:border-indigo-800/60 rounded-lg sm:rounded-xl text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-indigo-400/80 hover:text-purple-500 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff size={16} className="sm:w-5 sm:h-5" /> : <Eye size={16} className="sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                )}
              </div>

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 md:py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'Processing…' : (isLogin ? 'Sign In' : 'Create Free Account')}
                  {!loading && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              </motion.button>
            </form>

            <div className="relative py-2 sm:py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300/60 dark:border-slate-600/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-slate-900 px-4 sm:px-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:gap-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 sm:gap-3 py-2.5 sm:py-3 md:py-4 border border-slate-300/70 dark:border-slate-600/60 rounded-lg sm:rounded-2xl hover:bg-gradient-to-br hover:from-red-50/80 hover:to-orange-50/80 transition-all duration-300 shadow-sm hover:shadow group disabled:opacity-50"
              >
                <Chrome className="w-4 h-4 sm:w-5 sm:h-6 text-red-600" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Continue with Google</span>
              </button>
            </div>

            <p className="text-center text-slate-600 dark:text-slate-400 pt-2 sm:pt-4 text-xs sm:text-sm md:text-base">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors ml-1"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </>
        )}
      </div>

      <button
        onClick={onClose}
        className="absolute top-3 sm:top-5 right-3 sm:right-5 z-20 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
      >
        <X size={18} className="sm:w-6 sm:h-6 text-slate-700 dark:text-slate-300" />
      </button>
    </div>
  );
}

export default AuthForm;