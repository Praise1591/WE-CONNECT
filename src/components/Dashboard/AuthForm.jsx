// src/components/Dashboard/AuthForm.jsx - Complete Working Version for Your Firebase Config
import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, 
  Briefcase, Award, X, Chrome, Phone, Home, AlertCircle,
  CheckCircle, Send, UserPlus, LogIn, User,
  Hash, Smartphone, Star, Calendar, AwardIcon,
  AlertTriangle, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Import from your firebase.js
import { 
  auth, 
  db, 
  googleProvider,
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

// Role Card Component
const RoleCard = ({ icon: Icon, label, isSelected, onClick, color }) => {
  const getColorClasses = () => {
    switch(color) {
      case 'indigo':
        return { border: 'border-indigo-500', bg: 'bg-indigo-500', text: 'text-indigo-600' };
      case 'purple':
        return { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-600' };
      case 'pink':
        return { border: 'border-pink-500', bg: 'bg-pink-500', text: 'text-pink-600' };
      default:
        return { border: 'border-indigo-500', bg: 'bg-indigo-500', text: 'text-indigo-600' };
    }
  };
  
  const colors = getColorClasses();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        isSelected
          ? `${colors.border} bg-gradient-to-br from-${color}-500/10 to-${color}-600/10 shadow-lg`
          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
      }`}
    >
      <div className={`p-2 rounded-lg ${isSelected ? colors.bg : 'bg-slate-100 dark:bg-slate-700'}`}>
        <Icon size={20} className={isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'} />
      </div>
      <span className={`text-xs font-medium ${isSelected ? colors.text : 'text-slate-700 dark:text-slate-300'}`}>
        {label}
      </span>
    </motion.button>
  );
};

// Input Components
const InputField = ({ icon: Icon, label, error, required, type = "text", ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon size={18} className="text-slate-400" />
        </div>
        <input
          type={type}
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border transition-all focus:outline-none ${
            error
              ? 'border-red-500 focus:border-red-500'
              : isFocused
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-transparent focus:border-indigo-500'
          }`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

const PasswordInput = ({ icon: Icon, label, error, required, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Icon size={18} className="text-slate-400" />
        </div>
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`w-full pl-10 pr-12 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border transition-all focus:outline-none ${
            error
              ? 'border-red-500 focus:border-red-500'
              : isFocused
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-transparent focus:border-indigo-500'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {showPassword ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-slate-400" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Options Lists
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
];

const universitiesList = [
  { value: 'unilag', label: 'University of Lagos' },
  { value: 'ui', label: 'University of Ibadan' },
  { value: 'unn', label: 'University of Nigeria, Nsukka' },
  { value: 'oau', label: 'Obafemi Awolowo University' },
  { value: 'abu', label: 'Ahmadu Bello University' },
  { value: 'uniben', label: 'University of Benin' },
  { value: 'unilorin', label: 'University of Ilorin' },
  { value: 'uniport', label: 'University of Port Harcourt' },
  { value: 'other', label: 'Other University' },
];

const departmentsList = [
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'law', label: 'Law' },
  { value: 'business', label: 'Business Administration' },
  { value: 'economics', label: 'Economics' },
  { value: 'mass-comm', label: 'Mass Communication' },
  { value: 'other', label: 'Other Department' },
];

const specializationsList = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'other', label: 'Other' },
];

// Main AuthForm Component
function AuthForm({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [role, setRole] = useState('student');
  const [gender, setGender] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    matricNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    yearsExperience: '',
    title: '',
    yearsTeaching: '',
  });
  
  const navigate = useNavigate();

  // Auto-clear alert
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const showAlert = (type, title, message) => {
    setAlert({ type, title, message });
  };

  const triggerCelebration = () => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    document.body.appendChild(container);

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = `${Math.random() * 8 + 4}px`;
      particle.style.height = particle.style.width;
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = `hsl(${Math.random() * 60 + 280}, 80%, 60%)`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = '50%';
      particle.style.opacity = '1';
      particle.style.transition = 'all 1s ease-out';
      container.appendChild(particle);

      setTimeout(() => {
        particle.style.transform = `translateY(${Math.random() * -200 - 100}px) translateX(${Math.random() * 200 - 100}px)`;
        particle.style.opacity = '0';
      }, 10);

      setTimeout(() => {
        particle.remove();
      }, 1000);
    }

    setTimeout(() => {
      container.remove();
    }, 1500);
  };

  const handleAuthSuccess = (userProfile) => {
    triggerCelebration();
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    if (onClose) onClose();
    if (onLoginSuccess) onLoginSuccess(userProfile);
    navigate('/dashboard');
    window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userProfile }));
  };

  // ========== GOOGLE SIGN-IN (WORKING POPUP METHOD) ==========
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAlert(null);
    
    try {
      console.log("Opening Google sign-in popup...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log("Google sign-in successful:", user.email);
      
      // Check if user profile exists in Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      
      let userProfile;
      
      if (!profileDoc.exists()) {
        // First time Google sign-in - create profile
        const profileData = {
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          role: 'student', // Default role, can be updated later
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
          coins: 0,
          diamonds: 0,
          emailVerified: user.emailVerified,
          provider: 'google',
        };
        
        await setDoc(profileRef, profileData);
        
        userProfile = {
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          role: 'student',
          photoURL: user.photoURL || null,
          coins: 0,
          diamonds: 0,
          emailVerified: user.emailVerified,
        };
        
        showAlert('success', 'Welcome!', `Account created with Google. You can update your profile later.`);
      } else {
        // Existing user
        const profileData = profileDoc.data();
        userProfile = {
          id: user.uid,
          email: user.email,
          name: profileData.name || user.displayName || user.email?.split('@')[0] || 'User',
          role: profileData.role || 'student',
          photoURL: user.photoURL || profileData.photoURL,
          coins: profileData.coins || 0,
          diamonds: profileData.diamonds || 0,
          emailVerified: user.emailVerified,
        };
        
        showAlert('success', 'Welcome Back!', `Hello ${userProfile.name}`);
      }
      
      setTimeout(() => {
        handleAuthSuccess(userProfile);
      }, 1000);
      
    } catch (error) {
      console.error("Google Sign-In Error Details:", error);
      
      let message = 'Google sign-in failed. Please try again.';
      let title = 'Sign In Failed';
      
      if (error.code === 'auth/popup-blocked') {
        message = 'Popup was blocked. Please allow popups for this site and try again.';
        title = 'Popup Blocked';
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in popup was closed. Please try again.';
        title = 'Sign-in Cancelled';
      } else if (error.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized. Please add it to Firebase Console.';
        title = 'Domain Not Authorized';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
        title = 'Network Error';
      } else if (error.code === 'auth/internal-error') {
        message = 'Internal error. Please try again or use email sign-in.';
        title = 'Service Error';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        message = 'An account already exists with the same email address but different sign-in method. Please sign in using your email and password.';
        title = 'Account Already Exists';
      }
      
      showAlert('error', title, message);
    } finally {
      setLoading(false);
    }
  };

  // ========== EMAIL SIGN-IN ==========
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showAlert('error', 'Missing Fields', 'Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setAlert(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Reload to get latest email verification status
      await user.reload();
      
      if (!user.emailVerified) {
        showAlert('warning', 'Email Not Verified', 
          'Please verify your email before logging in. Check your inbox for the verification link.');
        setLoading(false);
        return;
      }
      
      // Get user profile from Firestore
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
        // Create basic profile if missing (shouldn't happen normally)
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
      }
      
      showAlert('success', 'Welcome Back!', `Hello ${userProfile.name}`);
      
      setTimeout(() => {
        handleAuthSuccess(userProfile);
      }, 1000);
      
    } catch (error) {
      console.error("Sign-in error:", error);
      
      let message = 'Sign in failed. Please try again.';
      let title = 'Sign In Failed';
      
      switch (error.code) {
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email. Please sign up.';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled. Please contact support.';
          break;
        default:
          message = error.message || 'Sign in failed. Please try again.';
      }
      
      showAlert('error', title, message);
    } finally {
      setLoading(false);
    }
  };

  // ========== EMAIL SIGN-UP ==========
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      showAlert('error', 'Name Required', 'Please enter your full name');
      return;
    }
    
    if (!formData.email) {
      showAlert('error', 'Email Required', 'Please enter your email');
      return;
    }
    
    if (!formData.password) {
      showAlert('error', 'Password Required', 'Please enter a password');
      return;
    }
    
    if (formData.password.length < 6) {
      showAlert('error', 'Weak Password', 'Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      showAlert('error', 'Password Mismatch', 'Passwords do not match');
      return;
    }
    
    // Role-specific validation
    if (role === 'student') {
      if (!formData.matricNumber.trim()) {
        showAlert('error', 'Matric Number Required', 'Please enter your matric number');
        return;
      }
      if (!selectedSchool) {
        showAlert('error', 'School Required', 'Please select your school');
        return;
      }
      if (!selectedDepartment) {
        showAlert('error', 'Department Required', 'Please select your department');
        return;
      }
    }
    
    if (role === 'tutor') {
      if (!selectedSpecialization) {
        showAlert('error', 'Specialization Required', 'Please select your specialization');
        return;
      }
      if (!formData.yearsExperience) {
        showAlert('error', 'Experience Required', 'Please enter your years of experience');
        return;
      }
    }
    
    if (role === 'lecturer') {
      if (!formData.title.trim()) {
        showAlert('error', 'Title Required', 'Please enter your title');
        return;
      }
      if (!selectedSchool) {
        showAlert('error', 'School Required', 'Please select your school');
        return;
      }
      if (!selectedDepartment) {
        showAlert('error', 'Department Required', 'Please select your department');
        return;
      }
      if (!formData.yearsTeaching) {
        showAlert('error', 'Teaching Experience Required', 'Please enter your years of teaching');
        return;
      }
    }
    
    setLoading(true);
    setAlert(null);
    
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Build profile data for Firestore
      const profileData = {
        name: formData.name.trim(),
        email: user.email,
        role: role,
        gender: gender?.value || null,
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        createdAt: serverTimestamp(),
        coins: 0,
        diamonds: 0,
        photoURL: null,
        emailVerified: false,
        provider: 'email',
      };
      
      // Add role-specific data
      if (role === 'student') {
        profileData.matricNumber = formData.matricNumber.trim();
        profileData.school = selectedSchool?.label;
        profileData.department = selectedDepartment?.label;
      } else if (role === 'tutor') {
        profileData.specialization = selectedSpecialization?.label;
        profileData.yearsExperience = parseInt(formData.yearsExperience);
      } else if (role === 'lecturer') {
        profileData.title = formData.title.trim();
        profileData.school = selectedSchool?.label;
        profileData.department = selectedDepartment?.label;
        profileData.yearsTeaching = parseInt(formData.yearsTeaching);
      }
      
      // Save to Firestore
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, profileData);
      
      const userProfile = {
        id: user.uid,
        email: user.email,
        name: formData.name.trim(),
        role: role,
        photoURL: null,
        coins: 0,
        diamonds: 0,
        emailVerified: false,
      };
      
      showAlert('success', 'Account Created!', 
        `Welcome! Please check your email at ${formData.email} to verify your account.`);
      
      setTimeout(() => {
        handleAuthSuccess(userProfile);
      }, 2000);
      
    } catch (error) {
      console.error("Sign-up error:", error);
      
      let message = 'Sign up failed. Please try again.';
      let title = 'Sign Up Failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Please sign in instead.';
          title = 'Email Already Exists';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak. Please use at least 6 characters.';
          title = 'Weak Password';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          title = 'Invalid Email';
          break;
        case 'auth/operation-not-allowed':
          message = 'Email/password accounts are not enabled. Please contact support.';
          title = 'Account Creation Disabled';
          break;
        default:
          message = error.message || 'Sign up failed. Please try again.';
      }
      
      showAlert('error', title, message);
    } finally {
      setLoading(false);
    }
  };

  // ========== PASSWORD RESET ==========
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      showAlert('error', 'Email Required', 'Please enter your email address');
      return;
    }
    
    setLoading(true);
    setAlert(null);
    
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      showAlert('success', 'Reset Email Sent', 
        `Check your email at ${resetEmail} for reset instructions.`);
    } catch (error) {
      console.error("Password reset error:", error);
      
      let message = 'Failed to send reset email.';
      let title = 'Reset Failed';
      
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      }
      
      showAlert('error', title, message);
    } finally {
      setLoading(false);
    }
  };

  const renderRoleFields = () => {
    if (role === 'student') {
      return (
        <>
          <InputField
            icon={Hash}
            label="Matric Number"
            value={formData.matricNumber}
            onChange={(e) => setFormData({ ...formData, matricNumber: e.target.value })}
            required
          />
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              School/University <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSchool?.value || ''}
              onChange={(e) => {
                const selected = universitiesList.find(opt => opt.value === e.target.value);
                setSelectedSchool(selected);
              }}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="">Select your school</option>
              {universitiesList.map(uni => (
                <option key={uni.value} value={uni.value}>{uni.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDepartment?.value || ''}
              onChange={(e) => {
                const selected = departmentsList.find(opt => opt.value === e.target.value);
                setSelectedDepartment(selected);
              }}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="">Select your department</option>
              {departmentsList.map(dept => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
          </div>
        </>
      );
    }
    
    if (role === 'tutor') {
      return (
        <>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              Specialization <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSpecialization?.value || ''}
              onChange={(e) => {
                const selected = specializationsList.find(opt => opt.value === e.target.value);
                setSelectedSpecialization(selected);
              }}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="">Select your specialization</option>
              {specializationsList.map(spec => (
                <option key={spec.value} value={spec.value}>{spec.label}</option>
              ))}
            </select>
          </div>
          <InputField
            icon={Star}
            label="Years of Experience"
            type="number"
            min="0"
            value={formData.yearsExperience}
            onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
            required
          />
        </>
      );
    }
    
    if (role === 'lecturer') {
      return (
        <>
          <InputField
            icon={AwardIcon}
            label="Title (Dr., Prof., Mr., Mrs., etc.)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              School/University <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSchool?.value || ''}
              onChange={(e) => {
                const selected = universitiesList.find(opt => opt.value === e.target.value);
                setSelectedSchool(selected);
              }}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="">Select your institution</option>
              {universitiesList.map(uni => (
                <option key={uni.value} value={uni.value}>{uni.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedDepartment?.value || ''}
              onChange={(e) => {
                const selected = departmentsList.find(opt => opt.value === e.target.value);
                setSelectedDepartment(selected);
              }}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="">Select your department</option>
              {departmentsList.map(dept => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
          </div>
          <InputField
            icon={Calendar}
            label="Years of Teaching"
            type="number"
            min="0"
            value={formData.yearsTeaching}
            onChange={(e) => setFormData({ ...formData, yearsTeaching: e.target.value })}
            required
          />
        </>
      );
    }
    
    return null;
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowResetPassword(false);
    setResetSent(false);
    setResetEmail('');
    setAlert(null);
    setActiveStep(1);
    setGender(null);
    setSelectedSchool(null);
    setSelectedDepartment(null);
    setSelectedSpecialization(null);
    setFormData({
      name: '',
      matricNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      yearsExperience: '',
      title: '',
      yearsTeaching: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-3">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">WE CONNECT EDU</h1>
          <p className="text-white/70 text-sm mt-1">Learn. Connect. Earn.</p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Toggle Buttons */}
          {!showResetPassword && (
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 text-center font-semibold transition-all relative ${
                  isLogin ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Sign In
                {isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 text-center font-semibold transition-all relative ${
                  !isLogin ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Sign Up
                {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />}
              </button>
            </div>
          )}

          <div className="p-5 max-h-[70vh] overflow-y-auto">
            {/* Alert Messages */}
            <AnimatePresence>
              {alert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-4 p-3 rounded-xl text-sm ${
                    alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400' :
                    alert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {alert.type === 'error' && <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
                    {alert.type === 'success' && <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />}
                    {alert.type === 'warning' && <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-xs">{alert.message}</p>
                    </div>
                    <button onClick={() => setAlert(null)} className="hover:opacity-70">
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showResetPassword ? (
              // Reset Password Form
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {resetSent ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-800 dark:text-white">Check Your Email</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      We've sent a password reset link to <strong className="text-indigo-600">{resetEmail}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setResetEmail('');
                      }}
                      className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      ← Use a different email
                    </button>
                  </div>
                ) : (
                  <>
                    <InputField
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
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
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
            ) : isLogin ? (
              // SIGN IN FORM
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <InputField
                  icon={Mail}
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                
                <PasswordInput
                  icon={Lock}
                  label="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 text-right block w-full"
                >
                  Forgot Password?
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader size={18} className="animate-spin" /> : <LogIn size={18} />}
                  Sign In
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 bg-white dark:bg-slate-900 text-xs text-slate-500">or continue with</span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Chrome className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Continue with Google</span>
                </button>
                
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button type="button" onClick={toggleMode} className="font-semibold text-indigo-600 hover:text-indigo-700">
                    Sign up
                  </button>
                </p>
              </form>
            ) : (
              // SIGN UP FORM
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                {activeStep === 1 ? (
                  <>
                    {/* Role Selection */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">I am a</label>
                      <div className="grid grid-cols-3 gap-3">
                        <RoleCard
                          icon={GraduationCap}
                          label="Student"
                          isSelected={role === 'student'}
                          onClick={() => setRole('student')}
                          color="indigo"
                        />
                        <RoleCard
                          icon={Briefcase}
                          label="Tutor"
                          isSelected={role === 'tutor'}
                          onClick={() => setRole('tutor')}
                          color="purple"
                        />
                        <RoleCard
                          icon={Award}
                          label="Lecturer"
                          isSelected={role === 'lecturer'}
                          onClick={() => setRole('lecturer')}
                          color="pink"
                        />
                      </div>
                    </div>
                    
                    <InputField
                      icon={User}
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    
                    <InputField
                      icon={Mail}
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                    
                    <PasswordInput
                      icon={Lock}
                      label="Password (min. 6 characters)"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    
                    <PasswordInput
                      icon={Lock}
                      label="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Gender (Optional)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {genderOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setGender(opt)}
                            className={`py-2 rounded-lg border transition-all text-sm ${
                              gender?.value === opt.value
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                            }`}
                          >
                            {opt.label === 'Prefer not to say' ? 'Prefer not' : opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <InputField
                      icon={Smartphone}
                      label="Phone Number (Optional)"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    
                    <InputField
                      icon={Home}
                      label="Address (Optional)"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-3 bg-white dark:bg-slate-900 text-xs text-slate-500">or continue with</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Chrome className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Continue with Google</span>
                    </button>
                    
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                      Already have an account?{' '}
                      <button type="button" onClick={toggleMode} className="font-semibold text-indigo-600 hover:text-indigo-700">
                        Sign in
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    {renderRoleFields()}
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader size={18} className="animate-spin" /> : <UserPlus size={18} />}
                        Create Account
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition"
          aria-label="Close"
        >
          <X size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}

export default AuthForm;