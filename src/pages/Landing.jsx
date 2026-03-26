// Landing.jsx - Honest and Authentic Version
import React, { useState, useEffect, useRef } from 'react';

import {
  LazyMotion,
  domAnimation,
  m as motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
  useScroll,
  useTransform,
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
  Sparkles,
  Rocket,
  Star,
  TrendingUp,
  Award,
  Globe,
  Zap,
  CheckCircle,
  Play,
  ArrowUpRight,
  ChevronRight,
  Mail,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Layers,
  Crown,
  Gift,
  Heart,
  Coffee,
} from 'lucide-react';
import AuthForm from '../components/Dashboard/AuthForm';

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
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const shouldReduceMotion = useReducedMotion();
  const [rawMouse, setRawMouse] = useState({ x: 0, y: 0 });
  const mouse = useThrottle(rawMouse, 80);
  const heroRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

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

  const features = [
    { icon: UploadCloud, title: "Share & Earn", desc: "Upload your notes, past questions, and tutorials. Earn diamonds when students download your materials.", color: "from-indigo-500 to-purple-500", gradient: "from-indigo-600 to-purple-600", delay: 0 },
    { icon: DollarSign, title: "Monetize Knowledge", desc: "Turn your academic expertise into income. Each download earns you diamonds that can be withdrawn.", color: "from-emerald-500 to-teal-500", gradient: "from-emerald-600 to-teal-600", delay: 0.1 },
    { icon: Users, title: "Build Community", desc: "Connect with students across Nigeria. Join study groups, share insights, and grow together.", color: "from-blue-500 to-cyan-500", gradient: "from-blue-600 to-cyan-600", delay: 0.2 },
    { icon: Video, title: "Video Tutorials", desc: "Create and share video explanations. Visual learning made easy and accessible for everyone.", color: "from-pink-500 to-rose-500", gradient: "from-pink-600 to-rose-600", delay: 0.3 },
    { icon: Search, title: "Smart Search", desc: "Find exactly what you need with our advanced search. Filter by school, course, or material type.", color: "from-orange-500 to-amber-500", gradient: "from-orange-600 to-amber-600", delay: 0.4 },
    { icon: ShieldCheck, title: "Secure Platform", desc: "Your content is protected. We ensure a safe environment for sharing and learning.", color: "from-cyan-500 to-blue-500", gradient: "from-cyan-600 to-blue-600", delay: 0.5 },
  ];

  const stats = [
    { value: 5000, label: "Active Students", icon: Users, color: "from-indigo-500 to-purple-500", suffix: "+" },
    { value: 2500, label: "Resources Shared", icon: BookOpen, color: "from-emerald-500 to-teal-500", suffix: "+" },
    { value: 50, label: "Universities", icon: GraduationCap, color: "from-blue-500 to-cyan-500", suffix: "+" },
    { value: 85, label: "Satisfaction Rate", icon: Star, color: "from-amber-500 to-orange-500", suffix: "%" },
  ];

  const benefits = [
    { icon: Award, title: "Earn Real Income", desc: "Convert your knowledge into diamonds worth ₦60 each" },
    { icon: Users, title: "Grow Your Network", desc: "Connect with thousands of like-minded students" },
    { icon: Sparkles, title: "Enhance Skills", desc: "Improve your understanding by teaching others" },
    { icon: Crown, title: "Build Reputation", desc: "Establish yourself as a subject matter expert" },
  ];

  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    document.querySelectorAll('.stat-number').forEach((counter) => {
      const target = +counter.getAttribute('data-target');
      let count = 0;
      const increment = target / 80;
      const update = () => {
        count += increment;
        if (count < target) {
          counter.innerText = Math.floor(count).toLocaleString();
          requestAnimationFrame(update);
        } else {
          counter.innerText = target.toLocaleString();
        }
      };
      update();
    });
  }, [isInView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950"
        onMouseMove={handleMouseMove}
      >
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
          
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, -100, 100],
                x: [null, Math.random() * 100 - 50, Math.random() * 100 - 50],
              }}
              transition={{
                duration: 10 + Math.random() * 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        {/* Navigation Bar - Fixed with both buttons visible on mobile */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 sm:py-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/10"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                WE CONNECT
              </span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => openAuth('login')}
                className="px-4 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuth('signup')}
                className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:shadow-lg transition-all"
              >
                Sign Up
              </motion.button>
            </div>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative min-h-screen flex items-center justify-center pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6"
        >
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 backdrop-blur-sm rounded-full border border-indigo-500/30 mb-4 sm:mb-8"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              <span className="text-xs sm:text-sm text-indigo-300">The Future of Nigerian Education</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 px-2"
            >
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Share Knowledge
              </span>
              <br />
              <span className="text-white">Earn & Grow</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-6 sm:mb-8 px-4"
            >
              Nigeria's platform for students to share academic resources, connect with peers, and monetize their knowledge.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuth('signup')}
                className="px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 justify-center"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVideoModal(true)}
                className="px-6 sm:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all flex items-center gap-2 justify-center"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                Watch Demo
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-slate-400 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                <span>Start earning immediately</span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section - Honest numbers */}
        <section ref={statsRef} className="py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className={`inline-flex p-2 sm:p-4 bg-gradient-to-br ${stat.color} rounded-xl sm:rounded-2xl mb-2 sm:mb-4`}>
                    <stat.icon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2 stat-number" data-target={stat.value}>
                    0
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">{stat.label}{stat.suffix}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Everything You Need to Succeed
              </h2>
              <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto px-4">
                Powerful features designed to help you share knowledge, earn income, and build your academic network
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10 hover:border-white/20 transition-all">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r ${feature.gradient} rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-5 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-r from-indigo-950/30 to-purple-950/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-base sm:text-xl text-slate-400">Simple steps to start sharing and earning</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                { step: "01", icon: UploadCloud, title: "Upload Your Materials", desc: "Share your notes, past questions, video tutorials, or technical summaries" },
                { step: "02", icon: Users, title: "Build Your Audience", desc: "Students discover and download your content, earning you diamonds" },
                { step: "03", icon: DollarSign, title: "Redeem Your Earnings", desc: "Convert diamonds to cash at ₦60 per diamond and withdraw securely" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative"
                >
                  <div className="text-5xl sm:text-6xl md:text-7xl font-black text-white/5 absolute top-0 right-0">{item.step}</div>
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-white/10">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                      <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Why Join WE CONNECT?
              </h2>
              <p className="text-base sm:text-xl text-slate-400">More than just a platform — a community</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 text-center"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 sm:mb-2">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section - Real questions */}
        <section id="faq" className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-16"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-xl text-slate-400">Got questions? We've got answers</p>
            </motion.div>

            <div className="space-y-3 sm:space-y-4">
              {[
                { q: "How do I earn money?", a: "When students download your uploaded materials, you earn diamonds. Each diamond is worth ₦60, and you can withdraw your earnings once you reach the minimum threshold." },
                { q: "What materials can I upload?", a: "You can upload past questions, lecture notes, video tutorials, technical summaries, and any educational content that helps other students learn." },
                { q: "Is it free to join?", a: "Yes! WE CONNECT is completely free to join. You only start earning when you share valuable content." },
                { q: "How do I withdraw my earnings?", a: "You can withdraw your earnings via bank transfer once you've accumulated at least 500 diamonds (₦30,000)." },
                { q: "Is my content protected?", a: "Yes, we take content protection seriously. Your materials are stored securely and only accessible to registered users." },
              ].map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all"
                >
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 sm:mb-2">{faq.q}</h3>
                  <p className="text-xs sm:text-sm text-slate-400">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 shadow-2xl"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4">
                Ready to Transform Your Academic Journey?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-indigo-100 mb-6 sm:mb-8">
                Join thousands of Nigerian students already sharing knowledge and earning income
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuth('signup')}
                className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 bg-white text-indigo-600 font-bold text-sm sm:text-base md:text-lg rounded-xl sm:rounded-2xl hover:shadow-xl transition-all"
              >
                Create Your Free Account
              </motion.button>
              <p className="mt-4 sm:mt-6 text-indigo-200 text-xs sm:text-sm">No credit card required • Free forever</p>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 sm:py-16 px-4 sm:px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-white">WE CONNECT</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">Empowering Nigerian students through knowledge sharing and community.</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Platform</h4>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
                <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-400">
                  <li><button onClick={() => setShowPrivacyModal(true)} className="hover:text-white transition-colors">Privacy Policy</button></li>
                  <li><button onClick={() => setShowTermsModal(true)} className="hover:text-white transition-colors">Terms of Service</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-3 sm:mb-4 text-sm sm:text-base">Connect</h4>
                <div className="flex gap-2 sm:gap-3">
                  <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </a>
                  <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </a>
                  <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </a>
                </div>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-400">support@weconnect.ng</p>
              </div>
            </div>
            <div className="text-center pt-6 sm:pt-8 border-t border-white/10">
              <p className="text-xs sm:text-sm text-slate-500">© {new Date().getFullYear()} WE CONNECT. Made with <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline text-red-500" /> by Nigerian students</p>
            </div>
          </div>
        </footer>

        {/* Auth Modal */}
        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 40 }}
                className="relative w-full max-w-lg bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-700 shadow-2xl overflow-hidden"
              >
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-3 sm:top-5 right-3 sm:right-5 p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors z-10"
                >
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
                <div className="p-4 sm:p-6 md:p-8">
                  <AuthForm initialMode={authMode} onClose={() => setShowAuthModal(false)} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy Modal */}
        <AnimatePresence>
          {showPrivacyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 40 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-700 p-4 sm:p-6 md:p-8"
              >
                <button onClick={() => setShowPrivacyModal(false)} className="absolute top-3 sm:top-5 right-3 sm:right-5 p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700">
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">Privacy Policy</h2>
                <div className="text-slate-300 space-y-3 sm:space-y-4 text-sm sm:text-base">
                  <p>At WE CONNECT, we take your privacy seriously. This policy outlines how we collect, use, and protect your information.</p>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mt-3 sm:mt-4">Information We Collect</h3>
                  <p>We collect basic information like name, email, and educational institution when you register. Your uploaded materials are stored securely and only shared with your permission.</p>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mt-3 sm:mt-4">How We Use Your Information</h3>
                  <p>We use your data to provide platform services, process earnings, and improve user experience. We never sell your personal information to third parties.</p>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mt-3 sm:mt-4">Data Security</h3>
                  <p>Your data is protected with industry-standard encryption. You can request data deletion at any time through your account settings.</p>
                  <p className="mt-3 sm:mt-4">For questions, contact us at support@weconnect.ng</p>
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
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 40 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-700 p-4 sm:p-6 md:p-8"
              >
                <button onClick={() => setShowTermsModal(false)} className="absolute top-3 sm:top-5 right-3 sm:right-5 p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700">
                  <X size={16} className="sm:w-5 sm:h-5" />
                </button>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 sm:mb-6">Terms of Service</h2>
                <div className="text-slate-300 space-y-3 sm:space-y-4 text-sm sm:text-base">
                  <p>By using WE CONNECT, you agree to these terms. Please read them carefully.</p>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mt-3 sm:mt-4">Account Responsibilities</h3>
                  <p>You are responsible for maintaining the security of your account and for all content you upload. You must be at least 13 years old to use the platform.</p>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mt-3 sm:mt-4">Content Guidelines</h3>
                  <p>All uploaded materials must be original or properly attributed. Prohibited content includes illegal materials, spam, and harassment.</p>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mt-3 sm:mt-4">Earnings and Payments</h3>
                  <p>You earn diamonds when users download your content. Diamonds can be redeemed at ₦60 each. We reserve the right to adjust rates with notice.</p>
                  <p className="mt-3 sm:mt-4">For full terms, contact support@weconnect.ng</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Modal */}
        <AnimatePresence>
          {showVideoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative w-full max-w-4xl aspect-video bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
                >
                  <X size={16} className="sm:w-6 sm:h-6" />
                </button>
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-purple-950">
                  <div className="text-center">
                    <Play className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-white/50 mx-auto mb-2 sm:mb-4" />
                    <p className="text-white text-sm sm:text-base">Demo video coming soon</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}