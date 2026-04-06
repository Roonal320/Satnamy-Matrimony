import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/discover');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ borderColor: 'var(--border)', borderWidth: '1px' }}>
            <div className="text-center mb-8">
              <h1 className="font-heading text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Welcome Back
              </h1>
              <p className="font-heading text-lg font-semibold mb-2" style={{ color: 'var(--secondary)' }}>
                जय सतनाम
              </p>
              <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
                Sign in to find your perfect match
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
              <Label htmlFor="email" className="font-body">Email</Label>
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
              <Label htmlFor="password" className="font-body">Password</Label>
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
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-medium transition-smooth" style={{ color: 'var(--primary)' }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;