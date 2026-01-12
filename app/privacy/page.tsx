"use client";

import React, { Suspense } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PrivacyContent() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-[800px] mx-auto px-4 sm:px-6 pb-12">
        <h1 className="text-3xl font-bold text-vk-green-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-green">
            <p>Your privacy is important to us. This policy explains how we handle your data.</p>
            <h3>1. Data Collection</h3>
            <p>We collect information you provide directly to us, such as when you create an account or place an order.</p>
            <h3>2. Data Usage</h3>
            <p>We use your data to process orders, improve our services, and communicate with you.</p>
            <h3>3. Security</h3>
            <p>We implement security measures to protect your personal information.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function PrivacyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-vk-green-50">Loading...</div>}>
            <PrivacyContent />
        </Suspense>
    );
}
