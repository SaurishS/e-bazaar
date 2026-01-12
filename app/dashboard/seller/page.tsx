"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { Plus, Settings, TrendingUp, Package, Users, DollarSign, Bell, CloudUpload } from "lucide-react";
import { motion } from "framer-motion";
import { useSettings } from "@/app/context/SettingsContext";

function SellerDashboardContent() {
  const router = useRouter();
  const { formatPrice, getRandomName } = useSettings();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Graph State
  const [timeRange, setTimeRange] = useState("30");
  const data30 = [30, 45, 35, 60, 50, 75, 65, 90, 80, 100];
  const data7 = [50, 70, 60, 85, 95, 80, 100]; // Higher intensity for 7 days
  const currentData = timeRange === "30" ? data30 : data7;

  // States for Add Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
      title: "", price: "", description: "", image: "https://dummyjson.com/image/200x200", category: "General"
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.user_metadata.role !== 'seller') {
        router.push('/login/seller');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleAddProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
          .from('products')
          .insert([{
              title: newProduct.title,
              price: parseFloat(newProduct.price),
              description: newProduct.description,
              category: newProduct.category,
              thumbnail: newProduct.image, // Now correctly stores base64 or URL
              seller_id: user.id
          }]);

      if (error) {
          console.error("Product Insert Error:", error);
          alert("Failed to add product. Ensure database schema is applied.");
      } else {
          alert(`Product "${newProduct.title}" added to store!`);
          setIsAddModalOpen(false);
          setNewProduct({ title: "", price: "", description: "", image: "https://dummyjson.com/image/200x200", category: "General" });
      }
  };

  if (loading) return <div className="min-h-screen bg-vk-green-50 flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-vk-green-50 font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-vk-green-800">Seller Dashboard</h1>
                <p className="text-gray-500">Welcome back, <span className="font-bold text-vk-gold-dark">{user?.user_metadata?.store_name || "Store Owner"}</span></p>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => router.push('/profile')}
                    className="flex items-center gap-2 px-5 py-3 bg-white border border-vk-green-100 text-vk-green-700 rounded-full font-bold shadow-sm hover:bg-vk-green-50 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-vk-green-600 text-white rounded-full font-bold shadow-lg shadow-vk-green-200 hover:bg-vk-green-700 hover:-translate-y-0.5 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Sell New Product
                </button>
            </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* STATS CHART (Main) */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-vk-green-50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-gray-800">Store Statistics</h3>
                    <select 
                        className="text-xs bg-gray-50 border-none rounded-lg px-2 py-1 text-gray-500 font-medium cursor-pointer"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                    >
                        <option value="30">Last 30 Days</option>
                        <option value="7">Last 7 Days</option>
                    </select>
                </div>
                
                {/* Simulated Graph */}
                <div className="h-48 w-full relative flex items-end justify-between px-2 gap-2 mb-6">
                    {currentData.map((h, i) => (
                        <motion.div 
                            key={`${timeRange}-${i}`}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            className="w-full bg-gradient-to-t from-vk-green-100 to-vk-green-400 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity relative group"
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {formatPrice(h * 12)}
                            </div>
                        </motion.div>
                    ))}
                    {/* SVG Curve Overlay (Decorative) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                         <path d="M0 150 C 50 100, 100 120, 150 80 S 250 100, 300 60 S 400 80, 500 20" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" className="opacity-20" />
                    </svg>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Revenue</p>
                        <p className="text-2xl font-bold text-vk-green-800">{formatPrice(12500)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Orders</p>
                        <p className="text-2xl font-bold text-vk-green-800">150</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg Value</p>
                        <p className="text-2xl font-bold text-vk-green-800">{formatPrice(83.33)}</p>
                    </div>
                </div>
            </div>

            {/* TOP PRODUCTS */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-vk-green-50">
                <h3 className="font-bold text-lg text-gray-800 mb-6">Top Performing</h3>
                <div className="space-y-6">
                    {[
                        { name: "Wireless Earbuds", sales: 50, views: 1200, color: "bg-blue-100" },
                        { name: "Smart Watch", sales: 30, views: 900, color: "bg-purple-100" },
                        { name: "Bluetooth Speaker", sales: 20, views: 600, color: "bg-orange-100" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                                <Package className="w-6 h-6 text-gray-700 opacity-50" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-800 truncate">{item.name}</h4>
                                <p className="text-xs text-gray-500">Sales: {item.sales} • Views: {item.views}</p>
                            </div>
                            {/* Tiny Bar Chart */}
                            <div className="flex items-end gap-1 h-8 w-16">
                                <div className="w-2 bg-vk-green-300 rounded-t-sm h-full" />
                                <div className="w-2 bg-vk-green-300 rounded-t-sm h-3/4" />
                                <div className="w-2 bg-vk-green-300 rounded-t-sm h-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

                {/* BOTTOM SECTION: RECENT ACTIVITY */}

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-vk-green-50">

                     <h3 className="font-bold text-lg text-gray-800 mb-6">Recent Activity</h3>

                     <div className="space-y-4">

                         {[{

                             icon: Bell,

                             type: "order",

                             text: "New Order #12345 from",

                             suffix: "",

                             val: 0,

                             time: "2 mins ago",

                             color: "text-blue-500 bg-blue-50"

                         },

                         {

                             icon: Package,

                             type: "alert",

                             text: "Product 'Gaming Mouse' is low on stock",

                             suffix: "",

                             val: 0,

                             time: "1 hour ago",

                             color: "text-orange-500 bg-orange-50"

                         },

                         {

                             icon: DollarSign,

                             type: "payment",

                             text: "Payment of",

                             suffix: "processed",

                             val: 500,

                             time: "5 hours ago",

                             color: "text-green-500 bg-green-50"

                         }].map((act, i) => (

                             <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">

                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${act.color}`}>

                                     <act.icon className="w-5 h-5" />

                                 </div>

                                 <div className="flex-1">

                                     <p className="text-sm font-medium text-gray-800">

                                        {act.type === 'order' && `${act.text} ${getRandomName(i)}`}

                                        {act.type === 'alert' && act.text}

                                        {act.type === 'payment' && `${act.text} ${formatPrice(act.val)} ${act.suffix}`}

                                     </p>

                                     <p className="text-xs text-gray-400">{act.time}</p>

                                 </div>

                             </div>

                         ))}

                     </div>

                </div>

      </main>

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl"
              >
                  <h2 className="text-2xl font-bold text-vk-green-800 mb-6">Add New Product</h2>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                      <input 
                        required 
                        placeholder="Product Title" 
                        value={newProduct.title}
                        onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                        className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:border-vk-green-500 outline-none"
                      />
                      <div className="grid grid-cols-2 gap-4">
                          <input 
                            required 
                            type="number"
                            placeholder="Price ($)" 
                            value={newProduct.price}
                            onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                            className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:border-vk-green-500 outline-none"
                          />
                          <select 
                            className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:border-vk-green-500 outline-none"
                            value={newProduct.category}
                            onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                          >
                              <optgroup label="Technology">
                                <option value="smartphones">Smartphones</option>
                                <option value="laptops">Laptops</option>
                                <option value="tablets">Tablets</option>
                                <option value="mobile-accessories">Mobile Accessories</option>
                              </optgroup>
                              <optgroup label="Fashion">
                                <option value="mens-shirts">Men's Shirts</option>
                                <option value="mens-shoes">Men's Shoes</option>
                                <option value="mens-watches">Men's Watches</option>
                                <option value="womens-dresses">Women's Dresses</option>
                                <option value="womens-bags">Women's Bags</option>
                                <option value="womens-jewellery">Jewellery</option>
                                <option value="sunglasses">Sunglasses</option>
                              </optgroup>
                              <optgroup label="Home & Living">
                                <option value="home-decoration">Home Decoration</option>
                                <option value="furniture">Furniture</option>
                                <option value="kitchen-accessories">Kitchen</option>
                                <option value="groceries">Groceries</option>
                              </optgroup>
                              <optgroup label="Beauty">
                                <option value="beauty">Beauty</option>
                                <option value="skin-care">Skin Care</option>
                                <option value="fragrances">Fragrances</option>
                              </optgroup>
                              <optgroup label="Automotive">
                                <option value="vehicle">Vehicles</option>
                                <option value="motorcycle">Motorcycles</option>
                              </optgroup>
                              <optgroup label="Sports">
                                <option value="sports-accessories">Sports Accessories</option>
                              </optgroup>
                          </select>
                      </div>
                      <textarea 
                        required 
                        placeholder="Description" 
                        value={newProduct.description}
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                        className="w-full bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 focus:border-vk-green-500 outline-none h-32 resize-none"
                      />
                      
                      {/* Image Upload Zone */}
                      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-white hover:border-vk-green-400 transition-colors cursor-pointer group">
                          <input 
                             type="file" 
                             className="absolute inset-0 opacity-0 cursor-pointer"
                             accept="image/*"
                             onChange={(e) => {
                                 if (e.target.files?.[0]) {
                                     const file = e.target.files[0];
                                     const reader = new FileReader();
                                     reader.onloadend = () => {
                                         setNewProduct({...newProduct, image: reader.result as string});
                                     };
                                     reader.readAsDataURL(file);
                                 }
                             }}
                          />
                          {newProduct.image !== "https://dummyjson.com/image/200x200" ? (
                              <div className="text-center">
                                  <p className="text-sm font-bold text-vk-green-600 truncate max-w-[200px]">Image Selected</p>
                                  <p className="text-xs text-gray-400">Click to change</p>
                              </div>
                          ) : (
                              <>
                                  <CloudUpload className="w-8 h-8 text-gray-400 group-hover:text-vk-green-500 transition-colors mb-2" />
                                  <p className="text-sm font-medium text-gray-600">Drag & Drop or Click to Upload</p>
                              </>
                          )}
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                          <button 
                            type="button" 
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                          >
                              Cancel
                          </button>
                          <button 
                            type="submit"
                            className="flex-1 py-3 bg-vk-green-600 text-white font-bold rounded-xl hover:bg-vk-green-700 shadow-lg shadow-vk-green-200"
                          >
                              Publish Product
                          </button>
                      </div>
                  </form>
              </motion.div>
          </div>
      )}

    </div>
  );
}

export default function SellerDashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-vk-green-50">Loading...</div>}>
            <SellerDashboardContent />
        </Suspense>
    );
}
