import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Heart, Search, MessageCircle, Crown, CheckCircle } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: 'Advanced Search',
      description: 'Filter by education, occupation, location, and more',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Perfect Matches',
      description: 'AI-powered suggestions based on your preferences',
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Secure Chat',
      description: 'Connect with matches through our private messaging',
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: 'Premium Features',
      description: 'Get higher visibility with premium membership',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Hero Section */}
      <div
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1722952934661-dde241aeb591?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY291cGxlfGVufDB8fHx8MTc3NTQ4OTI1Nnww&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 hero-overlay"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1
            className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white"
            data-testid="hero-heading"
          >
            Find Your Perfect Match in the Satnami Community
          </h1>
          <p className="font-body text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of Satnami community members finding their life partners through our trusted matrimony platform
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button
                data-testid="hero-discover-button"
                onClick={() => navigate('/discover')}
                className="h-14 px-8 rounded-full font-body font-medium text-white text-lg transition-smooth"
                style={{ background: 'var(--primary)' }}
                onMouseEnter={(e) => (e.target.style.background = 'var(--primary-hover)')}
                onMouseLeave={(e) => (e.target.style.background = 'var(--primary)')}
              >
                Discover Matches
              </Button>
            ) : (
              <>
                <Button
                  data-testid="hero-register-button"
                  onClick={() => navigate('/register')}
                  className="h-14 px-8 rounded-full font-body font-medium text-white text-lg transition-smooth"
                  style={{ background: 'var(--primary)' }}
                  onMouseEnter={(e) => (e.target.style.background = 'var(--primary-hover)')}
                  onMouseLeave={(e) => (e.target.style.background = 'var(--primary)')}
                >
                  Get Started
                </Button>
                <Button
                  data-testid="hero-login-button"
                  onClick={() => navigate('/login')}
                  className="h-14 px-8 rounded-full font-body font-medium transition-smooth"
                  style={{ background: 'white', color: 'var(--primary)' }}
                  onMouseEnter={(e) => (e.target.style.background = 'var(--surface-secondary)')}
                  onMouseLeave={(e) => (e.target.style.background = 'white')}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4" style={{ background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-16" style={{ color: 'var(--text-primary)' }}>
            Why Choose Us?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                data-testid={`feature-card-${index}`}
                className="p-8 rounded-2xl transition-smooth hover:-translate-y-1"
                style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border)' }}
              >
                <div className="mb-4" style={{ color: 'var(--primary)' }}>
                  {feature.icon}
                </div>
                <h3 className="font-heading text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories Section */}
      <div className="py-20 px-4" style={{ background: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-center mb-16" style={{ color: 'var(--text-primary)' }}>
            Success Stories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl transition-smooth"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--secondary)' }}>
                  {[...Array(5)].map((_, j) => (
                    <CheckCircle key={j} className="w-5 h-5" fill="currentColor" />
                  ))}
                </div>
                <p className="font-body mb-4 italic" style={{ color: 'var(--text-secondary)' }}>
                  "We found each other through Satnami Matrimony and couldn't be happier. The platform made it so easy to connect with our perfect match!"
                </p>
                <p className="font-body font-semibold" style={{ color: 'var(--text-primary)' }}>
                  - Happy Couple {i}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="py-20 px-4 text-center"
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-4xl sm:text-5xl font-bold mb-6 text-white">
            Ready to Find Your Life Partner?
          </h2>
          <p className="font-body text-lg text-white/90 mb-8">
            Join our community today and start your journey towards a happy marriage
          </p>
          <Button
            data-testid="cta-register-button"
            onClick={() => navigate('/register')}
            className="h-14 px-8 rounded-full font-body font-medium text-lg transition-smooth"
            style={{ background: 'white', color: 'var(--primary)' }}
            onMouseEnter={(e) => (e.target.style.background = 'var(--surface-secondary)')}
            onMouseLeave={(e) => (e.target.style.background = 'white')}
          >
            Register Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;