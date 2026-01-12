"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-vk-green-100 py-12 mt-auto">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-1">
             <span className="font-bold text-xl text-vk-green-800 tracking-tight">
              Value<span className="text-vk-gold-dark">Kart</span>
            </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
            <Link href="/terms" className="hover:text-vk-green-600 transition-colors">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-vk-green-600 transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-vk-green-600 transition-colors">Contact Us</Link>
        </div>

        {/* Made With */}
        <div className="flex items-center gap-1 text-sm font-bold text-vk-green-800">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span>by ValueKart Team</span>
        </div>

      </div>
    </footer>
  );
}
