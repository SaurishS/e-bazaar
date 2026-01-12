"use client";

import React, { Suspense } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function ContactContent() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center pt-24 px-4">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-vk-green-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-500">Contact Details would be updated soon...</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function ContactPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-vk-green-50">Loading...</div>}>
            <ContactContent />
        </Suspense>
    );
}
