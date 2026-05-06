"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Check } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";

type Product = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
};

const PER_SLUG_LIMIT = 5;

interface ProductGridProps {
  activeSlugs: string[] | null;
  searchQuery?: string | null;
}

export default function ProductGrid({ activeSlugs, searchQuery }: ProductGridProps) {
  const { formatPrice, t, localProducts } = useSettings();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  
  const observerTarget = useRef(null);

  useEffect(() => {
    setProducts([]);
    setSkip(0);
    setHasMore(true);
    setLoading(true);
  }, [activeSlugs, searchQuery]);

  const fetchProducts = useCallback(async (currentSkip: number, isInitial: boolean = false) => {
    try {
      if (!isInitial) setLoadingMore(true);
      
      let newProducts: Product[] = [];

      // --- SEARCH MODE ---
      if (searchQuery) {
        const res = await fetch(`https://dummyjson.com/products/search?q=${searchQuery}&limit=20&skip=${currentSkip}`);
        const data = await res.json();
        
        if (data.products.length === 0) setHasMore(false);
        else {
             setProducts(prev => isInitial ? data.products : [...prev, ...data.products]);
             setSkip(prev => prev + 20); 
        }
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // --- STANDARD MODE (No Search) ---

      // 1. Generic Fetch (No Filter or Empty Filter)
      if (!activeSlugs || activeSlugs.length === 0) {
        const res = await fetch(`https://dummyjson.com/products?limit=20&skip=${currentSkip}`);
        const data = await res.json();
        
        let initialList = data.products;
        
        // Add Local Products at the TOP of the initial load
        if (isInitial) {
            initialList = [...localProducts, ...data.products];
        }

        if (initialList.length === 0 && localProducts.length === 0) setHasMore(false);
        else {
             setProducts(prev => isInitial ? initialList : [...prev, ...data.products]);
             setSkip(prev => prev + 20); 
        }
        setLoading(false);
        setLoadingMore(false);
        return;
      }

      // 3. Multi-Category Fetch (When specific slugs are provided)
      const slugsToFetch = activeSlugs.filter(s => s !== 'custom-new');
      
      // Handle Custom Products
      if (activeSlugs.includes('custom-new')) {
         newProducts = [...newProducts, ...localProducts];
      }

      if (slugsToFetch.length > 0) {
          const requests = slugsToFetch.map(slug => 
            fetch(`https://dummyjson.com/products/category/${slug}?limit=${PER_SLUG_LIMIT}&skip=${currentSkip}`)
              .then(res => res.json())
              .then(data => data.products)
          );

          const results = await Promise.all(requests);
          
          results.forEach(list => {
            newProducts = [...newProducts, ...list];
          });
      }

      newProducts = newProducts.sort(() => Math.random() - 0.5);

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => isInitial ? newProducts : [...prev, ...newProducts]);
        // Only increment skip if we actually fetched from API, but for simplicity here we assume standard pagination 
        // Note: Infinite scroll with mixed sources is tricky. For now, we just rely on standard increments or stop if local only.
        if (slugsToFetch.length === 0) setHasMore(false); 
        else setSkip(prev => prev + PER_SLUG_LIMIT); 
      }

    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeSlugs, searchQuery]);

  useEffect(() => {
    setLoading(true);
    fetchProducts(0, true);
  }, [fetchProducts, activeSlugs, searchQuery]); 

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchProducts(skip);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadingMore, skip, fetchProducts]);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 pb-20">
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <ProductCard 
            key={`${product.id}-${index}-${product.category}`} 
            product={product} 
            index={index} 
            formatPrice={formatPrice} 
            t={t} 
            addToCart={addToCart}
          />
        ))}
        
        {loading && Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
      </div>

      {!loading && products.length === 0 && (
         <div className="text-center py-20 text-vk-green-600/50">
             <p>{t('noProducts')}</p>
         </div>
      )}

      <div ref={observerTarget} className="w-full h-20 flex items-center justify-center mt-8">
         {loadingMore && <Loader2 className="w-8 h-8 text-vk-green-600 animate-spin" />}
         {!hasMore && !loading && products.length > 0 && <p className="text-vk-green-600/50 text-sm font-medium">{t('endOfList')}</p>}
      </div>

    </div>
  );
}

function SkeletonCard() {
    return (
        <div className="bg-white p-3 rounded-2xl h-64 animate-pulse border border-vk-green-50">
            <div className="bg-vk-green-50/50 w-full aspect-square rounded-xl mb-3"></div>
            <div className="h-4 bg-vk-green-50/50 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-vk-green-50/50 rounded w-1/2"></div>
        </div>
    )
}

function ProductCard({ product, index, formatPrice, t, addToCart }: { product: Product, index: number, formatPrice: (p: number) => string, t: (k: string) => string, addToCart: (p: any) => void }) {

  const [isAdding, setIsAdding] = useState(false);



  const handleAdd = (e: React.MouseEvent) => {

    e.preventDefault();

    e.stopPropagation();

    setIsAdding(true);

    addToCart(product);

    setTimeout(() => setIsAdding(false), 1000);

  };



  return (

    <motion.div

      initial={{ opacity: 0, scale: 0.9 }}

      whileInView={{ opacity: 1, scale: 1 }}

      viewport={{ once: true, margin: "-50px" }}

      transition={{ duration: 0.4 }}

      whileHover={{ y: -5 }}

      className="bg-white p-3 rounded-2xl border border-vk-green-50 shadow-sm hover:shadow-xl hover:shadow-vk-green-100/50 transition-all group cursor-pointer flex flex-col h-full relative"

    >

      <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />



      <div className="w-full aspect-square rounded-xl mb-3 relative overflow-hidden bg-white flex items-center justify-center">

         <Image 

            src={product.thumbnail} 

            alt={product.title}

            fill

            className="object-contain hover:scale-110 transition-transform duration-500"

            sizes="(max-width: 768px) 50vw, 25vw"

         />

      </div>



      <div className="flex flex-col flex-grow justify-between">

          <div className="space-y-1">

            <h3 className="font-bold text-vk-green-900 text-sm leading-tight line-clamp-2" title={product.title}>{product.title}</h3>

            <p className="text-xs text-vk-green-600/70 font-medium capitalize truncate">{product.category}</p>

          </div>

          

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 pt-2 gap-2 sm:gap-0 border-t border-dashed border-vk-green-100 relative z-20">

              <span className="font-bold text-vk-green-800 text-base">{formatPrice(product.price)}</span>

              <button 

                onClick={handleAdd}

                disabled={isAdding}

                className={`flex items-center justify-center gap-1 w-full sm:w-auto px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all ${isAdding ? 'bg-vk-green-600 text-white' : 'bg-vk-green-100 hover:bg-vk-green-200 text-vk-green-700'}`}

              >

                  {isAdding ? (

                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-1">

                       <Check className="w-3 h-3" />

                       Added

                    </motion.div>

                  ) : t('addToCart')}

              </button>

          </div>

      </div>

    </motion.div>

  );

}
