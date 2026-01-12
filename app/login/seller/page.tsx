"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import ShoppingIllustration from "../../components/ShoppingIllustration";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SellerLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Role Check
      if (data.user?.user_metadata?.role !== 'seller') {
         await supabase.auth.signOut();
         throw new Error("This account is not a Seller. Please use the Customer Login.");
      }

      // TODO: Redirect to Seller Dashboard eventually
      router.push("/"); 
    } catch (err: any) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?role=seller`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first to reset password.");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      alert("Password reset link sent to your email! Please check your inbox.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-vk-green-50 flex flex-col font-sans">
      {/* Header */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          <div className="relative">
             <span className="font-bold text-xl sm:text-2xl text-vk-green-800 tracking-tight">
              Value<span className="text-vk-gold-dark">Kart</span>
            </span>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-3.5">
                <Check className="w-4 h-4 text-vk-gold-dark stroke-[4]" />
            </motion.div>
          </div>
        </Link>
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-600 hover:text-vk-green-700 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[550px] border-l-4 border-l-vk-gold">
          
          {/* Left Side: Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-vk-green-800 mb-2 text-center">
              Seller Login
            </h1>
             <p className="text-center text-vk-gold-dark font-medium mb-8 text-sm">Manage your store & products</p>


            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-100 text-gray-900 px-6 py-4 rounded-full border border-transparent focus:border-vk-gold focus:bg-white focus:ring-2 focus:ring-vk-gold/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
              
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-100 text-gray-900 px-6 py-4 rounded-full border border-transparent focus:border-vk-gold focus:bg-white focus:ring-2 focus:ring-vk-gold/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={handleForgotPassword} className="text-xs text-vk-green-600 hover:underline">
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-vk-green-800 text-white font-bold py-4 rounded-full hover:bg-vk-green-900 shadow-lg shadow-vk-green-200 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login to Dashboard"}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex gap-4">
              <button 
                onClick={handleGoogleLogin}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-full hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-1.19-2.67z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-gray-600 font-medium">Google</span>
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
              Become a Seller?{" "}
              <Link href="/register/seller" className="text-vk-gold-dark font-semibold hover:underline">
                Register Store
              </Link>
            </div>
          </div>

          {/* Right Side: Illustration (Recycled for now, but background tweaked to match Seller Vibe) */}
          <div className="hidden md:flex w-1/2 bg-vk-green-800 items-center justify-center relative p-12 md:rounded-r-[2rem]">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                 {/* Decorative Blobs */}
                 <div className="absolute top-10 right-10 w-20 h-20 bg-vk-gold rounded-full opacity-20 blur-xl"></div>
                 <div className="absolute bottom-10 left-10 w-32 h-32 bg-vk-green-600 rounded-full opacity-30 blur-2xl"></div>
                 
                 {/* Illustration */}
                 <div className="relative z-10 w-full flex flex-col items-center">
                    <ShoppingIllustration />
                    <div className="text-center mt-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Grow Business.</h2>
                        <p className="text-vk-green-100/80 font-medium">Reach millions of customers.</p>
                    </div>
                 </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
