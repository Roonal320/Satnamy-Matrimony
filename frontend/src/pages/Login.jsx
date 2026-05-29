import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logAnalyticsEvent } from '../lib/firebase';

/**
 * Styled Google button matching the app's design system.
 */
const GoogleAuthButton = ({ onClick, loading, label }) => (
  <button
    type="button"
    id="google-auth-button"
    data-testid="google-auth-button"
    onClick={onClick}
    disabled={loading}
    className="w-full h-12 rounded-full font-body font-medium transition-all duration-200 flex items-center justify-center gap-3"
    style={{
      background: 'white',
      border: '1.5px solid var(--border)',
      color: 'var(--text-primary)',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
    }}
    onMouseEnter={(e) => {
      if (!loading) {
        e.currentTarget.style.background = 'var(--surface-secondary)';
        e.currentTarget.style.borderColor = 'var(--text-secondary)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }
    }}
    onMouseLeave={(e) => {
      if (!loading) {
        e.currentTarget.style.background = 'white';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }
    }}
  >
    {loading ? (
      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    )}
    <span>{loading ? 'Connecting...' : label}</span>
  </button>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    logAnalyticsEvent('login_attempt', { method: 'password' });

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      logAnalyticsEvent('login_success', { method: 'password' });
      navigate('/');
    } else {
      logAnalyticsEvent('login_failure', { method: 'password', error: result.error });
      setError(result.error);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setGoogleLoading(true);
      logAnalyticsEvent('login_attempt', { method: 'google' });

      const result = await googleLogin(tokenResponse.access_token);
      setGoogleLoading(false);

      if (result.success) {
        logAnalyticsEvent('login_success', { method: 'google' });
        navigate('/');
      } else if (result.needsSignup) {
        logAnalyticsEvent('google_signup_required');
        navigate('/google-complete-signup', {
          state: {
            googleData: result.googleData,
            credential: result.credential,
          },
        });
      } else {
        logAnalyticsEvent('login_failure', { method: 'google', error: result.error || 'Google sign-in failed' });
        setError(result.error || 'Google sign-in failed.');
      }
    },
    onError: () => {
      logAnalyticsEvent('login_failure', { method: 'google', error: 'Google sign-in cancelled/failed' });
      setError('Google sign-in was cancelled or failed.');
    },
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ borderColor: 'var(--border)', borderWidth: '1px' }}>
            <div className="text-center mb-8">
              <h1 className="font-heading text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('auth.login_title')}
              </h1>
              <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
                {t('auth.login_subtitle')}
              </p>
            </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'var(--surface-secondary)', borderLeft: '4px solid var(--error)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
              <p className="text-sm font-body" style={{ color: 'var(--error)' }}>{error}</p>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-6">
            <GoogleAuthButton
              onClick={() => handleGoogleLogin()}
              loading={googleLoading}
              label={t('auth.google_sign_in', { defaultValue: 'Sign in with Google' })}
            />
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-sm font-body" style={{ color: 'var(--text-secondary)' }}>
              {t('auth.or_divider', { defaultValue: 'OR' })}
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="font-body">{t('auth.email')}</Label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-2 h-12 font-body"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-body">{t('auth.password')}</Label>
                <Link to="/forgot-password" className="text-xs font-body font-medium transition-smooth hover:underline" style={{ color: 'var(--primary)' }}>
                  {t('auth.forgot_password', { defaultValue: 'Forgot Password?' })}
                </Link>
              </div>
              <Input
                id="password"
                data-testid="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-2 h-12 font-body"
              />
            </div>

            <Button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="w-full h-12 rounded-full font-body font-medium text-white transition-smooth"
              style={{ background: loading ? 'var(--text-secondary)' : 'var(--primary)' }}
              onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--primary-hover)')}
              onMouseLeave={(e) => !loading && (e.target.style.background = 'var(--primary)')}
            >
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
              {t('auth.no_account')}{' '}
              <Link to="/register" className="font-medium transition-smooth" style={{ color: 'var(--primary)' }}>
                {t('auth.register_now')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
