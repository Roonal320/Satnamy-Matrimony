import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { MessageCircle, Crown, User, LogOut, LogIn } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl shadow-sm"
      style={{ background: 'rgba(255, 255, 255, 0.98)', borderBottom: '2px solid #2E5090' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Guru Ghasidas Photo */}
            <img
              src="https://customer-assets.emergentagent.com/job_satnami-unions/artifacts/kszwmy3l_ChatGPT%20Image%20Apr%206%2C%202026%2C%2010_53_26%20PM.png"
              alt="Guru Ghasidas Ji"
              className="w-14 h-14 rounded-full object-cover border-3 shadow-lg"
              style={{ borderColor: '#2E5090', objectPosition: 'center 30%' }}
            />
            
            <div onClick={() => navigate('/')} className="cursor-pointer">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                Satnami Matrimony
              </h1>
              <p className="font-heading text-base sm:text-lg font-bold tracking-wide" style={{ color: '#2E5090' }}>
                जय सतनाम
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                <Button
                  data-testid="nav-messages-button"
                  onClick={() => navigate('/chat')}
                  variant="ghost"
                  className="transition-smooth hover:bg-blue-50"
                  size="sm"
                >
                  <MessageCircle className="w-5 h-5" style={{ color: '#2E5090' }} />
                  <span className="hidden sm:inline ml-2" style={{ color: '#2E5090' }}>Messages</span>
                </Button>
                <Button
                  data-testid="nav-premium-button"
                  onClick={() => navigate('/premium')}
                  variant="ghost"
                  className="transition-smooth hover:bg-yellow-50"
                  size="sm"
                >
                  <Crown className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
                  <span className="hidden sm:inline ml-2">Premium</span>
                </Button>
                <Button
                  data-testid="nav-profile-button"
                  onClick={() => navigate(`/profile/${user?.id}`)}
                  variant="ghost"
                  className="transition-smooth hover:bg-blue-50"
                  size="sm"
                >
                  <User className="w-5 h-5" style={{ color: '#2E5090' }} />
                  <span className="hidden sm:inline ml-2" style={{ color: '#2E5090' }}>Profile</span>
                </Button>
                <Button
                  data-testid="nav-logout-button"
                  onClick={logout}
                  variant="ghost"
                  className="transition-smooth hover:bg-red-50"
                  size="sm"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline ml-2">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  data-testid="nav-login-button"
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className="transition-smooth hover:bg-blue-50"
                  size="sm"
                  style={{ color: '#2E5090' }}
                >
                  <LogIn className="w-5 h-5" />
                  <span className="hidden sm:inline ml-2">Sign In</span>
                </Button>
                <Button
                  data-testid="nav-register-button"
                  onClick={() => navigate('/register')}
                  className="h-10 px-4 sm:px-6 rounded-full font-body font-medium text-white transition-smooth shadow-md"
                  style={{ background: 'var(--primary)' }}
                  onMouseEnter={(e) => (e.target.style.background = 'var(--primary-hover)')}
                  onMouseLeave={(e) => (e.target.style.background = 'var(--primary)')}
                  size="sm"
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
