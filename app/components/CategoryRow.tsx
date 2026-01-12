"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useCart } from "../context/CartContext";
import { supabase } from "../../lib/supabaseClient";

type Product = {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
};

interface CategoryRowProps {
  title: string;
  categorySlug: string | string[]; // Can be single string or array
  onTitleClick?: () => void;
  isSubCategory?: boolean; 
}

export default function CategoryRow({ title, categorySlug, onTitleClick, isSubCategory = false }: CategoryRowProps) {
  const { formatPrice, t } = useSettings();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAdd = (e: React.MouseEvent, product: Product) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product);
  };

  useEffect(() => {
    async function fetchProducts() {
        try {
            let allProducts: Product[] = [];
            const slugs = Array.isArray(categorySlug) ? categorySlug : [categorySlug];

            // Check for Custom Category
            if (slugs.includes('custom-new')) {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);
                
                if (data) {
                    // Map Supabase products to Product type
                    const customProducts = data.map((p: any) => ({
                        id: p.id, // Ensure ID handling matches (might need string/number adjustment if Product uses number)
                        title: p.title,
                        price: p.price,
                        thumbnail: p.thumbnail || "https://dummyjson.com/image/400x400?text=No+Image",
                        category: p.category
                    }));
                    allProducts = [...customProducts];
                }
            } else {
                // Fetch from DummyJSON
                const requests = slugs.map(slug => 
                    fetch(`https://dummyjson.com/products/category/${slug}?limit=10`).then(res => res.json())
                );
                
                const results = await Promise.all(requests);
                
                results.forEach(data => {
                    if (data.products) allProducts = [...allProducts, ...data.products];
                });

                // Shuffle slightly to mix subcategories
                allProducts = allProducts.sort(() => Math.random() - 0.5);
            }

            setProducts(allProducts);
            
            // Reset scroll to start
            if (scrollRef.current) {
                scrollRef.current.scrollLeft = 0;
            }
        } catch (e) {
            console.error(e);
        }
    }
    fetchProducts();
  }, [categorySlug]);

  const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
          const { current } = scrollRef;
          const scrollAmount = direction === 'left' ? -current.offsetWidth + 100 : current.offsetWidth - 100;
          current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
  };

  if (products.length === 0) return null;

  return (
    <div className="py-8 border-b border-gray-50 last:border-0">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
          <button 
            onClick={onTitleClick}
            className={`group flex items-center gap-2 hover:text-vk-green-600 transition-colors ${isSubCategory ? 'text-xl font-bold text-gray-800' : 'mx-auto text-3xl font-bold text-vk-green-900'}`}
          >
              {title}
              {!isSubCategory && <ChevronRight className="w-6 h-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />}
          </button>
          
          {/* Scroll Buttons (Desktop) */}
          <div className="hidden sm:flex gap-2">
              <button onClick={() => scroll('left')} className="p-2 rounded-full border border-gray-200 hover:bg-vk-green-50 hover:border-vk-green-200 text-gray-500 hover:text-vk-green-700 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scroll('right')} className="p-2 rounded-full border border-gray-200 hover:bg-vk-green-50 hover:border-vk-green-200 text-gray-500 hover:text-vk-green-700 transition-colors">
                  <ArrowRight className="w-5 h-5" />
              </button>
          </div>
      </div>

      {/* Horizontal List */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 sm:px-0 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
      >
          {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} className="snap-start shrink-0">
                  <div className="w-[180px] sm:w-[220px] bg-white rounded-2xl border border-gray-100 hover:border-vk-green-200 hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col overflow-hidden group">
                      <div className="aspect-[1.1] relative bg-gray-50 p-4">
                          <Image src={product.thumbnail} alt={product.title} fill className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                          <h4 className="font-bold text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-vk-green-700 transition-colors">{product.title}</h4>
                          <p className="text-xs text-gray-500 capitalize mb-3">{product.category.replace('-', ' ')}</p>
                          <div className="mt-auto flex items-center justify-between gap-2">
                              <div className="font-bold text-vk-green-700 text-base shrink-0">
                                  {formatPrice(product.price)}
                              </div>
                              <button 
                                onClick={(e) => handleAdd(e, product)}
                                className="bg-vk-green-100 hover:bg-vk-green-600 hover:text-white text-vk-green-700 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all shrink-0"
                              >
                                  {t('addToCart')}
                              </button>
                          </div>
                      </div>
                  </div>
              </Link>
          ))}
      </div>

    </div>
  );
}
