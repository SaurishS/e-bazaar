"use client";

import React, { useState, Suspense } from "react";

import { useSearchParams } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";

import Hero from "./components/Hero";

import ProductGrid from "./components/ProductGrid";

import Footer from "./components/Footer";

import CategoryRow from "./components/CategoryRow";



// --- Configuration ---

// (Configuration constant remains the same, I will assume it's preserved or I should re-declare it if I replace the whole file. 

// Since replace tool works on strings, I will try to target the HomeContent function body if possible, or just replace the component logic. 

// Replacing the whole file is safer to ensure imports are correct.)



type SubCategory = { title: string; slug: string };

type MainCategory = { id: string; title: string; subcategories: SubCategory[] };



const CATEGORIES: MainCategory[] = [



    { 



        id: 'electronics', 



        title: 'Electronics', 



        subcategories: [



            { title: 'Laptops', slug: 'laptops' },



            { title: 'Tablets', slug: 'tablets' },



            { title: 'Smartphones', slug: 'smartphones' },



            { title: 'Mobile Accessories', slug: 'mobile-accessories' }



        ]



    },



    {



        id: 'fashion',



        title: 'Fashion',



        subcategories: [



            { title: 'Men\'s Shirts', slug: 'mens-shirts' },



            { title: 'Men\'s Shoes', slug: 'mens-shoes' },



            { title: 'Women\'s Dresses', slug: 'womens-dresses' },



            { title: 'Women\'s Bags', slug: 'womens-bags' },



            { title: 'Sunglasses', slug: 'sunglasses' },



            { title: 'Tops', slug: 'tops' }



        ]



    },



    {



        id: 'home',



        title: 'Home',



        subcategories: [



            { title: 'Decor', slug: 'home-decoration' },



            { title: 'Furniture', slug: 'furniture' },



            { title: 'Lighting', slug: 'lighting' },



            { title: 'Kitchen', slug: 'kitchen-accessories' }



        ]



    },



    {



        id: 'beauty',



        title: 'Beauty',



        subcategories: [



            { title: 'Makeup', slug: 'beauty' },



            { title: 'Skin Care', slug: 'skin-care' },



            { title: 'Fragrances', slug: 'fragrances' }



        ]



    },



    {



        id: 'groceries',



        title: 'Groceries',



        subcategories: [



            { title: 'Groceries', slug: 'groceries' }



        ]



    },



    {



        id: 'accessories',



        title: 'Accessories',



        subcategories: [



            { title: 'Men\'s Watches', slug: 'mens-watches' },



            { title: 'Women\'s Watches', slug: 'womens-watches' },



            { title: 'Jewellery', slug: 'womens-jewellery' },



            { title: 'Sports Accessories', slug: 'sports-accessories' }



        ]



    },



        {



            id: 'vehicles',



            title: 'Vehicles',



            subcategories: [



                { title: 'Cars', slug: 'vehicle' },



                { title: 'Motorcycles', slug: 'motorcycle' }



            ]



        },



        {



            id: 'custom',



            title: 'Community Products',



            subcategories: [



                { title: 'New Arrivals', slug: 'custom-new' }



            ]



        }



    ];

    



function HomeContent() {

  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("q");



  // View State

  const [activeCategory, setActiveCategory] = useState<MainCategory | null>(null);

  const [activeSubSlug, setActiveSubSlug] = useState<string | null>(null);



  // Animation Variants

  const pageVariants = {

    initial: { opacity: 0, y: 20 },

    in: { opacity: 1, y: 0 },

    out: { opacity: 0, y: -20 }

  };



    const pageTransition = {



      type: "tween",



      ease: "anticipate",



      duration: 0.5



    } as const;



  // --- SEARCH VIEW ---

  if (searchQuery) {

      return (

        <div className="pt-24 min-h-screen">

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 pb-4">

                <h2 className="text-2xl font-bold text-vk-green-900">

                    Results for "<span className="text-vk-green-600">{searchQuery}</span>"

                </h2>

            </div>

            <ProductGrid activeSlugs={null} searchQuery={searchQuery} />

            <Footer />

        </div>

      );

  }



  return (

    <>

            <div className="pt-16 min-h-screen flex flex-col">

              {/* Hero stays mounted and stable */}

              <Hero 

                  onCategorySelect={(catId) => {

                      const cat = CATEGORIES.find(c => c.id === catId);

                      if (cat) {

                          setActiveCategory(cat);

                          setActiveSubSlug(null); // Reset sub when switching main

                      } else {

                          // Deselect if clicking same or invalid (optional logic, mainly for 'All')

                          setActiveCategory(null);

                          setActiveSubSlug(null);

                      }

                  }}

                  onSubCategorySelect={(slug) => {

                      // Find parent category first

                      const parent = CATEGORIES.find(c => c.subcategories.some(s => s.slug === slug));

                      if (parent) {

                          setActiveCategory(parent);

                          setActiveSubSlug(slug);

                      }

                  }}

                  activeCategoryId={activeCategory?.id || null}

                  activeSubSlug={activeSubSlug}

              />

      

        

        <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 py-8 flex-1">

            <AnimatePresence mode="wait">

                

                {/* VIEW 1: MAIN LIST (All Categories) */}

                {!activeCategory && !activeSubSlug && (

                    <motion.div 

                        key="main-list"

                        initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}

                        className="flex flex-col gap-12"

                    >

                        {CATEGORIES.map((cat) => (

                            <CategoryRow 

                                key={cat.id}

                                title={cat.title}

                                categorySlug={cat.subcategories.map(s => s.slug)}

                                onTitleClick={() => setActiveCategory(cat)}

                            />

                        ))}

                    </motion.div>

                )}



                {/* VIEW 2: CATEGORY DETAIL (Subcategory Rows) */}

                {activeCategory && !activeSubSlug && (

                    <motion.div 

                        key="category-detail"

                        initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}

                    >

                        <button 

                            onClick={() => setActiveCategory(null)} 

                            className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-vk-green-600 transition-colors"

                        >

                            <ArrowLeft className="w-4 h-4" /> Back to All Categories

                        </button>

                        

                        <h1 className="text-4xl font-bold text-vk-green-900 text-center mb-12">{activeCategory.title}</h1>

                        

                        <div className="flex flex-col gap-12">

                            {activeCategory.subcategories.map((sub) => (

                                <CategoryRow 

                                    key={sub.slug} 

                                    title={sub.title} 

                                    categorySlug={sub.slug} 

                                    onTitleClick={() => setActiveSubSlug(sub.slug)}

                                    isSubCategory={true}

                                />

                            ))}

                        </div>

                    </motion.div>

                )}



                {/* VIEW 3: SUBCATEGORY GRID (Infinite Scroll) */}

                {activeSubSlug && activeCategory && (

                    <motion.div 

                        key="subcategory-grid"

                        initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}

                    >

                        <div className="flex items-center gap-4 mb-8">

                            <button 

                                onClick={() => setActiveSubSlug(null)} 

                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"

                            >

                                <ArrowLeft className="w-6 h-6 text-gray-600" />

                            </button>

                            <div>

                                <span className="text-sm text-gray-500">{activeCategory.title} /</span>

                                <h1 className="text-3xl font-bold text-vk-green-900">

                                    {activeCategory.subcategories.find(s => s.slug === activeSubSlug)?.title}

                                </h1>

                            </div>

                        </div>

                        <ProductGrid activeSlugs={[activeSubSlug]} />

                    </motion.div>

                )}



            </AnimatePresence>

        </div>

        

        <Footer />

      </div>

    </>

  );

}



export default function Home() {

  return (

    <main className="min-h-screen bg-background relative selection:bg-vk-green-200 selection:text-vk-green-900 flex flex-col">

      <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>

         <Navbar />

         <HomeContent />

      </Suspense>

    </main>

  );

}
