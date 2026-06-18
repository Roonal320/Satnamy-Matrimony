import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from 'react-i18next';
import { Heart, Users, UserPlus, Shield, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const RegisterChoice = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const options = [
    {
      id: 'self',
      icon: <UserPlus className="w-10 h-10" />,
      title: 'Self Registration',
      subtitle: 'I am looking for a life partner for myself',
      description: 'Create your own profile and find your perfect match directly.',
      color: 'var(--primary)',
      gradient: 'linear-gradient(135deg, #C84B31 0%, #A13A25 100%)',
      path: '/register',
      badge: null,
    },
    {
      id: 'parent',
      icon: <Users className="w-10 h-10" />,
      title: 'Parent / Guardian',
      subtitle: 'I am a parent or guardian registering for my child',
      description: 'Register on behalf of your son or daughter. Build a trusted family profile.',
      color: '#D4AF37',
      gradient: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
      path: '/parent-register',
      badge: '👨‍👩‍👧 Family Trusted',
    },
    {
      id: 'relative',
      icon: <Heart className="w-10 h-10" />,
      title: 'Brother / Sister / Relative',
      subtitle: 'I am registering on behalf of a family member',
      description: 'Help your sibling or relative find their life partner with a family-managed profile.',
      color: '#6C63FF',
      gradient: 'linear-gradient(135deg, #6C63FF 0%, #4B47B3 100%)',
      path: '/parent-register?type=relative',
      badge: '👫 Family Managed',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <SEO
        title="Register | Satnami Matrimony"
        description="Choose how you want to register on Satnami Matrimony. Register as self, parent, or relative to find the perfect life partner."
        keywords="register satnami matrimony, parent registration, family matrimony"
        canonicalUrl="https://satnamishaadiii.com/register-choice"
      />
      <Header />

      {/* Hero Section */}
      <div
        className="relative py-16 md:py-24 px-4 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(200,75,49,0.05) 0%, rgba(212,175,55,0.08) 50%, rgba(108,99,255,0.05) 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-body font-medium mb-6"
            style={{
              background: 'rgba(200,75,49,0.1)',
              color: 'var(--primary)',
            }}
          >
            <Shield className="w-4 h-4" />
            Trusted Satnami Community Platform
          </div>
          <h1
            className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            How would you like to{' '}
            <span style={{ color: 'var(--primary)' }}>register?</span>
          </h1>
          <p
            className="font-body text-base md:text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Choose the registration type that suits you best. Whether you are searching for yourself or helping a family member, we make it easy and trustworthy.
          </p>
        </div>
      </div>

      {/* Registration Cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => (
            <button
              key={option.id}
              id={`register-option-${option.id}`}
              data-testid={`register-option-${option.id}`}
              onClick={() => navigate(option.path)}
              className="group relative bg-white rounded-2xl p-6 md:p-8 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus:outline-none"
              style={{
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = option.color;
                e.currentTarget.style.boxShadow = `0 20px 40px -12px ${option.color}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Badge */}
              {option.badge && (
                <div
                  className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-body font-semibold text-white shadow-md"
                  style={{ background: option.gradient }}
                >
                  {option.badge}
                </div>
              )}

              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-white transition-transform duration-300 group-hover:scale-110"
                style={{ background: option.gradient }}
              >
                {option.icon}
              </div>

              {/* Content */}
              <h3
                className="font-heading text-xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {option.title}
              </h3>
              <p
                className="font-body text-sm mb-3"
                style={{ color: option.color }}
              >
                {option.subtitle}
              </p>
              <p
                className="font-body text-sm mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                {option.description}
              </p>

              {/* CTA */}
              <div
                className="flex items-center gap-2 font-body font-semibold text-sm transition-all duration-200 group-hover:gap-3"
                style={{ color: option.color }}
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>

        {/* Already have an account */}
        <div className="mt-10 text-center">
          <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium transition-smooth"
              style={{ color: 'var(--primary)' }}
            >
              Login here
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterChoice;
