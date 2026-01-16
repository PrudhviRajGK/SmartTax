import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg-secondary))] px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-14 h-14 bg-[rgb(var(--color-accent))] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] transition-all">
              <span className="text-white font-bold text-[20px]">ST</span>
            </div>
          </Link>
          <h1 className="text-[32px] font-semibold text-[rgb(var(--color-text-primary))] tracking-tight">
            Create account
          </h1>
          <p className="text-[15px] text-[rgb(var(--color-text-secondary))] mt-2">
            Start filing your taxes with SmartTax
          </p>
        </div>

        <Card padding="lg" className="shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-[rgb(var(--color-error-bg))] border border-[rgb(var(--color-error))] rounded-lg">
                <p className="text-[14px] text-[rgb(var(--color-error))]">{error}</p>
              </div>
            )}

            <div>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <Input
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
              />
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <p className="text-[13px] text-[rgb(var(--color-text-tertiary))] mt-6 text-center leading-relaxed">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>

        <p className="text-center text-[14px] text-[rgb(var(--color-text-secondary))] mt-6">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-[rgb(var(--color-accent))] hover:text-[rgb(var(--color-accent-hover))] font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>

        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="text-[14px] text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))] transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
