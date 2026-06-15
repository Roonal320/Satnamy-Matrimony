import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle, CheckCircle2, User, Mail, Image } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const GoogleCompleteSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { googleRegister } = useAuth();
  const { t } = useTranslation();

  const googleData = location.state?.googleData;
  const credential = location.state?.credential;

  const [formData, setFormData] = useState({
    phone: '',
    gender: '',
    date_of_birth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if no Google data
  useEffect(() => {
    if (!googleData || !credential) {
      navigate('/register', { replace: true });
    }
  }, [googleData, credential, navigate]);

  if (!googleData || !credential) {
    return null;
  }

  const getMinDOB = () => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.phone || !formData.gender || !formData.date_of_birth) {
      setError('Please fill in all required fields.');
      return;
    }

    if (calculateAge(formData.date_of_birth) < 18) {
      setError(t('auth.dob_underage', { defaultValue: 'You must be at least 18 years old to register' }));
      return;
    }

    setLoading(true);
    const result = await googleRegister(credential, formData);
    setLoading(false);

    if (result.success) {
      navigate('/complete-profile');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ borderColor: 'var(--border)', borderWidth: '1px' }}>

            {/* Header */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #4285F4, #34A853)' }}
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('auth.google_complete_title', { defaultValue: 'Complete Your Registration' })}
              </h1>
              <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
                {t('auth.google_complete_subtitle', { defaultValue: 'Just a few more details to get started' })}
              </p>
            </div>

            {/* Google Account Info Card */}
            <div
              className="mb-8 p-5 rounded-xl"
              style={{
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <p className="text-xs font-body font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                {t('auth.google_account_info', { defaultValue: 'Google Account' })}
              </p>
              <div className="flex items-center gap-4">
                {googleData.picture ? (
                  <img
                    src={googleData.picture}
                    alt="Google profile"
                    className="w-14 h-14 rounded-full object-cover"
                    style={{ border: '2px solid var(--border)' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--primary)', color: 'white' }}
                  >
                    <User className="w-7 h-7" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                    <p className="font-body font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {googleData.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                    <p className="font-body text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {googleData.email}
                    </p>
                  </div>
                  {googleData.picture && (
                    <div className="flex items-center gap-2 mt-1">
                      <Image className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
                      <p className="font-body text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Profile photo will be used
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'var(--surface-secondary)', borderLeft: '4px solid var(--error)' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
                <p className="text-sm font-body" style={{ color: 'var(--error)' }}>{error}</p>
              </div>
            )}

            {/* Form for remaining fields */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="phone" className="font-body">{t('auth.phone', { defaultValue: 'Phone Number' })} <span style={{ color: 'var(--error)' }}>*</span></Label>
                <Input
                  id="phone"
                  data-testid="google-signup-phone-input"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="1234567890"
                  required
                  className="mt-2 h-12 font-body"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="gender" className="font-body">{t('landing.gender', { defaultValue: 'Gender' })} <span style={{ color: 'var(--error)' }}>*</span></Label>
                  <Select onValueChange={(value) => handleChange('gender', value)} required>
                    <SelectTrigger data-testid="google-signup-gender-select" className="mt-2 h-12 font-body">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">{t('landing.male', { defaultValue: 'Male' })}</SelectItem>
                      <SelectItem value="Female">{t('landing.female', { defaultValue: 'Female' })}</SelectItem>
                      <SelectItem value="Transgender">{t('landing.transgender', { defaultValue: 'Transgender' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dob" className="font-body">{t('auth.dob', { defaultValue: 'Date of Birth' })} <span style={{ color: 'var(--error)' }}>*</span></Label>
                  <Input
                    id="dob"
                    data-testid="google-signup-dob-input"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    required
                    max={getMinDOB()}
                    className="mt-2 h-12 font-body"
                  />
                </div>
              </div>

              <Button
                type="submit"
                data-testid="google-signup-submit-button"
                disabled={loading}
                className="w-full h-12 rounded-full font-body font-medium text-white transition-smooth"
                style={{ background: loading ? 'var(--text-secondary)' : 'var(--primary)' }}
                onMouseEnter={(e) => !loading && (e.target.style.background = 'var(--primary-hover)')}
                onMouseLeave={(e) => !loading && (e.target.style.background = 'var(--primary)')}
              >
                {loading ? t('auth.creating_account', { defaultValue: 'Creating Account...' }) : t('auth.create_account', { defaultValue: 'Create Account' })}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="font-body text-sm" style={{ color: 'var(--text-secondary)' }}>
                Want to use a different method?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-medium transition-smooth"
                  style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Register with email
                </button>
              </p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GoogleCompleteSignup;
