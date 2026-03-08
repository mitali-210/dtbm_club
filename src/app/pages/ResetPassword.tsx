import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
          <h1 className="font-['Bebas_Neue'] text-4xl text-center mb-6 text-white">Reset Password</h1>
          {error && (
            <div className="mb-6 p-4 bg-[#111111] border border-[#2A2A2A] rounded-lg text-white text-sm">
              {error}
            </div>
          )}
          {success ? (
            <div className="mb-6 p-4 bg-green-900/60 border border-green-700 rounded text-green-200 text-center">
              Password reset! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[#B3B3B3] uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-white text-white placeholder-[#4A4A4A] transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-[#B3B3B3] uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-white text-white placeholder-[#4A4A4A] transition-all"
                  placeholder="Confirm new password"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-4 bg-white text-black rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#B3B3B3]"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
