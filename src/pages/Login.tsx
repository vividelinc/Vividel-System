import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('vividelinc@gmail.com');
  const [password, setPassword] = useState('Vividel2026!');
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
    <div className="min-h-screen bg-[#2B2414] text-[#E9E4DC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow shapes */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#40E0D0]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#585D27]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-[#3E3521]/90 border border-[#554A32] rounded-2xl p-8 shadow-2xl backdrop-blur-md relative z-10 animate-fade-in">
        {/* Wordmark Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#40E0D0] to-[#585D27] flex items-center justify-center font-bold text-[#2B2414] text-2xl mx-auto shadow-xl shadow-[#40E0D0]/20">
            V
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif tracking-wide text-[#E9E4DC]">
              VIVIDEL INC.
            </h1>
            <p className="text-xs text-[#40E0D0] uppercase tracking-widest font-semibold mt-1">
              Studio Operations Dashboard
            </p>
          </div>
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

        <div className="mt-8 pt-6 border-t border-[#554A32] text-center space-y-2">
          <p className="text-[11px] text-[#BCA890]/60">
            Restricted access for James Akabo Jnr & authorized personnel.
          </p>
          <div className="bg-[#2B2414] p-2.5 rounded-lg border border-[#554A32] text-[11px] text-[#40E0D0]">
            Demo Credentials pre-filled for instant preview access
          </div>
        </div>
      </div>
    </div>
  );
};
