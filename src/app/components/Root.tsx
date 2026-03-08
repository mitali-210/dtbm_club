import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Toaster } from "sonner";
import { useAuth } from "../context/AuthContext";

export function Root() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const hiddenPromptRoutes = ['/login', '/signup', '/reset-password', '/admin', '/spiddy'];
  const shouldHidePrompt = hiddenPromptRoutes.some((route) => location.pathname.startsWith(route));

  useEffect(() => {
    if (!loading && !user && !shouldHidePrompt) {
      setShowLoginPrompt(true);
    }
    if (user || shouldHidePrompt) {
      setShowLoginPrompt(false);
    }
  }, [loading, user, shouldHidePrompt, location.pathname]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navigation />
      <Outlet />
      <Footer />
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[80] flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-8">
            <h2 className="font-['Bebas_Neue'] text-4xl text-white mb-3 tracking-wide">Login Required</h2>
            <p className="text-[#B3B3B3] mb-6 text-sm">
              Please sign in to continue with DTBM features and event access.
            </p>
            <div className="flex gap-3">
              <Link
                to="/login"
                state={{ from: location.pathname }}
                className="flex-1 text-center py-3 bg-white text-black rounded-lg font-medium hover:bg-[#B3B3B3] transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="flex-1 text-center py-3 border border-white/30 text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Sign Up
              </Link>
            </div>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full mt-4 text-[#B3B3B3] text-xs hover:text-white transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
      <Toaster 
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
          },
        }}
      />
    </div>
  );
}