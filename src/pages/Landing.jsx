// src/pages/Landing.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, BookOpen, Video, FileText, ScrollText, ArrowRight,
  CheckCircle2, Users, ShieldCheck, X, Zap, UploadCloud, DollarSign,
  MessageCircle, Search, Star
} from 'lucide-react';
import AuthForm from '../components/Dashboard/AuthForm';

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const statsRef = useRef(null);

  // Mouse position for parallax (values from -1 to 1)
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;     // 0 to 1
    const y = (e.clientY - rect.top) / rect.height;     // 0 to 1
    setMouse({
      x: (x - 0.5) * 2,   // -1 to 1
      y: (y - 0.5) * 2
    });
  };

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
    <div 
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950"
      onMouseMove={handleMouseMove}
    >
      {/* ────────────────────────────────────────────── */}
      {/*   Professional 3D Parallax Background – Premium & Modern   */}
      {/* ────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            perspective: '1800px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
            }}
            animate={{
              rotateX: mouse.y * 8,     // gentler tilt
              rotateY: -mouse.x * 12,
            }}
            transition={{
              type: 'spring',
              stiffness: 80,
              damping: 30,
              mass: 1.2
            }}
          >

            {/* Layer 0 – Very subtle repeating logo / watermark */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{ 
                backgroundImage: "url('/weconnect-logo.png')",
                backgroundSize: "400px",
                backgroundRepeat: "repeat",
                filter: "blur(2px) brightness(1.3) contrast(0.9)",
                transform: 'translateZ(-900px) scale(1.15)',
              }}
            />

            {/* Layer 1 – Large, soft, slow-breathing gradient orbs */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={`orb-${i}`}
                className="absolute w-[60vw] h-[60vw] rounded-full blur-3xl"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #6366f1, #a855f7, #ec4899, transparent 70%)',
                  left: `${-10 + i * 28}%`,
                  top: `${-20 + i * 32}%`,
                  transform: `translateZ(${-600 - i * 140}px)`,
                  opacity: 0.18 + i * 0.06,
                }}
                animate={{
                  scale: [1, 1.18, 1],
                  opacity: [0.18, 0.38, 0.18],
                }}
                transition={{
                  duration: 18 + i * 4,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut'
                }}
              />
            ))}

            {/* Layer 2 – Subtle tech mesh / connection lines */}
            <div className="absolute inset-0" style={{ transform: 'translateZ(-200px)' }}>
              <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                {[
                  [10,15, 40,35], [40,35, 65,25], [65,25, 90,45],
                  [15,60, 45,80], [45,80, 75,55], [20,85, 55,70]
                ].map(([x1,y1,x2,y2], i) => (
                  <line 
                    key={i}
                    x1={`${x1}%`} y1={`${y1}%`} 
                    x2={`${x2}%`} y2={`${y2}%`} 
                    stroke="url(#lineGrad)" 
                    strokeWidth="0.6" 
                    strokeDasharray="1.5 4"
                  >
                    <animate 
                      attributeName="strokeDashoffset" 
                      from="0" to="-12" 
                      dur={`${7 + i * 1.4}s`} 
                      repeatCount="indefinite" 
                    />
                  </line>
                ))}
              </svg>
            </div>

            {/* Layer 3 – Gentle floating glowing dots (wave motion) */}
            <div className="absolute inset-0" style={{ transform: 'translateZ(120px)' }}>
              {Array.from({ length: 18 }).map((_, i) => {
                const delay = i * 0.4;
                const duration = 12 + Math.random() * 6;
                return (
                  <motion.div
                    key={`dot-${i}`}
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/60 shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -40, 0],
                      opacity: [0.3, 0.9, 0.3],
                      scale: [0.7, 1.3, 0.7],
                    }}
                    transition={{
                      duration,
                      repeat: Infinity,
                      delay,
                      ease: 'easeInOut'
                    }}
                  />
                );
              })}
            </div>

            {/* Layer 4 – Soft moving spotlight / glow (premium feel) */}
            <motion.div
              className="absolute left-1/2 top-1/2 w-[90vmin] h-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{ 
                background: 'radial-gradient(circle at 40% 40%, rgba(99,102,241,0.22), rgba(236,72,153,0.18), transparent 65%)',
                transform: 'translateZ(280px)'
              }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.4, 0.65, 0.4],
                // backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] // optional subtle shift
              }}
              transition={{
                duration: 24,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            />

          </motion.div>
        </div>
      </div>

      {/* ────────────────────────────────────────────── */}
      {/*                   MAIN CONTENT                   */}
      {/* ────────────────────────────────────────────── */}

      <header className="relative pt-40 pb-56 px-6 md:px-16 lg:px-32 text-center z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="inline-flex items-center gap-3 mb-10 px-8 py-4 bg-slate-900/40 backdrop-blur-xl rounded-full border border-indigo-500/30 shadow-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <ShieldCheck className="text-indigo-400" size={24} />
            <span className="font-bold text-lg text-indigo-200">
              Trusted Learning & Earning Hub for Nigerian Students & Lecturers 🚀
            </span>
          </motion.div>

          <motion.div 
            className="mb-20 flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.div 
              className="relative w-44 h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.5)] border-8 border-white/30"
              whileHover={{ scale: 1.08, rotate: 6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700" />
              <img 
                src="/weconnect-logo.png" 
                alt="WE CONNECT" 
                className="w-full h-full object-contain p-6 drop-shadow-2xl"
              />
            </motion.div>

            <div className="text-center md:text-left">
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent leading-none drop-shadow-2xl">
                WE CONNECT
              </h1>
              <p className="mt-4 text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-emerald-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
                Learn Smarter • Earn Real Money 💰
              </p>
            </div>
          </motion.div>

          <motion.p 
            className="text-2xl md:text-3xl lg:text-4xl text-slate-200 max-w-5xl mx-auto mb-16 leading-tight font-medium drop-shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
          >
            Upload past questions, PDF notes, video tutorials & technical reviews. 📤<br className="hidden sm:block" />
            Earn when others download • Connect with students & lecturers across Nigeria. 🤝🔥
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-8 justify-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
          >
            <motion.button
              whileHover={{ scale: 1.07, boxShadow: '0 0 50px rgba(99,102,241,0.6)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openAuth('signup')}
              className="relative px-14 py-7 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-extrabold text-2xl rounded-full shadow-2xl overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-4">
                Start Earning Today 🚀
                <ArrowRight className="group-hover:translate-x-3 transition-transform" size={28} />
              </span>
              <motion.div 
                className="absolute inset-0 bg-white/20"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,0.4)' }}
              onClick={() => openAuth('login')}
              className="px-14 py-7 bg-white/10 backdrop-blur-2xl border-4 border-white/30 text-white font-extrabold text-2xl rounded-full hover:bg-white/20 transition-all shadow-xl"
            >
              Already Connected? Log In 😎
            </motion.button>
          </motion.div>
        </div>
      </header>

      {/* Features section remains unchanged */}
      <section className="py-32 px-6 md:px-16 lg:px-32 bg-slate-900/30 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-6xl md:text-7xl lg:text-8xl font-black text-center mb-24 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Power-Packed Features 🔥
          </motion.h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-10">
            {[
              { icon: ScrollText, color: 'amber', title: 'Past Questions 📝', desc: 'Authentic Nigerian uni exams - level up your prep game' },
              { icon: FileText, color: 'blue', title: 'PDF Notes 📓', desc: 'Organized summaries for quick vibes & cramming' },
              { icon: Video, color: 'purple', title: 'Video Tutorials 🎥', desc: 'Bite-sized explainer vids that slap' },
              { icon: BookOpen, color: 'emerald', title: 'Technical Reviews 🔍', desc: 'Deep dives & breakdowns for real understanding' },
              { icon: UploadCloud, color: 'orange', title: 'Upload & Monetize 💸', desc: 'Share your stuff & get paid - creator mode on' },
              { icon: DollarSign, color: 'green', title: 'Secure Earnings 🤑', desc: 'Cash out per download - no cap' },
              { icon: MessageCircle, color: 'pink', title: 'Social Network 💬', desc: 'Vibe check with peeps nationwide' },
              { icon: Users, color: 'indigo', title: 'Study Groups 👥', desc: 'Squad up for group grinds & collabs' },
              { icon: Search, color: 'red', title: 'Smart Search 🔎', desc: 'Find resources faster than TikTok scrolls' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                className="group relative bg-slate-800/60 backdrop-blur-2xl rounded-3xl p-10 border border-white/30 shadow-xl hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-5 hover:border-purple-400/60"
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                <div className={`w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-700 flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg group-hover:shadow-${item.color}-500/50`}>
                  <item.icon size={44} />
                </div>
                <h3 className="text-3xl font-extrabold text-center text-white mb-5 group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-center text-slate-300 text-lg leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats section remains unchanged */}
      <section ref={statsRef} className="py-32 px-6 md:px-16 lg:px-32 bg-gradient-to-r from-purple-950/50 to-pink-950/50 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2 
            className="text-6xl md:text-7xl lg:text-8xl font-black mb-24 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Community at a Glance 📊
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-12">
            {[
              { value: "25000", label: "Materials Shared 📤", color: "indigo" },
              { value: "120", label: "Institutions 🏫", color: "purple" },
              { value: "5000", label: "Active Creators 👩‍💻", color: "pink" },
              { value: "4.9/5", label: "Community Rating ⭐", color: "amber", special: true },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                className={`group bg-slate-800/60 backdrop-blur-2xl p-12 rounded-3xl border border-slate-700/50 shadow-xl hover:shadow-2xl hover:shadow-${stat.color}-500/40 transition-all hover:-translate-y-4`}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i*0.15 }}
              >
                <div className={`text-7xl lg:text-8xl font-black text-${stat.color}-400 mb-6 ${stat.special ? '' : 'counter'}`} data-target={stat.special ? undefined : stat.value}>
                  {stat.value}
                </div>
                <p className="text-3xl font-bold text-white">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section remains unchanged */}
      <section className="py-40 px-6 text-center bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 text-white relative overflow-hidden z-10">
        <motion.div 
          className="absolute inset-0 bg-[url('/weconnect-logo.png')] bg-[length:500px] opacity-10 animate-pulse-slow"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.h2 
            className="text-6xl md:text-7xl lg:text-8xl font-black mb-12 drop-shadow-2xl"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Level Up, Share & Stack Cash? 💰🔥
          </motion.h2>
          <motion.p 
            className="text-3xl md:text-4xl mb-16 max-w-4xl mx-auto opacity-90"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join the squad building lit futures together. No cap, just vibes & wins. 😎
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: '0 0 60px rgba(255,255,255,0.5)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => openAuth('signup')}
            className="px-20 py-10 bg-white text-indigo-700 font-black text-3xl rounded-full shadow-2xl hover:shadow-white/60 transition-all"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Join the Wave Now 🌊
          </motion.button>
        </div>
      </section>

      {/* Footer remains unchanged */}
      <footer className="py-20 px-6 text-center bg-slate-950/50 backdrop-blur-xl border-t border-slate-700/50 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl">
            <img src="/weconnect-logo.png" alt="WE CONNECT" className="w-full h-full object-contain bg-gradient-to-br from-indigo-600 to-purple-700 p-4" />
          </div>
          <p className="text-2xl font-bold text-slate-200">
            © {new Date().getFullYear()} WE CONNECT • Built with passion in Port Harcourt, Nigeria 🌍💥
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-10 text-lg">
          <button onClick={() => setShowPrivacyModal(true)} className="hover:text-indigo-400 font-medium transition-colors">Privacy Policy 🔒</button>
          <button onClick={() => setShowTermsModal(true)} className="hover:text-indigo-400 font-medium transition-colors">Terms of Service 📜</button>
          <a href="#" className="hover:text-indigo-400 font-medium transition-colors">Contact Us 📩</a>
        </div>
      </footer>

      {/* Modals remain unchanged */}
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
              <button onClick={closePrivacy} className="absolute top-6 right-6 p-3 rounded-2xl bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600">
                <X size={24} />
              </button>

              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Privacy Policy 🔒
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
                  For full details, please contact us at <a href="mailto:support@weconnect.ng" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">support@weconnect.ng</a>. Last updated: January 2026.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <button onClick={closeTerms} className="absolute top-6 right-6 p-3 rounded-2xl bg-white/90 dark:bg-slate-700/90 hover:bg-white dark:hover:bg-slate-600">
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
                  For full terms, contact <a href="mailto:support@weconnect.ng" className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">support@weconnect.ng</a>. Last updated: January 2026.
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
            className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-50 flex items-start justify-center pt-16 md:pt-24 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-md md:max-w-xl lg:max-w-2xl mx-6 my-8 rounded-3xl bg-slate-900/95 backdrop-blur-3xl shadow-3xl border border-slate-700/60"
            >
              <button onClick={closeAuth} className="absolute top-6 right-6 p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700">
                <X size={24} />
              </button>
              <div className="p-8 md:p-10">
                <AuthForm initialMode={authMode} onClose={closeAuth} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}