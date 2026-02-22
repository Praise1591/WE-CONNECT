// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';

// Optimized Motion imports: LazyMotion + m alias for smaller bundle (~4-5 KB initial)
// useReducedMotion for accessibility/perf + useInView for scroll-triggered counters
import {
  LazyMotion,
  domAnimation,
  m as motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from 'motion/react';

import {
  GraduationCap,
  BookOpen,
  Video,
  FileText,
  UploadCloud,
  DollarSign,
  Users,
  ShieldCheck,
  Search,
  MessageCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import AuthForm from '../components/Dashboard/AuthForm';

// Simple throttle utility (no external deps needed)
function useThrottle(value, limit) {
  const [throttled, setThrottled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setThrottled(value), limit);
    return () => clearTimeout(timer);
  }, [value, limit]);

  return throttled;
}

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const shouldReduceMotion = useReducedMotion(); // respects prefers-reduced-motion

  // Mouse position – throttled to ~12 updates/sec (80ms) → big perf win
  const [rawMouse, setRawMouse] = useState({ x: 0, y: 0 });
  const mouse = useThrottle(rawMouse, 80);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRawMouse({ x: x * 2, y: y * 2 });
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuth = () => setShowAuthModal(false);
  const closePrivacy = () => setShowPrivacyModal(false);
  const closeTerms = () => setShowTermsModal(false);

  // Stats section ref + inView trigger
  const statsRef = React.useRef(null);
  const isInView = useInView(statsRef, { once: true, margin: '-100px' });

  // Counter logic – only run once when in view
  useEffect(() => {
    if (!isInView) return;

    document.querySelectorAll('.counter').forEach((counter) => {
      const target = +counter.getAttribute('data-target');
      let count = +counter.innerText || 0;
      const increment = target / 100;
      const update = () => {
        count += increment;
        counter.innerText = Math.ceil(count);
        if (count < target) {
          requestAnimationFrame(update); // smoother than setTimeout
        } else {
          counter.innerText = target.toLocaleString();
        }
      };
      update();
    });
  }, [isInView]);

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
        onMouseMove={handleMouseMove}
      >
        {/* Background layers – reduced when prefers-reduced-motion */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0"
            style={{
              perspective: '1600px',
              perspectiveOrigin: '50% 40%',
              willChange: 'transform', // GPU hint
            }}
            animate={{
              rotateX: shouldReduceMotion ? 0 : mouse.y * 3,
              rotateY: shouldReduceMotion ? 0 : mouse.x * -5,
            }}
            transition={{ type: 'spring', stiffness: 90, damping: 40 }}
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "url('/weconnect-logo.png')",
                backgroundSize: '500px',
                backgroundRepeat: 'repeat',
                filter: 'blur(4px) brightness(1.5)',
                transform: 'translateZ(-900px) scale(1.25)',
              }}
            />

            {Array.from({ length: shouldReduceMotion ? 1 : 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-[50vw] h-[50vw] rounded-full blur-3xl opacity-15"
                style={{
                  background: 'radial-gradient(circle at 40% 40%, #6366f1, #a855f7, transparent 70%)',
                  left: `${10 + i * 30}%`,
                  top: `${-10 + i * 35}%`,
                  transform: `translateZ(${-550 - i * 200}px)`,
                  willChange: 'transform, opacity', // GPU hint
                }}
                animate={
                  shouldReduceMotion
                    ? { scale: 1, opacity: 0.15 }
                    : { scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 26 + i * 6,
                  repeat: shouldReduceMotion ? 0 : Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* HERO SECTION */}
        <header className="relative pt-32 pb-40 px-6 md:px-12 lg:px-24 text-center z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="inline-flex items-center gap-3 mb-10 px-6 py-3 bg-slate-800/40 backdrop-blur-lg rounded-full border border-indigo-500/20 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <ShieldCheck className="text-indigo-400" size={22} />
              <span className="font-semibold text-indigo-200">
                Secure platform for Nigerian students & educators
              </span>
            </motion.div>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 mb-16">
              {/* Revolving logo */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 mx-auto lg:mx-0">
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: shouldReduceMotion ? 0 : 360 }}
                  transition={{
                    duration: 24,
                    ease: 'linear',
                    repeat: shouldReduceMotion ? 0 : Infinity,
                  }}
                >
                  <motion.div
                    className="absolute left-1/2 top-1/2 w-48 h-48 md:w-64 md:h-64 -translate-x-1/2 -translate-y-1/2 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-800"
                    style={{ transformOrigin: 'center', willChange: 'transform' }}
                    animate={{
                      rotate: shouldReduceMotion ? 0 : -360,
                    }}
                    transition={{
                      duration: 24,
                      ease: 'linear',
                      repeat: shouldReduceMotion ? 0 : Infinity,
                    }}
                    whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(99,102,241,0.5)' }}
                  >
                    <img
                      src="/weconnect-logo.png"
                      alt="WE CONNECT Logo"
                      className="w-full h-full object-contain p-8 drop-shadow-2xl"
                    />
                  </motion.div>
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-8">
                  <div className="w-full h-full rounded-full border border-indigo-400/20" />
                </div>
              </div>

              <div className="text-center lg:text-left">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 bg-clip-text text-transparent leading-none">
                  WE CONNECT
                </h1>
                <p className="mt-6 text-3xl md:text-4xl font-semibold text-slate-200">
                  Share Knowledge. Earn Income. Build Community.
                </p>
              </div>
            </div>

            <motion.p
              className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              Upload past questions, lecture notes, video explanations and technical summaries.
              <br className="hidden sm:block" />
              Monetize your contributions when others access them — securely connect with students and lecturers nationwide.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openAuth('signup')}
                className="px-12 py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xl rounded-xl shadow-xl hover:shadow-2xl transition-all"
              >
                Get Started — Free
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04 }}
                onClick={() => openAuth('login')}
                className="px-12 py-6 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-bold text-xl rounded-xl hover:bg-white/15 transition-all"
              >
                Log In
              </motion.button>
            </motion.div>
          </div>
        </header>

        {/* Features section */}
        <section className="py-24 px-6 md:px-12 lg:px-24 bg-slate-900/30 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-5xl md:text-6xl font-black text-center mb-16 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Core Features
            </motion.h2>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[
                { icon: FileText, title: 'Past Questions & Notes', desc: 'Upload and access authentic university exam materials and summaries.' },
                { icon: Video, title: 'Video Tutorials', desc: 'Share and discover concise explanatory videos.' },
                { icon: UploadCloud, title: 'Monetize Content', desc: 'Earn revenue each time your materials are downloaded.' },
                { icon: DollarSign, title: 'Secure Payouts', desc: 'Reliable earnings with transparent tracking.' },
                { icon: Users, title: 'Academic Network', desc: 'Connect with students and lecturers across institutions.' },
                { icon: MessageCircle, title: 'Study Communities', desc: 'Join focused groups for collaboration and discussion.' },
                { icon: Search, title: 'Advanced Search', desc: 'Quickly locate relevant academic resources.' },
                { icon: ShieldCheck, title: 'Protected Platform', desc: 'Secure uploads, verified content, and privacy-first design.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.08 }}
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-center text-white mb-4">{item.title}</h3>
                  <p className="text-slate-300 text-center">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats section – now uses useInView */}
        <section
          ref={statsRef}
          className="py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-r from-indigo-950/40 to-purple-950/40 relative z-10"
        >
          <div className="max-w-6xl mx-auto text-center">
            <motion.h2
              className="text-5xl md:text-6xl font-black mb-16 bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Platform Impact
            </motion.h2>

            <div className="grid md:grid-cols-4 gap-10">
              {[
                { value: '25000', label: 'Resources Shared', color: 'indigo' },
                { value: '120', label: 'Institutions', color: 'purple' },
                { value: '5000', label: 'Active Contributors', color: 'pink' },
                { value: '4.9/5', label: 'User Rating', color: 'amber', special: true },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="bg-slate-800/50 backdrop-blur-lg p-10 rounded-2xl border border-slate-700 hover:shadow-xl transition-all"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.12 }}
                >
                  <div
                    className={`text-6xl lg:text-7xl font-black text-${stat.color}-400 mb-4 ${stat.special ? '' : 'counter'}`}
                    data-target={stat.special ? undefined : stat.value}
                  >
                    {stat.value}
                  </div>
                  <p className="text-2xl font-semibold text-slate-200">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-32 px-6 text-center bg-gradient-to-br from-indigo-800 via-purple-800 to-indigo-900 text-white relative z-10">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              className="text-5xl md:text-6xl font-black mb-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Start Sharing & Earning Today
            </motion.h2>
            <motion.p
              className="text-2xl mb-12 max-w-3xl mx-auto opacity-90"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join thousands of Nigerian students and educators building a sustainable knowledge-sharing ecosystem.
            </motion.p>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openAuth('signup')}
              className="px-16 py-8 bg-white text-indigo-900 font-bold text-2xl rounded-xl shadow-2xl hover:shadow-white/30 transition-all"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Create Your Account
            </motion.button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 text-center bg-slate-950/70 border-t border-slate-800 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
            <img src="/weconnect-logo.png" alt="WE CONNECT" className="w-16 h-16 object-contain" />
            <p className="text-xl font-semibold text-slate-300">
              © {new Date().getFullYear()} WE CONNECT • Port Harcourt, Nigeria
            </p>
          </div>
          <div className="flex justify-center gap-10 text-lg">
            <button onClick={() => setShowPrivacyModal(true)} className="hover:text-indigo-400 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => setShowTermsModal(true)} className="hover:text-indigo-400 transition-colors">
              Terms of Service
            </button>
            <a href="mailto:support@weconnect.ng" className="hover:text-indigo-400 transition-colors">
              Contact
            </a>
          </div>
        </footer>

        {/* Privacy Modal */}
        <AnimatePresence>
          {showPrivacyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-3xl shadow-3xl border border-white/30 dark:border-slate-700/50 p-10 md:p-12"
              >
                <button
                  onClick={closePrivacy}
                  className="absolute top-6 right-6 p-3 rounded-2xl bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600"
                >
                  <X size={24} />
                </button>

                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  Privacy Policy 🔒
                </h2>
                <div className="prose prose-lg max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p className="mb-6 text-lg">
                    At WE CONNECT, we value your privacy. This policy explains how we collect, use, and protect your personal information.
                  </p>
                  <ul className="list-disc pl-8 space-y-4 mb-8 text-lg">
                    <li>We collect basic information like name, email, and school details during registration to provide personalized services.</li>
                    <li>Your uploaded materials are stored securely and only shared with your permission.</li>
                    <li>We use cookies for session management and analytics to improve the platform.</li>
                    <li>We do not share your data with third parties without consent, except for legal requirements.</li>
                    <li>You can request data deletion at any time via settings.</li>
                  </ul>
                  <p className="text-lg opacity-90">
                    For full details, please contact us at{' '}
                    <a
                      href="mailto:support@weconnect.ng"
                      className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      support@weconnect.ng
                    </a>
                    . Last updated: January 2026.
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
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-3xl shadow-3xl border border-white/30 dark:border-slate-700/50 p-10 md:p-12"
              >
                <button
                  onClick={closeTerms}
                  className="absolute top-6 right-6 p-3 rounded-2xl bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600"
                >
                  <X size={24} />
                </button>

                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  Terms of Service 📜
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
                    For full terms, contact{' '}
                    <a
                      href="mailto:support@weconnect.ng"
                      className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      support@weconnect.ng
                    </a>
                    . Last updated: January 2026.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.92, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 40 }}
                className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden"
              >
                <button
                  onClick={closeAuth}
                  className="absolute top-5 right-5 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700"
                >
                  <X size={24} />
                </button>
                <div className="p-10">
                  <AuthForm initialMode={authMode} onClose={closeAuth} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}