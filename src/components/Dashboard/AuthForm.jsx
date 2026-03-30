// components/Dashboard/AuthForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, 
  Briefcase, Award, X, Chrome, Phone, Home, KeyRound, CheckCircle, AlertCircle
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
  const [navigationInProgress, setNavigationInProgress] = useState(false);
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

  // Improved navigation handler with state management
  const handleSuccessfulLogin = (userProfile) => {
    console.log("[Navigation] Starting post-login navigation process");
    console.log("[Navigation] User profile:", userProfile);
    
    // Prevent multiple navigation attempts
    if (navigationInProgress) {
      console.log("[Navigation] Navigation already in progress, skipping");
      return;
    }
    
    setNavigationInProgress(true);
    
    try {
      // Save to localStorage with timestamp for validation
      const profileWithTimestamp = {
        ...userProfile,
        lastLogin: Date.now(),
        isLoggedIn: true
      };
      localStorage.setItem('userProfile', JSON.stringify(profileWithTimestamp));
      console.log("[Navigation] Profile saved to localStorage with timestamp");
      
      // Dispatch custom event for real-time updates
      const loginEvent = new CustomEvent('userLoggedIn', { 
        detail: profileWithTimestamp,
        bubbles: true 
      });
      window.dispatchEvent(loginEvent);
      console.log("[Navigation] UserLoggedIn event dispatched");
      
      // Show success message
      toast.success(`Welcome back, ${userProfile.name || 'User'}!`, {
        duration: 3000,
        icon: '🎉',
      });
      
      // Close modal if provided
      if (onClose && typeof onClose === 'function') {
        console.log("[Navigation] Closing modal");
        onClose();
      }
      
      // Call onLoginSuccess callback if provided
      if (onLoginSuccess && typeof onLoginSuccess === 'function') {
        console.log("[Navigation] Calling onLoginSuccess callback");
        onLoginSuccess(userProfile);
      }
      
      // Navigate with a slight delay to ensure modal closes and state updates
      setTimeout(() => {
        console.log("[Navigation] Attempting to navigate to /dashboard");
        
        try {
          // Use React Router navigation
          navigate('/dashboard', { 
            replace: true,
            state: { 
              fromLogin: true, 
              userProfile: userProfile,
              timestamp: Date.now()
            }
          });
          console.log("[Navigation] React Router navigation successful");
          
          // Force a final check - if still on same page after 1 second, try hard navigation
          setTimeout(() => {
            if (window.location.pathname !== '/dashboard') {
              console.log("[Navigation] React Router navigation didn't update URL, using hard navigation");
              window.location.href = '/dashboard';
            }
            setNavigationInProgress(false);
          }, 1000);
          
        } catch (navError) {
          console.error("[Navigation] Navigation error:", navError);
          // Fallback to hard navigation
          window.location.href = '/dashboard';
          setNavigationInProgress(false);
        }
      }, 300);
      
    } catch (error) {
      console.error("[Navigation] Error in handleSuccessfulLogin:", error);
      setNavigationInProgress(false);
      toast.error("Login successful but navigation failed. Please refresh the page.");
      
      // Last resort fallback
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading || navigationInProgress) return;
    
    setLoading(true);
    try {
      console.log("[Google] Attempting Google sign in...");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      console.log("[Google] Signed in successfully:", user.uid);
      console.log("[Google] Email verified:", user.emailVerified);

      const profileRef = doc(db, 'profiles', user.uid);
      const profileDoc = await getDoc(profileRef);

      let userProfile;

      if (!profileDoc.exists()) {
        console.log("[Google] Creating new profile");
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
        console.log("[Google] Profile created");
        
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
        console.log("[Google] Profile exists, fetching data");
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

      console.log("[Google] User profile prepared:", userProfile);
      handleSuccessfulLogin(userProfile);

    } catch (error) {
      console.error("[GOOGLE AUTH ERROR]", error);
      let message = 'Google sign-in failed. Please try again.';
      if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Popup was blocked. Please allow popups for this site.';
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Password reset handler with detailed logging
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    const email = resetEmail.trim();
    console.log("[Password Reset] Attempting to send reset email to:", email);
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      console.log("[Password Reset] Calling Firebase sendPasswordResetEmail...");
      await sendPasswordResetEmail(auth, email);
      console.log("[Password Reset] Reset email sent successfully");
      
      setResetSent(true);
      toast.success('Password reset email sent! Check your inbox and spam folder.');
      
      toast('If you don\'t see the email, please check your spam/junk folder', {
        duration: 5000,
        icon: '📧',
      });
      
    } catch (error) {
      console.error("[PASSWORD RESET ERROR] Full error:", error);
      console.error("[PASSWORD RESET ERROR] Error code:", error.code);
      console.error("[PASSWORD RESET ERROR] Error message:", error.message);
      
      let message = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No account found with this email address. Please check the email or sign up first.';
          break;
        case 'auth/invalid-email':
          message = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          message = 'Too many attempts. Please wait a few minutes before trying again.';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Please check your internet connection.';
          break;
        case 'auth/configuration-not-found':
          message = 'Email/password sign-in is not enabled. Please contact support.';
          break;
        default:
          message = error.message || 'Failed to send reset email. Please try again later.';
      }
      
      toast.error(message, {
        duration: 5000,
      });
      
    } finally {
      setLoading(false);
    }
  };

  // Test password reset configuration
  const testPasswordReset = async () => {
    console.log("[Password Reset Test] Checking Firebase configuration...");
    try {
      const currentUser = auth.currentUser;
      console.log("[Password Reset Test] Auth instance:", !!auth);
      console.log("[Password Reset Test] Current user:", currentUser?.email || 'Not logged in');
      
      const testEmail = resetEmail.trim();
      if (!testEmail) {
        toast.error('Please enter an email address to test');
        return;
      }
      
      console.log("[Password Reset Test] Attempting test send to:", testEmail);
      await sendPasswordResetEmail(auth, testEmail);
      console.log("[Password Reset Test] Test email sent successfully!");
      toast.success(`Test email sent to ${testEmail}! Check if you received it.`);
    } catch (error) {
      console.error("[Password Reset Test] Error:", error);
      toast.error(`Test failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading || navigationInProgress) return;
    
    setLoading(true);

    try {
      const email = formData.email.trim();
      const password = formData.password.trim();

      console.log("[Auth] Form submitted, isLogin:", isLogin);
      console.log("[Auth] Email:", email);

      if (!email) throw new Error("Please enter your email address");
      if (!password) throw new Error("Password is required");

      let userCredential;

      if (!isLogin) {
        // SIGNUP FLOW
        console.log("[Signup] Starting signup process");
        
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        console.log("[Signup] Creating user account...");
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log("[Signup] Account created successfully:", user.uid);

        // Send email verification
        console.log("[Signup] Sending verification email...");
        await sendEmailVerification(user);
        console.log("[Signup] Verification email sent");

        // Create profile in 'profiles' collection
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

        console.log("[Signup] Saving profile to Firestore...");
        const profileRef = doc(db, 'profiles', user.uid);
        await setDoc(profileRef, profileData);
        console.log("[Signup] Profile saved");

        const basicProfile = {
          id: user.uid,
          email: user.email,
          name: formData.name.trim() || 'User',
          role: role,
          photoURL: user.photoURL || null,
          coins: 0,
          diamonds: 0,
          emailVerified: false,
        };
        
        localStorage.setItem('userProfile', JSON.stringify(basicProfile));
        console.log("[Signup] Profile saved to localStorage");

        toast.success('Account created! Please verify your email address to continue.');
        toast.success('Check your inbox for verification link');
        
        if (onClose && typeof onClose === 'function') onClose();
        
        setTimeout(() => {
          console.log("[Signup] Redirecting to home after signup");
          navigate('/', { replace: true });
        }, 3000);
        
      } else {
        // LOGIN FLOW
        console.log("[Login] Starting login process");
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("[Login] Signed in successfully:", user.uid);
        console.log("[Login] Email verified:", user.emailVerified);
        
        // Check if email is verified
        await user.reload();
        
        if (!user.emailVerified) {
          console.log("[Login] Email not verified - blocking login");
          toast.error('Please verify your email address before logging in. Check your inbox for the verification link.');
          toast('Need a new verification email? Use the "Forgot Password" option to resend.', {
            duration: 5000,
            icon: '📧',
          });
          setLoading(false);
          return;
        }
        
        console.log("[Login] Email verified, fetching profile...");
        
        // Fetch profile from Firestore
        const profileRef = doc(db, 'profiles', user.uid);
        const profileDoc = await getDoc(profileRef);
        
        console.log("[Login] Profile exists:", profileDoc.exists());
        
        let userProfile;
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          console.log("[Login] Profile data retrieved:", profileData);
          
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
          
          // Update emailVerified status in Firestore
          await setDoc(profileRef, { emailVerified: user.emailVerified }, { merge: true });
          console.log("[Login] Updated Firestore with emailVerified status");
        } else {
          console.log("[Login] Profile doesn't exist, creating default profile");
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
        
        console.log("[Login] User profile prepared:", userProfile);
        
        // Handle successful login with navigation
        handleSuccessfulLogin(userProfile);
      }

    } catch (error) {
      console.error("[AUTH ERROR]", error);
      let message = 'An error occurred. Please try again.';
      
      if (error.code === 'auth/network-request-failed') {
        message = 'Network error. Please check your internet connection and try again.';
      } else {
        switch (error.code) {
          case 'permission-denied':
            message = 'Permission denied – check Firestore security rules';
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
          default:
            message = error.message || 'Network or server issue – please check your connection.';
        }
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

  // Test navigation function for debugging
  const testNavigation = () => {
    console.log("[Test] Testing navigation directly...");
    const testProfile = {
      id: 'test',
      email: 'test@example.com',
      name: 'Test User',
      role: 'student',
      coins: 0,
      diamonds: 0,
      emailVerified: true,
    };
    handleSuccessfulLogin(testProfile);
  };

  return (
    <div className="relative bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full border border-indigo-100/40 dark:border-indigo-900/30">
      
      {/* Header - Mobile Optimized */}
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

      {/* Content - Mobile Optimized with max height */}
      <div className="p-4 sm:p-6 md:p-10 lg:p-12 space-y-6 sm:space-y-10 max-h-[70vh] sm:max-h-[76vh] overflow-y-auto">
        
        {showResetPassword ? (
          // Password Reset Form
          <form onSubmit={handlePasswordReset} className="space-y-5 sm:space-y-7">
            {resetSent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
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
                  <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="relative z-10">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </span>
                </motion.button>

                {/* Test button for debugging */}
                <button
                  type="button"
                  onClick={testPasswordReset}
                  className="w-full py-2 text-center text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Test Email Configuration
                </button>

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
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                  
                  {/* Test button for debugging navigation */}
                  <button
                    type="button"
                    onClick={testNavigation}
                    className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    Test Nav
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || navigationInProgress}
                className="w-full py-3 sm:py-4 md:py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'Processing…' : (navigationInProgress ? 'Redirecting...' : (isLogin ? 'Sign In' : 'Create Free Account'))}
                  {!loading && !navigationInProgress && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />}
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
                disabled={loading || navigationInProgress}
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