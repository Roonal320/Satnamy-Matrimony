import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { AlertCircle, Eye, EyeOff, Check, X, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { logAnalyticsEvent } from '../lib/firebase';
import { toast } from 'sonner';
import SEO from '../components/SEO';

/**
 * Styled Google button matching the app's design system.
 */
const GoogleAuthButton = ({ onClick, loading, label }) => (
  <button
    type="button"
    id="google-signup-button"
    data-testid="google-signup-button"
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

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    date_of_birth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState('');

  // Cooldown countdown timer
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const getMinDOB = () => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const checkPasswordRules = (pwd) => {
    return {
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    };
  };

  const rules = checkPasswordRules(formData.password);
  const isPasswordValid = rules.hasLength && rules.hasUpper && rules.hasNumber && rules.hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to register.');
      return;
    }

    // 1. Password complexity check
    if (!isPasswordValid) {
      setError('Password does not meet complexity requirements.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.password_mismatch', { defaultValue: 'Passwords do not match' }));
      return;
    }

    // 2. DOB Age limit validation
    if (calculateAge(formData.date_of_birth) < 18) {
      setError(t('auth.dob_underage', { defaultValue: 'You must be at least 18 years old to register' }));
      return;
    }

    setLoading(true);
    logAnalyticsEvent('signup_attempt', { method: 'password' });

    try {
      const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;
      const { data } = await axios.post(`${API}/auth/send-otp`, { email: formData.email });
      
      setDevOtp(data.devOtp || '');
      setOtpCode('');
      setOtpError('');
      setShowOtpModal(true);
      setResendCooldown(60);
      toast.success(t('auth.otp_sent_success', { defaultValue: 'Verification code sent to your email!' }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send verification code. Please try again.');
      logAnalyticsEvent('signup_failure', { method: 'password', error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    const result = await register({ ...formData, otp: otpCode });
    setOtpLoading(false);

    if (result.success) {
      logAnalyticsEvent('signup_success', { method: 'password' });
      setShowOtpModal(false);
      navigate('/complete-profile');
    } else {
      logAnalyticsEvent('signup_failure', { method: 'password', error: result.error });
      setOtpError(result.error);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpError('');
    setDevOtp('');

    try {
      const API = `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000')}/api`;
      const { data } = await axios.post(`${API}/auth/send-otp`, { email: formData.email });
      setDevOtp(data.devOtp || '');
      setResendCooldown(60);
      toast.success(t('auth.otp_sent_success', { defaultValue: 'Verification code sent to your email!' }));
    } catch (err) {
      setOtpError(err.response?.data?.detail || 'Failed to resend code. Please try again.');
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setGoogleLoading(true);
      logAnalyticsEvent('signup_attempt', { method: 'google' });

      const result = await googleLogin(tokenResponse.access_token);
      setGoogleLoading(false);

      if (result.success) {
        // User already exists, just log them in
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
        logAnalyticsEvent('signup_failure', { method: 'google', error: result.error || 'Google sign-up failed' });
        setError(result.error || 'Google sign-up failed.');
      }
    },
    onError: () => {
      logAnalyticsEvent('signup_failure', { method: 'google', error: 'Google sign-up cancelled/failed' });
      setError('Google sign-up was cancelled or failed.');
    },
    flow: 'implicit',
  });

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <SEO 
        title="Register | Satnami Matrimony"
        description="Create your free Satnami Matrimony account today. Join thousands of verified Satnami community members searching for their perfect lifepartner."
        keywords="register satnami matrimony, satnami shadi registration, free satnami matrimony"
        canonicalUrl="https://satnamishaadiii.com/register"
      />
      <Header />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ borderColor: 'var(--border)', borderWidth: '1px' }}>
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('auth.register_title')}
            </h1>
            <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
              {t('auth.register_subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'var(--surface-secondary)', borderLeft: '4px solid var(--error)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
              <p className="text-sm font-body" style={{ color: 'var(--error)' }}>{error}</p>
            </div>
          )}

          {/* Google Sign-Up Button */}
          <div className="mb-6">
            <GoogleAuthButton
              onClick={() => handleGoogleSignup()}
              loading={googleLoading}
              label={t('auth.google_sign_up', { defaultValue: 'Sign up with Google' })}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="font-body">{t('auth.name')} <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  data-testid="register-name-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                  className="mt-2 h-12 font-body"
                />
              </div>

              <div>
                <Label htmlFor="email" className="font-body">{t('auth.email')} <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  data-testid="register-email-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="mt-2 h-12 font-body"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Label htmlFor="password" className="font-body">{t('auth.password')} <span className="text-red-500">*</span></Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    data-testid="register-password-input"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 pr-10 font-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Label htmlFor="confirmPassword" className="font-body">{t('auth.confirm_password', { defaultValue: 'Confirm Password' })} <span className="text-red-500">*</span></Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    data-testid="register-confirm-password-input"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 pr-10 font-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password rules indicator checklist */}
              <div className="col-span-1 md:col-span-2 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <p className="text-xs font-semibold font-body text-neutral-500 mb-2 uppercase tracking-wider">Password Requirements</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-body">
                  <div className="flex items-center gap-2">
                    {rules.hasLength ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-neutral-400" />}
                    <span className={rules.hasLength ? "text-green-700" : "text-neutral-500"}>8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rules.hasUpper ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-neutral-400" />}
                    <span className={rules.hasUpper ? "text-green-700" : "text-neutral-500"}>Uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rules.hasNumber ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-neutral-400" />}
                    <span className={rules.hasNumber ? "text-green-700" : "text-neutral-500"}>Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {rules.hasSpecial ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-neutral-400" />}
                    <span className={rules.hasSpecial ? "text-green-700" : "text-neutral-500"}>Special character</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="font-body">{t('auth.phone')} <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  data-testid="register-phone-input"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="1234567890"
                  required
                  className="mt-2 h-12 font-body"
                />
              </div>

              <div>
                <Label htmlFor="gender" className="font-body">{t('landing.gender')} <span className="text-red-500">*</span></Label>
                <Select onValueChange={(value) => handleChange('gender', value)} required>
                  <SelectTrigger data-testid="register-gender-select" className="mt-2 h-12 font-body">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">{t('landing.male')}</SelectItem>
                    <SelectItem value="Female">{t('landing.female')}</SelectItem>
                    <SelectItem value="Transgender">{t('landing.transgender', { defaultValue: 'Transgender' })}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dob" className="font-body">{t('auth.dob')} <span className="text-red-500">*</span></Label>
                <Input
                  id="dob"
                  data-testid="register-dob-input"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  required
                  max={getMinDOB()}
                  className="mt-2 h-12 font-body"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 py-2">
              <input
                id="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-1 rounded border-neutral-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                required
              />
              <Label htmlFor="agreeTerms" className="font-body text-xs leading-normal select-none cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" target="_blank" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                  Privacy Policy
                </Link>
                .
              </Label>
            </div>

            <Button
              type="submit"
              data-testid="register-submit-button"
              disabled={loading}
              className="w-full h-12 rounded-full font-body font-medium text-white transition-smooth"
              style={{ background: loading ? 'var(--text-secondary)' : 'var(--primary)' }}
              onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--primary-hover)')}
              onMouseLeave={(e) => !loading && (e.target.style.background = 'var(--primary)')}
            >
              {loading ? t('auth.creating_account') : t('auth.create_account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
              {t('auth.already_have')}{' '}
              <Link to="/login" className="font-medium transition-smooth" style={{ color: 'var(--primary)' }}>
                {t('auth.login_here')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>

      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md bg-white border border-neutral-200 shadow-xl rounded-2xl p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="font-heading text-2xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>
              {t('auth.otp_title')}
            </DialogTitle>
            <DialogDescription className="font-body text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('auth.otp_subtitle')} <strong className="text-neutral-800">{formData.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyAndRegister} className="space-y-6 mt-4">
            {otpError && (
              <div className="p-3 rounded-lg flex items-start gap-3 bg-red-50 border-l-4 border-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <p className="text-sm font-body text-red-600">{otpError}</p>
              </div>
            )}
            <div>
              <Label htmlFor="otpCode" className="font-body text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {t('auth.otp_input')}
              </Label>
              <Input
                id="otpCode"
                data-testid="otp-input"
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder=""
                required
                className="mt-2 text-center text-3xl tracking-[0.75em] h-14 font-mono font-bold focus:ring-primary focus:border-primary border-neutral-300 rounded-xl"
              />
            </div>

            {devOtp && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-mono flex flex-col gap-1 shadow-inner">
                <span className="font-semibold text-xs text-blue-600 uppercase tracking-wider">Developer Mode OTP</span>
                <span className="text-lg font-bold tracking-wider">{devOtp}</span>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
                className="flex-1 h-12 rounded-full font-body font-medium transition-all duration-200 shadow-sm border border-neutral-300"
                style={{
                  background: 'transparent',
                  color: resendCooldown > 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (resendCooldown <= 0) {
                    e.currentTarget.style.background = 'var(--surface-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (resendCooldown <= 0) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {resendCooldown > 0 ? `${t('auth.resend_otp')} (${resendCooldown}s)` : t('auth.resend_otp')}
              </Button>
              <Button
                type="submit"
                disabled={otpLoading || otpCode.length !== 6}
                className="flex-1 h-12 rounded-full font-body font-medium text-white transition-all duration-200 shadow-md"
                style={{
                  background: (otpLoading || otpCode.length !== 6) ? 'var(--text-secondary)' : 'var(--primary)'
                }}
                onMouseEnter={(e) => {
                  if (!otpLoading && otpCode.length === 6) {
                    e.currentTarget.style.background = 'var(--primary-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!otpLoading && otpCode.length === 6) {
                    e.currentTarget.style.background = 'var(--primary)';
                  }
                }}
              >
                {otpLoading ? 'Verifying...' : t('auth.verify_and_register')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Register;
