"use client";

import React, { Suspense } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function TermsContent() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 max-w-[800px] mx-auto px-4 sm:px-6 pb-12">
        <h1 className="text-3xl font-bold text-vk-green-900 mb-6">Terms and Conditions</h1>
        <div className="prose prose-green">
            <p>Welcome to ValueKart. By accessing our website, you agree to these terms.</p>
            <h3>1. Usage</h3>
            <p>You agree to use our platform for lawful purposes only.</p>
            <h3>2. Orders</h3>
            <p>All orders are subject to availability and confirmation of the order price.</p>
            <h3>3. Returns</h3>
            <p>You may return items within 15 days of receipt if they are in original condition.</p>
            <h3>4. Liability</h3>
            <p>ValueKart is not liable for any indirect or consequential loss.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function TermsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-vk-green-50">Loading...</div>}>
            <TermsContent />
        </Suspense>
    );
}
