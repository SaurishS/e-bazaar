"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Package, MapPin, Settings, LogOut, Camera, Edit2, ChevronRight, Download, Plus, Trash2, Check, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { useSettings } from "../context/SettingsContext";
import { generateReceipt } from "../utils/receiptGenerator";

type Tab = 'profile' | 'orders' | 'addresses' | 'settings';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab;
  
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'profile');
  const [loading, setLoading] = useState(true);

  // Sync tab if param changes
  useEffect(() => {
      if (tabParam) {
          setActiveTab(tabParam);
      }
  }, [tabParam]);

  // User State
  const [user, setUser] = useState<any>({
      name: "",
      username: "",
      email: "",
      phone: "",
      avatar: null,
      addresses: []
  });

  useEffect(() => {
    async function getUser() {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUser({
                name: user.user_metadata.full_name || "",
                username: user.user_metadata.username || "",
                email: user.email || "",
                phone: user.phone || "",
                avatar: user.user_metadata.avatar_url || null,
                addresses: user.user_metadata.addresses || [
                    { id: 1, label: "Home", text: "123 Green Lane, Cityville, Maharashtra" }
                ]
            });
        } else {
             // Redirect if not logged in
             router.push('/login/customer');
        }
        setLoading(false);
    }
    getUser();
  }, [router]);

  const handleLogout = async () => {
      await supabase.auth.signOut();
      router.push('/');
  };

  const updateProfile = async (updates: any) => {
      // Optimistic update
      setUser({ ...user, ...updates });
      
      // Persist to Supabase
      const { error } = await supabase.auth.updateUser({
          data: updates
      });
      if (error) console.error("Update failed", error);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="pt-24 max-w-[1000px] mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold text-vk-green-900 mb-8 text-center">User Profile & Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="md:col-span-1 space-y-2">
                <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User className="w-5 h-5" />} label="Profile" />
                <NavButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Package className="w-5 h-5" />} label="Your Orders" />
                <NavButton active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} icon={<MapPin className="w-5 h-5" />} label="Addresses" />
                <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-5 h-5" />} label="Settings" />
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors font-medium mt-4"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-3">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && <ProfileTab key="profile" user={user} updateProfile={updateProfile} />}
                    {activeTab === 'orders' && <OrdersTab key="orders" />}
                    {activeTab === 'addresses' && <AddressesTab key="addresses" user={user} updateProfile={updateProfile} />}
                    {activeTab === 'settings' && <SettingsTab key="settings" />}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </main>
  );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-vk-green-50">Loading...</div>}>
            <ProfileContent />
        </Suspense>
    );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                active ? 'bg-vk-green-600 text-white shadow-lg shadow-vk-green-200' : 'bg-white text-gray-600 hover:bg-vk-green-50'
            }`}
        >
            {icon}
            <span className="font-bold">{label}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto" />}
        </button>
    )
}

function ProfileTab({ user, updateProfile }: any) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localUser, setLocalUser] = useState(user);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

    // Load Avatar from LocalStorage on mount (Mock Cloud Storage)
    useEffect(() => {
        const savedAvatar = localStorage.getItem(`avatar_${user.email}`);
        if (savedAvatar) {
            setLocalUser((prev: any) => ({ ...prev, avatar: savedAvatar }));
        }
    }, [user.email]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLocalUser({ ...localUser, avatar: base64String });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        
        // Save Avatar to LocalStorage (Mock)
        if (localUser.avatar) {
            localStorage.setItem(`avatar_${user.email}`, localUser.avatar);
        }

        await updateProfile({
            full_name: localUser.name,
            username: localUser.username,
            // avatar_url: localUser.avatar // Don't send huge base64 to metadata, keeping local for now
        });
        
        setIsSaving(false);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-[32px] p-8 shadow-sm border border-vk-green-50">
            <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
                        {localUser.avatar ? <img src={localUser.avatar} className="w-full h-full object-cover" /> : <User className="w-full h-full p-4 text-gray-400" />}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md text-vk-green-600 group-hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4" />
                    </div>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">Change Photo</h2>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="space-y-6">
                <InputGroup label="Name" value={localUser.name} onChange={(v: string) => setLocalUser({...localUser, name: v})} />
                <InputGroup label="Username" value={localUser.username} onChange={(v: string) => setLocalUser({...localUser, username: v})} icon={<Edit2 className="w-4 h-4" />} />
                <InputGroup label="Email" value={localUser.email} onChange={(v: string) => setLocalUser({...localUser, email: v})} readOnly />
                <InputGroup label="Phone Number" value={localUser.phone} onChange={(v: string) => setLocalUser({...localUser, phone: v})} icon={<Edit2 className="w-4 h-4" />} />
            </div>

            <div className="mt-8 flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`
                        font-bold px-8 py-3 rounded-full transition-all shadow-lg flex items-center gap-2
                        ${saveStatus === 'saved' ? 'bg-green-500 text-white shadow-green-200' : 'bg-vk-green-600 text-white hover:bg-vk-green-700 shadow-vk-green-200'}
                    `}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : saveStatus === 'saved' ? (
                        <>
                            <Check className="w-4 h-4" />
                            Saved
                        </>
                    ) : "Save Changes"}
                </button>
            </div>
        </motion.div>
    )
}

function InputGroup({ label, value, onChange, icon, readOnly }: any) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">{label}</label>
            <div className="relative">
                <input 
                    type="text" 
                    value={value} 
                    readOnly={readOnly}
                    onChange={(e) => onChange(e.target.value)} 
                    className={`w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-vk-green-200 outline-none text-gray-800 font-medium ${readOnly && 'opacity-60 cursor-not-allowed'}`}
                />
                {icon && !readOnly && <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-vk-green-600">{icon}</button>}
            </div>
        </div>
    )
}

function OrdersTab() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
    const [loadingItems, setLoadingItems] = useState(false);
    const { formatPrice } = useSettings();

    useEffect(() => {
        async function fetchOrders() {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (data) setOrders(data);
            setLoading(false);
        }
        fetchOrders();
    }, []);

    const calculateStatus = (createdAt: string) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        
        if (diffHours < 2) return 'Processing';
        if (diffHours < 24) return 'Shipped';
        if (diffHours < 72) return 'Out for Delivery';
        return 'Delivered';
    };

    const toggleDetails = async (orderId: string) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
            return;
        }

        setExpandedOrderId(orderId);

        if (!orderItems[orderId]) {
            setLoadingItems(true);
            const { data } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);
            
            if (data) {
                setOrderItems(prev => ({ ...prev, [orderId]: data }));
            }
            setLoadingItems(false);
        }
    };

    const handleDownloadReceipt = (order: any) => {
        const items = orderItems[order.id];
        if (items) {
            generateReceipt(order.id, order.created_at, items, order.total, formatPrice);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;
    if (orders.length === 0) return <div className="text-center py-10 text-gray-400">No orders found.</div>;

    return (
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="text-2xl font-bold text-vk-green-900 mb-6">Your Orders</h2>
            {orders.map(order => {
                const status = calculateStatus(order.created_at);
                const isExpanded = expandedOrderId === order.id;
                const items = orderItems[order.id] || [];

                return (
                    <div key={order.id} className="bg-white rounded-[24px] border border-vk-green-50 shadow-sm overflow-hidden transition-all">
                        <div 
                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-vk-green-50/30 transition-colors"
                            onClick={() => toggleDetails(order.id)}
                        >
                            <div>
                                <h3 className="font-bold text-vk-green-900">{order.id}</h3>
                                <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full ${
                                    status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                    status === 'Out for Delivery' ? 'bg-orange-100 text-orange-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {status}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-gray-800 mb-2">{order.total ? formatPrice(order.total) : 'N/A'}</p>
                                <div className="flex items-center gap-2 justify-end">
                                    <span className="text-sm text-vk-green-600 font-bold flex items-center gap-1">
                                        {isExpanded ? "Hide Details" : "Order Details"} <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-gray-50 border-t border-gray-100"
                                >
                                    <div className="p-6">
                                        <h4 className="font-bold text-gray-700 mb-4">Items Ordered</h4>
                                        {loadingItems && !items.length ? (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Loading items...
                                            </div>
                                        ) : (
                                            <div className="space-y-3 mb-6">
                                                {items.map((item: any) => (
                                                    <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                            {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
                                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <Link href={`/track-order?id=${order.id}`} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                                                Track Order
                                            </Link>
                                            <button 
                                                onClick={() => handleDownloadReceipt(order)}
                                                className="flex-1 bg-vk-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-vk-green-700 transition-colors shadow-lg shadow-vk-green-200"
                                            >
                                                <Download className="w-4 h-4" /> Download Receipt
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </motion.div>
    )
}

function AddressesTab({ user, updateProfile }: any) {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [newAddress, setNewAddress] = useState("");
    const [label, setLabel] = useState("Home");
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch Addresses from DB
    useEffect(() => {
        async function fetchAddresses() {
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (data) setAddresses(data);
            setLoading(false);
        }
        fetchAddresses();
    }, []);

    const handleAdd = async () => {
        if (!newAddress) return;
        
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        const { data, error } = await supabase
            .from('addresses')
            .insert([{ 
                user_id: currentUser.id,
                label, 
                address_text: newAddress 
            }])
            .select();

        if (error) {
            console.error("Address Insert Error:", error);
            alert(`Failed to save address: ${error.message}`);
            return;
        }

        if (data) {
            setAddresses([data[0], ...addresses]);
            setNewAddress("");
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        const { error } = await supabase
            .from('addresses')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Address Delete Error:", error);
            alert("Failed to delete address");
        } else {
            setAddresses(addresses.filter(a => a.id !== id));
        }
    };

    if (loading) return <div className="p-8 text-center">Loading addresses...</div>;

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-[32px] p-8 shadow-sm border border-vk-green-50 space-y-6">
            <h2 className="text-2xl font-bold text-vk-green-900">Saved Addresses</h2>
            
            <div className="space-y-4">
                {addresses.length === 0 && !isAdding && <p className="text-gray-400">No addresses saved yet.</p>}
                
                {addresses.map((addr) => (
                    <div key={addr.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-vk-green-100 flex items-center justify-center text-vk-green-600">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{addr.label}</p>
                                <p className="text-sm text-gray-500">{addr.address_text}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(addr.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            {isAdding ? (
                <div className="p-4 bg-gray-50 rounded-2xl border border-vk-green-200 animate-in fade-in zoom-in-95 duration-200">
                    <input 
                        placeholder="Label (e.g. Home, Work)" 
                        value={label} 
                        onChange={e => setLabel(e.target.value)}
                        className="w-full mb-3 p-3 rounded-xl border border-gray-200 text-sm font-bold"
                    />
                    <textarea 
                        placeholder="Enter full address..." 
                        value={newAddress} 
                        onChange={e => setNewAddress(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm mb-3 h-24 resize-none"
                    />
                    <div className="flex gap-2">
                        <button onClick={handleAdd} className="flex-1 bg-vk-green-600 text-white font-bold py-2 rounded-xl">Save</button>
                        <button onClick={() => setIsAdding(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-xl">Cancel</button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsAdding(true)} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-vk-green-400 hover:text-vk-green-600 transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" /> Add New Address
                </button>
            )}
        </motion.div>
    )
}

function SettingsTab() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!password || password !== confirm) {
            setMsg("Passwords do not match or empty.");
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.updateUser({ password: password });
        setLoading(false);
        if (error) {
            console.error("Password Update Error:", error);
            setMsg(`Error: ${error.message}`);
        }
        else setMsg("Password updated successfully!");
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-[32px] p-8 shadow-sm border border-vk-green-50 space-y-6">
            <h2 className="text-2xl font-bold text-vk-green-900 mb-4">Account Settings</h2>
            
            <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none" />
                 </div>
                 {msg && <p className={`text-sm font-bold ${msg.includes("success") ? "text-green-600" : "text-red-500"}`}>{msg}</p>}
                 
                 <button 
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="w-full bg-vk-green-600 text-white font-bold py-4 rounded-2xl hover:bg-vk-green-700 transition-all shadow-lg shadow-vk-green-200"
                 >
                    {loading ? "Updating..." : "Update Password"}
                 </button>
            </div>
        </motion.div>
    )
}