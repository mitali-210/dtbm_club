import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import { ADMIN_EMAILS } from '../lib/config';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const { signIn, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSent(false);
    try {
      await forgotPassword(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      const isAdmin = ADMIN_EMAILS.has(email.trim().toLowerCase());
      const from = typeof location.state?.from === 'string' ? location.state.from : '/';
      navigate(isAdmin ? '/spiddy' : from);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-[#111111] border-2 border-white rounded-2xl flex items-center justify-center">
              <LogIn size={32} className="text-white" />
            </div>
          </div>

          <h1 className="font-['Bebas_Neue'] text-5xl text-center mb-2 tracking-wide text-white">Welcome Back</h1>
          <p className="text-[#B3B3B3] text-center mb-8">Sign in to DTBM Run Club</p>

          {error && (
            <div className="mb-6 p-4 bg-[#111111] border border-[#2A2A2A] rounded-lg text-white text-sm">
              {error}
            </div>
          )}

          {!showForgot ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[#B3B3B3] uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-white text-white placeholder-[#4A4A4A] transition-all"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[#B3B3B3] uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-white text-white placeholder-[#4A4A4A] transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    className="text-xs text-[#4CC9F0] hover:underline"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot password?
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-white text-black rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#B3B3B3]"
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </motion.button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[#B3B3B3] text-sm">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-white font-medium hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <form onSubmit={handleForgot} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#B3B3B3] uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-white text-white placeholder-[#4A4A4A] transition-all"
                  placeholder="your@email.com"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-white text-black rounded-lg font-medium text-lg transition-all hover:bg-[#B3B3B3]"
              >
                Send Reset Email
              </motion.button>
              <button
                type="button"
                className="w-full mt-2 text-xs text-[#4CC9F0] hover:underline"
                onClick={() => setShowForgot(false)}
              >
                Back to login
              </button>
              {resetSent && (
                <div className="mt-4 p-3 bg-green-900/60 border border-green-700 rounded text-green-200 text-sm text-center">
                  Password reset email sent! Check your inbox.
                </div>
              )}
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}