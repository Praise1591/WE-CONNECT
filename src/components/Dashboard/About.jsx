// About.jsx — Professional, Captivating & Fully Styled with Your Dependencies
import React from 'react';
import { 
  Zap, 
  Users, 
  BookOpen, 
  Download, 
  Heart, 
  MessageSquare, 
  Mail, 
  Phone, 
  Globe, 
  ChevronRight,
  Sparkles,
  Target,
  Shield
} from 'lucide-react';

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
      {/* Hero Section with Gradient Overlay */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 dark:from-blue-500/10 dark:to-purple-500/10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-4 mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-800 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              WE CONNECT
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto mb-6 leading-relaxed">
            The <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">ultimate student community platform</span> connecting Nigerian university students to share knowledge, materials, and opportunities.
          </p>

          <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 italic">
            I Connect. You Connect. We Connect.
          </p>

          <div className="flex items-center justify-center gap-2 mt-8">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-400">Built by students, for students</span>
            <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-800 dark:text-white mb-16">
          Our Mission
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="group relative bg-white dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Empower Learning</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Making quality educational materials accessible to every Nigerian student, regardless of location or resources.
              </p>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Build Community</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Fostering real connections between students across universities to collaborate, share experiences, and grow together.
              </p>
            </div>
          </div>

          <div className="group relative bg-white dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Shield className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Student-First</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                A safe, trusted platform created and moderated by students who understand your academic journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Guide */}
      <section className="py-16 px-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-800 dark:text-white mb-16">
            Explore WE CONNECT
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: BookOpen, color: 'from-blue-500 to-cyan-600', title: "Materials Library", desc: "Browse thousands of past questions, lecture notes, video tutorials, and technical reviews from students across Nigeria." },
              { icon: Download, color: 'from-emerald-500 to-teal-600', title: "Downloads", desc: "Keep track of all your downloaded materials in one organized place — accessible anytime." },
              { icon: Heart, color: 'from-red-500 to-pink-600', title: "Favourites", desc: "Save your most important resources for quick access during exams or revision." },
              { icon: Users, color: 'from-purple-500 to-indigo-600', title: "Connect Network", desc: "Find and connect with students from your department, school, or across the country." },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 border border-slate-200/30 dark:border-slate-700/50">
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 group-hover:translate-x-2 transition-transform">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {feature.desc}
                    </p>
                    <ChevronRight className="w-5 h-5 text-slate-400 mt-4 group-hover:translate-x-4 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-8">
            Get in Touch
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Have questions, feedback, or want to contribute? We're here for you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <a href="mailto:support@weconnect.ng" className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <Mail className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-medium">Email Us</p>
              <p className="text-sm opacity-90 mt-2">weconnect@gmail.com</p>
            </a>

            <div className="group bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <Phone className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-medium">Call Us</p>
              <p className="text-sm opacity-90 mt-2">+234 812 345 6789</p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300">
              <Globe className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-medium">Visit Website</p>
              <p className="text-sm opacity-90 mt-2">weconnect.ng</p>
            </div>
          </div>

          <p className="mt-16 text-lg text-slate-600 dark:text-slate-400">
            Made with <span className="text-red-500">❤️</span> by students, for the future of Nigerian education
          </p>
        </div>
      </section>
    </div>
  );
}

export default About;