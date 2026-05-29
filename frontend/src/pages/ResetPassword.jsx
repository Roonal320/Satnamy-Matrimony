import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tok = params.get('token');
    if (!tok) {
      setError('Invalid reset link. Token is missing.');
    } else {
      setToken(tok);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token is missing or invalid.');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/auth/reset-password`, { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white rounded-2xl p-8 shadow-lg animate-smooth" style={{ borderColor: 'var(--border)', borderWidth: '1px' }}>
            
            {success ? (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <CheckCircle2 className="w-16 h-16 text-green-500 animate-in zoom-in-50 duration-300" />
                </div>
                <h1 className="font-heading text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  {t('auth.reset_password_title')}
                </h1>
                <p className="font-body text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Password reset successfully! You can now log in with your new password.
                </p>

                <Link to="/login">
                  <Button className="w-full h-12 rounded-full font-body font-medium text-white transition-smooth animate-bounce-short" style={{ background: 'var(--primary)' }}>
                    <span>{t('header.sign_in')}</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {t('auth.reset_password_title')}
                  </h1>
                  <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t('auth.reset_password_subtitle')}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'var(--surface-secondary)', borderLeft: '4px solid var(--error)' }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
                    <p className="text-sm font-body" style={{ color: 'var(--error)' }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="password" className="font-body">{t('auth.new_password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={!token}
                      className="mt-2 h-12 font-body animate-smooth"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="font-body">{t('auth.confirm_new_password')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={!token}
                      className="mt-2 h-12 font-body animate-smooth"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full h-12 rounded-full font-body font-medium text-white transition-smooth"
                    style={{ background: loading ? 'var(--text-secondary)' : 'var(--primary)' }}
                  >
                    {loading ? t('auth.resetting_password') : t('auth.reset_password_btn')}
                  </Button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
