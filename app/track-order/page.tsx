"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Check, Package, Truck, Home, MapPin } from "lucide-react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  
  const [orderId, setOrderId] = useState(queryId || "VK-2026-8942");
  const [dates, setDates] = useState<any>(null);
  
  // Current Date (Real-time)
  const now = new Date(); 

  useEffect(() => {
    async function fetchOrder() {
        if (!queryId) return;

        let foundOrder = null;

        // 1. Try Supabase
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('id', queryId)
            .single();
        
        if (data) {
            foundOrder = { ...data, timestamp: new Date(data.created_at).getTime() };
        } else {
            // 2. Try LocalStorage (Fallback for Demo)
            const savedOrders = JSON.parse(localStorage.getItem("vk-orders") || "[]");
            foundOrder = savedOrders.find((o: any) => o.id === queryId);
        }

        if (foundOrder) {
            setOrderId(foundOrder.id);
            const baseTime = new Date(foundOrder.timestamp || foundOrder.created_at);
            
            // Calculate Steps Relative to Order Placement
            setDates({
                placed: baseTime,
                processing: new Date(baseTime.getTime() + 2 * 60 * 60 * 1000), // +2 hours
                shipped: new Date(baseTime.getTime() + 24 * 60 * 60 * 1000), // +1 Day
                outForDelivery: new Date(baseTime.getTime() + 72 * 60 * 60 * 1000), // +3 Days
                delivered: new Date(baseTime.getTime() + 80 * 60 * 60 * 1000), // +3 Days 8 Hours
            });
        } else {
            // Fallback if not found (or mock ID)
            const baseTime = new Date();
            setDates({
                placed: baseTime,
                processing: new Date(baseTime.getTime() + 2 * 60 * 60 * 1000),
                shipped: new Date(baseTime.getTime() + 24 * 60 * 60 * 1000),
                outForDelivery: new Date(baseTime.getTime() + 72 * 60 * 60 * 1000),
                delivered: new Date(baseTime.getTime() + 80 * 60 * 60 * 1000),
            });
        }
    }
    fetchOrder();
  }, [queryId]);

  if (!dates) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  const steps = [
    { icon: <Package className="w-5 h-5" />, label: "Order Placed", dateObj: dates.placed, completed: now >= dates.placed },
    { icon: <Check className="w-5 h-5" />, label: "Processing", dateObj: dates.processing, completed: now >= dates.processing },
    { icon: <Truck className="w-5 h-5" />, label: "Shipped", dateObj: dates.shipped, completed: now >= dates.shipped },
    { icon: <MapPin className="w-5 h-5" />, label: "Out for Delivery", dateObj: dates.outForDelivery, completed: now >= dates.outForDelivery },
    { icon: <Home className="w-5 h-5" />, label: "Delivered", dateObj: dates.delivered, completed: now >= dates.delivered },
  ];

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="pt-24 max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-vk-green-900 mb-2">Track Order</h1>
        <p className="text-gray-500 mb-8">Order #{orderId}</p>

        {/* Estimated Delivery Card */}
        <div className="bg-vk-green-600 rounded-[32px] p-8 text-white shadow-lg shadow-vk-green-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             
             <div className="relative z-10">
                 <p className="text-vk-green-100 font-medium mb-1">Estimated Arrival</p>
                 <h2 className="text-3xl sm:text-4xl font-bold">
                     {dates.delivered.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                 </h2>
                 <p className="text-sm text-vk-green-100 mt-2">By 8:00 PM</p>
             </div>
             <div className="relative z-10 bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                 <Truck className="w-10 h-10 text-white" />
             </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-[32px] p-8 border border-vk-green-50 shadow-sm">
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100" />

                <div className="space-y-8 relative">
                    {steps.map((step, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-6 relative"
                        >
                            {/* Icon Bubble */}
                            <div className={`
                                w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 transition-colors duration-500
                                ${step.completed 
                                    ? 'bg-vk-green-500 border-white text-white shadow-md' 
                                    : 'bg-white border-gray-100 text-gray-300'
                                }
                            `}>
                                {step.completed ? <Check className="w-5 h-5" /> : step.icon}
                            </div>
                            
                            {/* Text */}
                            <div className={`pt-1 ${step.completed ? 'opacity-100' : 'opacity-50'}`}>
                                <h4 className="font-bold text-vk-green-900 text-lg">{step.label}</h4>
                                <p className="text-sm text-gray-500">
                                    {step.dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        <div className="mt-8 text-center">
            <Link href="/" className="text-vk-green-600 font-bold hover:underline">
                Continue Shopping
            </Link>
        </div>
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-vk-green-50">Loading...</div>}>
            <TrackOrderContent />
        </Suspense>
    );
}