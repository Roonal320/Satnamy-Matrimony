import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: '',
    date_of_birth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate('/complete-profile');
    } else {
      setError(result.error);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ borderColor: 'var(--border)', borderWidth: '1px' }}>
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold mb-2" style={{ color: '#2E5090' }}>
              Join Satnami Matrimony
            </h1>
            <p className="font-heading text-xl font-bold mb-4" style={{ color: '#2E5090' }}>
              जय सतनाम
            </p>
            <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
              Begin your journey to find your life partner
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ background: 'var(--surface-secondary)', borderLeft: '4px solid var(--error)' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
              <p className="text-sm font-body" style={{ color: 'var(--error)' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="font-body">Full Name</Label>
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
                <Label htmlFor="email" className="font-body">Email</Label>
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

              <div>
                <Label htmlFor="password" className="font-body">Password</Label>
                <Input
                  id="password"
                  data-testid="register-password-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-2 h-12 font-body"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="font-body">Phone Number</Label>
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
                <Label htmlFor="gender" className="font-body">Gender</Label>
                <Select onValueChange={(value) => handleChange('gender', value)} required>
                  <SelectTrigger data-testid="register-gender-select" className="mt-2 h-12 font-body">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dob" className="font-body">Date of Birth</Label>
                <Input
                  id="dob"
                  data-testid="register-dob-input"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  required
                  className="mt-2 h-12 font-body"
                />
              </div>
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-medium transition-smooth" style={{ color: 'var(--primary)' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Register;