"use client";

import React, { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart, MapPin, ChevronDown, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

function CartContent() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const { formatPrice, t } = useSettings();
  const router = useRouter();

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressText, setNewAddressText] = useState("");
  const [newAddressLabel, setNewAddressLabel] = useState("Home");

  useEffect(() => {
    async function fetchAddresses() {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data } = await supabase.from('addresses').select('*').order('created_at', { ascending: false });
            if (data && data.length > 0) {
                setAddresses(data);
                setSelectedAddressId(data[0].id);
            }
        }
    }
    fetchAddresses();
  }, []);

  const handleAddAddress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !newAddressText) return;

      const { data, error } = await supabase
          .from('addresses')
          .insert([{ user_id: user.id, label: newAddressLabel, address_text: newAddressText }])
          .select();
      
      if (data) {
          setAddresses([data[0], ...addresses]);
          setSelectedAddressId(data[0].id);
          setIsAddingAddress(false);
          setIsDropdownOpen(false);
          setNewAddressText("");
      }
  };

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);
  
  // Delivery Date (Mock: Today + 3 days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const deliveryDateString = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  const shipping = totalPrice > 50 || totalItems === 0 ? 0 : 5.99;
  const tax = totalPrice * 0.08; // 8% estimated tax
  const finalTotal = totalPrice + shipping + tax;

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="pt-24 max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-vk-green-100 flex items-center justify-center text-vk-green-600">
                <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-vk-green-900">{t('cartTitle')}</h1>
                <p className="text-vk-green-600 font-medium">{totalItems} {t('items')}</p>
            </div>
        </div>

        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white rounded-[32px] p-12 text-center border border-vk-green-50 shadow-sm"
          >
            <div className="w-24 h-24 bg-vk-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-vk-green-200">
                <ShoppingBag className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-vk-green-800 mb-2">{t('emptyCart')}</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-vk-green-600 text-white font-bold px-8 py-4 rounded-full hover:bg-vk-green-700 transition-all shadow-lg shadow-vk-green-100">
                {t('continueShopping')}
                <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white rounded-3xl p-4 sm:p-6 flex items-center gap-4 sm:gap-6 border border-vk-green-50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-20 h-20 sm:w-28 sm:h-28 relative bg-vk-green-50 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image src={item.thumbnail} alt={item.title} fill className="object-contain p-2" />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-vk-green-900 text-lg truncate pr-2">{item.title}</h3>
                            </div>
                            <p className="text-sm text-vk-green-600 font-medium mb-1 capitalize">{item.category}</p>
                            <p className="font-bold text-vk-green-700 text-lg">
                                {formatPrice(item.price)}
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                             {/* Quantity Control Pill */}
                            <div className="flex items-center gap-1 bg-vk-green-50 rounded-full p-1 border border-vk-green-100">
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center text-vk-green-700 hover:bg-white rounded-full transition-colors"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-bold text-vk-green-900 text-sm">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center text-vk-green-700 hover:bg-white rounded-full transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Remove Button (Vertical) */}
                    <button 
                        onClick={() => removeFromCart(item.id)}
                        className="flex flex-col items-center gap-1 text-red-400 hover:text-red-600 transition-colors p-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span className="text-[10px] font-bold">Remove</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary & Billing */}
            <div className="lg:col-span-1 space-y-6">
              {/* Summary Card */}
              <div className="bg-white rounded-[32px] p-8 border border-vk-green-50 shadow-sm">
                <h2 className="text-xl font-bold text-vk-green-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>{t('subtotal')}</span>
                        <span className="font-semibold text-vk-green-800">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>{t('shipping')}</span>
                        <span className="font-semibold text-vk-green-800">
                            {shipping === 0 ? 'Free' : formatPrice(shipping)}
                        </span>
                    </div>
                    {/* Delivery Date Estimation */}
                    {selectedAddress && (
                        <div className="flex justify-between text-vk-green-600">
                            <span>Est. Delivery</span>
                            <span className="font-bold">{deliveryDateString}</span>
                        </div>
                    )}
                </div>

                <div className="h-px bg-vk-green-50 mb-6" />

                <div className="flex justify-between text-xl font-bold text-vk-green-900 mb-8">
                    <span>{t('total')}</span>
                    <span>{formatPrice(finalTotal)}</span>
                </div>

                <button 
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-vk-green-600 text-white font-bold py-4 rounded-full hover:bg-vk-green-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-vk-green-100 flex items-center justify-center gap-2"
                >
                    {t('checkout')}
                    <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Address Selection Dropdown */}
              <div className="bg-white rounded-[32px] p-6 border border-vk-green-50 shadow-sm relative">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-vk-green-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-vk-green-500" />
                          Delivery To
                      </h3>
                      {selectedAddress && (
                          <span className="text-xs font-bold text-vk-green-600 bg-vk-green-50 px-2 py-1 rounded-full uppercase">
                              {selectedAddress.label}
                          </span>
                      )}
                  </div>
                  
                  <div className="relative">
                      <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full text-left p-3 rounded-xl border border-vk-green-100 hover:border-vk-green-300 transition-colors flex items-center justify-between bg-vk-green-50/30"
                      >
                          <span className="text-sm font-medium text-gray-700 truncate mr-2">
                              {selectedAddress ? selectedAddress.address_text : "Select Address"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                          {isDropdownOpen && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-vk-green-100 overflow-hidden z-20 max-h-80 overflow-y-auto"
                              >
                                  {!isAddingAddress ? (
                                      <>
                                        {addresses.map(addr => (
                                            <button 
                                                key={addr.id}
                                                onClick={() => { setSelectedAddressId(addr.id); setIsDropdownOpen(false); }}
                                                className={`w-full text-left p-3 text-sm hover:bg-vk-green-50 transition-colors flex items-center justify-between ${selectedAddressId === addr.id ? 'bg-vk-green-50/50 text-vk-green-900 font-medium' : 'text-gray-600'}`}
                                            >
                                                <div className="min-w-0">
                                                    <span className="text-xs font-bold bg-gray-100 px-1.5 py-0.5 rounded mr-2">{addr.label}</span>
                                                    <span className="truncate">{addr.address_text}</span>
                                                </div>
                                                {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-vk-green-500 flex-shrink-0 ml-2" />}
                                            </button>
                                        ))}
                                        <div className="h-px bg-gray-100 mx-2" />
                                        <button 
                                            className="w-full text-left p-3 text-sm text-vk-green-600 font-bold hover:bg-vk-green-50 transition-colors flex items-center gap-2"
                                            onClick={() => setIsAddingAddress(true)}
                                        >
                                            <PlusCircle className="w-4 h-4" />
                                            Add New Address
                                        </button>
                                      </>
                                  ) : (
                                      <div className="p-3 bg-gray-50">
                                          <input 
                                            placeholder="Label (e.g. Work)" 
                                            value={newAddressLabel}
                                            onChange={(e) => setNewAddressLabel(e.target.value)}
                                            className="w-full mb-2 p-2 rounded-lg border border-gray-200 text-xs font-bold"
                                          />
                                          <textarea 
                                            placeholder="Address..." 
                                            value={newAddressText}
                                            onChange={(e) => setNewAddressText(e.target.value)}
                                            className="w-full mb-2 p-2 rounded-lg border border-gray-200 text-xs h-16 resize-none"
                                          />
                                          <div className="flex gap-2">
                                              <button onClick={handleAddAddress} className="flex-1 bg-vk-green-600 text-white text-xs font-bold py-2 rounded-lg">Save</button>
                                              <button onClick={() => setIsAddingAddress(false)} className="flex-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg">Cancel</button>
                                          </div>
                                      </div>
                                  )}
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

export default function CartPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-vk-green-50">Loading...</div>}>
            <CartContent />
        </Suspense>
    );
}
