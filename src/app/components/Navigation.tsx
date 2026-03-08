import { Link } from "react-router";
import { motion } from "motion/react";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ADMIN_EMAILS } from "../lib/config";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isAdmin = Boolean(user?.email && ADMIN_EMAILS.has(user.email.toLowerCase()));

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-[1440px] mx-auto px-[var(--site-margin)]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <span className="font-['Bebas_Neue'] text-2xl tracking-wider font-[Belgrano]">DTBM{">"}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-12">
            <NavLink to="/#about">About</NavLink>
            <NavLink to="/#events">Events</NavLink>
            <NavLink to="/community">Community</NavLink>
            
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/profile" className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors">
                  {user.name}
                </Link>
                {isAdmin && (
                  <Link to="/spiddy" className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link
                  to="/login"
                  className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/signup">
                  <button className="border border-white px-8 py-3 hover:bg-white hover:text-black transition-all duration-300">
                    <span className="font-['Space_Mono'] text-xs uppercase tracking-wider">
                      Join
                    </span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 hover:bg-white/10 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t border-white/10 bg-black"
        >
          <div className="px-[var(--site-margin)] py-8 space-y-6">
            <MobileNavLink to="/#about" onClick={() => setIsOpen(false)}>About</MobileNavLink>
            <MobileNavLink to="/#events" onClick={() => setIsOpen(false)}>Events</MobileNavLink>
            <MobileNavLink to="/community" onClick={() => setIsOpen(false)}>Community</MobileNavLink>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  onClick={() => setIsOpen(false)}
                  className="block font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors py-2"
                >
                  Profile ({user.name})
                </Link>
                {isAdmin && (
                  <Link 
                    to="/spiddy" 
                    onClick={() => setIsOpen(false)}
                    className="block font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors py-2"
                  >
                    Admin
                  </Link>
                )}
                <button 
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="w-full border border-white px-8 py-4 hover:bg-white hover:text-black transition-all duration-300 font-['Space_Mono'] text-xs uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full border border-white/20 px-8 py-4 hover:border-white transition-all duration-300 font-['Space_Mono'] text-xs uppercase tracking-wider">
                    Sign In
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <button className="w-full border border-white px-8 py-4 hover:bg-white hover:text-black transition-all duration-300 font-['Space_Mono'] text-xs uppercase tracking-wider">
                    Join
                  </button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <a
      href={to}
      className="font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white group-hover:w-full transition-all duration-300" />
    </a>
  );
}

function MobileNavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <a
      href={to}
      onClick={onClick}
      className="block font-['Space_Mono'] text-xs uppercase tracking-wider text-white/60 hover:text-white transition-colors py-2"
    >
      {children}
    </a>
  );
}