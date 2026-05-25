import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from './ui/dialog';
import { Home, MessageCircle, Crown, User, LogOut, LogIn, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('hi') ? 'en' : 'hi';
    i18n.changeLanguage(newLang);
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl shadow-sm w-full"
      style={{ background: 'rgba(255, 255, 255, 0.98)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink min-w-0">
            {/* Guru Ghasidas Photo */}
            <Dialog>
              <DialogTrigger asChild>
                <img
                  src="/guru.png"
                  alt="Guru Ghasidas Ji"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 shadow-md flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
                  style={{ borderColor: 'var(--primary)', objectPosition: 'center 30%' }}
                />
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] md:max-w-2xl bg-transparent border-0 shadow-none p-0 flex justify-center items-center">
                <DialogTitle className="sr-only">Guru Ghasidas Ji</DialogTitle>
                <DialogDescription className="sr-only">Full size photo of Guru Ghasidas Ji</DialogDescription>
                <img
                  src="/guru.png"
                  alt="Guru Ghasidas Ji"
                  className="w-auto h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
              </DialogContent>
            </Dialog>
            
            <div onClick={() => navigate('/')} className="cursor-pointer min-w-0 flex-shrink pt-1">
              <h1 className="font-heading text-sm sm:text-lg md:text-xl lg:text-2xl font-bold whitespace-nowrap leading-normal" style={{ color: 'var(--primary)' }}>
                {t('header.brand_name')}
              </h1>
              <p className="font-body text-[10px] sm:text-xs md:text-sm font-medium leading-relaxed hidden md:block" style={{ color: 'var(--text-secondary)' }}>
                {t('header.brand_slogan')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
            <Button
              onClick={toggleLanguage}
              variant="outline"
              className="font-body text-xs sm:text-sm font-bold rounded-full border-2 h-8 sm:h-10 px-2 sm:px-3"
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              {i18n.language.startsWith('hi') ? 'English' : 'हिंदी'}
            </Button>
            
            <Button
              data-testid="nav-home-button"
              onClick={() => navigate('/')}
              variant="ghost"
              className="transition-smooth p-1 sm:p-2"
              size="sm"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline ml-1 sm:ml-2 text-xs sm:text-sm">{t('header.home')}</span>
            </Button>
            
            {user ? (
              <>
                {user.is_premium && (
                  <div
                    className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border shadow-sm mr-0.5 sm:mr-1"
                    style={{
                      background: user.premium_plan?.includes('platinum')
                        ? 'linear-gradient(135deg, #1F1A17 0%, #3D3530 100%)'
                        : user.premium_plan?.includes('diamond')
                          ? 'linear-gradient(135deg, #6C63FF 0%, #4B47B3 100%)'
                          : 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                      color: 'white',
                      borderColor: 'transparent'
                    }}
                  >
                    <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    <span className="text-[9px] sm:text-[10px] font-body font-bold uppercase tracking-wider hidden sm:inline">
                      {user.premium_name || 'Premium'}
                    </span>
                  </div>
                )}
                <Button
                  data-testid="nav-messages-button"
                  onClick={() => navigate('/chat')}
                  variant="ghost"
                  className="transition-smooth p-1 sm:p-2"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline ml-2 text-sm">{t('header.messages')}</span>
                </Button>
                <Button
                  data-testid="nav-premium-button"
                  onClick={() => navigate('/premium')}
                  variant="ghost"
                  className="transition-smooth p-1 sm:p-2"
                  size="sm"
                >
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--secondary)' }} />
                  <span className="hidden lg:inline ml-2 text-sm">{t('header.premium')}</span>
                </Button>
                <Button
                  data-testid="nav-profile-button"
                  onClick={() => navigate(`/profile/${user?.id}`)}
                  variant="ghost"
                  className="transition-smooth p-1 sm:p-2"
                  size="sm"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline ml-2 text-sm">{t('header.profile')}</span>
                </Button>
                <Button
                  data-testid="nav-logout-button"
                  onClick={logout}
                  variant="ghost"
                  className="transition-smooth p-1 sm:p-2"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden lg:inline ml-2 text-sm">{t('header.logout')}</span>
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
                  <span className="hidden sm:inline ml-1 sm:ml-2 text-xs sm:text-sm">{t('header.sign_in')}</span>
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
                  {t('header.register')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation Toggle & Premium Badge */}
          <div className="flex md:hidden items-center gap-2 flex-shrink-0">
            {user && user.is_premium && (
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border shadow-sm"
                style={{
                  background: user.premium_plan?.includes('platinum')
                    ? 'linear-gradient(135deg, #1F1A17 0%, #3D3530 100%)'
                    : user.premium_plan?.includes('diamond')
                      ? 'linear-gradient(135deg, #6C63FF 0%, #4B47B3 100%)'
                      : 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
                  color: 'white',
                  borderColor: 'transparent'
                }}
              >
                <Crown className="w-3 h-3 text-white" />
                <span className="text-[9px] font-body font-bold uppercase tracking-wider">
                  {user.premium_name || 'Premium'}
                </span>
              </div>
            )}
            
            <Button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              variant="ghost"
              size="sm"
              className="p-1 sm:p-2"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-40 bg-white/98 backdrop-blur-xl border-b shadow-lg animate-in fade-in slide-in-from-top-5 duration-200" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-col p-4 gap-2">
            <Button
              data-testid="nav-home-button"
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              variant="ghost"
              className="flex items-center justify-start gap-3 w-full py-2 px-3 hover:bg-neutral-100 rounded-lg text-sm font-body"
            >
              <Home className="w-5 h-5 text-neutral-600" />
              <span>{t('header.home')}</span>
            </Button>

            {user ? (
              <>
                <Button
                  data-testid="nav-messages-button"
                  onClick={() => {
                    navigate('/chat');
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="flex items-center justify-start gap-3 w-full py-2 px-3 hover:bg-neutral-100 rounded-lg text-sm font-body"
                >
                  <MessageCircle className="w-5 h-5 text-neutral-600" />
                  <span>{t('header.messages')}</span>
                </Button>

                <Button
                  data-testid="nav-premium-button"
                  onClick={() => {
                    navigate('/premium');
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="flex items-center justify-start gap-3 w-full py-2 px-3 hover:bg-neutral-100 rounded-lg text-sm font-body"
                >
                  <Crown className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
                  <span>{t('header.premium')}</span>
                </Button>

                <Button
                  data-testid="nav-profile-button"
                  onClick={() => {
                    navigate(`/profile/${user?.id}`);
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="flex items-center justify-start gap-3 w-full py-2 px-3 hover:bg-neutral-100 rounded-lg text-sm font-body"
                >
                  <User className="w-5 h-5 text-neutral-600" />
                  <span>{t('header.profile')}</span>
                </Button>

                <Button
                  data-testid="nav-logout-button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="flex items-center justify-start gap-3 w-full py-2 px-3 hover:bg-neutral-100 rounded-lg text-sm font-body text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('header.logout')}</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  data-testid="nav-login-button"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="flex items-center justify-start gap-3 w-full py-2 px-3 hover:bg-neutral-100 rounded-lg text-sm font-body"
                >
                  <LogIn className="w-5 h-5 text-neutral-600" />
                  <span>{t('header.sign_in')}</span>
                </Button>

                <Button
                  data-testid="nav-register-button"
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-full font-body font-medium text-white transition-smooth text-sm flex items-center justify-center"
                  style={{ background: 'var(--primary)' }}
                >
                  {t('header.register')}
                </Button>
              </>
            )}

            <div className="border-t my-2" style={{ borderColor: 'var(--border)' }}></div>

            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-xs font-body font-medium text-neutral-500">Language / भाषा</span>
              <Button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                variant="outline"
                className="font-body text-xs font-bold rounded-full border-2 h-8 px-3"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                {i18n.language.startsWith('hi') ? 'English' : 'हिंदी'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
