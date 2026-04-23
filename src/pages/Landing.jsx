// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowRight, BookOpen, Users, Award, Shield, Zap, 
  GraduationCap, Briefcase, Star, TrendingUp, 
  CheckCircle, Play, Github, Twitter, Linkedin, 
  Mail, Phone, MapPin, ChevronRight, Menu, X,
  Sparkles, Globe, Lock, Heart, Camera, Code,
  MessageCircle, Bell, Download, Upload, Coins, Gem,
  Building2, FileCheck, BadgeCheck, Headphones
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/Dashboard/AuthForm';

function Landing() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      console.log("User already authenticated, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const features = [
    {
      icon: <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Academic Resources",
      description: "Access quality study materials, past questions, and research papers shared by students across Nigeria.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Briefcase className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Expert Tutors",
      description: "Connect with verified tutors for personalized learning sessions and academic support.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Earn While Learning",
      description: "Share your knowledge and earn coins that can be converted to real cash rewards.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Study Groups",
      description: "Join or create study groups with peers from your school and department.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security and privacy features.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: "Fast & Reliable",
      description: "Lightning-fast access to resources with reliable uptime.",
      color: "from-red-500 to-orange-500"
    }
  ];

  // Realistic stats - updated for launched platform
  const stats = [
    { value: "500+", label: "Active Users", icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />, note: "And growing daily" },
    { value: "2,000+", label: "Study Materials", icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />, note: "Shared by students" },
    { value: "50+", label: "Expert Tutors", icon: <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />, note: "Ready to help" },
    { value: "₦150K+", label: "Rewards Paid", icon: <Coins className="w-4 h-4 sm:w-5 sm:h-5" />, note: "To our community" }
  ];

  const faqs = [
    {
      question: "How do I earn coins?",
      answer: "You can earn coins by uploading study materials, helping other students, referring friends, and completing daily tasks."
    },
    {
      question: "How do I withdraw my earnings?",
      answer: "Convert your coins to diamonds and request withdrawal to your bank account or mobile wallet. Minimum withdrawal is 10 diamonds (₦600)."
    },
    {
      question: "Is WE CONNECT free to use?",
      answer: "Yes! Basic access is free. You can earn coins to access premium features without spending money."
    },
    {
      question: "How do I become a tutor?",
      answer: "Sign up as a tutor, complete your profile, and get verified. Once approved, you can start offering tutoring sessions."
    },
    {
      question: "Is WE CONNECT registered?",
      answer: "Yes! WE CONNECT is officially registered with the Corporate Affairs Commission (CAC) of Nigeria."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      
      {/* Browser Title and Meta Tags */}
      <Helmet>
        <title>WE CONNECT EDU | Share Knowledge, Earn & Grow</title>
        <meta name="description" content="Nigeria's platform for students to share academic resources, connect with peers, and monetize their knowledge. Join WE CONNECT EDU today!" />
        <meta name="keywords" content="WE CONNECT, WE CONNECT EDU, Nigerian students, academic resources, study materials, online tutoring, earn money, Nigeria education" />
        <meta property="og:title" content="WE CONNECT EDU - Share Knowledge, Earn & Grow" />
        <meta property="og:description" content="Nigeria's leading platform for students to connect, learn, and earn together." />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="WE CONNECT EDU - Share Knowledge, Earn & Grow" />
        <meta name="twitter:description" content="Join Nigeria's fastest-growing academic community today!" />
      </Helmet>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                WE CONNECT EDU
              </span>
              {/* CAC Badge - hidden on very small screens */}
              <div className="hidden lg:flex items-center gap-1 ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                <BadgeCheck size={12} className="text-green-600" />
                <span className="text-[10px] font-medium text-green-700 dark:text-green-400">CAC Reg.</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition text-sm lg:text-base">Features</a>
              <a href="#faq" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition text-sm lg:text-base">FAQ</a>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 lg:px-5 lg:py-2 text-indigo-600 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition text-sm lg:text-base"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 lg:px-5 lg:py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-sm lg:text-base"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-4 max-h-[calc(100vh-56px)] overflow-y-auto">
            <div className="flex flex-col gap-3 px-4">
              <a href="#features" className="py-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#faq" className="py-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <button
                onClick={() => openAuthModal('login')}
                className="py-2 text-indigo-600 font-semibold text-left"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl text-center"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">Welcome to WE CONNECT EDU</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Connect, Learn,
                </span>
                <br />
                <span>and Earn Together</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-lg">
                Nigeria's fastest-growing academic community. Share resources, connect with peers, and earn real rewards for your knowledge.
              </p>
              
              {/* CAC Registration Badge - Hero Section */}
              <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-green-50 dark:bg-green-950/30 rounded-full border border-green-200 dark:border-green-800">
                <Building2 size={12} className="text-green-600 sm:w-[14px] sm:h-[14px]" />
                <FileCheck size={12} className="text-green-600 sm:w-[14px] sm:h-[14px]" />
                <span className="text-[10px] sm:text-xs text-green-700 dark:text-green-400 font-medium">Officially registered with CAC Nigeria</span>
              </div>
              
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-5 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group text-sm sm:text-base"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition" />
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all text-sm sm:text-base"
                >
                  Sign In
                </button>
              </div>
              <div className="mt-6 sm:mt-8 flex items-center gap-4 sm:gap-6">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base">Join 500+ Active Students</p>
                  <p className="text-xs sm:text-sm text-slate-500">Be part of Nigeria's learning revolution</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop"
                  alt="Students studying together"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20" />
              </div>
              {/* Floating stats cards - repositioned for mobile */}
              <div className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500">Active Users</p>
                  <p className="text-sm sm:text-xl font-bold text-slate-800 dark:text-white">500+</p>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-500">Rewards Paid</p>
                  <p className="text-sm sm:text-xl font-bold text-slate-800 dark:text-white">₦150K+</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Updated for launched platform */}
      <section className="py-10 sm:py-12 md:py-16 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">Our Growing Community</p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mt-2">Making an Impact</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 sm:mt-1">{stat.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-4">
              Powerful features designed to help you learn better, connect smarter, and earn more.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400">
              Simple steps to start your journey with WE CONNECT EDU
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up for free and complete your profile",
                icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />
              },
              {
                step: "02",
                title: "Explore & Learn",
                description: "Access thousands of study materials and resources",
                icon: <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
              },
              {
                step: "03",
                title: "Share & Earn",
                description: "Upload content and earn coins that convert to cash",
                icon: <Coins className="w-6 h-6 sm:w-8 sm:h-8" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-8 lg:-right-12 w-8 lg:w-16 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600">
                      <ChevronRight className="absolute -right-2 -top-2 text-purple-600 w-4 h-4" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-2">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Accordion style for mobile */}
      <section id="faq" className="py-12 sm:py-16 md:py-20 bg-white dark:bg-slate-900/50 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-3 sm:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400">
              Got questions? We've got answers
            </p>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-4 sm:p-6 flex justify-between items-center gap-4"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white flex-1">
                    {faq.question}
                  </h3>
                  <ChevronRight 
                    className={`w-5 h-5 text-indigo-600 transition-transform duration-300 flex-shrink-0 ${
                      openFaqIndex === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-48 pb-4 sm:pb-6' : 'max-h-0'
                  } overflow-hidden`}
                >
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-4 sm:px-6 pb-4 sm:pb-6">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 px-2">
              Join thousands of students already using WE CONNECT EDU
            </p>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto group text-sm sm:text-base"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition" />
            </button>
            <p className="text-xs sm:text-sm text-white/70 mt-3 sm:mt-4">
              No credit card required • Free forever • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-base sm:text-xl font-bold">WE CONNECT EDU</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm">Connecting Nigerian students for academic excellence and financial empowerment.</p>
              <div className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 bg-green-900/30 rounded-full border border-green-800">
                <BadgeCheck size={10} className="text-green-400 sm:w-[12px] sm:h-[12px]" />
                <span className="text-[9px] sm:text-xs text-green-400 font-medium">CAC Registered Nigeria</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-xs sm:text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><button onClick={() => openAuthModal('signup')} className="hover:text-white transition">Sign Up</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">CAC Registration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
              <ul className="space-y-1.5 sm:space-y-2 text-slate-400 text-xs sm:text-sm">
                <li className="flex items-center gap-1.5 sm:gap-2 break-all"><Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> weconnect159@gmail.com</li>
                <li className="flex items-center gap-1.5 sm:gap-2">
                  <a href="https://wa.me/2349013879230" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 sm:gap-2 hover:text-green-400 transition break-all">
                    <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> +234 901 387 9230
                  </a>
                </li>
                <li className="flex items-center gap-1.5 sm:gap-2"><MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> Port Harcourt, Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-slate-400 text-[10px] sm:text-xs text-center sm:text-left">&copy; 2025 WE CONNECT EDU. All rights reserved. | CAC Registered Nigeria</p>
            <div className="flex gap-3 sm:gap-4">
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition">
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="max-h-[90vh] overflow-y-auto">
            <AuthForm
              initialMode={authMode}
              onClose={() => setShowAuthModal(false)}
              onLoginSuccess={() => {
                setShowAuthModal(false);
                navigate('/dashboard');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;