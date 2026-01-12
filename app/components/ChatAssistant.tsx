"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircleHeart, X, Send, ChevronLeft, Sparkles, Loader2, MoreVertical, HelpCircle, CreditCard, Phone, ArrowLeft, RefreshCcw, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { usePathname } from "next/navigation";

type Product = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
};

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
  products?: Product[];
  isTyping?: boolean;
};

type ChatMode = 'default' | 'orders' | 'payment' | 'contact';

export default function ChatAssistant() {
  const { formatPrice } = useSettings();
  const { cart, totalItems, totalPrice } = useCart();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chatMode, setChatMode] = useState<ChatMode>('default');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi! I'm your ValueKart assistant. Tell me what you're looking for, or choose a topic from the menu! ✨",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [bottomOffset, setBottomOffset] = useState(24);

  // Footer Avoidance Logic
  useEffect(() => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const observer = new IntersectionObserver((entries) => {
          const entry = entries[0];
          if (entry.isIntersecting) {
              const isMobile = window.innerWidth < 768;
              setBottomOffset(isMobile ? 160 : 140); 
          } else {
              setBottomOffset(24);
          }
      }, { threshold: [0, 0.1] }); 

      observer.observe(footer);
      return () => observer.disconnect();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, chatMode]); // Scroll when mode changes too

  // Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname.includes("/login")) return null;

  // --- CORE LOGIC ---

  const addBotMessage = (text: string, products?: Product[]) => {
      setIsTyping(true);
      setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: "bot", text, products }]);
          setIsTyping(false);
      }, 800);
  };

  const handleModeSwitch = (mode: ChatMode, introText: string) => {
      setChatMode(mode);
      setIsMenuOpen(false);
      addBotMessage(introText);
  };

  const handlePillClick = (text: string, action?: () => void) => {
      // 1. Add User Selection
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", text }]);
      
      // 2. Trigger Action or Bot Response
      if (action) {
          action();
      } else {
          // Default fallback if no specific action function
          processResponse(text, chatMode);
      }
  };

  const processResponse = (text: string, mode: ChatMode) => {
      const lower = text.toLowerCase();
      let response = "I'm checking on that for you...";

      // --- ORDERS LOGIC ---
      if (mode === 'orders') {
          if (lower.includes("where") || lower.includes("track") || lower.includes("status")) {
              response = "I've checked your latest order #VK-2026-8942. It's currently **Out for Delivery**! 🚚 Expect it by 8 PM today.";
          } else if (lower.includes("return") || lower.includes("refund")) {
              response = "Returns are easy! Select the item from your 'Orders' page within 15 days. Would you like a direct link?";
          } else if (lower.includes("cancel")) {
              response = "I can help with cancellation. If the order hasn't shipped yet, you can cancel it directly from the 'Order Details' page.";
          } else {
              response = "Could you please provide your Order ID? Or check the 'My Orders' section for detailed history.";
          }
      } 
      // --- PAYMENT LOGIC ---
      else if (mode === 'payment') {
          if (lower.includes("failed") || lower.includes("declined")) {
              response = "Don't worry! If money was deducted, it is usually auto-refunded within 3-5 business days. You can retry the payment.";
          } else if (lower.includes("refund") || lower.includes("status")) {
              response = "Refunds are processed to the original source. UPI takes instant-24hrs, Cards take 3-5 days.";
          } else if (lower.includes("coupon") || lower.includes("offer")) {
              response = "We have a special 10% OFF code: **VALUE10**. Apply it at checkout! 🎉";
          } else {
              response = "We support UPI, Credit/Debit Cards, and Net Banking. What specific payment help do you need?";
          }
      }
      // --- CONTACT LOGIC ---
      else if (mode === 'contact') {
          if (lower.includes("email")) {
              response = "Drop us a line at **support@valuekart.com**. We typically reply within 2 hours!";
          } else if (lower.includes("call")) {
              response = "Our support line is **1800-VK-HELP**. Available 9 AM - 9 PM daily.";
          } else {
              response = "You can also visit our FAQ page for quick answers. Or just leave a message here!";
          }
      }
      // --- DEFAULT (PRODUCT SEARCH) LOGIC ---
      else {
          // Re-use existing search logic, simplified for this function
          // Note: Real search is in handleSendMessage for typed input. 
          // This is for pills if we add default pills later.
          response = "Tell me more about what you're looking for!";
      }

      addBotMessage(response);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userText = inputValue.trim();
    setInputValue("");

    // --- EASTER EGG ---
    if (userText.toLowerCase() === "blueflamego") {
        window.open("https://saurishdev.netlify.app/", "_blank");
        return;
    }

    // Add User Message
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: userText }]);

    // Route based on Mode
    if (chatMode !== 'default') {
        processResponse(userText, chatMode);
        return;
    }

    // --- DEFAULT MODE: PRODUCT SEARCH & GENERAL ---
    setIsTyping(true);
    try {
      const lowerText = userText.toLowerCase();

      // Cart Intent
      if (lowerText.includes("cart") || lowerText.includes("basket")) {
          const botText = totalItems === 0 
            ? "Your cart is empty. Ready to shop?" 
            : `You have ${totalItems} items (${formatPrice(totalPrice)}). Want to checkout?`;
          
          setTimeout(() => {
              setMessages((prev) => [...prev, { id: Date.now().toString(), role: "bot", text: botText }]);
              setIsTyping(false);
          }, 800);
          return;
      }

      // ... (Existing Product Search Logic - Condensed for brevity but functional) ...
      // Categories mapping (Simplified for this update, maintaining key mappings)
      const term = extractSearchTerm(lowerText);
      
      const url = `https://dummyjson.com/products/search?q=${encodeURIComponent(term)}&limit=3`;
      const res = await fetch(url);
      const data = await res.json();
      
      let products = data.products;
      let botText = products.length > 0 
        ? `I found these for "${term}"! 👇` 
        : "I couldn't find an exact match, but maybe you'll like these? 👇";

      if (products.length === 0) {
          const fb = await fetch('https://dummyjson.com/products?limit=3&skip=5');
          const fbData = await fb.json();
          products = fbData.products;
      }

      setTimeout(() => {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: "bot", text: botText, products }]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  // Helper for keyword extraction (Preserved logic)
  const extractSearchTerm = (text: string) => {
      const map: Record<string, string> = { "laptop": "laptops", "phone": "smartphones", "shoe": "mens-shoes", "dress": "womens-dresses", "watch": "mens-watches" };
      for (const [k, v] of Object.entries(map)) if (text.includes(k)) return v;
      return text.split(" ").filter(w => !["i", "want", "find", "show", "me", "a", "the"].includes(w)).join(" ") || "products";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  // --- PILLS CONFIGURATION ---
  const getPills = () => {
      switch (chatMode) {
          case 'orders':
              return [
                  { label: "Where is my order?", action: () => processResponse("Where is my order?", 'orders') },
                  { label: "Return Item", action: () => processResponse("return", 'orders') },
                  { label: "Cancel Order", action: () => processResponse("cancel", 'orders') },
                  { label: "Exit Order Help", action: () => setChatMode('default') }
              ];
          case 'payment':
              return [
                  { label: "Payment Failed", action: () => processResponse("payment failed", 'payment') },
                  { label: "Refund Status", action: () => processResponse("refund status", 'payment') },
                  { label: "Any Coupons?", action: () => processResponse("coupon", 'payment') },
                  { label: "Exit Payment Help", action: () => setChatMode('default') }
              ];
          case 'contact':
              return [
                  { label: "Email Support", action: () => processResponse("email", 'contact') },
                  { label: "Call Us", action: () => processResponse("call", 'contact') },
                  { label: "Back to Chat", action: () => setChatMode('default') }
              ];
          default:
              return [];
      }
  };

  const pills = getPills();

  return (
    <>
      {/* Trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ bottom: bottomOffset }}
            className="fixed right-6 z-50 transition-all duration-300 ease-out"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group relative flex items-center justify-center w-14 h-14 bg-vk-green-600 text-white rounded-full shadow-lg shadow-vk-green-300 hover:scale-110 hover:bg-vk-green-700 transition-all"
            >
              <MessageCircleHeart className="w-7 h-7" />
              <span className="absolute inset-0 rounded-full bg-vk-green-500 opacity-75 animate-ping -z-10 group-hover:animate-none"></span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ bottom: typeof window !== 'undefined' && window.innerWidth >= 768 ? bottomOffset + 80 : 0 }}
            className={`
              fixed z-50 bg-white shadow-2xl overflow-hidden flex flex-col
              inset-0 md:inset-auto md:right-6 md:w-[380px] md:h-[550px] md:rounded-2xl md:border md:border-vk-green-100
              transition-all duration-300 ease-out font-sans
            `}
          >
            {/* Header */}
            <div className="bg-vk-green-600 p-4 text-white flex items-center justify-between shadow-md shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsOpen(false)} className="md:hidden p-1 hover:bg-vk-green-700 rounded-full"><ChevronLeft className="w-6 h-6" /></button>
                <div className="bg-white/20 p-2 rounded-full"><Sparkles className="w-5 h-5 text-vk-gold" /></div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                      {chatMode === 'default' ? 'Assistant' : chatMode === 'orders' ? 'Order Help' : chatMode === 'payment' ? 'Billing Support' : 'Contact Us'}
                  </h3>
                  <p className="text-[10px] opacity-80 flex items-center gap-1">
                      {isTyping ? "Typing..." : "Online"} 
                      {!isTyping && <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>}
                  </p>
                </div>
              </div>

              {/* Context Menu */}
              <div className="flex items-center gap-2" ref={menuRef}>
                 <div className="relative">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1 hover:bg-vk-green-700 rounded-full transition-colors text-white/80 hover:text-white flex items-center justify-center"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-vk-green-100 py-1 z-50 text-gray-800 origin-top-right overflow-hidden"
                            >
                                <button onClick={() => handleModeSwitch('orders', "How can I help with your orders today? 📦")} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                                    <Package className="w-4 h-4 text-vk-green-600" /> Help with Orders
                                </button>
                                <button onClick={() => handleModeSwitch('payment', "What payment issue are you facing? 💳")} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50">
                                    <CreditCard className="w-4 h-4 text-vk-green-600" /> Payment Help
                                </button>
                                <button onClick={() => handleModeSwitch('contact', "We're here to help! How do you want to reach us? 📞")} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-vk-green-600" /> Contact Us
                                </button>
                                {chatMode !== 'default' && (
                                    <button onClick={() => setChatMode('default')} className="w-full text-left px-4 py-3 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 flex items-center gap-2 justify-center">
                                        <RefreshCcw className="w-3 h-3" /> Reset Chat
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                 </div>
                 <button onClick={() => setIsOpen(false)} className="hidden md:block p-1 hover:bg-vk-green-700 rounded-full"><X className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 space-y-4 bg-vk-green-50/50 overscroll-contain">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                        msg.role === "user" ? "bg-vk-green-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                      }`}
                  >
                    {msg.text.split("**").map((chunk, i) => i % 2 === 1 ? <strong key={i}>{chunk}</strong> : chunk)}
                  </div>
                  {msg.products && (
                    <div className="mt-3 w-full space-y-2">
                      {msg.products.map((product) => (
                        <Link key={product.id} href={`/product/${product.id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-vk-green-200 transition-all group">
                          <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            <Image src={product.thumbnail} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                            <p className="text-xs text-vk-green-600 font-bold">{formatPrice(product.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-vk-green-500" />
                    <span className="text-xs text-gray-500">ValueKart is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Interactive Pills */}
            <AnimatePresence>
                {pills.length > 0 && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="flex gap-2 overflow-x-auto p-3 scrollbar-hide">
                            {pills.map((pill, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handlePillClick(pill.label, pill.action)}
                                    className="flex-shrink-0 px-3 py-1.5 bg-vk-green-50 text-vk-green-700 text-xs font-bold rounded-full border border-vk-green-100 hover:bg-vk-green-100 hover:border-vk-green-200 transition-colors whitespace-nowrap"
                                >
                                    {pill.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-200 focus-within:border-vk-green-400 focus-within:ring-2 focus-within:ring-vk-green-100 transition-all">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={chatMode === 'default' ? "Ask about products..." : `Ask about ${chatMode}...`}
                  className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-2 bg-vk-green-600 text-white rounded-full hover:bg-vk-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
