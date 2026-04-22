// src/components/Dashboard/AuthForm.jsx - Mobile-First with All Fields and Role Selection
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, 
  Briefcase, Award, X, Chrome, Phone, Home, AlertCircle,
  CheckCircle, Shield, Sparkles, UserCheck, Fingerprint,
  Send, Key, RefreshCw, UserPlus, LogIn,
  ChevronRight, ChevronLeft, Hash, Building2, User,
  Smartphone, Globe, Zap, BookOpen, Video, FileText, ScrollText, Users, Star,
  Calendar, MapPin, School, BriefcaseBusiness, Award as AwardIcon,
  Target, Layers, BookMarked, Library, PenTool, Microscope
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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

// Role Card Component
const RoleCard = ({ icon: Icon, label, isSelected, onClick, color }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        isSelected
          ? `border-${color}-500 bg-gradient-to-br from-${color}-500/10 to-${color}-600/10 shadow-lg`
          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
      }`}
    >
      <div className={`p-2 rounded-lg ${isSelected ? `bg-${color}-500` : 'bg-slate-100 dark:bg-slate-700'}`}>
        <Icon size={20} className={isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'} />
      </div>
      <span className={`text-xs font-medium ${isSelected ? `text-${color}-600` : 'text-slate-700 dark:text-slate-300'}`}>
        {label}
      </span>
    </motion.button>
  );
};

// Mobile Input Component
const MobileInput = ({ icon: Icon, label, error, required, ...props }) => {
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

// Mobile Password Input
const MobilePasswordInput = ({ icon: Icon, label, error, required, ...props }) => {
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

// Mobile TextArea
const MobileTextArea = ({ icon: Icon, label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-3">
          <Icon size={18} className="text-slate-400" />
        </div>
        <textarea
          {...props}
          rows={3}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border transition-all focus:outline-none resize-none ${
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

// Gender Options
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
];

// Nigerian Universities List
const universitiesList = [
  { value: 'unilag', label: 'University of Lagos' },
  { value: 'ui', label: 'University of Ibadan' },
  { value: 'unn', label: 'University of Nigeria, Nsukka' },
  { value: 'oau', label: 'Obafemi Awolowo University' },
  { value: 'abu', label: 'Ahmadu Bello University' },
  { value: 'uniben', label: 'University of Benin' },
  { value: 'unilorin', label: 'University of Ilorin' },
  { value: 'uniport', label: 'University of Port Harcourt' },
  { value: 'futa', label: 'FUT Akure' },
  { value: 'futo', label: 'FUT Owerri' },
  { value: 'lasu', label: 'Lagos State University' },
  { value: 'delsu', label: 'Delta State University' },
  { value: 'other', label: 'Other' },
];

// Departments List
const departmentsList = [
  { value: 'accounting', label: 'Accounting' },
  { value: 'agric-economics', label: 'Agricultural Economics' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'biochemistry', label: 'Biochemistry' },
  { value: 'business-admin', label: 'Business Administration' },
  { value: 'chemical-engineering', label: 'Chemical Engineering' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'civil-engineering', label: 'Civil Engineering' },
  { value: 'computer-engineering', label: 'Computer Engineering' },
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'economics', label: 'Economics' },
  { value: 'electrical-engineering', label: 'Electrical Engineering' },
  { value: 'english', label: 'English Language' },
  { value: 'law', label: 'Law' },
  { value: 'mass-communication', label: 'Mass Communication' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'mechanical-engineering', label: 'Mechanical Engineering' },
  { value: 'medicine-surgery', label: 'Medicine & Surgery' },
  { value: 'microbiology', label: 'Microbiology' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'physics', label: 'Physics' },
  { value: 'political-science', label: 'Political Science' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'sociology', label: 'Sociology' },
  { value: 'other', label: 'Other' },
];

// Faculties List
const facultiesList = [
  { value: 'agriculture', label: 'Faculty of Agriculture' },
  { value: 'arts', label: 'Faculty of Arts' },
  { value: 'education', label: 'Faculty of Education' },
  { value: 'engineering', label: 'Faculty of Engineering' },
  { value: 'environmental-sciences', label: 'Faculty of Environmental Sciences' },
  { value: 'law', label: 'Faculty of Law' },
  { value: 'management-sciences', label: 'Faculty of Management Sciences' },
  { value: 'medical-sciences', label: 'Faculty of Medical Sciences' },
  { value: 'pharmacy', label: 'Faculty of Pharmacy' },
  { value: 'science', label: 'Faculty of Science' },
  { value: 'social-sciences', label: 'Faculty of Social Sciences' },
  { value: 'veterinary-medicine', label: 'Faculty of Veterinary Medicine' },
  { value: 'other', label: 'Other' },
];

// Tutor Specializations
const specializationsList = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'english', label: 'English' },
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'economics', label: 'Economics' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'law', label: 'Law' },
  { value: 'other', label: 'Other' },
];

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
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
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
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const googleProvider = new GoogleAuthProvider();

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
    triggerCelebration();
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
      if (!formData.name) newErrors.name = 'Name is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      if (role === 'student') {
        if (!formData.matricNumber) newErrors.matricNumber = 'Matric number required';
        if (!selectedSchool) newErrors.school = 'School required';
        if (!selectedDepartment) newErrors.department = 'Department required';
      }
      if (role === 'tutor') {
        if (!selectedSpecialization) newErrors.specialization = 'Specialization required';
        if (!formData.yearsExperience) newErrors.yearsExperience = 'Years of experience required';
      }
      if (role === 'lecturer') {
        if (!formData.title) newErrors.title = 'Title required';
        if (!selectedSchool) newErrors.school = 'School required';
        if (!selectedDepartment) newErrors.department = 'Department required';
        if (!formData.yearsTeaching) newErrors.yearsTeaching = 'Years of teaching required';
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
          profileData.school = selectedSchool?.label || formData.school;
          profileData.faculty = selectedFaculty?.label || formData.faculty;
          profileData.department = selectedDepartment?.label || formData.department;
        } else if (role === 'tutor') {
          profileData.specialization = selectedSpecialization?.label || formData.specialization;
          profileData.yearsExperience = Number(formData.yearsExperience) || 0;
        } else if (role === 'lecturer') {
          profileData.title = formData.title.trim() || null;
          profileData.school = selectedSchool?.label || formData.school;
          profileData.department = selectedDepartment?.label || formData.department;
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
    setActiveStep(1);
    setGender(null);
    setSelectedSchool(null);
    setSelectedFaculty(null);
    setSelectedDepartment(null);
    setSelectedSpecialization(null);
    setFormData({
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
    setErrors({});
  };

  const renderRoleSpecificFields = () => {
    if (role === 'student') {
      return (
        <>
          <MobileInput
            icon={Hash}
            label="Matric Number"
            type="text"
            name="matricNumber"
            value={formData.matricNumber}
            onChange={handleInputChange}
            error={errors.matricNumber}
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
            {errors.school && <p className="text-xs text-red-500 mt-1">{errors.school}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Faculty</label>
            <select
              value={selectedFaculty?.value || ''}
              onChange={(e) => {
                const selected = facultiesList.find(opt => opt.value === e.target.value);
                setSelectedFaculty(selected);
              }}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="">Select your faculty (optional)</option>
              {facultiesList.map(fac => (
                <option key={fac.value} value={fac.value}>{fac.label}</option>
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
            {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
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
            {errors.specialization && <p className="text-xs text-red-500 mt-1">{errors.specialization}</p>}
          </div>
          <MobileInput
            icon={Star}
            label="Years of Experience"
            type="number"
            name="yearsExperience"
            value={formData.yearsExperience}
            onChange={handleInputChange}
            error={errors.yearsExperience}
            required
          />
        </>
      );
    }
    
    if (role === 'lecturer') {
      return (
        <>
          <MobileInput
            icon={AwardIcon}
            label="Title (e.g., Dr., Prof., Mr.)"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={errors.title}
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
            {errors.school && <p className="text-xs text-red-500 mt-1">{errors.school}</p>}
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
            {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
          </div>
          <MobileInput
            icon={Calendar}
            label="Years of Teaching"
            type="number"
            name="yearsTeaching"
            value={formData.yearsTeaching}
            onChange={handleInputChange}
            error={errors.yearsTeaching}
            required
          />
        </>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-pink-900/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Animated Background Elements */}
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
          <h1 className="text-2xl font-bold text-white">WE CONNECT</h1>
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
                {isLogin && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 text-center font-semibold transition-all relative ${
                  !isLogin ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Sign Up
                {!isLogin && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                )}
              </button>
            </div>
          )}

          <div className="p-5 max-h-[70vh] overflow-y-auto">
            {/* Alert */}
            <AnimatePresence>
              {alert && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-4 p-3 rounded-xl text-sm ${
                    alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                    alert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                    'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {alert.type === 'error' && <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
                    {alert.type === 'success' && <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-xs">{alert.message}</p>
                    </div>
                    <button onClick={clearAlert}><X size={14} /></button>
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
                    <h3 className="text-lg font-bold mb-2">Check Your Email</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      We've sent a password reset link to <strong>{resetEmail}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setResetEmail('');
                      }}
                      className="mt-4 text-indigo-600 hover:underline text-sm"
                    >
                      Try another email
                    </button>
                  </div>
                ) : (
                  <>
                    <MobileInput
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
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
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
              // Login Form
              <form onSubmit={handleSubmit} className="space-y-4">
                <MobileInput
                  icon={Mail}
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                />
                
                <MobilePasswordInput
                  icon={Lock}
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
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
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <LogIn size={18} />}
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
                  className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <Chrome className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Google</span>
                </button>
                
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button type="button" onClick={toggleMode} className="font-semibold text-indigo-600 hover:text-indigo-700">
                    Sign up
                  </button>
                </p>
              </form>
            ) : (
              // Sign Up Form - Step by Step with All Fields
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Step 1: Basic Info + Role Selection */}
                {activeStep === 1 && (
                  <>
                    {/* Role Selection Cards - RESTORED! */}
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
                    
                    <MobileInput
                      icon={User}
                      label="Full Name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={errors.name}
                      required
                    />
                    
                    <MobileInput
                      icon={Mail}
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={errors.email}
                      required
                    />
                    
                    <MobilePasswordInput
                      icon={Lock}
                      label="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      error={errors.password}
                      required
                    />
                    
                    <MobilePasswordInput
                      icon={Lock}
                      label="Confirm Password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      error={errors.confirmPassword}
                      required
                    />
                    
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Gender (Optional)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {genderOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setGender(opt)}
                            className={`py-2 rounded-lg border transition-all ${
                              gender?.value === opt.value
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <MobileInput
                      icon={Smartphone}
                      label="Phone Number (Optional)"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    
                    <MobileTextArea
                      icon={Home}
                      label="Address (Optional)"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                    
                    <button
                      type="button"
                      onClick={() => setActiveStep(2)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>
                  </>
                )}
                
                {/* Step 2: Role-Specific Fields */}
                {activeStep === 2 && (
                  <>
                    {renderRoleSpecificFields()}
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveStep(1)}
                        className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus size={18} />}
                        Create Account
                      </button>
                    </div>
                  </>
                )}
                
                {/* Social Login - Only on Step 1 */}
                {activeStep === 1 && (
                  <>
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
                      className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <Chrome className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Google</span>
                    </button>
                    
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                      Already have an account?{' '}
                      <button type="button" onClick={toggleMode} className="font-semibold text-indigo-600 hover:text-indigo-700">
                        Sign in
                      </button>
                    </p>
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
        >
          <X size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}

export default AuthForm;