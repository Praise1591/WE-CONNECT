// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

  const features = [
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Academic Resources",
      description: "Access quality study materials, past questions, and research papers shared by students across Nigeria.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Expert Tutors",
      description: "Connect with verified tutors for personalized learning sessions and academic support.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Earn While Learning",
      description: "Share your knowledge and earn coins that can be converted to real cash rewards.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Study Groups",
      description: "Join or create study groups with peers from your school and department.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security and privacy features.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast & Reliable",
      description: "Lightning-fast access to resources with reliable uptime.",
      color: "from-red-500 to-orange-500"
    }
  ];

  // Realistic stats - updated for launched platform
  const stats = [
    { value: "500+", label: "Active Users", icon: <Users className="w-5 h-5" />, note: "And growing daily" },
    { value: "1,000+", label: "Study Materials", icon: <BookOpen className="w-5 h-5" />, note: "Shared by students" },
    { value: "50+", label: "Expert Tutors", icon: <Briefcase className="w-5 h-5" />, note: "Ready to help" },
    { value: "₦50K+", label: "Rewards Paid", icon: <Coins className="w-5 h-5" />, note: "To our community" }
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
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                WE CONNECT
              </span>
              {/* CAC Badge */}
              <div className="hidden lg:flex items-center gap-1 ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                <BadgeCheck size={12} className="text-green-600" />
                <span className="text-[10px] font-medium text-green-700 dark:text-green-400">CAC Reg.</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">Features</a>
              <a href="#faq" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition">FAQ</a>
              <button
                onClick={() => openAuthModal('login')}
                className="px-5 py-2 text-indigo-600 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-4">
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
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Welcome to WE CONNECT</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Connect, Learn,
                </span>
                <br />
                <span>and Earn Together</span>
              </h1>
              <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 max-w-lg">
                Nigeria's fastest-growing academic community. Share resources, connect with peers, and earn real rewards for your knowledge.
              </p>
              
              {/* CAC Registration Badge - Hero Section */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 rounded-full border border-green-200 dark:border-green-800">
                <Building2 size={14} className="text-green-600" />
                <FileCheck size={14} className="text-green-600" />
                <span className="text-xs text-green-700 dark:text-green-400 font-medium">Officially registered with CAC Nigeria</span>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                >
                  Sign In
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-sm font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">Join 500+ Active Students</p>
                  <p className="text-sm text-slate-500">Be part of Nigeria's learning revolution</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop"
                  alt="Students studying together"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20" />
              </div>
              {/* Floating stats cards */}
              <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Active Users</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">500+</p>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Rewards Paid</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">₦50K+</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Updated for launched platform */}
      <section className="py-16 bg-white dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Our Growing Community</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mt-2">Making an Impact</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-slate-600 dark:text-slate-400">{stat.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{stat.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to help you learn better, connect smarter, and earn more.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Simple steps to start your journey with WE CONNECT
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up for free and complete your profile",
                icon: <Users className="w-8 h-8" />
              },
              {
                step: "02",
                title: "Explore & Learn",
                description: "Access thousands of study materials and resources",
                icon: <BookOpen className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Share & Earn",
                description: "Upload content and earn coins that convert to cash",
                icon: <Coins className="w-8 h-8" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-12 w-16 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600">
                      <ChevronRight className="absolute -right-2 -top-2 text-purple-600" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white dark:bg-slate-900/50 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Got questions? We've got answers
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6"
              >
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 shadow-2xl"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of students already using WE CONNECT
            </p>
            <button
              onClick={() => openAuthModal('signup')}
              className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto group"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            <p className="text-sm text-white/70 mt-4">
              No credit card required • Free forever • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">WE CONNECT</span>
              </div>
              <p className="text-slate-400">Connecting Nigerian students for academic excellence and financial empowerment.</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-900/30 rounded-full border border-green-800">
                <BadgeCheck size={12} className="text-green-400" />
                <span className="text-xs text-green-400 font-medium">CAC Registered Nigeria</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><button onClick={() => openAuthModal('signup')} className="hover:text-white transition">Sign Up</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition">CAC Registration</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> weconnect159@gmail.com</li>
                <li className="flex items-center gap-2">
                  <a href="https://wa.me/2349013879230" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-400 transition">
                    <MessageCircle className="w-4 h-4" /> +234 901 387 9230 (WhatsApp)
                  </a>
                </li>
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Port Harcourt, Nigeria</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">&copy; 2024 WE CONNECT. All rights reserved. | CAC Registered Nigeria</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <AuthForm
            initialMode={authMode}
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={() => {
              setShowAuthModal(false);
              navigate('/dashboard');
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Landing;