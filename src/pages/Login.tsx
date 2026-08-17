import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import vividelLogo from '../assets/vividel-logo.png';

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid login credentials. Please check email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D10] text-[#F2F4F5] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow shapes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2DD4BF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#059669]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#171D23]/90 border border-[#262D34] rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10 animate-fade-in">
        {/* Wordmark Header */}
        <div className="text-center space-y-3 mb-8">
          <img src={vividelLogo} alt="Vividel Inc." className="h-12 w-auto mx-auto" />
          <p className="text-xs text-[#2DD4BF] uppercase tracking-widest font-semibold">
            Studio Operations Dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            label="Studio Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            className="w-full py-3 mt-2 text-sm font-semibold"
            disabled={isLoading}
            icon={<ShieldCheck className="w-4 h-4" />}
          >
            {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#262D34] text-center space-y-2">
          <p className="text-[11px] text-[#8B96A0]/60">
            Restricted access for James Akabo Jnr & authorized personnel.
          </p>
        </div>
      </div>
    </div>
  );
};
