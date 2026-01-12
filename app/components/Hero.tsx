import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Monitor, Shirt, Home, Sparkles, Apple, Armchair, Watch, Car, Plus, Check, Smartphone, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { useSettings } from "../context/SettingsContext";

// --- CATEGORY DATA (unchanged) ---
type SubCategory = { name: string; slug: string };
type CategoryConfig = { name: string; icon: any; key: string; subs: SubCategory[] };

const CATEGORIES: CategoryConfig[] = [
  { 
    name: "Electronics", 
    icon: Monitor, 
    key: "electronics", 
    subs: [
        { name: "Laptops", slug: "laptops" },
        { name: "Phones", slug: "smartphones" },
        { name: "Tablets", slug: "tablets" },
        { name: "Accessories", slug: "mobile-accessories" }
    ] 
  },
  { 
    name: "Fashion", 
    icon: Shirt, 
    key: "fashion", 
    subs: [
        { name: "Shirts", slug: "mens-shirts" },
        { name: "Shoes", slug: "mens-shoes" },
        { name: "Dresses", slug: "womens-dresses" },
        { name: "Tops", slug: "tops" },
        { name: "Bags", slug: "womens-bags" },
        { name: "Sunglasses", slug: "sunglasses" }
    ] 
  },
  { 
    name: "Home", 
    icon: Home, 
    key: "home", 
    subs: [
        { name: "Decor", slug: "home-decoration" },
        { name: "Furniture", slug: "furniture" },
        { name: "Lighting", slug: "lighting" },
        { name: "Kitchen", slug: "kitchen-accessories" }
    ] 
  },
  { 
    name: "Beauty", 
    icon: Sparkles, 
    key: "beauty", 
    subs: [
        { name: "Makeup", slug: "beauty" },
        { name: "Fragrances", slug: "fragrances" },
        { name: "Skincare", slug: "skin-care" }
    ] 
  },
  { 
    name: "Groceries", 
    icon: Apple, 
    key: "groceries", 
    subs: [
        { name: "Groceries", slug: "groceries" }
    ] 
  },
  { 
    name: "Accessories", 
    icon: Watch, 
    key: "accessories", 
    subs: [
        { name: "Men's Watches", slug: "mens-watches" },
        { name: "Women's Watches", slug: "womens-watches" },
        { name: "Jewellery", slug: "womens-jewellery" },
        { name: "Sports", slug: "sports-accessories" }
    ] 
  },
  { 
    name: "Vehicles", 
    icon: Car, 
    key: "vehicles", 
    subs: [
        { name: "Cars", slug: "vehicle" },
        { name: "Bikes", slug: "motorcycle" }
    ] 
  },
  {
    name: "Community",
    icon: ShoppingBag,
    key: "custom",
    subs: [
        { name: "New Arrivals", slug: "custom-new" }
    ]
  }
];

// --- CAROUSEL DATA ---
import Image from "next/image";

const SLIDES = [
    {
        id: 1,
        title: "hero_modular",
        highlight: "hero_livingSale",
        desc: "hero_upgradeHome",
        targetCategory: "home", 
        gradient: "from-vk-green-200 via-vk-green-100 to-white",
        textColor: "text-vk-green-800",
        highlightColor: "text-vk-green-500",
        buttonColor: "bg-vk-green-600",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Main Image (Chair) */}
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-48 h-48 md:w-56 md:h-56 z-10 md:-translate-x-16"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        className="w-full h-full relative"
                    >
                        <Image 
                            src="https://cdn.dummyjson.com/products/images/furniture/Knoll%20Saarinen%20Executive%20Conference%20Chair/thumbnail.png" 
                            alt="Modern Chair" 
                            fill 
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                    </motion.div>
                </motion.div>

                {/* Secondary Image (Sofa) - Desktop Only */}
                <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="hidden md:block absolute right-[-80px] bottom-[-10px] w-64 h-40 z-0"
                >
                     <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                        className="w-full h-full relative"
                     >
                        <Image 
                            src="https://cdn.dummyjson.com/products/images/furniture/Annibale%20Colombo%20Sofa/thumbnail.png" 
                            alt="Sofa" 
                            fill 
                            className="object-contain drop-shadow-lg opacity-90"
                        />
                     </motion.div>
                </motion.div>
            </div>
        )
    },
    {
        id: 2,
        title: "hero_nextGen",
        highlight: "hero_techFest",
        desc: "hero_iphone",
        targetCategory: "electronics", 
        gradient: "from-blue-100 via-indigo-50 to-white",
        textColor: "text-slate-800",
        highlightColor: "text-blue-600",
        buttonColor: "bg-blue-600",
        visual: (
            <div className="relative w-full h-full flex items-center justify-center">
                {/* Main Image (Phone) */}
                <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "backOut" }}
                    className="relative w-32 h-44 sm:w-40 sm:h-56 md:w-48 md:h-64 z-20 md:translate-x-16"
                >
                     <motion.div 
                        animate={{ rotate: [0, 5, 0] }} 
                        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                        className="w-full h-full relative"
                    >
                        <Image 
                            src="https://cdn.dummyjson.com/products/images/smartphones/iPhone%20X/thumbnail.png" 
                            alt="iPhone Style Phone" 
                            fill 
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                     </motion.div>
                </motion.div>

                {/* Secondary Image (Laptop) - Desktop Only */}
                <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="hidden md:block absolute left-[-100px] bottom-10 w-72 h-48 z-10"
                >
                    <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
                        className="w-full h-full relative"
                    >
                        <Image 
                            src="https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png" 
                            alt="Laptop" 
                            fill 
                            className="object-contain drop-shadow-xl"
                        />
                    </motion.div>
                </motion.div>
            </div>
        )
    },
    {
        id: 3,
        title: "hero_fresh",
        highlight: "hero_organic",
        desc: "hero_farmToTable",
        targetCategory: "groceries", 
        gradient: "from-orange-100 via-yellow-50 to-white",
        textColor: "text-orange-900",
        highlightColor: "text-orange-500",
        buttonColor: "bg-orange-500",
        visual: (
             <div className="relative w-full h-full flex items-center justify-center">
                 {/* Main Image (Juice) */}
                 <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative w-48 h-48 md:w-56 md:h-56 z-20"
                >
                     <motion.div 
                        animate={{ y: [0, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="w-full h-full relative"
                    >
                        <Image 
                            src="https://cdn.dummyjson.com/products/images/groceries/Juice/thumbnail.png" 
                            alt="Fresh Juice" 
                            fill 
                            className="object-contain drop-shadow-2xl"
                            priority
                        />
                     </motion.div>
                </motion.div>

                {/* Secondary Image (Apple) - Desktop Only */}
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="hidden md:block absolute right-[-10px] top-10 w-40 h-40 z-10"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.2 }}
                        className="w-full h-full relative"
                    >
                        <Image 
                            src="https://cdn.dummyjson.com/products/images/groceries/Apple/thumbnail.png" 
                            alt="Apple" 
                            fill 
                            className="object-contain drop-shadow-lg"
                        />
                    </motion.div>
                </motion.div>
            </div>
        )
    }
];

const SLIDE_DURATION = 5;

interface HeroProps {
  onCategorySelect: (id: string | null) => void;
  onSubCategorySelect: (slug: string) => void;
  activeCategoryId: string | null;
  activeSubSlug: string | null;
}

export default function Hero({ onCategorySelect, onSubCategorySelect, activeCategoryId, activeSubSlug }: HeroProps) {
  // Removed local selectedMain state to rely on props
  // const [selectedMain, setSelectedMain] = useState<string | null>(null); -> GONE
  // const [activeSubs, setActiveSubs] = useState<string[]>([]); -> We only support single active sub for now based on page.tsx logic
  
  const { t } = useSettings();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

  const handleMainClick = (key: string) => {
      // Toggle Logic
      if (activeCategoryId === key) {
          onCategorySelect(null);
      } else {
          onCategorySelect(key);
      }
  };

  const handleSubClick = (slug: string) => {
      onSubCategorySelect(slug);
  };

  // Find config based on PROP
  const activeCategoryConfig = CATEGORIES.find(c => c.key === activeCategoryId);
  const activeSlideData = SLIDES[currentSlide];

  // Translation Maps
  const catKeys: Record<string, string> = {
      "Electronics": "cat_electronics",
      "Fashion": "cat_fashion",
      "Home": "cat_home",
      "Beauty": "cat_beauty",
      "Groceries": "cat_groceries",
      "Accessories": "cat_accessories",
      "Vehicles": "cat_vehicles",
      "Community": "cat_community"
  };

  // Helper for subcat translation attempts
  const getSubLabel = (sub: SubCategory) => {
      // Try to find a direct mapping if possible, otherwise use name
      // Example: 'mens-shirts' -> 'sub_shirts' if we map logic
      // For now, simpler approach:
      const attemptKey = `sub_${sub.slug.split('-').pop()}`; // 'mens-shirts' -> 'shirts' -> 'sub_shirts'
      const val = t(attemptKey);
      return val !== attemptKey ? val : sub.name; // If translation missing, use default name
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 pb-6">
      
      {/* --- CAROUSEL BANNER --- */}
      {/* Changed aspect ratio for mobile: aspect-[4/5] to give more vertical space */}
      <div 
        className="relative w-full aspect-[4/5] sm:aspect-[2.5/1] md:aspect-[3/1] lg:aspect-[3.5/1] rounded-2xl overflow-hidden shadow-xl shadow-vk-green-100/50"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        
        <AnimatePresence mode="wait">
            <motion.div 
                key={activeSlideData.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className={clsx("absolute inset-0 bg-gradient-to-br sm:bg-gradient-to-r", activeSlideData.gradient, "opacity-90")}
            >
                 <div className="absolute top-[-50%] left-[-10%] w-[300px] h-[300px] bg-white/40 rounded-full blur-3xl mix-blend-overlay" />
                 
                 {/* Content Container - Stacked on Mobile, Row on Desktop */}
                 <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between px-6 py-4 md:px-12 md:py-8 lg:px-16">
                    
                    {/* Visuals - Top on Mobile */}
                    <div className="flex-1 w-full h-full flex items-center justify-center relative scale-75 md:scale-75 md:origin-left md:mb-0">
                        {activeSlideData.visual}
                    </div>

                    {/* Text - Bottom on Mobile */}
                    <div className="flex-1 flex flex-col justify-end md:justify-center items-center md:items-end w-full relative z-20">
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/80 backdrop-blur-xl p-5 md:p-6 rounded-2xl shadow-lg border border-white w-full max-w-sm text-center md:text-left"
                        >
                            <h2 className={clsx("text-3xl md:text-3xl font-bold leading-tight mb-2", activeSlideData.textColor)}>
                                {t(activeSlideData.title)} <br className="hidden md:block"/>
                                <span className={activeSlideData.highlightColor}>{t(activeSlideData.highlight)}</span>
                            </h2>
                            <p className="text-sm text-gray-500 mb-4 font-medium">{t(activeSlideData.desc)}</p>
                            
                            <button 
                                onClick={() => handleMainClick(activeSlideData.targetCategory)}
                                className={clsx("flex items-center justify-center md:justify-start gap-2 text-white px-5 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 shadow-md active:scale-95 w-full md:w-auto", activeSlideData.buttonColor)}
                            >
                                {t('shopNow')} <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    </div>
                 </div>
            </motion.div>
        </AnimatePresence>

        {/* --- PAGINATION INDICATORS --- */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-30">
            {SLIDES.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                    <div 
                        key={slide.id} 
                        onClick={() => goToSlide(index)}
                        className={clsx(
                            "rounded-full cursor-pointer transition-all duration-300 relative overflow-hidden bg-black/10 backdrop-blur-sm",
                            isActive ? "w-8 h-2.5" : "w-2.5 h-2.5 hover:bg-black/20"
                        )}
                    >
                        {isActive && (
                            <motion.div 
                                className="absolute inset-0 bg-vk-green-600 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: SLIDE_DURATION, ease: "linear" }}
                                onAnimationComplete={() => {
                                    if (isActive) nextSlide();
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </div>

      </div>

      {/* --- CATEGORIES ROW --- */}
      <motion.div 
        className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center"
      >
        {CATEGORIES.map((cat, index) => (
            <button 
                key={index}
                onClick={() => handleMainClick(cat.key)}
                className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-full shadow-sm border transition-all min-w-max group",
                    activeCategoryId === cat.key 
                        ? "bg-vk-green-600 border-vk-green-600 text-white shadow-md shadow-vk-green-200" 
                        : "bg-white border-vk-green-50 hover:border-vk-green-200 hover:shadow-md text-vk-green-800"
                )}
            >
                <cat.icon className={clsx("w-4 h-4 transition-colors", activeCategoryId === cat.key ? "text-white" : "text-vk-green-600 group-hover:text-vk-green-800")} />
                <span className="text-sm font-medium">{t(catKeys[cat.name] || cat.name)}</span>
            </button>
        ))}
      </motion.div>

      <AnimatePresence>
        {activeCategoryId && activeCategoryConfig && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
            >
                <div className="pt-4 flex flex-wrap gap-2 justify-center">
                    {activeCategoryConfig.subs.map((sub, idx) => {
                        const isSelected = activeSubSlug === sub.slug;
                        return (
                            <motion.button
                                key={sub.slug}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleSubClick(sub.slug)}
                                className={clsx(
                                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5",
                                    isSelected
                                        ? "bg-vk-green-100 text-vk-green-800 border-vk-green-200"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-vk-green-300 hover:text-vk-green-700"
                                )}
                            >
                                {isSelected ? (
                                    <Check className="w-3 h-3 text-vk-green-600" />
                                ) : (
                                    <Plus className="w-3 h-3 text-gray-400 group-hover:text-vk-green-500" />
                                )}
                                {getSubLabel(sub)}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
