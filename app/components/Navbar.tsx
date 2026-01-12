"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ShoppingCart, Search, Menu, Check, X, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSettings, COUNTRIES } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import clsx from "clsx";
import Image from "next/image";
import { supabase } from "../../lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export default function Navbar() {
  const { scrollY } = useScroll();
  const { t, country, language, setCountry, setLanguage } = useSettings();
  const { totalItems } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const width = useTransform(scrollY, [0, 150], ["80%", "100%"]);
  const top = useTransform(scrollY, [0, 150], ["20px", "0px"]);
  const borderRadius = useTransform(scrollY, [0, 150], ["24px", "0px"]);
  
  useEffect(() => {
    const unsub = scrollY.on("change", (latest) => setIsScrolled(latest > 150));
    return () => unsub();
  }, [scrollY]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://dummyjson.com/products/search?q=${query}&limit=4`);
          const data = await res.json();
          setSuggestions(data.products);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
        router.push(`/?q=${encodeURIComponent(query)}`);
        setSuggestions([]); 
        setIsMobileSearchOpen(false);
    }
  };

  const navigateToLogin = (type: 'seller' | 'customer') => {
      if (type === 'customer') {
          router.push('/login/customer');
      } else {
          router.push('/login/seller');
      }
      setIsMobileMenuOpen(false);
  };

  return (
    <>
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pointer-events-none">
      <motion.nav
        style={{ width, top, borderRadius }}
        className="pointer-events-auto bg-white/80 backdrop-blur-md shadow-lg border border-white/50 h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 relative"
      >
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

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-6 relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="w-full">
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full h-9 pl-4 pr-10 rounded-full bg-vk-green-50/80 border-none focus:ring-2 focus:ring-vk-green-300 text-sm text-vk-green-900 placeholder:text-vk-green-400/70 transition-all"
            />
            <button type="submit" className="absolute right-2 top-1.5 p-1 text-vk-green-500 hover:text-vk-green-700">
                <Search className="w-4 h-4" />
            </button>
          </form>
          <AnimatePresence>
            {suggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-vk-green-100 overflow-hidden z-50">
                    {suggestions.map((item) => (
                        <Link key={item.id} href={`/product/${item.id}`} onClick={() => setSuggestions([])} className="flex items-center gap-3 p-3 hover:bg-vk-green-50 transition-colors border-b border-gray-50 last:border-0">
                            <div className="w-10 h-10 relative bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-800 truncate">{item.title}</h4>
                                <p className="text-xs text-gray-500 truncate">{item.category}</p>
                            </div>
                        </Link>
                    ))}
                    <button onClick={() => handleSearchSubmit()} className="w-full p-2 text-center text-xs font-bold text-vk-green-600 hover:bg-vk-green-50 bg-gray-50 uppercase tracking-wide">
                        See results for "{query}"
                    </button>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsMobileSearchOpen(true)} className="md:hidden p-1.5 text-vk-green-700 hover:bg-vk-green-50 rounded-full">
                <Search className="w-5 h-5" />
            </button>

            {/* Country */}
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsLangOpen(!isLangOpen)} className="w-8 h-8 flex items-center justify-center rounded-full bg-vk-green-50 border border-vk-green-100 hover:bg-vk-green-100 transition-colors shadow-sm text-lg">
                    {country.flag}
                </button>
                <AnimatePresence>
                    {isLangOpen && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-vk-green-100 p-2 z-50">
                           <div className="space-y-1">
                                {COUNTRIES.map((c) => (
                                    <div key={c.code} className="p-2 rounded-xl hover:bg-vk-green-50 transition-colors">
                                        <div className="flex items-center justify-between cursor-pointer" onClick={() => { setCountry(c); if (!c.languages.some(l => l.code === language.code)) setLanguage(c.languages[0]); }}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{c.flag}</span>
                                                <span className={clsx("text-sm font-semibold", country.code === c.code ? "text-vk-green-800" : "text-gray-600")}>{c.name}</span>
                                            </div>
                                            {country.code === c.code && <Check className="w-4 h-4 text-vk-green-600" />}
                                        </div>
                                        {country.code === c.code && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="ml-8 mt-2 space-y-1">
                                                {c.languages.map(l => (
                                                    <button key={l.code} onClick={() => setLanguage(l)} className={clsx("block w-full text-left px-2 py-1 rounded-md text-xs font-medium transition-colors", language.code === l.code ? "bg-vk-green-100 text-vk-green-800" : "text-gray-500 hover:bg-gray-100")}>{l.name}</button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* REFINED LOGIN BUTTONS OR USER MENU */}
            {!user ? (
                // NOT LOGGED IN: Show Login Buttons
                <div className="hidden sm:flex items-center h-8 relative isolate">
                    
                    {/* Seller (Left) */}
                    <div className="relative z-10 transition-all duration-200 ease-out hover:-translate-y-1 hover:drop-shadow-[0_4px_0_#4CAF50]">
                        <button 
                            onClick={() => navigateToLogin('seller')}
                            className="pl-4 pr-6 py-1.5 h-full bg-white border border-vk-green-100 text-[11px] font-bold text-vk-green-700 rounded-l-full"
                            style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' }}
                        >
                            Seller
                        </button>
                    </div>

                    {/* Customer (Right) */}
                    <div className="relative z-20 -ml-3 transition-all duration-200 ease-out hover:-translate-y-1 hover:drop-shadow-[0_4px_0_#9CA3AF]">
                        <button 
                            onClick={() => navigateToLogin('customer')}
                            className="pl-6 pr-4 py-1.5 h-full bg-vk-green-600 text-[11px] font-bold text-white rounded-r-full"
                            style={{ clipPath: 'polygon(12px 0, 100% 0, 100% 100%, 0 100%)' }}
                        >
                            Customer Login
                        </button>
                    </div>
                </div>
            ) : user.user_metadata.role === 'seller' ? (
                // SELLER LOGGED IN: Dashboard Button
                 <div className="hidden sm:flex relative z-10">
                    <button 
                        onClick={() => router.push('/dashboard/seller')}
                        className="group relative px-5 py-2 overflow-hidden bg-vk-gold-dark text-white text-xs font-bold rounded-full shadow-md flex items-center gap-2 transition-all"
                    >
                        <span className="absolute inset-0 w-full h-full bg-vk-green-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out"></span>
                        <span className="relative flex items-center gap-2">
                            Seller Dashboard
                            <ArrowRight className="w-3 h-3" />
                        </span>
                    </button>
                </div>
            ) : (
                // CUSTOMER LOGGED IN: Avatar
                <div className="relative" ref={profileDropdownRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-9 h-9 rounded-full bg-vk-green-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        {user.user_metadata.avatar_url ? (
                            <Image src={user.user_metadata.avatar_url} alt="Profile" width={36} height={36} className="object-cover" />
                        ) : (
                            <span className="text-vk-green-700 font-bold text-sm">
                                {user.user_metadata.full_name ? user.user_metadata.full_name[0] : user.email?.[0]?.toUpperCase()}
                            </span>
                        )}
                    </button>
                    
                    {/* Profile Dropdown */}
                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                                className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-vk-green-100 p-1 z-50 origin-top-right"
                            >
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{user.user_metadata.full_name || "User"}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <button onClick={() => { router.push('/profile?tab=profile'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Profile</button>
                                <button onClick={() => { router.push('/profile?tab=orders'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Orders</button>
                                <button onClick={() => { router.push('/profile?tab=addresses'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Addresses</button>
                                <button onClick={() => { router.push('/profile?tab=settings'); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Settings</button>
                                <button 
                                    onClick={async () => { await supabase.auth.signOut(); setIsProfileOpen(false); router.push("/"); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    Log Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Cart */}
            <div className="relative">
                <button 
                    onClick={() => router.push('/cart')}
                    className="p-1.5 text-vk-green-700 hover:bg-vk-green-50 rounded-full relative group"
                >
                    <ShoppingCart className="w-5 h-5" />
                    {totalItems > 0 && (
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            key={totalItems}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-vk-green-600 text-white text-[9px] flex items-center justify-center rounded-full border border-white font-bold"
                        >
                            {totalItems}
                        </motion.span>
                    )}
                </button>
            </div>
            
            {/* Menu */}
             {!user && (
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="sm:hidden p-1.5 text-vk-green-700 hover:bg-vk-green-50 rounded-full">
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
             )}
        </div>
      </motion.nav>
    </div>

    {/* OVERLAYS (UNCHANGED) */}
    <AnimatePresence>
        {isMobileSearchOpen && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 bg-white z-[60] p-4">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 -ml-2 text-gray-500"><ArrowLeft className="w-6 h-6" /></button>
                    <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                         <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('searchPlaceholder')} className="w-full h-12 pl-4 pr-10 rounded-xl bg-vk-green-50 border-none focus:ring-2 focus:ring-vk-green-300 text-lg text-vk-green-900" />
                         {query && <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-3 text-gray-400"><X className="w-5 h-5" /></button>}
                    </form>
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[80vh]">
                     {suggestions.map((item) => (
                        <Link key={item.id} href={`/product/${item.id}`} onClick={() => setIsMobileSearchOpen(false)} className="flex items-center gap-4">
                            <div className="w-12 h-12 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <Image src={item.thumbnail} alt={item.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 border-b border-gray-100 pb-4">
                                <h4 className="text-base font-medium text-gray-800">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </motion.div>
        )}
    </AnimatePresence>

    <AnimatePresence>
        {isMobileMenuOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/20 z-[55] sm:hidden backdrop-blur-sm" />
                <motion.div ref={mobileMenuRef} initial={{ y: -20, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -20, opacity: 0, scale: 0.95 }} className="fixed top-20 right-4 w-64 bg-white rounded-2xl shadow-xl border border-vk-green-100 z-[60] sm:hidden p-2 origin-top-right">
                    <div className="flex flex-col gap-1">
                        <button onClick={() => navigateToLogin('seller')} className="flex items-center justify-between p-3 rounded-xl hover:bg-vk-green-50 transition-colors text-left">
                            <span className="font-semibold text-vk-green-800">{t('sellerLogin')}</span>
                            <ArrowRight className="w-4 h-4 text-vk-green-400" />
                        </button>
                        <div className="h-px bg-vk-green-50 mx-2" />
                        <button onClick={() => navigateToLogin('customer')} className="flex items-center justify-between p-3 rounded-xl hover:bg-vk-green-50 transition-colors text-left">
                            <span className="font-semibold text-vk-green-800">{t('customerLogin')}</span>
                            <ArrowRight className="w-4 h-4 text-vk-green-400" />
                        </button>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
    </>
  );
}
