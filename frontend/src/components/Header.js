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
      style={{ background: 'rgba(255, 255, 255, 0.98)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink min-w-0">
            {/* Guru Ghasidas Photo */}
            <img
              src="https://customer-assets.emergentagent.com/job_satnami-unions/artifacts/kszwmy3l_ChatGPT%20Image%20Apr%206%2C%202026%2C%2010_53_26%20PM.png"
              alt="Guru Ghasidas Ji"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 shadow-md flex-shrink-0"
              style={{ borderColor: 'var(--primary)', objectPosition: 'center 30%' }}
            />
            
            <div onClick={() => navigate('/')} className="cursor-pointer min-w-0 flex-shrink">
              <h1 className="font-heading text-lg sm:text-2xl md:text-3xl font-bold truncate" style={{ color: 'var(--primary)' }}>
                Satnami Matrimony
              </h1>
              <p className="font-body text-[10px] sm:text-xs md:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                जय सतनाम
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
            {user ? (
              <>
                <Button
                  data-testid="nav-messages-button"
                  onClick={() => navigate('/chat')}
                  variant="ghost"
                  className="transition-smooth p-1 sm:p-2"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden md:inline ml-2 text-sm">Messages</span>
                </Button>
                <Button
                  data-testid="nav-premium-button"
                  onClick={() => navigate('/premium')}
                  variant="ghost"
                  className="transition-smooth p-1 sm:p-2"
                  size="sm"
                >
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--secondary)' }} />
                  <span className="hidden md:inline ml-2 text-sm">Premium</span>
                </Button>
                <Button
                  data-testid="nav-profile-button"
                  onClick={() => navigate(`/profile/${user?.id}`)}
                  variant="ghost"
                  className="transition-smooth p-1 sm:p-2"
                  size="sm"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden md:inline ml-2 text-sm">Profile</span>
                </Button>
                <Button
                  data-testid="nav-logout-button"
                  onClick={logout}
                  variant="ghost"
                  className="transition-smooth p-1 sm:p-2"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline ml-2 text-sm">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  data-testid="nav-login-button"
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className="transition-smooth p-1 sm:p-2"
                  size="sm"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline ml-1 sm:ml-2 text-xs sm:text-sm">Sign In</span>
                </Button>
                <Button
                  data-testid="nav-register-button"
                  onClick={() => navigate('/register')}
                  className="h-8 sm:h-10 px-3 sm:px-4 md:px-6 rounded-full font-body font-medium text-white transition-smooth text-xs sm:text-sm"
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
