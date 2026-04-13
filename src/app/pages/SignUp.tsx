import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

export function SignUp() {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const cleanPhone = mobileNumber.replace(/[\s\-+()]/g, '');
    // strip country code only if it results in a 10-digit number
    const normalized = cleanPhone.length === 12 && cleanPhone.startsWith('91')
      ? cleanPhone.slice(2)
      : cleanPhone.length === 13 && cleanPhone.startsWith('091')
      ? cleanPhone.slice(3)
      : cleanPhone;
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(normalized)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (password.length < 8 || password.length > 10) {
      setError('Password must be between 8 and 10 characters');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Password must contain at least one special character');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, name, mobileNumber);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
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
              <UserPlus size={32} className="text-white" />
            </div>
          </div>

          <h1 className="font-['Bebas_Neue'] text-5xl text-center mb-2 tracking-wide text-white">Join The Club</h1>
          <p className="text-[#B3B3B3] text-center mb-8">Create your DTBM Run Club account</p>

          {error && (
            <div className="mb-6 p-4 bg-[#111111] border border-[#2A2A2A] rounded-lg text-white text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#B3B3B3] uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-white text-white placeholder-[#4A4A4A] transition-all"
                placeholder="John Doe"
              />
            </div>

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
              <label className="block text-sm font-medium mb-2 text-[#B3B3B3] uppercase tracking-wider">Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-white text-white placeholder-[#4A4A4A] transition-all"
                placeholder="+91 98765 43210"
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

            <div>
              <label className="block text-sm font-medium mb-2 text-[#B3B3B3] uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#111111] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-white text-white placeholder-[#4A4A4A] transition-all"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-4 bg-white text-black rounded-lg font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#B3B3B3]"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#B3B3B3] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}