"use client";

import React, { useEffect, useState, use, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Star, ShieldCheck, RefreshCw, ShoppingCart, Zap } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useSettings } from "@/app/context/SettingsContext";
import { useCart } from "@/app/context/CartContext";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Review = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

type Product = {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  reviews: Review[];
  warrantyInformation: string;
  returnPolicy: string;
};

function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { formatPrice, t, country } = useSettings();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Localized Names Logic
  const getRandomName = (code: string, seed: number) => {
      const namesIN = ["Rahul Sharma", "Priya Singh", "Amit Patel", "Sneha Gupta", "Vikram Malhotra", "Anjali Verma"];
      const namesJP = ["Kenji Tanaka", "Sakura Sato", "Hiroshi Suzuki", "Yuki Takahashi", "Takumi Watanabe", "Hana Ito"];
      const namesUS = ["John Doe", "Emily Smith", "Michael Brown", "Sarah Johnson", "David Wilson", "Jessica Davis"];
      
      let list = namesUS;
      if (code === 'IN') list = namesIN;
      if (code === 'JP') list = namesJP;
      if (code === 'UK') list = namesUS;

      return list[seed % list.length];
  };

  const handleAddToCart = () => {
      if (!product) return;
      setIsAdding(true);
      addToCart(product);
      setTimeout(() => setIsAdding(false), 1000);
  };

  const handleBuyNow = () => {
      if (!product) return;
      addToCart(product);
      router.push('/cart');
  };

  // Zoom State
  const [showZoom, setShowZoom] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        
        // 1. Check Supabase first (for custom products)
        const { data: customData } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (customData) {
            setProduct({
                id: customData.id,
                title: customData.title,
                description: customData.description,
                price: customData.price,
                rating: 5, 
                stock: 10,
                brand: "Community",
                category: customData.category,
                thumbnail: customData.thumbnail,
                images: [customData.thumbnail],
                reviews: [],
                warrantyInformation: "Provided by Community Seller",
                returnPolicy: "Standard 15 days"
            });
            setActiveImage(customData.thumbnail);
            setLoading(false);
            return;
        }

        // 2. Fallback to DummyJSON
        const res = await fetch(`https://dummyjson.com/products/${id}`);
        const data = await res.json();
        if (data.id) {
            setProduct(data);
            setActiveImage(data.images[0]);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgContainerRef.current) return;
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  if (loading) return <LoadingScreen />;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-vk-green-800">Product not found.</div>;

  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="pt-24 max-w-[1200px] mx-auto px-4 sm:px-6 relative">
        
        {/* Breadcrumb */}
        <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-vk-green-700 hover:text-vk-green-900 font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Products
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative">
            
            {/* LEFT: Gallery Section */}
            <div className="space-y-4 relative z-20">
                {/* Main Image Card with Zoom Trigger */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[32px] aspect-square relative flex items-center justify-center p-8 shadow-sm border border-vk-green-50 overflow-hidden cursor-crosshair"
                    onMouseEnter={() => setShowZoom(true)}
                    onMouseLeave={() => setShowZoom(false)}
                    onMouseMove={handleMouseMove}
                    ref={imgContainerRef}
                >
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={activeImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-full h-full"
                        >
                            <Image 
                                src={activeImage} 
                                alt={product.title} 
                                fill 
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                     </AnimatePresence>

                     {/* Zoom Lens Overlay (Optional visual indicator) */}
                     {showZoom && (
                        <div 
                            className="absolute pointer-events-none w-32 h-32 border border-vk-green-400 bg-vk-green-400/10 rounded-full mix-blend-multiply hidden md:block"
                            style={{ 
                                left: `${mousePosition.x}%`, 
                                top: `${mousePosition.y}%`,
                                transform: 'translate(-50%, -50%)'
                            }} 
                        />
                     )}
                </motion.div>

                {/* Thumbnails */}
                <div className="flex gap-4 overflow-x-auto p-4 -mx-4 scrollbar-hide">
                    {product.images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`relative w-20 h-20 flex-shrink-0 bg-white rounded-xl border-2 transition-all p-2 overflow-hidden ${activeImage === img ? 'border-vk-green-500 shadow-md scale-105' : 'border-transparent hover:border-vk-green-200'}`}
                        >
                            <Image src={img} alt="thumbnail" fill className="object-contain" />
                        </button>
                    ))}
                </div>
            </div>

            {/* ZOOM POPUP CONTAINER */}
            {showZoom && (
                <div className="hidden lg:block absolute left-[50%] top-0 w-[50%] h-[500px] z-50 ml-4 rounded-[32px] overflow-hidden shadow-2xl border-2 border-vk-green-100 bg-white">
                    <div 
                        className="w-full h-full"
                        style={{
                            backgroundImage: `url(${activeImage})`,
                            backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                            backgroundSize: '200%', 
                            backgroundRepeat: 'no-repeat'
                        }}
                    />
                </div>
            )}

            {/* RIGHT: Product Details Card */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[32px] p-8 shadow-sm border border-vk-green-50 h-fit"
            >
                <h1 className="text-3xl font-bold text-vk-green-900 leading-tight mb-2">{product.title}</h1>
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center text-yellow-400">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="ml-1 font-bold text-vk-green-800">{product.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-vk-green-600 font-medium">{product.stock} in stock</span>
                </div>

                <div className="text-4xl font-bold text-vk-green-600 mb-6">
                    {formatPrice(product.price)}
                </div>

                <div className="mb-6">
                    <h3 className="font-bold text-vk-green-800 mb-2">Key Features</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-vk-green-500 mt-0.5 shrink-0" />
                            <span>Premium build quality with {product.brand || 'Category Leader'} standards.</span>
                        </li>
                         <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-vk-green-500 mt-0.5 shrink-0" />
                            <span>Highly rated for {product.category} performance.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-vk-green-500 mt-0.5 shrink-0" />
                            <span>Genuine authentic product.</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-3 mb-8">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-vk-green-50 flex items-center justify-center text-vk-green-600">
                             <ShieldCheck className="w-5 h-5" />
                         </div>
                         <div>
                             <p className="font-bold text-vk-green-800 text-sm">Warranty</p>
                             <p className="text-xs text-gray-500">{product.warrantyInformation || "1 Year Official Warranty"}</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-vk-green-50 flex items-center justify-center text-vk-green-600">
                             <RefreshCw className="w-5 h-5" />
                         </div>
                         <div>
                             <p className="font-bold text-vk-green-800 text-sm">Return Policy</p>
                             <p className="text-xs text-gray-500">{product.returnPolicy || "15-Day Return Period"}</p>
                         </div>
                     </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="flex items-center justify-center gap-2 bg-vk-green-600 text-white font-bold py-4 rounded-full hover:bg-vk-green-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-vk-green-200 disabled:bg-vk-green-400"
                    >
                        {isAdding ? (
                            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Added!
                            </motion.div>
                        ) : (
                            <>
                                <ShoppingCart className="w-5 h-5" />
                                {t('addToCart')}
                            </>
                        )}
                    </button>
                    <button 
                        onClick={handleBuyNow}
                        className="flex items-center justify-center gap-2 bg-white text-vk-green-700 border-2 border-vk-green-600 font-bold py-4 rounded-full hover:bg-vk-green-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Zap className="w-5 h-5" />
                        Buy Now
                    </button>
                </div>

            </motion.div>
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-vk-green-50">
                    <h2 className="text-2xl font-bold text-vk-green-900 mb-4">About Product</h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        {product.description}
                    </p>
                </div>
            </div>

            <div className="lg:col-span-1">
                 <div className="bg-white rounded-[32px] p-8 shadow-sm border border-vk-green-50 h-full">
                    <h2 className="text-2xl font-bold text-vk-green-900 mb-6">Customer Reviews</h2>
                    {product.reviews && product.reviews.length > 0 ? (
                        <div className="space-y-6">
                            {product.reviews.map((review, i) => (
                                <div key={i} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex text-yellow-400">
                                            {Array.from({length: 5}).map((_, starI) => (
                                                <Star key={starI} className={`w-3 h-3 ${starI < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">{new Date(review.date).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="font-bold text-vk-green-800 text-sm mb-1">
                                        {getRandomName(country.code, i)}
                                    </h4>
                                    <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 italic">No reviews yet.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <ProductContent params={params} />
        </Suspense>
    );
}

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-vk-green-200" />
                <div className="h-4 w-32 bg-vk-green-200 rounded-full" />
            </div>
        </div>
    )
}
