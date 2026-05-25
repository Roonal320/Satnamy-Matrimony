import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Heart, Users, Star, Shield, Target, Award, Quote, CheckCircle2, Sparkles } from 'lucide-react';

const stats = [
  { value: '10,000+', label: 'Registered Members', desc: 'Trusting our sacred platform' },
  { value: '500+', label: 'Successful Matches', desc: 'Loves united in Satnam' },
  { value: '50+', label: 'Cities Covered', desc: 'Connecting lives across borders' },
  { value: '4.8★', label: 'Average Rating', desc: 'Highly recommended by families' },
];

const values = [
  {
    icon: <Heart className="w-6 h-6 text-white" fill="white" />,
    title: 'Community First',
    desc: 'We are proudly built for the Satnami community, honoring the teachings of Guru Ghasidas Ji — equality, compassion, and truth.',
    bg: 'linear-gradient(135deg, #C84B31 0%, #A93A21 100%)'
  },
  {
    icon: <Shield className="w-6 h-6 text-white" />,
    title: 'Privacy & Trust',
    desc: 'Your personal information is handled with the highest discretion. We never share your data without your consent.',
    bg: 'linear-gradient(135deg, #1F1A17 0%, #3A2E2A 100%)'
  },
  {
    icon: <Target className="w-6 h-6 text-white" />,
    title: 'Meaningful Connections',
    desc: 'We focus on compatibility, culture, and character — not just profiles — helping you find a lifelong partner.',
    bg: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)'
  },
  {
    icon: <Award className="w-6 h-6 text-white" />,
    title: 'Quality Matches',
    desc: 'Our smart matching algorithm considers education, values, family background, and preferences for truly meaningful suggestions.',
    bg: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)'
  },
];

const team = [
  { 
    name: 'Roonal Khandelwal', 
    role: 'Founder & CEO', 
    initials: 'RK',
    bio: 'Roonal is dedicated to combining modern technology with traditional values, building a trusted space for the Satnami community to find lifelong bonds.'
  },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <Header />

      {/* Hero Section */}
      <div className="py-24 px-4 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1F1A17 0%, #2A211D 50%, #3A2E2A 100%)' }}>
        {/* Soft Background Glows */}
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 15% 30%, var(--primary) 0%, transparent 60%), radial-gradient(circle at 85% 70%, var(--secondary) 0%, transparent 60%)' }} />
        
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 opacity-5" style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="relative mb-8 group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-red-600 opacity-75 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <img 
              src="/guru.png" 
              alt="Guru Ghasidas Ji" 
              className="relative w-20 h-20 rounded-full object-cover border-2 shadow-2xl transition-transform duration-500 group-hover:scale-105" 
              style={{ borderColor: 'var(--secondary)', objectPosition: 'center 30%' }} 
            />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Founded on Satnam Principles
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            About Satnami Shaadi
          </h1>
          <p className="font-body text-lg md:text-xl leading-relaxed max-w-2xl text-stone-300 font-light">
            A sacred digital space where the Satnami community finds love, companionship, and lifelong bonds — rooted in faith, culture, and shared values.
          </p>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-6xl mx-auto px-4 py-20 flex-grow">

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 -mt-32 relative z-20 mb-24">
          {stats.map((s, i) => (
            <div 
              key={i} 
              className="text-center p-8 rounded-3xl bg-white/90 backdrop-blur-md border hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-center" 
              style={{ 
                borderColor: 'var(--border)', 
                boxShadow: '0 10px 30px rgba(31, 26, 23, 0.05)'
              }}
            >
              <p className="font-heading text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-red-700 to-amber-600 bg-clip-text text-transparent">{s.value}</p>
              <p className="font-body text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
              <p className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Our Story & Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-red-600" />
              <span className="font-body text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Our Heritage</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
              Connecting Hearts, <br/>Honoring Tradition
            </h2>
            <div className="space-y-5 font-body leading-relaxed text-base" style={{ color: 'var(--text-secondary)' }}>
              <p>
                Satnami Shaadi was founded with a single, heartfelt purpose — to create a trustworthy matrimonial platform exclusively for the Satnami community, inspired by the timeless principles of Guru Ghasidas Ji: truth (Satnam), equality, and compassion.
              </p>
              <p>
                Founded by <strong style={{ color: 'var(--text-primary)' }}>Roonal Khandelwal</strong> and headquartered in Raipur, Chhattisgarh, we understand the cultural nuances, family values, and traditions that are central to a Satnami household. Our platform is built not just as a matrimony service, but as a community institution.
              </p>
              <p>
                We believe that finding a life partner is one of the most important decisions a family and individual make. Our platform combines modern digital matching technology with a deep respect for tradition, giving you the tools to find compatible, verified matches with confidence and dignity.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="rounded-3xl p-6 text-center hover:scale-105 transition-transform duration-300 shadow-md" style={{ background: 'linear-gradient(135deg, #C84B31 0%, #A93A21 100%)' }}>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading text-xl font-bold text-white mb-1">Community</p>
              <p className="font-body text-xs text-white/80">Exclusively for Satnami matches</p>
            </div>
            
            <div className="rounded-3xl p-6 text-center hover:scale-105 transition-transform duration-300 shadow-md" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)' }}>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading text-xl font-bold text-white mb-1">Verified</p>
              <p className="font-body text-xs text-white/80">Manual moderation of profiles</p>
            </div>

            <div className="rounded-3xl p-6 text-center hover:scale-105 transition-transform duration-300 shadow-md" style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)' }}>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="font-heading text-xl font-bold text-white mb-1">Secure</p>
              <p className="font-body text-xs text-white/80">Privacy & protection of data</p>
            </div>

            <div className="rounded-3xl p-6 text-center hover:scale-105 transition-transform duration-300 shadow-md" style={{ background: 'linear-gradient(135deg, #1F1A17 0%, #3A2E2A 100%)' }}>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <p className="font-heading text-xl font-bold text-white mb-1">Trusted</p>
              <p className="font-body text-xs text-white/80">Over 500+ successful matches</p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-red-600" />
              <span className="font-body text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Our Principles</span>
              <span className="w-8 h-px bg-red-600" />
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Our Core Values</h2>
            <p className="font-body text-base max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Built upon values of respect, transparency, and community heritage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div 
                key={i} 
                className="flex gap-5 p-8 rounded-3xl bg-white hover:border-amber-500/30 border transition-all duration-300 hover:shadow-lg" 
                style={{ 
                  borderColor: 'var(--border)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                }}
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner" 
                  style={{ background: v.bg }}
                >
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-heading text-2xl font-bold mb-2.5" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                  <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Our Mission */}
        <div className="relative py-16 px-8 md:px-16 rounded-3xl mb-24 overflow-hidden text-center border" style={{ 
          background: 'linear-gradient(135deg, #1F1A17 0%, #3A2E2A 100%)',
          borderColor: 'var(--secondary)'
        }}>
          {/* Top light glow */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, var(--secondary) 0%, transparent 60%)' }} />
          
          <Quote className="w-12 h-12 text-amber-500/20 mx-auto mb-6 rotate-180" />
          
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
          <p className="font-body text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-stone-300 font-light italic">
            "To empower the Satnami community with a safe, dignified, and culturally sensitive matrimonial platform that facilitates meaningful life partnerships — guided by the eternal wisdom of <span className="text-amber-400 font-semibold not-italic">Guru Ghasidas Ji</span> and the values of Satnam."
          </p>
        </div>

        {/* Leadership */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-8 h-px bg-red-600" />
            <span className="font-body text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Leadership</span>
            <span className="w-8 h-px bg-red-600" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Behind Satnami Shaadi</h2>
          <p className="font-body text-base max-w-lg mx-auto mb-12" style={{ color: 'var(--text-secondary)' }}>
            The visionary leader driving our platform's mission.
          </p>

          <div className="flex justify-center">
            {team.map((m, i) => (
              <div 
                key={i} 
                className="p-8 md:p-10 rounded-3xl bg-white text-center max-w-md border hover:border-amber-500/30 transition-all duration-300 shadow-sm hover:shadow-md" 
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="relative w-24 h-24 mx-auto mb-6 group">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-red-600 opacity-50 blur group-hover:opacity-75 transition duration-500" />
                  <div className="relative w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-heading font-bold shadow-md" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)' }}>
                    {m.initials}
                  </div>
                </div>
                <h3 className="font-heading text-2xl font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>{m.name}</h3>
                <p className="font-body text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--primary)' }}>{m.role}</p>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-16 px-6 md:px-12 rounded-3xl mb-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--surface-secondary) 0%, #E6E2D8 100%)', border: '1px solid var(--border)' }}>
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Begin Your Sacred Journey</h2>
          <p className="font-body text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of Satnami families who trust us to find their ideal life partner. Register today and explore verified profiles.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a href="/register" className="px-8 py-3 rounded-full font-body font-semibold text-white transition-all hover:opacity-95 hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg" style={{ background: 'var(--primary)' }}>
              Create Free Account
            </a>
            <a href="/login" className="px-8 py-3 rounded-full font-body font-semibold transition-all hover:bg-black/5 hover:scale-[1.02] active:scale-95 border" style={{ borderColor: 'var(--text-primary)', color: 'var(--text-primary)' }}>
              Sign In
            </a>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
