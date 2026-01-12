"use client";

import React from "react";
import { ShoppingBag, CreditCard, Tag, Sparkles, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

export default function ShoppingIllustration() {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      
      {/* Background Glows (Static) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-vk-gold/20 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-vk-green-400/20 rounded-full blur-2xl" />

      {/* Main Floating Glass Card (Phone/App Interface) */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-40 h-56 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-4 overflow-hidden"
      >
        {/* Screen Content */}
        <div className="w-full h-full bg-white/50 rounded-2xl flex flex-col items-center pt-6 gap-3">
             <div className="w-16 h-16 bg-vk-green-100 rounded-full flex items-center justify-center shadow-inner">
                 <ShoppingBag className="w-8 h-8 text-vk-green-600" />
             </div>
             <div className="w-20 h-2 bg-gray-200 rounded-full" />
             <div className="w-12 h-2 bg-gray-200 rounded-full" />
             
             {/* Buy Button */}
             <div className="mt-auto mb-4 w-24 h-8 bg-vk-green-500 rounded-full shadow-lg shadow-vk-green-200" />
        </div>
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      </motion.div>

      {/* Floating Elements Orbiting */}
      
      {/* Credit Card */}
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -right-8 top-12 z-20"
      >
          <div className="w-24 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl shadow-xl flex items-center justify-center border border-gray-600">
             <CreditCard className="w-6 h-6 text-white/80" />
          </div>
      </motion.div>

      {/* Sale Tag */}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-6 bottom-16 z-20"
      >
          <div className="w-16 h-16 bg-vk-gold rounded-2xl shadow-lg flex items-center justify-center border-2 border-white rotate-12">
             <Tag className="w-8 h-8 text-white" />
          </div>
      </motion.div>

      {/* Sparkles */}
      <motion.div
         animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
         transition={{ duration: 2, repeat: Infinity }}
         className="absolute top-0 left-4"
      >
          <Sparkles className="w-6 h-6 text-vk-gold" />
      </motion.div>

    </div>
  );
}