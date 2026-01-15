// AuthForm.jsx — Fixed "Processing" & Integrated Social Sign-In with Firebase
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
import { 
  auth, 
  db, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider, // For Apple
  signInWithPopup,
  doc,
  setDoc 
} from "@/firebase";

function AuthForm({ initialMode = 'login', onClose, onLoginSuccess }) {
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

    try {
      let userCredential;
      if (!isLogin) {
        if (!gender) {
          toast.error('Please select your gender');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }

        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: formData.name,
          email: formData.email,
          role,
          gender: gender.value,
          matricNumber: formData.matricNumber || null,
          school: formData.school || null,
          faculty: formData.faculty || null,
          department: formData.department || null,
          specialization: formData.specialization || null,
          yearsExperience: formData.yearsExperience || null,
          title: formData.title || null,
          yearsTeaching: formData.yearsTeaching || null,
          phone: formData.phone || null,
          address: formData.address || null,
          coins: 0,
          diamonds: 0,
          createdAt: new Date(),
        });

        toast.success('Account created! Welcome to WE CONNECT 🎉');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast.success('Welcome back!');
      }

      // Save profile to localStorage
      const user = userCredential.user;
      localStorage.setItem('userProfile', JSON.stringify({
        uid: user.uid,
        name: formData.name || user.displayName || 'User',
        email: formData.email || user.email,
        role,
        school: formData.school,
        specialization: formData.specialization,
        // Add other fields as needed
      }));

      // Trigger updates
      window.dispatchEvent(new CustomEvent('userLoggedIn'));

      // Close modal and trigger success
      onClose?.();
      onLoginSuccess?.();

    } catch (error) {
      console.error(error);
      let message = 'Something went wrong';
      if (error.code === 'auth/email-already-in-use') message = 'Email already registered. Try logging in.';
      if (error.code === 'auth/weak-password') message = 'Password should be at least 6 characters';
      if (error.code === 'auth/invalid-email') message = 'Invalid email address';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') message = 'Invalid email or password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Social Sign-In Functions
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if new user — if so, prompt for additional info (role, etc.) via separate form or default
      // For simplicity, default to student
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'student',
        gender: null, // Can prompt later
        coins: 0,
        diamonds: 0,
        createdAt: new Date(),
      }, { merge: true });

      localStorage.setItem('userProfile', JSON.stringify({
        name: user.displayName,
        email: user.email,
        role: 'student',
      }));

      toast.success('Signed in with Google!');
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      onClose?.();
      onLoginSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        role: 'student',
        gender: null,
        coins: 0,
        diamonds: 0,
        createdAt: new Date(),
      }, { merge: true });

      localStorage.setItem('userProfile', JSON.stringify({
        name: user.displayName,
        email: user.email,
        role: 'student',
      }));

      toast.success('Signed in with Facebook!');
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      onClose?.();
      onLoginSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Facebook sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName || 'Apple User',
        email: user.email,
        role: 'student',
        gender: null,
        coins: 0,
        diamonds: 0,
        createdAt: new Date(),
      }, { merge: true });

      localStorage.setItem('userProfile', JSON.stringify({
        name: user.displayName || 'Apple User',
        email: user.email,
        role: 'student',
      }));

      toast.success('Signed in with Apple!');
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      onClose?.();
      onLoginSuccess?.();
    } catch (error) {
      toast.error(error.message || 'Apple sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => setIsLogin(!isLogin);

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

              {!isLogin && (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required
                  className="md:col-span-2 px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              )}

              {!isLogin && role === 'student' && (
                <>
                  <input type="text" name="matricNumber" value={formData.matricNumber} onChange={handleInputChange} placeholder="Matric Number" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="school" value={formData.school} onChange={handleInputChange} placeholder="University" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="faculty" value={formData.faculty} onChange={handleInputChange} placeholder="Faculty" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </>
              )}

              {!isLogin && role === 'tutor' && (
                <>
                  <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="Specialization" required className="md:col-span-2 px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleInputChange} placeholder="Years of Experience" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </>
              )}

              {!isLogin && role === 'lecturer' && (
                <>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Academic Title" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="school" value={formData.school} onChange={handleInputChange} placeholder="University" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                  <input type="number" name="yearsTeaching" value={formData.yearsTeaching} onChange={handleInputChange} placeholder="Years of Teaching" required className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </>
              )}

              {!isLogin && (
                <div className="md:col-span-2">
                  <Select
                    options={genderOptions}
                    value={gender}
                    onChange={setGender}
                    placeholder="Select Gender"
                    classNamePrefix="react-select"
                  />
                </div>
              )}

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

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 group disabled:opacity-70"
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  {!loading && <ArrowRight className="w-7 h-7 group-hover:translate-x-3 transition-transform" />}
                </button>
              </div>
            </form>

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

            <div className="grid grid-cols-3 gap-4">
              <button onClick={handleGoogleSignIn} className="flex items-center justify-center gap-3 py-4 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Chrome size={24} />
                <span className="font-medium">Google</span>
              </button>
              <button onClick={handleAppleSignIn} className="flex items-center justify-center gap-3 py-4 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Apple size={24} />
                <span className="font-medium">Apple</span>
              </button>
              <button onClick={handleFacebookSignIn} className="flex items-center justify-center gap-3 py-4 border border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <Facebook size={24} />
                <span className="font-medium">Facebook</span>
              </button>
            </div>

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