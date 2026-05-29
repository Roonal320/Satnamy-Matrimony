import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devLink, setDevLink] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDevLink('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/auth/forgot-password`, { email });
      setSuccess(true);
      if (data.devLink) {
        setDevLink(data.devLink);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to process request. Please try again.');
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
                  {t('auth.forgot_password_title')}
                </h1>
                <p className="font-body text-sm mb-6 leading-relaxed animate-fade-in" style={{ color: 'var(--text-secondary)' }}>
                  {t('auth.check_email_success')}
                </p>

                {devLink && (
                  <div className="mb-6 p-4 rounded-xl bg-violet-50 border border-violet-100 text-left">
                    <p className="text-xs font-semibold text-violet-800 mb-1">Development Reset Link:</p>
                    <a 
                      href={devLink} 
                      className="text-xs text-violet-600 underline break-all font-mono"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {devLink}
                    </a>
                  </div>
                )}

                <Link to="/login">
                  <Button className="w-full h-12 rounded-full font-body font-medium text-white transition-smooth" style={{ background: 'var(--primary)' }}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('auth.back_to_login')}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {t('auth.forgot_password_title')}
                  </h1>
                  <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {t('auth.forgot_password_subtitle')}
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
                    <Label htmlFor="email" className="font-body">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="mt-2 h-12 font-body"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-full font-body font-medium text-white transition-smooth"
                    style={{ background: loading ? 'var(--text-secondary)' : 'var(--primary)' }}
                  >
                    {loading ? t('auth.sending_reset_link') : t('auth.send_reset_link')}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="font-body text-sm font-medium transition-smooth inline-flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
                    <ArrowLeft className="w-4 h-4" />
                    {t('auth.back_to_login')}
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
