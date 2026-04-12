// src/components/Dashboard/AuthForm.jsx - Modern Advanced Version
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, 
  Briefcase, Award, X, Chrome, Phone, Home, AlertCircle,
  CheckCircle, Shield, Sparkles, UserCheck, Fingerprint,
  Github, Twitter, Linkedin, Instagram, Globe, Zap,
  Star, TrendingUp, Users, BookOpen, Video, FileText,
  ScrollText, Send, Key, RefreshCw, UserPlus, LogIn,
  ChevronRight, ChevronLeft, Menu, Smartphone, Laptop,
  Moon, Sun, Gift, Crown, Rocket, Target, Heart,
  Activity, BarChart3, Calendar, Clock, Compass
} from 'lucide-react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

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

// Custom 3D Tilt Component
const TiltCard = ({ children, className }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * 10, y: x * 10 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
};

// Animated Background Component
const AnimatedBackground = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/40" />
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(particle.id) * 20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
};

// Modern Input Component
const ModernInput = ({ icon: Icon, label, error, success, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r rounded-xl transition-all duration-300 ${isFocused ? 'from-indigo-500 to-purple-500 opacity-100 blur' : 'opacity-0 group-hover:opacity-50'}`} />
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Icon className={`w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-indigo-500' : 'text-slate-400'}`} />
        </div>
        <input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`w-full pl-12 pr-4 py-4 bg-white/10 dark:bg-slate-900/50 backdrop-blur-sm border-2 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200 focus:outline-none ${
            isFocused 
              ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
              : error 
                ? 'border-red-500' 
                : success 
                  ? 'border-green-500' 
                  : 'border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300'
          }`}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
        )}
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Modern Select Component
const ModernSelect = ({ options, value, onChange, placeholder, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer"
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Icon className="w-5 h-5 text-slate-400" />
        </div>
        <div className={`w-full pl-12 pr-4 py-4 bg-white/10 dark:bg-slate-900/50 backdrop-blur-sm border-2 rounded-xl text-slate-900 dark:text-white transition-all duration-200 ${
          isOpen 
            ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
            : 'border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300'
        }`}>
          {value ? value.label : placeholder}
        </div>
        <ChevronRight className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-950/30 ${
                    value?.value === opt.value ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600' : ''
                  }`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Role Card Component
const RoleCard = ({ role, icon: Icon, label, isSelected, onClick, color }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative p-4 rounded-xl border-2 transition-all duration-300 ${
        isSelected
          ? `border-${color}-500 bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 shadow-xl`
          : 'border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-400'
      }`}
    >
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${isSelected ? `from-${color}-500 to-${color}-600` : ''} opacity-0 group-hover:opacity-10 transition-opacity`} />
      <div className={`relative p-2 rounded-xl bg-gradient-to-r ${isSelected ? `from-${color}-500 to-${color}-600` : 'from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600'} w-12 h-12 flex items-center justify-center mx-auto mb-3 transition-all group-hover:scale-110`}>
        <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} />
      </div>
      <p className={`text-center font-semibold ${isSelected ? `text-${color}-600` : 'text-slate-700 dark:text-slate-300'}`}>{label}</p>
    </motion.button>
  );
};

// Floating Label Input
const FloatingInput = ({ icon: Icon, label, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <Icon className={`w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-indigo-500' : 'text-slate-400'}`} />
      </div>
      <input
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);
          setHasValue(!!e.target.value);
        }}
        onChange={(e) => {
          setHasValue(!!e.target.value);
          props.onChange?.(e);
        }}
        className="w-full pl-12 pr-4 pt-6 pb-2 bg-white/10 dark:bg-slate-900/50 backdrop-blur-sm border-2 rounded-xl text-slate-900 dark:text-white placeholder-transparent transition-all duration-200 focus:outline-none focus:border-indigo-500 peer"
        placeholder=" "
      />
      <label className={`absolute left-12 transition-all duration-200 pointer-events-none ${
        isFocused || hasValue
          ? 'text-xs top-2 text-indigo-500'
          : 'text-base top-1/2 -translate-y-1/2 text-slate-400'
      }`}>
        {label}
      </label>
    </div>
  );
};

// Main AuthForm Component
function AuthForm({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [role, setRole] = useState('student');
  const [gender, setGender] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', matricNumber: '', school: '', faculty: '', department: '',
    specialization: '', yearsExperience: '', title: '', yearsTeaching: '',
    email: '', password: '', confirmPassword: '', phone: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSocialMenu, setShowSocialMenu] = useState(false);
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-say', label: 'Prefer not to say' },
  ];

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B']
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setAlert(null);
  };

  const clearAlert = () => setAlert(null);

  const showAlert = (type, title, message) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Invalid email address';
      case 'password':
        return value.length >= 6 ? '' : 'Password must be at least 6 characters';
      case 'confirmPassword':
        return value === formData.password ? '' : 'Passwords do not match';
      case 'name':
        return value.length >= 2 ? '' : 'Name must be at least 2 characters';
      default:
        return '';
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const email = resetEmail.trim();
    if (!email) {
      showAlert('error', 'Email Required', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      showAlert('success', 'Reset Email Sent', `We've sent a password reset link to ${email}.`);
    } catch (error) {
      let message = 'Failed to send reset email.';
      let title = 'Reset Failed';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
        title = 'Account Not Found';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
        title = 'Invalid Email';
      }
      showAlert('error', title, message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (userProfile) => {
    triggerConfetti();
    if (onClose) onClose();
    if (onLoginSuccess) onLoginSuccess(userProfile);
    navigate('/dashboard', { replace: true });
    window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userProfile }));
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAlert(null);
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
      showAlert('success', 'Welcome!', `Signed in successfully as ${userProfile.name}`);
      setTimeout(() => handleAuthSuccess(userProfile), 500);
    } catch (error) {
      let message = 'Google sign-in failed. Please try again.';
      let title = 'Authentication Failed';
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in was cancelled. Please try again.';
        title = 'Cancelled';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
        title = 'Network Error';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Popup was blocked. Please allow popups for this site.';
        title = 'Popup Blocked';
      }
      showAlert('error', title, message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (role === 'student') {
        if (!formData.matricNumber) newErrors.matricNumber = 'Matric number required';
        if (!formData.school) newErrors.school = 'School required';
        if (!formData.department) newErrors.department = 'Department required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setAlert(null);

    try {
      const email = formData.email.trim();
      const password = formData.password.trim();

      if (!isLogin) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await sendEmailVerification(user);

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
        showAlert('success', 'Account Created!', `Welcome to WE CONNECT! Please check your email to verify your account.`);
        setTimeout(() => handleAuthSuccess(userProfile), 2000);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await user.reload();
        
        if (!user.emailVerified) {
          showAlert('warning', 'Email Not Verified', 'Please verify your email before logging in.');
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
        showAlert('success', 'Welcome Back!', `Hello ${userProfile.name}, you have successfully signed in.`);
        setTimeout(() => handleAuthSuccess(userProfile), 500);
      }
    } catch (error) {
      let message = 'An error occurred. Please try again.';
      let title = 'Authentication Failed';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          message = 'The email or password you entered is incorrect.';
          title = 'Invalid Credentials';
          break;
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Please sign in instead.';
          title = 'Email Already Exists';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email. Please sign up first.';
          title = 'Account Not Found';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again or click "Forgot Password".';
          title = 'Wrong Password';
          break;
        default:
          message = error.message || 'Authentication failed.';
      }
      showAlert('error', title, message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowResetPassword(false);
    setResetSent(false);
    setResetEmail('');
    setAlert(null);
    setCurrentStep(1);
    setFormData({
      ...formData,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setGender(null);
    setErrors({});
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -20 }
  };

  const floatingIcons = [
    { icon: BookOpen, delay: 0, x: 10, y: 20 },
    { icon: Video, delay: 2, x: -15, y: 30 },
    { icon: FileText, delay: 4, x: 20, y: 10 },
    { icon: ScrollText, delay: 1, x: -10, y: 40 },
    { icon: Users, delay: 3, x: 15, y: 25 },
    { icon: Star, delay: 5, x: -20, y: 15 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <AnimatedBackground />
      
      {/* Floating Icons */}
      {floatingIcons.map((item, idx) => {
        const IconComp = item.icon;
        return (
          <motion.div
            key={idx}
            className="absolute text-white/10 pointer-events-none"
            style={{ fontSize: '60px' }}
            initial={{ x: item.x, y: item.y, opacity: 0 }}
            animate={{ 
              x: [item.x, item.x + 30, item.x],
              y: [item.y, item.y - 50, item.y],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              delay: item.delay,
              ease: "linear"
            }}
          >
            <IconComp size={80} />
          </motion.div>
        );
      })}

      <TiltCard className="relative w-full max-w-5xl">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative bg-gradient-to-br from-white/95 to-indigo-50/95 dark:from-slate-900/95 dark:to-indigo-950/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800/50"
        >
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Branding & Features */}
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 lg:p-12 text-white overflow-hidden">
              <div className="absolute inset-0 bg-[url('/weconnect-logo.png')] bg-[length:200px] bg-repeat opacity-10" />
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8"
                >
                  <GraduationCap className="w-8 h-8 text-white" />
                </motion.div>
                
                <motion.h2 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl lg:text-4xl font-bold mb-4"
                >
                  {isLogin ? 'Welcome Back!' : 'Join the Future'}
                </motion.h2>
                
                <motion.p 
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 mb-8 leading-relaxed"
                >
                  {isLogin 
                    ? 'Continue your academic journey with thousands of shared resources'
                    : 'Create your account and start collaborating smarter today'
                  }
                </motion.p>
                
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Access 50,000+ Study Materials</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Connect with Expert Tutors</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm">Earn Real Cash Rewards</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 pt-8 border-t border-white/20"
                >
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-xs font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-white/60 mt-3">Join 10,000+ active learners</p>
                </motion.div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="p-6 lg:p-8 overflow-y-auto max-h-[80vh] lg:max-h-[90vh]">
              {/* Header with Toggle */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isLogin 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      !isLogin 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Alert Container */}
              <AnimatePresence>
                {alert && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 p-3 rounded-xl border ${
                      alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                      alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
                      'bg-yellow-50 border-yellow-200 text-yellow-700'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {alert.type === 'error' && <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
                      {alert.type === 'success' && <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />}
                      <div>
                        <p className="font-semibold text-sm">{alert.title}</p>
                        <p className="text-xs">{alert.message}</p>
                      </div>
                      <button onClick={clearAlert} className="ml-auto"><X size={14} /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {showResetPassword ? (
                <form onSubmit={handlePasswordReset} className="space-y-5">
                  {resetSent ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Check Your Email</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        We've sent a password reset link to <strong>{resetEmail}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setResetSent(false);
                          setResetEmail('');
                        }}
                        className="mt-4 text-indigo-600 hover:underline"
                      >
                        Try another email
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <FloatingInput
                        icon={Mail}
                        label="Email Address"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                        Send Reset Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(false)}
                        className="w-full text-center text-sm text-slate-500 hover:text-indigo-600 transition"
                      >
                        ← Back to Sign In
                      </button>
                    </>
                  )}
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Role Selection - Only for Sign Up */}
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">I am a</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'student', icon: GraduationCap, label: 'Student', color: 'indigo' },
                          { value: 'tutor', icon: Briefcase, label: 'Tutor', color: 'purple' },
                          { value: 'lecturer', icon: Award, label: 'Lecturer', color: 'pink' },
                        ].map((r) => (
                          <RoleCard
                            key={r.value}
                            role={r.value}
                            icon={r.icon}
                            label={r.label}
                            isSelected={role === r.value}
                            onClick={() => setRole(r.value)}
                            color={r.color}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Email Field */}
                  <FloatingInput
                    icon={Mail}
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                  />
                  {errors.email && <p className="text-xs text-red-500 -mt-3">{errors.email}</p>}

                  {/* Password Field */}
                  <div className="relative">
                    <FloatingInput
                      icon={Lock}
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {errors.password && <p className="text-xs text-red-500 -mt-3">{errors.password}</p>}
                  </div>

                  {/* Confirm Password - Only for Sign Up */}
                  {!isLogin && (
                    <div className="relative">
                      <FloatingInput
                        icon={Lock}
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        error={errors.confirmPassword}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      {errors.confirmPassword && <p className="text-xs text-red-500 -mt-3">{errors.confirmPassword}</p>}
                    </div>
                  )}

                  {/* Name Field - Only for Sign Up */}
                  {!isLogin && (
                    <FloatingInput
                      icon={User}
                      label="Full Name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={errors.name}
                      required
                    />
                  )}

                  {/* Student Specific Fields */}
                  {!isLogin && role === 'student' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 overflow-hidden"
                    >
                      <FloatingInput
                        icon={Hash}
                        label="Matric Number"
                        type="text"
                        name="matricNumber"
                        value={formData.matricNumber}
                        onChange={handleInputChange}
                        error={errors.matricNumber}
                      />
                      <FloatingInput
                        icon={Building2}
                        label="School/University"
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        error={errors.school}
                      />
                      <FloatingInput
                        icon={GraduationCap}
                        label="Faculty"
                        type="text"
                        name="faculty"
                        value={formData.faculty}
                        onChange={handleInputChange}
                      />
                      <FloatingInput
                        icon={BookOpen}
                        label="Department"
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        error={errors.department}
                      />
                    </motion.div>
                  )}

                  {/* Forgot Password Link */}
                  {isLogin && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 transition"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white dark:bg-slate-800 text-sm text-slate-500">or continue with</span>
                    </div>
                  </div>

                  {/* Social Login */}
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="flex items-center justify-center gap-3 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                    >
                      <Chrome className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Continue with Google</span>
                    </button>
                  </div>

                  {/* Toggle Mode Link */}
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 transition"
                    >
                      {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </TiltCard>
    </div>
  );
}

export default AuthForm;