// About.jsx - Authentic, Clean Design
import React, { useEffect, useRef, useState } from 'react';
import { 
  Zap, Users, BookOpen, Download, Heart, Mail, Phone, Globe, 
  Target, Shield, Lightbulb, Compass, Coffee, MessageCircle,
  ChevronDown, Quote, Twitter, Linkedin, Instagram, Youtube,
  ArrowUpRight, Sparkles, Gem, Crown, Star, Feather, 
  Eye, Layers, Palette, Code, Camera, Music
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

function About() {
  const [activeSection, setActiveSection] = useState('mission');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.98]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['mission', 'values', 'features', 'contact'];
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We believe in the power of fresh ideas and creative solutions to transform education.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Learning is better together. We foster genuine connections and peer-to-peer support.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "We maintain a safe, respectful space where academic honesty is valued and protected.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Heart,
      title: "Empathy",
      description: "Understanding the student journey helps us build tools that truly serve our community.",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: Compass,
      title: "Growth",
      description: "We're committed to continuous improvement based on real student feedback and needs.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Coffee,
      title: "Dedication",
      description: "Built by students who understand the challenges and celebrate the victories.",
      color: "from-stone-500 to-neutral-500"
    }
  ];

  const features = [
    {
      icon: BookOpen,
      title: "Resource Sharing",
      description: "Upload and access study materials, past questions, and educational resources shared by peers.",
      details: "Share your notes, find relevant materials, and build your academic toolkit."
    },
    {
      icon: MessageCircle,
      title: "Community Discussions",
      description: "Engage in meaningful conversations about courses, careers, and campus life.",
      details: "Connect with students who share your interests and academic goals."
    },
    {
      icon: Download,
      title: "Personal Library",
      description: "Save and organize your favorite resources for quick access when you need them.",
      details: "Build your personal collection of valuable learning materials."
    },
    {
      icon: Users,
      title: "Study Networks",
      description: "Find study partners and build connections within your department and beyond.",
      details: "Create or join study groups that match your learning style."
    }
  ];

  const teamMembers = [
    { name: "Oluwaseun Adekunle", role: "Founder", bio: "Computer Science student passionate about EdTech", avatar: "👨‍💻" },
    { name: "Amina Mohammed", role: "Community Lead", bio: "Building inclusive learning spaces", avatar: "👩‍💼" },
    { name: "Chidi Okonkwo", role: "Technical Lead", bio: "Full-stack developer & open-source advocate", avatar: "👨‍🔧" },
    { name: "Ngozi Eze", role: "Content Curator", bio: "Ensuring quality educational resources", avatar: "📚" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation Dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block">
        <div className="flex flex-col gap-3">
          {['mission', 'values', 'features', 'contact'].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeSection === section 
                  ? 'bg-indigo-600 w-6' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center px-4"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-full">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-indigo-600 dark:text-indigo-400">Student Built · Student Driven</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WE CONNECT
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4"
          >
            A community platform for Nigerian university students
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-gray-500 dark:text-gray-500 max-w-2xl mx-auto mb-12"
          >
            Share knowledge, discover resources, and connect with fellow students who share your academic journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-8 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors">
              Join the Community
            </button>
            <button className="px-8 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Learn More
            </button>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <section id="mission" className="py-24 px-4 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                To create a supportive digital space where Nigerian university students can connect, collaborate, and grow together.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We believe that every student deserves access to quality educational resources and a community that supports their academic journey. WE CONNECT was born from this belief — built by students, for students.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-full flex items-center justify-center">
                  <Feather className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Started with a simple idea</p>
                  <p className="font-medium text-gray-900 dark:text-white">One platform. Infinite possibilities.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Eye className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Vision</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Connected learning for all</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Empower student success</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Community</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Collaborative learning</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <Sparkles className="w-6 h-6 text-amber-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Impact</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Real student outcomes</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              These principles guide everything we do at WE CONNECT
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What We Offer
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tools and features designed to enhance your learning experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {feature.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {feature.details}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 rounded-full mb-6">
              <Quote className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-600 dark:text-amber-400">Our Story</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How It All Began
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              WE CONNECT started as a simple idea among a group of Nigerian university students who recognized a common challenge: accessing quality study materials and connecting with peers across different institutions was harder than it needed to be.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              What began as a small WhatsApp group sharing past questions grew into something bigger. Students wanted more — a dedicated space where they could not only share resources but also build meaningful connections, find study partners, and support each other's academic journeys.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Today, WE CONNECT is growing organically as more students discover the value of a community built by and for Nigerian students. We're not trying to be the biggest platform — we're focused on being the most genuine and useful one.
            </p>
            <div className="pt-6">
              <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-full flex items-center justify-center">
                  <Code className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Built with ❤️ by students</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Open to feedback, driven by community needs</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-4 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Behind the Platform
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A team of passionate students working to make learning better
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Have questions, feedback, or ideas? We'd love to hear from you.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <a
                href="mailto:hello@weconnect.ng"
                className="group flex items-center gap-4 p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-500">Email us</p>
                  <p className="font-medium text-gray-900 dark:text-white">hello@weconnect.ng</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>

              <div className="group flex items-center gap-4 p-6 bg-gray-50 dark:bg-slate-900 rounded-2xl">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-500">Join our community</p>
                  <p className="font-medium text-gray-900 dark:text-white">Discord / WhatsApp</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              {[Twitter, Linkedin, Instagram, Youtube].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors group"
                >
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </a>
              ))}
            </div>

            <p className="mt-12 text-sm text-gray-500 dark:text-gray-500">
              Made with <Heart className="w-3 h-3 inline text-red-500" /> by Nigerian students
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default About;