// src/pages/Landing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // New dependency for "crazy" animations - install with npm install framer-motion
import { 
  GraduationCap, 
  BookOpen, 
  Video, 
  FileText, 
  ScrollText, 
  ArrowRight,
  CheckCircle2,
  Users,
  ShieldCheck,
  X,
  Zap
} from 'lucide-react';
import AuthForm from '../components/Dashboard/AuthForm'; // Adjust path if needed

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const statsRef = useRef(null);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuth = () => setShowAuthModal(false);
  const closePrivacy = () => setShowPrivacyModal(false);
  const closeTerms = () => setShowTermsModal(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const counters = document.querySelectorAll('.counter');
          counters.forEach(counter => {
            const updateCount = () => {
              const target = +counter.getAttribute('data-target');
              const count = +counter.innerText;
              const increment = target / 100;
              if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 20);
              } else {
                counter.innerText = target;
              }
            };
            updateCount();
          });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* Hero Section with Integrated Logo */}
      <section className="relative py-20 px-4 md:px-8 lg:px-16 xl:px-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-900/30 dark:to-purple-900/30 backdrop-blur-sm" />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.img
            src="https://files.catbox.moe/xyz789.png" // Your favorite logo URL - replace if hosted locally
            alt="WE CONNECT Logo"
            className="mx-auto h-32 md:h-48 w-auto mb-8 drop-shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Learn Smarter Together
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed opacity-90"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            The collaborative platform where Nigerian students and lecturers share past questions, lecture notes, video tutorials, and technical reviews — all in one trusted place.
          </motion.p>
          <motion.div
            className="flex flex-col md:flex-row justify-center gap-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <button
              onClick={() => openAuth('signup')}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 group"
            >
              Get Started Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <button
              onClick={() => openAuth('login')}
              className="px-10 py-5 bg-transparent border-2 border-blue-600 text-blue-600 dark:border-purple-500 dark:text-purple-500 font-bold text-lg rounded-xl hover:bg-blue-600/10 dark:hover:bg-purple-500/10 transition-all duration-300"
            >
              Log In
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Enhanced with professional cards */}
      <section className="py-24 px-4 md:px-8 lg:px-16 xl:px-32 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Why Choose WE CONNECT?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: GraduationCap, title: 'Connect with Experts', desc: 'Collaborate with lecturers and tutors across Nigeria.' },
              { icon: BookOpen, title: 'Share Resources', desc: 'Upload and download lecture notes, past questions, and more.' },
              { icon: Video, title: 'Video Tutorials', desc: 'Access high-quality video content for better understanding.' },
              { icon: FileText, title: 'Technical Reviews', desc: 'Get insights on technical topics from peers and experts.' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-purple-500"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <feature.icon className="w-12 h-12 mb-4 text-blue-600 dark:text-purple-400" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced with gradients and animations */}
      <section ref={statsRef} className="py-24 px-4 md:px-8 lg:px-16 xl:px-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            { icon: Users, value: 10000, label: 'Active Users' },
            { icon: FileText, value: 5000, label: 'Resources Shared' },
            { icon: ShieldCheck, value: 99.9, label: 'Uptime' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <stat.icon className="w-16 h-16 mx-auto mb-4 text-blue-600 dark:text-purple-400" />
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <span className="counter" data-target={stat.value}>0</span>{stat.label.includes('Uptime') ? '%' : '+'}
              </div>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section - More professional with gradient callout */}
      <section className="py-24 px-4 md:px-8 lg:px-16 xl:px-32 text-center bg-gradient-to-r from-indigo-700 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Ready to Connect and Learn?
          </motion.h2>
          <motion.p
            className="text-xl mb-10 opacity-90"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join thousands of Nigerian students and lecturers today. It's free and easy!
          </motion.p>
          <motion.button
            onClick={() => openAuth('signup')}
            className="px-10 py-5 bg-white text-purple-600 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-4 group mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Get Started Free
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* Footer - With Logo */}
      <footer className="py-12 px-4 md:px-8 lg:px-16 xl:px-32 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <img 
              src="https://files.catbox.moe/xyz789.png" // Your logo URL
              alt="WE CONNECT Logo"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold text-blue-600 dark:text-purple-400">WE CONNECT</span>
          </div>
          <div className="flex gap-6 text-sm">
            <button onClick={() => setShowPrivacyModal(true)} className="hover:underline">Privacy Policy</button>
            <button onClick={() => setShowTermsModal(true)} className="hover:underline">Terms of Service</button>
            <a href="mailto:support@weconnect.ng" className="hover:underline">Contact Us</a>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} WE CONNECT. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Privacy Modal (unchanged) */}
      {showPrivacyModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-h-[80vh] overflow-y-auto"
            >
              <button onClick={closePrivacy} className="absolute top-4 right-4">
                <X size={24} />
              </button>
              <h2 className="text-3xl font-bold mb-6">Privacy Policy</h2>
              <p className="text-lg leading-relaxed">
                Your privacy is important to us. WE CONNECT collects minimal data for account creation and resource sharing. We never share your personal information with third parties without consent. All uploaded content is protected and only visible to authorized users. For full privacy policy, contact support@weconnect.ng. Last updated: January 2026.
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Terms Modal (unchanged) */}
      {showTermsModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-h-[80vh] overflow-y-auto"
            >
              <button onClick={closeTerms} className="absolute top-4 right-4">
                <X size={24} />
              </button>
              <h2 className="text-3xl font-bold mb-6">Terms of Service</h2>
              <p className="text-lg leading-relaxed">
                By using WE CONNECT, you agree to our terms. Users must be 13+ years old. Content uploaded must be original or properly attributed. No spam, harassment, or illegal activities. We reserve the right to moderate content. For full terms, contact support@weconnect.ng. Last updated: January 2026.
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Auth Modal (unchanged) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-800 shadow-2xl">
            <button
              onClick={closeAuth}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-all shadow-lg"
            >
              <X size={24} className="text-slate-700 dark:text-slate-300" />
            </button>
            <AuthForm 
              initialMode={authMode}
              onClose={closeAuth}
            />
          </div>
        </div>
      )}
    </div>
  );
}