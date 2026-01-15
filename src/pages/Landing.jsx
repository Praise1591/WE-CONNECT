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

  // Stats counter animation
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Floating background elements with animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{ x: [0, -100, 0], y: [0, -50, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', delay: 2 }}
        />
      </div>

      {/* Hero */}
      <header className="relative pt-32 pb-40 px-6 md:px-12 lg:px-24 text-center">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="inline-block mb-6 px-6 py-2 bg-indigo-100/80 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-300 font-medium text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ShieldCheck className="inline mr-2" size={16} />
            Trusted by students & educators across Nigeria
          </motion.div>
            
          <motion.h1 
            className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl inline-flex mr-4 align-middle">
              <Zap className="w-12 h-12 text-white" />
            </div>
            WE CONNECT
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Learn Smarter Together
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            The collaborative platform where Nigerian students and lecturers share past questions, lecture notes, video tutorials, and technical reviews — all in one trusted place.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button
              onClick={() => openAuth('signup')}
              className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-indigo-500/40 transition-all hover:scale-105 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Get Started Free
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>

            <button
              onClick={() => openAuth('login')}
              className="px-10 py-5 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-semibold text-lg rounded-2xl hover:bg-white/20 transition-all"
            >
              Log In
            </button>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center text-slate-900 dark:text-white mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Designed for Academic Excellence
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ScrollText, color: 'amber', title: 'Past Questions', desc: 'Real past exam papers from Nigerian universities' },
              { icon: FileText, color: 'blue', title: 'PDF Notes', desc: 'Well-structured lecture summaries and handouts' },
              { icon: Video, color: 'purple', title: 'Video Tutorials', desc: 'Clear explanations and recorded lectures' },
              { icon: BookOpen, color: 'emerald', title: 'Technical Reviews', desc: 'In-depth analyses and advanced guides' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 hover:-translate-y-2"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  <item.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-20 px-6 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Growing Strong with Our Community
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12">
            <motion.div 
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-10 rounded-2xl border border-slate-200/50 dark:border-slate-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4 counter" data-target="15000">0</div>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">Materials Shared</p>
            </motion.div>

            <motion.div 
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-10 rounded-2xl border border-slate-200/50 dark:border-slate-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-6xl font-extrabold text-purple-600 dark:text-purple-400 mb-4 counter" data-target="70">0</div>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">Institutions</p>
            </motion.div>

            <motion.div 
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md p-10 rounded-2xl border border-slate-200/50 dark:border-slate-700/50"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="text-6xl font-extrabold text-pink-600 dark:text-pink-400 mb-4">4.9<span className="text-3xl">/5</span></div>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">Community Rating</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] -z-10" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Start Your Journey Today
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join thousands already sharing and accessing quality educational materials.
          </motion.p>
          <motion.button
            onClick={() => openAuth('signup')}
            className="px-12 py-6 bg-white text-indigo-700 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Create Free Account
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
        <p>© {new Date().getFullYear()} WE CONNECT • Built with ❤️ in Port Harcourt, Nigeria</p>
        <div className="mt-4 flex justify-center gap-8 text-sm">
          <button onClick={() => setShowPrivacyModal(true)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Privacy Policy
          </button>
          <button onClick={() => setShowTermsModal(true)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Terms of Service
          </button>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Us</a>
        </div>
      </footer>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-800 shadow-2xl p-8"
            >
              <button
                onClick={closePrivacy}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-all shadow-lg"
              >
                <X size={24} className="text-slate-700 dark:text-slate-300" />
              </button>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Privacy Policy
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                At WE CONNECT, we value your privacy. This policy explains how we collect, use, and protect your personal information.
              </p>
              <ul className="list-disc pl-6 space-y-4 text-slate-700 dark:text-slate-300">
                <li>We collect basic information like name, email, and school details during registration to provide personalized services.</li>
                <li>Your uploaded materials are stored securely and only shared with your permission.</li>
                <li>We use cookies for session management and analytics to improve the platform.</li>
                <li>We do not share your data with third parties without consent, except for legal requirements.</li>
                <li>You can request data deletion at any time via settings.</li>
              </ul>
              <p className="mt-6 text-slate-700 dark:text-slate-300">
                For full details, please contact us at support@weconnect.ng. Last updated: January 2026.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-800 shadow-2xl p-8"
            >
              <button
                onClick={closeTerms}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 transition-all shadow-lg"
              >
                <X size={24} className="text-slate-700 dark:text-slate-300" />
              </button>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                Terms of Service
              </h2>
              <p className="text-slate-700 dark:text-slate-300 mb-4">
                By using WE CONNECT, you agree to these terms. Please read carefully.
              </p>
              <ul className="list-disc pl-6 space-y-4 text-slate-700 dark:text-slate-300">
                <li>You must be at least 13 years old to use the platform.</li>
                <li>All uploaded materials must be your own or have permission to share.</li>
                <li>We are not responsible for the accuracy of shared content.</li>
                <li>Prohibited: Illegal content, spam, harassment.</li>
                <li>We may terminate accounts for violations.</li>
                <li>Services are provided "as is" without warranties.</li>
              </ul>
              <p className="mt-6 text-slate-700 dark:text-slate-300">
                For full terms, contact support@weconnect.ng. Last updated: January 2026.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
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