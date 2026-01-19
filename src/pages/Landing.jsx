// src/pages/Landing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import AuthForm from '../components/Dashboard/AuthForm';

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
      {/* Floating background elements with subtle logo pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-15 dark:opacity-5">
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: "url('/weconnect-logo.png')",
            backgroundSize: "200px",
            backgroundRepeat: "repeat",
            backgroundPosition: "center",
            opacity: 0.2
          }}
        />
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
            className="inline-block mb-8 px-6 py-3 bg-indigo-100/80 dark:bg-indigo-900/40 backdrop-blur-sm rounded-2xl text-indigo-700 dark:text-indigo-300 font-semibold text-base shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShieldCheck className="inline mr-2" size={18} />
            Trusted by students & educators across Nigeria
          </motion.div>
            
          {/* Professional Logo Section - Side-by-side Icon + Wordmark */}
          <motion.div 
            className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-12"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Logo Icon - Enhanced with glow & shine effect */}
            <motion.div 
              className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 flex-shrink-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/50 dark:border-slate-800/50"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
              style={{
                boxShadow: '0 0 40px rgba(99, 102, 241, 0.4), 0 20px 40px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Zap className="w-14 h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 text-white drop-shadow-lg" />
            </motion.div>

            {/* Wordmark + Tagline - Vertical stack for perfect alignment */}
            <div className="text-left md:text-center max-w-md">
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-slate-800 via-indigo-600 to-purple-700 dark:from-white dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent leading-tight drop-shadow-2xl"
              >
                WE CONNECT
              </h1>
              <p 
                className="mt-2 text-2xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent leading-tight"
              >
                Learn Smarter Together
              </p>
            </div>
          </motion.div>

          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            The collaborative platform where Nigerian students and lecturers share past questions, lecture notes, video tutorials, and technical reviews — all in one trusted place.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openAuth('signup')}
              className="group relative px-10 py-5 md:px-12 md:py-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-lg md:text-xl rounded-3xl shadow-2xl hover:shadow-3xl hover:shadow-indigo-500/50 transition-all overflow-hidden border-0"
            >
              <span className="relative z-10 flex items-center gap-3">
                Get Started Free
                <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" size={20} />
              </span>
              <motion.span 
                className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 -skew-x-3 scale-x-0 group-hover:scale-x-100 origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => openAuth('login')}
              className="px-10 py-5 md:px-12 md:py-6 bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white font-semibold text-lg md:text-xl rounded-3xl hover:bg-white/30 hover:border-white/50 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              Log In
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-slate-900 dark:text-white mb-20 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent pb-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
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
                className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-3xl transition-all duration-500 border border-slate-200/60 dark:border-slate-700/60 hover:border-purple-200/60 hover:-translate-y-4 hover:bg-white/90 dark:hover:bg-slate-800/90"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl group-hover:shadow-purple-500/25`}>
                  <item.icon size={36} className="drop-shadow-lg" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6 text-center leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center text-lg leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-24 md:py-32 px-6 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:to-purple-950/40">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-20 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Growing Strong with Our Community
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <motion.div 
              className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-10 md:p-12 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300/70 shadow-2xl hover:shadow-3xl hover:shadow-indigo-500/30 transition-all duration-500 hover:-translate-y-2"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="text-6xl md:text-7xl lg:text-8xl font-black text-indigo-600 dark:text-indigo-400 mb-6 counter group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" data-target="15000">0</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">Materials Shared</p>
            </motion.div>

            <motion.div 
              className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-10 md:p-12 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:border-purple-300/70 shadow-2xl hover:shadow-3xl hover:shadow-purple-500/30 transition-all duration-500 hover:-translate-y-2"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-6xl md:text-7xl lg:text-8xl font-black text-purple-600 dark:text-purple-400 mb-6 counter group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" data-target="70">0</div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">Institutions</p>
            </motion.div>

            <motion.div 
              className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-10 md:p-12 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:border-pink-300/70 shadow-2xl hover:shadow-3xl hover:shadow-pink-500/30 transition-all duration-500 hover:-translate-y-2"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-6xl md:text-7xl lg:text-8xl font-black text-pink-600 dark:text-pink-400 mb-6">4.9<span className="text-4xl md:text-5xl">/5</span></div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">Community Rating</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 md:py-40 px-6 text-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/weconnect-logo.png')] bg-[length:300px] bg-repeat opacity-5 mix-blend-multiply animate-pulse" />
        <div className="absolute inset-0 bg-grid-white/[0.08] -z-10" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent drop-shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Start Your Journey Today
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl mx-auto opacity-95 leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Join thousands already sharing and accessing quality educational materials.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openAuth('signup')}
            className="px-12 md:px-16 py-6 md:py-8 bg-white text-indigo-700 font-black text-xl md:text-2xl rounded-3xl shadow-2xl hover:shadow-white/50 hover:shadow-3xl transition-all duration-300 border-0 tracking-wide"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Create Free Account
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 text-center text-slate-600 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <p className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white">
            © {new Date().getFullYear()} WE CONNECT • Built with ❤️ in Port Harcourt, Nigeria
          </p>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-8 text-sm md:text-base">
          <button onClick={() => setShowPrivacyModal(true)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 font-medium hover:underline">
            Privacy Policy
          </button>
          <button onClick={() => setShowTermsModal(true)} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 font-medium hover:underline">
            Terms of Service
          </button>
          <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300 font-medium hover:underline">Contact Us</a>
        </div>
      </footer>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-3xl shadow-3xl border border-white/30 dark:border-slate-700/50 p-10 md:p-12"
            >
              <button
                onClick={closePrivacy}
                className="absolute top-6 right-6 p-3 rounded-2xl bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <X size={24} className="text-slate-700 dark:text-slate-300" />
              </button>

              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Privacy Policy
              </h2>
              <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="mb-6 text-lg">At WE CONNECT, we value your privacy. This policy explains how we collect, use, and protect your personal information.</p>
                <ul className="list-disc pl-8 space-y-4 mb-8 text-lg">
                  <li>We collect basic information like name, email, and school details during registration to provide personalized services.</li>
                  <li>Your uploaded materials are stored securely and only shared with your permission.</li>
                  <li>We use cookies for session management and analytics to improve the platform.</li>
                  <li>We do not share your data with third parties without consent, except for legal requirements.</li>
                  <li>You can request data deletion at any time via settings.</li>
                </ul>
                <p className="text-lg opacity-90">
                  For full details, please contact us at <a href="mailto:support@weconnect.ng" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">support@weconnect.ng</a>. Last updated: January 2026.
                </p>
              </div>
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
            className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-3xl shadow-3xl border border-white/30 dark:border-slate-700/50 p-10 md:p-12"
            >
              <button
                onClick={closeTerms}
                className="absolute top-6 right-6 p-3 rounded-2xl bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <X size={24} className="text-slate-700 dark:text-slate-300" />
              </button>

              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Terms of Service
              </h2>
              <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="mb-6 text-lg">By using WE CONNECT, you agree to these terms. Please read carefully.</p>
                <ul className="list-disc pl-8 space-y-4 mb-8 text-lg">
                  <li>You must be at least 13 years old to use the platform.</li>
                  <li>All uploaded materials must be your own or have permission to share.</li>
                  <li>We are not responsible for the accuracy of shared content.</li>
                  <li>Prohibited: Illegal content, spam, harassment.</li>
                  <li>We may terminate accounts for violations.</li>
                  <li>Services are provided "as is" without warranties.</li>
                </ul>
                <p className="text-lg opacity-90">
                  For full terms, contact <a href="mailto:support@weconnect.ng" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">support@weconnect.ng</a>. Last updated: January 2026.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-3xl shadow-3xl border border-white/40 dark:border-slate-700/60">
            <button
              onClick={closeAuth}
              className="absolute top-6 right-6 z-10 p-3 rounded-2xl bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              <X size={24} className="text-slate-700 dark:text-slate-300" />
            </button>
            <div className="pt-20 pb-12 px-8 md:px-12">
              <AuthForm 
                initialMode={authMode}
                onClose={closeAuth}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}