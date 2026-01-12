"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CreditCard, Truck, ShieldCheck, ArrowRight, ArrowLeft, ChevronRight, Landmark, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { supabase } from "../../lib/supabaseClient";
import { generateReceipt } from "../utils/receiptGenerator";

type Step = 'shipping' | 'payment' | 'review';

function CheckoutContent() {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const { formatPrice, t, country } = useSettings();
  const router = useRouter();
  
  const [step, setStep] = useState<Step>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [confirmedItems, setConfirmedItems] = useState<any[]>([]);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  // Shipping State
  const [shippingDetails, setShippingDetails] = useState({
      fullName: "",
      phone: "",
      city: "",
      address: "",
      postalCode: ""
  });

  // Billing State
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');

  const shipping = totalPrice > 50 || totalItems === 0 ? 0 : 5.99;
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + shipping + tax;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Generate Order ID
    const newOrderId = "VK-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
    setOrderId(newOrderId);
    setConfirmedItems([...cart]);
    setConfirmedTotal(finalTotal);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // 1. Insert Order
        const { error: orderError } = await supabase
            .from('orders')
            .insert([{
                id: newOrderId,
                user_id: user.id,
                total: finalTotal,
                status: 'Processing',
                shipping_address: `${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.postalCode}`, 
                payment_method: paymentMethod
            }]);

        if (orderError) {
            console.error("Order Insert Error Full:", orderError);
            console.warn("Proceeding with demo flow despite DB error.");
        } else {
             // 2. Insert Items
            const itemsToInsert = cart.map(item => ({
                order_id: newOrderId,
                product_id: item.id,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                thumbnail: item.thumbnail,
                category: item.category
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) console.error("Items Insert Error", itemsError);
        }
    } else {
        console.warn("User not logged in, skipping DB insert.");
    }

    // Send Email (Mock API Call)
    try {
        await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                orderId: newOrderId,
                cart: cart,
                total: formatPrice(finalTotal)
            })
        });
    } catch (e) {
        console.error("Failed to send email", e);
    }

    // Simulate Delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    }, 2000);
  };

  const downloadReceipt = () => {
      generateReceipt(orderId, new Date(), confirmedItems, confirmedTotal, formatPrice);
  };

  if (cart.length === 0 && !isSuccess) {
      return (
          <main className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
              <div className="bg-white rounded-[32px] p-12 border border-vk-green-50 shadow-sm max-w-md w-full">
                  <h2 className="text-2xl font-bold text-vk-green-800 mb-4">Your cart is empty</h2>
                  <p className="text-gray-500 mb-8">Add some items to your cart before checking out.</p>
                  <Link href="/" className="inline-block bg-vk-green-600 text-white font-bold px-8 py-3 rounded-full">
                      Start Shopping
                  </Link>
              </div>
          </main>
      );
  }

  if (isSuccess) {
      return (
          <main className="min-h-screen bg-background flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[40px] p-12 text-center border border-vk-green-50 shadow-2xl max-w-xl w-full"
              >
                  <div className="w-24 h-24 bg-vk-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-vk-green-600">
                      <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h1 className="text-4xl font-bold text-vk-green-900 mb-2">Order Placed!</h1>
                  <p className="text-vk-green-800 font-bold text-xl mb-2">{orderId}</p>
                  {email && <p className="text-vk-green-600 font-medium mb-4">Receipt sent to {email}</p>}
                  
                  <div className="flex justify-center gap-4 mb-8">
                      <button onClick={downloadReceipt} className="flex items-center gap-2 text-vk-green-700 hover:text-vk-green-900 underline">
                          <CheckCircle2 className="w-4 h-4" /> Download PDF Receipt
                      </button>
                  </div>

                  <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                      Thank you for your purchase. We've sent a confirmation email to your registered address.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={() => router.push('/')} className="bg-white text-vk-green-700 border-2 border-vk-green-100 font-bold px-10 py-4 rounded-full hover:bg-vk-green-50 transition-all">
                        Back to Home
                    </button>
                    <button onClick={() => router.push(`/track-order?id=${orderId}`)} className="bg-vk-green-600 text-white font-bold px-10 py-4 rounded-full hover:bg-vk-green-700 transition-all">
                        Track Order
                    </button>
                  </div>
              </motion.div>
          </main>
      );
  }

  // Display logic for billing address
  const billingAddressDisplay = sameAsShipping 
      ? (shippingDetails.address ? `${shippingDetails.address}, ${shippingDetails.city}` : "Same as Shipping")
      : "123 Green Lane, Cityville"; // Placeholder if unchecked (or could add another form)

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="pt-24 max-w-[1200px] mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-vk-green-800">Secure Payment</h1>
        </div>

        <div className="flex items-center justify-center mb-12">
            <div className="flex items-center gap-4">
                <StepItem label="Shipping" active={step === 'shipping'} completed={step === 'payment' || step === 'review'} />
                <div className={`w-12 h-0.5 rounded-full ${step === 'payment' || step === 'review' ? 'bg-vk-green-500' : 'bg-vk-green-100'}`} />
                <StepItem label="Payment" active={step === 'payment'} completed={step === 'review'} />
                <div className={`w-12 h-0.5 rounded-full ${step === 'review' ? 'bg-vk-green-500' : 'bg-vk-green-100'}`} />
                <StepItem label="Review" active={step === 'review'} completed={false} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                    {step === 'shipping' && (
                        <motion.div 
                            key="shipping"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white rounded-[32px] p-8 border border-vk-green-50 shadow-sm"
                        >
                            <h2 className="text-2xl font-bold text-vk-green-900 mb-8 flex items-center gap-3">
                                <Truck className="w-6 h-6 text-vk-green-500" />
                                Shipping Address
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <Input label="Full Name" placeholder="John Doe" value={shippingDetails.fullName} onChange={(v: string) => setShippingDetails({...shippingDetails, fullName: v})} />
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@example.com"
                                        className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-vk-green-300 focus:border-transparent outline-none transition-all placeholder:text-gray-300 text-gray-900 bg-white"
                                    />
                                </div>
                                <Input label="Phone Number" placeholder="+91 9876543210" value={shippingDetails.phone} onChange={(v: string) => setShippingDetails({...shippingDetails, phone: v})} />
                                <div className="md:col-span-1">
                                    <Input label="City" placeholder="Mumbai" value={shippingDetails.city} onChange={(v: string) => setShippingDetails({...shippingDetails, city: v})} />
                                </div>
                                <div className="md:col-span-2">
                                    <Input label="Street Address" placeholder="123, Green Valley, Sector 45" value={shippingDetails.address} onChange={(v: string) => setShippingDetails({...shippingDetails, address: v})} />
                                </div>
                                <Input label="Postal Code" placeholder="400001" value={shippingDetails.postalCode} onChange={(v: string) => setShippingDetails({...shippingDetails, postalCode: v})} />
                            </div>

                            {/* Billing Address Toggle */}
                            <div className="flex items-center gap-3 mb-8 p-4 bg-vk-green-50 rounded-2xl border border-vk-green-100">
                                <input 
                                    type="checkbox" 
                                    id="sameAsShipping" 
                                    checked={sameAsShipping}
                                    onChange={(e) => setSameAsShipping(e.target.checked)}
                                    className="w-5 h-5 text-vk-green-600 rounded focus:ring-vk-green-500 border-gray-300"
                                />
                                <label htmlFor="sameAsShipping" className="text-sm font-bold text-vk-green-800 cursor-pointer select-none">
                                    Billing address is same as shipping address
                                </label>
                            </div>

                            <button 
                                onClick={() => setStep('payment')}
                                className="mt-4 w-full bg-vk-green-600 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-vk-green-700 transition-all shadow-lg shadow-vk-green-100"
                            >
                                Continue to Payment
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {step === 'payment' && (
                        <motion.div 
                            key="payment"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white rounded-[32px] p-8 border border-vk-green-50 shadow-sm"
                        >
                            <button onClick={() => setStep('shipping')} className="text-vk-green-600 flex items-center gap-1 text-sm font-bold mb-6">
                                <ArrowLeft className="w-4 h-4" /> Back to Shipping
                            </button>
                            <h2 className="text-xl font-bold text-vk-green-900 mb-6">Select Payment Method</h2>
                            
                            <div className="flex gap-4 mb-8 overflow-x-auto p-1 -m-1">
                                <PaymentTab 
                                    id="card" 
                                    label="Credit/Debit Card" 
                                    icon={<CreditCard className="w-5 h-5" />} 
                                    selected={paymentMethod === 'card'} 
                                    onClick={() => setPaymentMethod('card')} 
                                />
                                {country.code === 'IN' && (
                                    <PaymentTab 
                                        id="upi" 
                                        label="UPI" 
                                        icon={<Smartphone className="w-5 h-5" />} 
                                        selected={paymentMethod === 'upi'} 
                                        onClick={() => setPaymentMethod('upi')} 
                                    />
                                )}
                                <PaymentTab 
                                    id="netbanking" 
                                    label="Net Banking" 
                                    icon={<Landmark className="w-5 h-5" />} 
                                    selected={paymentMethod === 'netbanking'} 
                                    onClick={() => setPaymentMethod('netbanking')} 
                                />
                            </div>
                            
                            {paymentMethod === 'card' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <Input label="Card Number" placeholder="Card Number" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <Input label="Expiry Date (MM/YY)" placeholder="MM/YY" />
                                        <Input label="CVV" placeholder="CVV" />
                                    </div>
                                    <Input label="Name on Card" placeholder="Name on Card" />
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="saveCard" className="w-4 h-4 text-vk-green-600 rounded border-gray-300 focus:ring-2 focus:ring-vk-green-500" />
                                        <label htmlFor="saveCard" className="text-sm text-gray-600">Save card for future</label>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'upi' && country.code === 'IN' && (
                                <div className="text-center py-8 text-gray-500 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <p>Enter your UPI ID to verify payment.</p>
                                    <input type="text" placeholder="username@upi" className="mt-4 w-full max-w-xs px-4 py-2 border rounded-lg text-center mx-auto block outline-none focus:ring-2 focus:ring-vk-green-300" />
                                </div>
                            )}
                             
                             {paymentMethod === 'netbanking' && (
                                <div className="py-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <p className="mb-4 text-sm font-bold text-gray-700">Select your Bank:</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(country.code === 'IN' ? ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'] : 
                                          country.code === 'US' ? ['Chase', 'Bank of America', 'Wells Fargo', 'Citi'] : 
                                          country.code === 'UK' ? ['HSBC', 'Barclays', 'Lloyds', 'NatWest'] : 
                                          country.code === 'JP' ? ['Mitsubishi UFJ', 'Sumitomo Mitsui', 'Mizuho', 'Japan Post Bank'] : 
                                          ['Bank A', 'Bank B', 'Bank C', 'Bank D']).map(bank => (
                                            <button key={bank} className="p-3 border rounded-xl hover:bg-vk-green-50 hover:border-vk-green-200 text-sm font-medium text-left transition-colors">
                                                {bank}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                             )}

                        </motion.div>
                    )}

                    {step === 'review' && (
                        <motion.div 
                            key="review"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white rounded-[32px] p-8 border border-vk-green-50 shadow-sm"
                        >
                             <button onClick={() => setStep('payment')} className="text-vk-green-600 flex items-center gap-1 text-sm font-bold mb-6">
                                <ArrowLeft className="w-4 h-4" /> Back to Payment
                            </button>
                            <h2 className="text-2xl font-bold text-vk-green-900 mb-6">Final Review</h2>
                             <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center border-b border-gray-100 py-2">
                                        <span>{item.title} (x{item.quantity})</span>
                                        <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Right Content: Sidebar */}
            <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                    <div className="bg-white rounded-[32px] p-8 border border-vk-green-50 shadow-sm">
                        <h2 className="text-xl font-bold text-vk-green-900 mb-6 border-b pb-2 border-gray-100">Order Summary</h2>
                        <div className="flex justify-between text-xl font-bold text-vk-green-900 mb-8">
                            <span>Total Payable:</span>
                            <span>{formatPrice(finalTotal)}</span>
                        </div>
                        
                        {step === 'payment' ? (
                             <button 
                                onClick={() => setStep('review')}
                                className="w-full bg-vk-green-600 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-vk-green-700 transition-all shadow-lg shadow-vk-green-100"
                            >
                                Review & Pay
                            </button>
                        ) : step === 'review' ? (
                            <button 
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                className="w-full bg-vk-green-600 text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-vk-green-700 transition-all shadow-lg shadow-vk-green-100 disabled:opacity-50"
                            >
                                {isProcessing ? "Processing..." : "Pay Now"}
                            </button>
                        ) : (
                             <p className="text-xs text-gray-400 text-center">Complete shipping to proceed</p>
                        )}
                    </div>

                    <div className="bg-white rounded-[32px] p-6 border border-vk-green-50 shadow-sm relative">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-vk-green-900">Billing Address</h3>
                            <div className="w-6 h-6 bg-vk-green-500 rounded-full flex items-center justify-center text-white">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {billingAddressDisplay}
                        </p>
                    </div>

                     <div className="flex items-center justify-center gap-2 text-vk-green-600/50">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Secure Payment</span>
                     </div>
                </div>
            </div>

        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-vk-green-50">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}

function StepItem({ label, active, completed }: { label: string, active: boolean, completed: boolean }) {
    return (
        <div className="flex flex-col items-center gap-2">
             <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                completed ? 'bg-vk-green-500 border-vk-green-500 text-white' : 
                active ? 'border-vk-green-500 text-vk-green-600' : 
                'border-vk-green-100 text-vk-green-200'
            }`}>
                {completed ? <CheckCircle2 className="w-4 h-4" /> : <div className={`w-2 h-2 rounded-full ${active ? 'bg-vk-green-500' : 'bg-vk-green-200'}`} />}
            </div>
            <span className={`text-xs font-bold ${active || completed ? 'text-vk-green-800' : 'text-vk-green-200'}`}>{label}</span>
        </div>
    )
}

// Updated Input to be Controlled
function Input({ label, placeholder, value, onChange }: { label: string, placeholder: string, value?: string, onChange?: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">{label}</label>
            <input 
                type="text" 
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-vk-green-300 focus:border-transparent outline-none transition-all placeholder:text-gray-300 text-gray-900 bg-white"
            />
        </div>
    )
}

function PaymentTab({ id, label, icon, selected, onClick }: { id: string, label: string, icon: React.ReactNode, selected: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`
                flex items-center gap-2 px-4 py-3 rounded-xl border transition-all whitespace-nowrap
                ${selected 
                    ? 'bg-vk-green-50 border-vk-green-500 text-vk-green-900 ring-1 ring-vk-green-500 shadow-sm' 
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }
            `}
        >
            {icon}
            <span className="font-bold text-sm">{label}</span>
        </button>
    )
}