"use client";

import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import ShoppingIllustration from "../../components/ShoppingIllustration";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SellerRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form States
  const [formData, setFormData] = useState({
    fullName: "",
    storeName: "",
    phone: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { email, password, fullName, phone, storeName } = formData;

    try {
      // 1. Sign Up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            store_name: storeName, // Storing Store Name in metadata
            role: 'seller' // Tagging user as seller
          },
        },
      });

      if (authError) throw authError;

      // 2. Success
      alert("Store registered successfully! Check email for verification.");
      router.push("/login/seller");
      
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
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
          href="/login/seller" 
          className="flex items-center gap-2 text-gray-600 hover:text-vk-green-700 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Seller Login
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[600px] border-l-4 border-l-vk-gold">
          
          {/* Left Side: Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-vk-green-800 mb-2 text-center">
              Register Store
            </h1>
            <p className="text-center text-gray-500 mb-8 text-sm">Start selling to millions today.</p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Full Owner Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-full border border-transparent focus:border-vk-gold focus:bg-white focus:ring-2 focus:ring-vk-gold/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <input
                  name="storeName"
                  type="text"
                  placeholder="Store Name (e.g. MyGadgets)"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-full border border-transparent focus:border-vk-gold focus:bg-white focus:ring-2 focus:ring-vk-gold/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Business Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-full border border-transparent focus:border-vk-gold focus:bg-white focus:ring-2 focus:ring-vk-gold/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>
              
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Business Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-full border border-transparent focus:border-vk-gold focus:bg-white focus:ring-2 focus:ring-vk-gold/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-full border border-transparent focus:border-vk-gold focus:bg-white focus:ring-2 focus:ring-vk-gold/20 outline-none transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-vk-green-800 text-white font-bold py-4 rounded-full hover:bg-vk-green-900 shadow-lg shadow-vk-green-200 transition-all hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Create Store Account"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
              Already have a store?{" "}
              <Link href="/login/seller" className="text-vk-gold-dark font-semibold hover:underline">
                Login here
              </Link>
            </div>
          </div>

          {/* Right Side: Illustration */}
          <div className="hidden md:flex w-1/2 bg-vk-green-800 items-center justify-center relative p-12">
            <div className="relative w-full h-full flex flex-col items-center justify-center">
                 {/* Decorative Blobs */}
                 <div className="absolute top-10 right-10 w-20 h-20 bg-vk-gold rounded-full opacity-20 blur-xl"></div>
                 <div className="absolute bottom-10 left-10 w-32 h-32 bg-vk-green-600 rounded-full opacity-30 blur-2xl"></div>
                 
                 {/* Illustration */}
                 <div className="relative z-10 w-full flex flex-col items-center">
                    <ShoppingIllustration />
                    <div className="text-center mt-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Join as Seller.</h2>
                        <p className="text-vk-green-100/80 font-medium">Your business, your rules.</p>
                    </div>
                 </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
