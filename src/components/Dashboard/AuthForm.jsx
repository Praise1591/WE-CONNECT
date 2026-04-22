// src/components/Dashboard/AuthForm.jsx - Complete with Role-Based Fields
import React, { useState } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, 
  Briefcase, Award, X, Chrome, AlertCircle,
  CheckCircle, UserPlus, LogIn, User, Smartphone,
  Hash, School, BookOpen, Target, Star, Calendar,
  CreditCard, Building2, Phone, MapPin, Send,
  Globe, Linkedin, Twitter, Github, Facebook
} from 'lucide-react';
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
const RoleCard = ({ icon: Icon, label, isSelected, onClick, color }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
      isSelected
        ? `border-${color}-500 bg-gradient-to-br from-${color}-500 to-${color}-600 text-white shadow-lg`
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md'
    }`}
  >
    <Icon size={22} className={isSelected ? 'text-white' : `text-${color}-500`} />
    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
      {label}
    </span>
  </button>
);

// Input Component
const FormInput = ({ icon: Icon, label, error, required, ...props }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          {...props}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border transition-all focus:outline-none ${
            error ? 'border-red-500' : focused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent'
          }`}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Password Input
const PasswordInput = ({ icon: Icon, label, error, required, ...props }) => {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          {...props}
          type={show ? 'text' : 'password'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full pl-10 pr-12 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border transition-all focus:outline-none ${
            error ? 'border-red-500' : focused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {show ? <EyeOff size={18} className="text-slate-400" /> : <Eye size={18} className="text-slate-400" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Select Component
const FormSelect = ({ icon: Icon, label, options, value, onChange, error, required, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(opt => opt.value === value);
  
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border ${
          error ? 'border-red-500' : 'border-transparent'
        }`}
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-slate-400" />
          <span className="text-slate-900 dark:text-white">
            {selected?.label || placeholder}
          </span>
        </div>
        <ArrowRight size={16} className="text-slate-400" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl z-[100] max-h-[70vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 dark:text-white">{label}</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      value === opt.value
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

// Data Lists
const universities = [
  { value: 'unilag', label: 'University of Lagos (UNILAG)' },
  { value: 'ui', label: 'University of Ibadan (UI)' },
  { value: 'unn', label: 'University of Nigeria, Nsukka (UNN)' },
  { value: 'oau', label: 'Obafemi Awolowo University (OAU)' },
  { value: 'abu', label: 'Ahmadu Bello University (ABU)' },
  { value: 'uniben', label: 'University of Benin (UNIBEN)' },
  { value: 'unilorin', label: 'University of Ilorin (UNILORIN)' },
  { value: 'uniport', label: 'University of Port Harcourt (UNIPORT)' },
  { value: 'futa', label: 'Federal University of Technology, Akure (FUTA)' },
  { value: 'futo', label: 'Federal University of Technology, Owerri (FUTO)' },
  { value: 'lasu', label: 'Lagos State University (LASU)' },
  { value: 'delsu', label: 'Delta State University (DELSU)' },
  { value: 'covenant', label: 'Covenant University' },
  { value: 'babcock', label: 'Babcock University' },
  { value: 'other', label: 'Other' },
];

const departments = [
  { value: 'cs', label: 'Computer Science' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'medicine', label: 'Medicine & Surgery' },
  { value: 'law', label: 'Law' },
  { value: 'business', label: 'Business Administration' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'economics', label: 'Economics' },
  { value: 'masscomm', label: 'Mass Communication' },
  { value: 'biochemistry', label: 'Biochemistry' },
  { value: 'microbiology', label: 'Microbiology' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'physics', label: 'Physics' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'english', label: 'English Language' },
  { value: 'history', label: 'History' },
  { value: 'political-science', label: 'Political Science' },
  { value: 'psychology', label: 'Psychology' },
  { value: 'sociology', label: 'Sociology' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'nursing', label: 'Nursing' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'estate', label: 'Estate Management' },
  { value: 'other', label: 'Other' },
];

const levels = [
  { value: '100', label: '100 Level' },
  { value: '200', label: '200 Level' },
  { value: '300', label: '300 Level' },
  { value: '400', label: '400 Level' },
  { value: '500', label: '500 Level' },
  { value: 'postgraduate', label: 'Postgraduate' },
];

const specializations = [
  { value: 'math', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },
  { value: 'biology', label: 'Biology' },
  { value: 'cs', label: 'Computer Science' },
  { value: 'english', label: 'English' },
  { value: 'economics', label: 'Economics' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'medicine', label: 'Medicine' },
  { value: 'law', label: 'Law' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'graphics', label: 'Graphic Design' },
  { value: 'webdev', label: 'Web Development' },
  { value: 'datascience', label: 'Data Science' },
  { value: 'ai', label: 'Artificial Intelligence' },
  { value: 'other', label: 'Other' },
];

const ranks = [
  { value: 'professor', label: 'Professor' },
  { value: 'associate', label: 'Associate Professor' },
  { value: 'senior', label: 'Senior Lecturer' },
  { value: 'lecturer1', label: 'Lecturer I' },
  { value: 'lecturer2', label: 'Lecturer II' },
  { value: 'assistant', label: 'Assistant Lecturer' },
  { value: 'ga', label: 'Graduate Assistant' },
];

const faculties = [
  { value: 'science', label: 'Faculty of Science' },
  { value: 'engineering', label: 'Faculty of Engineering' },
  { value: 'arts', label: 'Faculty of Arts' },
  { value: 'social', label: 'Faculty of Social Sciences' },
  { value: 'management', label: 'Faculty of Management Sciences' },
  { value: 'law', label: 'Faculty of Law' },
  { value: 'medicine', label: 'Faculty of Medicine' },
  { value: 'pharmacy', label: 'Faculty of Pharmacy' },
  { value: 'education', label: 'Faculty of Education' },
  { value: 'agriculture', label: 'Faculty of Agriculture' },
  { value: 'environmental', label: 'Faculty of Environmental Sciences' },
  { value: 'communication', label: 'Faculty of Communication' },
  { value: 'other', label: 'Other' },
];

const qualifications = [
  { value: 'bsc', label: "Bachelor's Degree (B.Sc)" },
  { value: 'msc', label: "Master's Degree (M.Sc)" },
  { value: 'phd', label: 'PhD' },
  { value: 'hnd', label: 'HND' },
  { value: 'nd', label: 'ND' },
  { value: 'certificate', label: 'Professional Certificate' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'other', label: 'Other' },
];

function AuthForm({ initialMode = 'signup', onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [role, setRole] = useState('student');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  const [formData, setFormData] = useState({
    // Common
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    // Student
    matricNumber: '',
    school: '',
    department: '',
    level: '',
    // Tutor
    specialization: '',
    yearsExperience: '',
    hourlyRate: '',
    qualification: '',
    // Lecturer
    staffId: '',
    faculty: '',
    academicRank: '',
    yearsTeaching: '',
    researchArea: '',
  });
  
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSelect = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const showAlert = (type, title, message) => {
    setAlert({ type, title, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const clearAlert = () => setAlert(null);

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

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    
    if (!formData.password) newErrors.password = 'Password required';
    else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
    
    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Name required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      // Student validations
      if (role === 'student') {
        if (!formData.matricNumber) newErrors.matricNumber = 'Matric number required';
        if (!formData.school) newErrors.school = 'School required';
        if (!formData.department) newErrors.department = 'Department required';
        if (!formData.level) newErrors.level = 'Level required';
      }
      
      // Tutor validations
      if (role === 'tutor') {
        if (!formData.specialization) newErrors.specialization = 'Specialization required';
        if (!formData.yearsExperience) newErrors.yearsExperience = 'Years of experience required';
        if (!formData.qualification) newErrors.qualification = 'Qualification required';
      }
      
      // Lecturer validations
      if (role === 'lecturer') {
        if (!formData.staffId) newErrors.staffId = 'Staff ID required';
        if (!formData.school) newErrors.school = 'School required';
        if (!formData.faculty) newErrors.faculty = 'Faculty required';
        if (!formData.academicRank) newErrors.academicRank = 'Academic rank required';
        if (!formData.yearsTeaching) newErrors.yearsTeaching = 'Years of teaching required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
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
          name: formData.name.trim(),
          email: user.email,
          role: role,
          phone: formData.phone?.trim() || null,
          address: formData.address?.trim() || null,
          createdAt: serverTimestamp(),
          coins: 0,
          diamonds: 0,
          photoURL: user.photoURL || null,
          emailVerified: false,
        };

        // Student data
        if (role === 'student') {
          profileData.matricNumber = formData.matricNumber?.trim();
          profileData.school = formData.school;
          profileData.department = formData.department;
          profileData.level = formData.level;
        }
        
        // Tutor data
        if (role === 'tutor') {
          profileData.specialization = formData.specialization;
          profileData.yearsExperience = parseInt(formData.yearsExperience) || 0;
          profileData.hourlyRate = parseInt(formData.hourlyRate) || 0;
          profileData.qualification = formData.qualification;
        }
        
        // Lecturer data
        if (role === 'lecturer') {
          profileData.staffId = formData.staffId?.trim();
          profileData.school = formData.school;
          profileData.faculty = formData.faculty;
          profileData.department = formData.department || null;
          profileData.academicRank = formData.academicRank;
          profileData.yearsTeaching = parseInt(formData.yearsTeaching) || 0;
          profileData.researchArea = formData.researchArea?.trim() || null;
        }

        await setDoc(doc(db, 'profiles', user.uid), profileData);

        const userProfile = {
          id: user.uid,
          email: user.email,
          name: formData.name.trim(),
          role: role,
          photoURL: user.photoURL || null,
          coins: 0,
          diamonds: 0,
          emailVerified: false,
        };
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        showAlert('success', 'Account Created!', `Welcome! Please check your email to verify your account.`);
        setTimeout(() => {
          if (onClose) onClose();
          navigate('/dashboard');
        }, 2000);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await user.reload();
        
        if (!user.emailVerified) {
          showAlert('warning', 'Email Not Verified', 'Please verify your email before logging in.');
          setLoading(false);
          return;
        }
        
        const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
        const userProfile = {
          id: user.uid,
          email: user.email,
          ...profileDoc.data()
        };
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        triggerCelebration();
        
        if (onLoginSuccess) onLoginSuccess(userProfile);
        if (onClose) onClose();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      let message = 'Authentication failed. Please try again.';
      let title = 'Error';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered. Please sign in instead.';
          title = 'Email Already Exists';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email. Please sign up first.';
          title = 'Account Not Found';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password. Please try again.';
          title = 'Wrong Password';
          break;
        case 'auth/invalid-credential':
          message = 'Invalid email or password.';
          title = 'Invalid Credentials';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters.';
          title = 'Weak Password';
          break;
        default:
          message = error.message || 'Authentication failed.';
      }
      showAlert('error', title, message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setAlert(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);
      
      if (!profileDoc.exists()) {
        await setDoc(profileRef, {
          name: user.displayName || 'User',
          email: user.email,
          role: 'student',
          createdAt: serverTimestamp(),
          coins: 0,
          diamonds: 0,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL || null,
        });
      }
      
      const profileData = profileDoc.exists() ? profileDoc.data() : {};
      const userProfile = {
        id: user.uid,
        email: user.email,
        name: profileData.name || user.displayName || 'User',
        role: profileData.role || 'student',
        photoURL: user.photoURL || profileData.photoURL,
        coins: profileData.coins || 0,
        diamonds: profileData.diamonds || 0,
        emailVerified: user.emailVerified,
      };
      
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      triggerCelebration();
      
      if (onLoginSuccess) onLoginSuccess(userProfile);
      if (onClose) onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
      let message = 'Google sign-in failed. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in was cancelled. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      }
      showAlert('error', 'Google Sign In Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      showAlert('error', 'Error', 'Email address required');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      showAlert('success', 'Reset Email Sent', `Check ${resetEmail} for reset link`);
    } catch (error) {
      let message = 'Could not send reset email.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      }
      showAlert('error', 'Reset Failed', message);
    } finally {
      setLoading(false);
    }
  };

  // Render role-specific fields
  const renderRoleFields = () => {
    if (role === 'student') {
      return (
        <div className="space-y-4">
          <FormInput 
            icon={Hash} 
            label="Matric Number" 
            name="matricNumber" 
            value={formData.matricNumber} 
            onChange={handleChange} 
            error={errors.matricNumber} 
            required 
            placeholder="e.g., 2021/123456"
          />
          <FormSelect 
            icon={School} 
            label="School/University" 
            options={universities} 
            value={formData.school} 
            onChange={(v) => handleSelect('school', v)} 
            error={errors.school} 
            required 
            placeholder="Select your school"
          />
          <FormSelect 
            icon={BookOpen} 
            label="Department" 
            options={departments} 
            value={formData.department} 
            onChange={(v) => handleSelect('department', v)} 
            error={errors.department} 
            required 
            placeholder="Select your department"
          />
          <FormSelect 
            icon={Target} 
            label="Current Level" 
            options={levels} 
            value={formData.level} 
            onChange={(v) => handleSelect('level', v)} 
            error={errors.level} 
            required 
            placeholder="Select your level"
          />
        </div>
      );
    }
    
    if (role === 'tutor') {
      return (
        <div className="space-y-4">
          <FormSelect 
            icon={Star} 
            label="Specialization" 
            options={specializations} 
            value={formData.specialization} 
            onChange={(v) => handleSelect('specialization', v)} 
            error={errors.specialization} 
            required 
            placeholder="Select your specialization"
          />
          <FormInput 
            icon={Calendar} 
            label="Years of Experience" 
            type="number" 
            name="yearsExperience" 
            value={formData.yearsExperience} 
            onChange={handleChange} 
            error={errors.yearsExperience} 
            required 
            placeholder="e.g., 3"
          />
          <FormInput 
            icon={CreditCard} 
            label="Hourly Rate (₦)" 
            type="number" 
            name="hourlyRate" 
            value={formData.hourlyRate} 
            onChange={handleChange} 
            placeholder="e.g., 5000"
          />
          <FormSelect 
            icon={Award} 
            label="Highest Qualification" 
            options={qualifications} 
            value={formData.qualification} 
            onChange={(v) => handleSelect('qualification', v)} 
            error={errors.qualification} 
            required 
            placeholder="Select your qualification"
          />
        </div>
      );
    }
    
    if (role === 'lecturer') {
      return (
        <div className="space-y-4">
          <FormInput 
            icon={Hash} 
            label="Staff ID" 
            name="staffId" 
            value={formData.staffId} 
            onChange={handleChange} 
            error={errors.staffId} 
            required 
            placeholder="e.g., UNN/STAFF/001"
          />
          <FormSelect 
            icon={School} 
            label="School/University" 
            options={universities} 
            value={formData.school} 
            onChange={(v) => handleSelect('school', v)} 
            error={errors.school} 
            required 
            placeholder="Select your institution"
          />
          <FormSelect 
            icon={Building2} 
            label="Faculty" 
            options={faculties} 
            value={formData.faculty} 
            onChange={(v) => handleSelect('faculty', v)} 
            error={errors.faculty} 
            required 
            placeholder="Select your faculty"
          />
          <FormSelect 
            icon={BookOpen} 
            label="Department" 
            options={departments} 
            value={formData.department} 
            onChange={(v) => handleSelect('department', v)} 
            placeholder="Select department (optional)"
          />
          <FormSelect 
            icon={Award} 
            label="Academic Rank" 
            options={ranks} 
            value={formData.academicRank} 
            onChange={(v) => handleSelect('academicRank', v)} 
            error={errors.academicRank} 
            required 
            placeholder="Select your rank"
          />
          <FormInput 
            icon={Calendar} 
            label="Years of Teaching" 
            type="number" 
            name="yearsTeaching" 
            value={formData.yearsTeaching} 
            onChange={handleChange} 
            error={errors.yearsTeaching} 
            required 
            placeholder="e.g., 5"
          />
          <FormInput 
            icon={Target} 
            label="Research Area" 
            name="researchArea" 
            value={formData.researchArea} 
            onChange={handleChange} 
            placeholder="e.g., Artificial Intelligence, Renewable Energy"
          />
        </div>
      );
    }
    
    return null;
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:scale-105 transition-all duration-200 z-50 border border-slate-200 dark:border-slate-700"
          aria-label="Close"
        >
          <X size={18} className="text-slate-700 dark:text-slate-300" />
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-3">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">WE CONNECT</h1>
          <p className="text-white/70 text-sm mt-1">Learn. Connect. Earn.</p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          {!showReset && (
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => { setIsLogin(true); setStep(1); }}
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
                onClick={() => { setIsLogin(false); setStep(1); setRole('student'); }}
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

          <div className="p-5 max-h-[60vh] overflow-y-auto">
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
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{alert.title}</p>
                      <p className="text-xs">{alert.message}</p>
                    </div>
                    <button onClick={clearAlert} className="p-0.5">
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset Password Form */}
            {showReset ? (
              <form onSubmit={handleReset} className="space-y-4">
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
                      onClick={() => { setResetSent(false); setResetEmail(''); }}
                      className="mt-4 text-indigo-600 hover:underline text-sm"
                    >
                      Try another email
                    </button>
                  </div>
                ) : (
                  <>
                    <FormInput
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
                      onClick={() => setShowReset(false)}
                      className="w-full text-center text-sm text-slate-500 hover:text-indigo-600 transition"
                    >
                      ← Back to Sign In
                    </button>
                  </>
                )}
              </form>
            ) : isLogin ? (
              // SIGN IN FORM
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  icon={Mail}
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                
                <PasswordInput
                  icon={Lock}
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setShowReset(true)}
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
                  onClick={handleGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <Chrome className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Google</span>
                </button>
                
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => { setIsLogin(false); setStep(1); setRole('student'); }} className="font-semibold text-indigo-600 hover:text-indigo-700">
                    Sign up
                  </button>
                </p>
              </form>
            ) : (
              // SIGN UP FORM
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">I am a</label>
                  <div className="grid grid-cols-3 gap-3">
                    <RoleCard
                      icon={GraduationCap}
                      label="Student"
                      isSelected={role === 'student'}
                      onClick={() => { setRole('student'); setStep(1); }}
                      color="indigo"
                    />
                    <RoleCard
                      icon={Briefcase}
                      label="Tutor"
                      isSelected={role === 'tutor'}
                      onClick={() => { setRole('tutor'); setStep(1); }}
                      color="purple"
                    />
                    <RoleCard
                      icon={Award}
                      label="Lecturer"
                      isSelected={role === 'lecturer'}
                      onClick={() => { setRole('lecturer'); setStep(1); }}
                      color="pink"
                    />
                  </div>
                </div>

                {/* Step 1: Common Fields */}
                {step === 1 && (
                  <>
                    <FormInput
                      icon={User}
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                      placeholder="Enter your full name"
                    />
                    <FormInput
                      icon={Mail}
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                      placeholder="you@example.com"
                    />
                    <PasswordInput
                      icon={Lock}
                      label="Password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      required
                    />
                    <PasswordInput
                      icon={Lock}
                      label="Confirm Password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      required
                    />
                    <FormInput
                      icon={Smartphone}
                      label="Phone Number (Optional)"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+234 123 456 7890"
                    />
                    <FormInput
                      icon={MapPin}
                      label="Address (Optional)"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Your address"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>
                  </>
                )}

                {/* Step 2: Role-Specific Fields */}
                {step === 2 && (
                  <>
                    {renderRoleFields()}
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
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
                {step === 1 && (
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
                      onClick={handleGoogle}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <Chrome className="w-5 h-5 text-red-600" />
                      <span className="font-medium">Google</span>
                    </button>
                    
                    <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                      Already have an account?{' '}
                      <button type="button" onClick={() => { setIsLogin(true); setStep(1); }} className="font-semibold text-indigo-600 hover:text-indigo-700">
                        Sign in
                      </button>
                    </p>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;