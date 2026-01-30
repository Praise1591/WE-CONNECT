// About.jsx — Plain JSX version (no TypeScript)
import React from 'react';
import { 
  Zap, 
  Users, 
  BookOpen, 
  Download, 
  Heart, 
  Mail, 
  Phone, 
  Globe, 
  ChevronRight,
  Sparkles,
  Target,
  Shield,
  BarChart2,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Parallax } from 'react-parallax';
import Particles from 'react-particles';
import { loadFull } from 'tsparticles';

// Particle configuration for subtle, creative background effects
const particlesInit = async (engine) => {
  await loadFull(engine);
};

const particlesOptions = {
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "repulse",
      },
      resize: true,
    },
    modes: {
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: ["#3b82f6", "#8b5cf6"],
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.2,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "bounce",
      },
      random: false,
      speed: 1,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.3,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 3 },
    },
  },
  detectRetina: true,
};

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-x-hidden relative">
      {/* Creative Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 z-0"
      />

      {/* Subtle logo watermark */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center bg-contain opacity-5 dark:opacity-3 pointer-events-none"
        style={{
          backgroundImage: `url('/weconnect-logo.png')`,
          backgroundSize: 'clamp(50%, 80%, 100%) auto',
        }}
      />

      {/* Hero Section with Parallax */}
      <Parallax strength={200} className="relative">
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative py-16 sm:py-24 md:py-32 lg:py-40 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 dark:from-blue-500/10 dark:to-purple-500/10" />
          <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-blue-500/30 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-purple-500/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse-slow" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl md:shadow-2xl">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                WE CONNECT
              </h1>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto mb-3 sm:mb-4 md:mb-6 leading-relaxed"
            >
              The <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">ultimate student community platform</span> connecting Nigerian university students to share knowledge, materials, and opportunities.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 italic"
            >
              I Connect. You Connect. We Connect.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-6 md:mt-8"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500 animate-pulse" />
              <span className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400">Built by students, for students</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500 animate-pulse" />
            </motion.div>
          </div>
        </motion.section>
      </Parallax>

      {/* Mission & Values */}
      <Parallax strength={100}>
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-800 dark:text-white mb-10 sm:mb-12 md:mb-16"
          >
            Our Mission
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[
              { icon: Target, colorFrom: 'blue-500', colorTo: 'blue-600', title: 'Empower Learning', desc: 'Making quality educational materials accessible to every Nigerian student, regardless of location or resources.' },
              { icon: Users, colorFrom: 'purple-500', colorTo: 'purple-600', title: 'Build Community', desc: 'Fostering real connections between students across universities to collaborate, share experiences, and grow together.' },
              { icon: Shield, colorFrom: 'emerald-500', colorTo: 'teal-600', title: 'Student-First', desc: 'A safe, trusted platform created and moderated by students who understand your academic journey.' },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="group relative bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-500 ease-out border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${item.colorFrom}/5 to-${item.colorTo}/5 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-${item.colorFrom} to-${item.colorTo} rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 md:mb-6 shadow-lg`}>
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-9 lg:h-9 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-2 sm:mb-3 md:mb-4">{item.title}</h3>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </Parallax>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-10 sm:mb-12 md:mb-16"
          >
            Our Impact
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
            {[
              { icon: Users, value: '50K+', label: 'Active Students' },
              { icon: BookOpen, value: '10K+', label: 'Materials Shared' },
              { icon: GraduationCap, value: '100+', label: 'Universities' },
              { icon: BarChart2, value: '1M+', label: 'Connections Made' },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.6 }}
                className="p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 shadow-lg"
              >
                <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-600 dark:text-blue-400 mx-auto mb-2 sm:mb-3 md:mb-4" />
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white">{stat.value}</h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Parallax strength={150}>
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-slate-800 dark:text-white mb-10 sm:mb-12 md:mb-16"
            >
              Explore WE CONNECT
            </motion.h2>

            <AnimatePresence>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {[
                  { icon: BookOpen, color: 'from-blue-500 to-cyan-600', title: "Materials Library", desc: "Browse thousands of past questions, lecture notes, video tutorials, and technical reviews from students across Nigeria." },
                  { icon: Download, color: 'from-emerald-500 to-teal-600', title: "Downloads", desc: "Keep track of all your downloaded materials in one organized place — accessible anytime." },
                  { icon: Heart, color: 'from-red-500 to-pink-600', title: "Favourites", desc: "Save your most important resources for quick access during exams or revision." },
                  { icon: Users, color: 'from-purple-500 to-indigo-600', title: "Connect Network", desc: "Find and connect with students from your department, school, or across the country." },
                ].map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    className="group bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-500 ease-out border border-slate-200/30 dark:border-slate-700/50"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 md:gap-6">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r ${feature.color} rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2 md:mb-3 group-hover:translate-x-2 transition-transform duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                          {feature.desc}
                        </p>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-slate-400 mt-2 sm:mt-3 md:mt-4 group-hover:translate-x-4 transition-transform duration-300" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </section>
      </Parallax>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-8 sm:mb-10 md:mb-12"
          >
            Get in Touch
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto"
          >
            Have questions, feedback, or want to contribute? We're here for you.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <motion.a 
              href="mailto:support@weconnect.ng"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-out"
            >
              <Mail className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <p className="text-sm sm:text-base md:text-lg font-medium">Email Us</p>
              <p className="text-xs sm:text-sm opacity-90 mt-1">weconnect@gmail.com</p>
            </motion.a>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="group bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-out"
            >
              <Phone className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <p className="text-sm sm:text-base md:text-lg font-medium">Call Us</p>
              <p className="text-xs sm:text-sm opacity-90 mt-1">+234 812 345 6789</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="group bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-out"
            >
              <Globe className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300" />
              <p className="text-sm sm:text-base md:text-lg font-medium">Visit Website</p>
              <p className="text-xs sm:text-sm opacity-90 mt-1">weconnect.ng</p>
            </motion.div>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-10 sm:mt-12 md:mt-16 text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400"
          >
            Made with <span className="text-red-500">❤️</span> by students, for the future of Nigerian education
          </motion.p>
        </div>
      </section>
    </div>
  );
}

export default About;