import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function JoinSection() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    level: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    const cleanPhone = formData.phone.replace(/[\s\-+()]/g, '');
    const normalized = cleanPhone.length === 12 && cleanPhone.startsWith('91')
      ? cleanPhone.slice(2)
      : cleanPhone.length === 13 && cleanPhone.startsWith('091')
      ? cleanPhone.slice(3)
      : cleanPhone;
    if (!/^[6-9]\d{9}$/.test(normalized)) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (formData.password.length < 8 || formData.password.length > 10) {
      setError('Password must be between 8 and 10 characters');
      return;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      setError('Password must contain at least one special character');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.name, formData.phone);
      navigate('/profile');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden px-[var(--site-margin)]">
      <div className="max-w-[1440px] mx-auto">
        {/* Chapter Header */}
        <div className="flex justify-between items-start mb-16 md:mb-24 border-b border-white/10 pb-8">
          <div>
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-2">
              chapter 4:
            </p>
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              join us
            </p>
          </div>
          <div className="text-right">
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              become a member
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Left: Large Text */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-['Bebas_Neue'] text-[8vw] md:text-[6vw] lg:text-[80px] leading-[0.95] mb-12">
              READY<br/>TO RUN?
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-[1px] bg-white/20 mt-3" />
                <div>
                  <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-3">
                    What you get
                  </p>
                  <ul className="space-y-3 text-white/60">
                    <li>• Weekly group runs</li>
                    <li>• Exclusive events access</li>
                    <li>• Training programs</li>
                    <li>• Community support</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Simple Form */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-[#111111] border border-[#2A2A2A] rounded-lg text-white text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="city" className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="Nashik"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="8-10 chars, include special character"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="Re-enter password"
                  required
                />
              </div>

              <div>
                <label htmlFor="level" className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Running Level
                </label>
                <select
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  required
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full border border-white px-12 py-6 hover:bg-white transition-all duration-300 mt-12"
              >
                <span className="font-['Space_Mono'] text-sm uppercase tracking-wider group-hover:text-black transition-colors duration-300">
                  {loading ? 'Creating Account...' : 'Join the Club'}
                </span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}