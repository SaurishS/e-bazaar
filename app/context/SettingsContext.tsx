"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
type Language = { code: string; name: string };
type Country = {
  code: string;
  name: string;
  flag: string;
  currency: { code: string; symbol: string; rate: number };
  languages: Language[];
};

// Data
export const COUNTRIES: Country[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: { code: 'INR', symbol: '₹', rate: 84.5 },
    languages: [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'हिन्दी' }
    ]
  },
  {
    code: 'US',
    name: 'USA',
    flag: '🇺🇸',
    currency: { code: 'USD', symbol: '$', rate: 1 },
    languages: [
      { code: 'en', name: 'English' }
    ]
  },
  {
    code: 'UK',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: { code: 'GBP', symbol: '£', rate: 0.79 },
    languages: [
      { code: 'en', name: 'English' }
    ]
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currency: { code: 'JPY', symbol: '¥', rate: 148 },
    languages: [
      { code: 'en', name: 'English' },
      { code: 'ja', name: '日本語' }
    ]
  }
];

// Translations Dictionary
const TRANSLATIONS: Record<string, Record<string, string>> = {
  'en': {
    // General
    searchPlaceholder: 'Search for items...',
    sellerLogin: 'Seller',
    customerLogin: 'Customer Login',
    shopNow: 'Shop Now',
    addToCart: 'Add',
    noProducts: 'No products found.',
    endOfList: 'No more products.',
    loading: 'Loading...',
    back: 'Back',
    
    // Cart & Checkout
    cartTitle: 'Your Shopping Cart',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    checkout: 'Proceed to Checkout',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    tax: 'Estimated Tax',
    total: 'Total',
    items: 'items',
    securePayment: 'Secure Payment',
    shippingAddress: 'Shipping Address',
    billingAddress: 'Billing Address',
    paymentMethod: 'Payment Method',
    payNow: 'Pay Now',
    orderSummary: 'Order Summary',
    
    // Profile
    profileTitle: 'User Profile & Settings',
    tabProfile: 'Profile',
    tabOrders: 'Your Orders',
    tabAddresses: 'Addresses',
    tabSettings: 'Settings',
    logout: 'Logout',
    saveChanges: 'Save Changes',
    saved: 'Saved',
    changePhoto: 'Change Photo',
    
    // Hero Slides
    hero_modular: 'Modular',
    hero_livingSale: 'Living Sale',
    hero_upgradeHome: 'Upgrade Your Home',
    hero_nextGen: 'Next-Gen',
    hero_techFest: 'Tech Fest',
    hero_iphone: 'iPhone 17 Pro Max & More',
    hero_fresh: 'Fresh &',
    hero_organic: 'Organic',
    hero_farmToTable: 'Farm to Table',

    // Categories
    cat_electronics: 'Electronics',
    cat_fashion: 'Fashion',
    cat_home: 'Home',
    cat_beauty: 'Beauty',
    cat_groceries: 'Groceries',
    cat_accessories: 'Accessories',
    cat_vehicles: 'Vehicles',
    cat_community: 'Community',
    
    // Subcategories (Common)
    sub_laptops: 'Laptops',
    sub_phones: 'Phones',
    sub_tablets: 'Tablets',
    sub_shirts: 'Shirts',
    sub_shoes: 'Shoes',
    sub_dresses: 'Dresses',
    sub_decor: 'Decor',
    sub_furniture: 'Furniture',
    sub_makeup: 'Makeup',
    sub_skincare: 'Skincare',
    sub_watches: 'Watches',
    sub_cars: 'Cars',
    sub_bikes: 'Bikes'
  },
  'hi': {
    // General
    searchPlaceholder: 'सामान खोजें...',
    sellerLogin: 'विक्रेता',
    customerLogin: 'ग्राहक लॉगिन',
    shopNow: 'अभी खरीदें',
    addToCart: 'जोड़ें',
    noProducts: 'कोई उत्पाद नहीं मिला।',
    endOfList: 'और उत्पाद नहीं हैं।',
    loading: 'लोड हो रहा है...',
    back: 'वापस',

    // Cart & Checkout
    cartTitle: 'आपका शॉपिंग कार्ट',
    emptyCart: 'आपका कार्ट खाली है',
    continueShopping: 'खरीदारी जारी रखें',
    checkout: 'चेकआउट पर जाएं',
    subtotal: 'उपयोग',
    shipping: 'शिपिंग',
    tax: 'अनुमानित कर',
    total: 'कुल',
    items: 'सामान',
    securePayment: 'सुरक्षित भुगतान',
    shippingAddress: 'शिपिंग पता',
    billingAddress: 'बिलिंग पता',
    paymentMethod: 'भुगतान का तरीका',
    payNow: 'अभी भुगतान करें',
    orderSummary: 'ऑर्डर सारांश',

    // Profile
    profileTitle: 'उपयोगकर्ता प्रोफ़ाइल और सेटिंग्स',
    tabProfile: 'प्रोफ़ाइल',
    tabOrders: 'आपके ऑर्डर',
    tabAddresses: 'पते',
    tabSettings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    saveChanges: 'परिवर्तन सहेजें',
    saved: 'सहेजा गया',
    changePhoto: 'फोटो बदलें',

    // Hero Slides
    hero_modular: 'मॉड्यूलर',
    hero_livingSale: 'लिविंग सेल',
    hero_upgradeHome: 'घर को अपग्रेड करें',
    hero_nextGen: 'नेक्स्ट-जेन',
    hero_techFest: 'टेक फेस्ट',
    hero_iphone: 'iPhone 17 प्रो मैक्स और अधिक',
    hero_fresh: 'ताज़ा और',
    hero_organic: 'ऑर्गेनिक',
    hero_farmToTable: 'खेत से टेबल तक',

    // Categories
    cat_electronics: 'इलेक्ट्रॉनिक्स',
    cat_fashion: 'फैशन',
    cat_home: 'घर',
    cat_beauty: 'सौंदर्य',
    cat_groceries: 'किराना',
    cat_accessories: 'एक्सेसरीज',
    cat_vehicles: 'वाहन',
    cat_community: 'समुदाय',

    // Subcategories
    sub_laptops: 'लैपटॉप',
    sub_phones: 'फ़ोन',
    sub_tablets: ' टैबलेट',
    sub_shirts: 'शर्ट',
    sub_shoes: 'जूते',
    sub_dresses: 'कपड़े',
    sub_decor: 'सजावट',
    sub_furniture: 'फर्नीचर',
    sub_makeup: 'मेकअप',
    sub_skincare: 'त्वचा की देखभाल',
    sub_watches: 'घड़ियाँ',
    sub_cars: 'कारें',
    sub_bikes: 'बाइक'
  },
  'ja': {
    // General
    searchPlaceholder: '検索...',
    sellerLogin: '出品者',
    customerLogin: 'ログイン',
    shopNow: '今すぐ購入',
    addToCart: '追加',
    noProducts: '商品が見つかりません。',
    endOfList: 'これ以上商品はありません。',
    loading: '読み込み中...',
    back: '戻る',

    // Cart & Checkout
    cartTitle: 'ショッピングカート',
    emptyCart: 'カートは空です',
    continueShopping: '買い物を続ける',
    checkout: 'レジに進む',
    subtotal: '小計',
    shipping: '送料',
    tax: '消費税',
    total: '合計',
    items: '点',
    securePayment: '安全な支払い',
    shippingAddress: '配送先住所',
    billingAddress: '請求先住所',
    paymentMethod: '支払方法',
    payNow: '今すぐ支払う',
    orderSummary: '注文概要',

    // Profile
    profileTitle: 'プロフィール設定',
    tabProfile: 'プロフィール',
    tabOrders: '注文履歴',
    tabAddresses: '住所',
    tabSettings: '設定',
    logout: 'ログアウト',
    saveChanges: '変更を保存',
    saved: '保存しました',
    changePhoto: '写真を変更',

    // Hero Slides
    hero_modular: 'モジュラー',
    hero_livingSale: 'リビングセール',
    hero_upgradeHome: 'ホームアップグレード',
    hero_nextGen: '次世代',
    hero_techFest: 'テックフェス',
    hero_iphone: 'iPhone 17 Pro Max 他',
    hero_fresh: '新鮮＆',
    hero_organic: 'オーガニック',
    hero_farmToTable: '農場から食卓へ',

    // Categories
    cat_electronics: '電化製品',
    cat_fashion: 'ファッション',
    cat_home: 'ホーム',
    cat_beauty: '美容',
    cat_groceries: '食料品',
    cat_accessories: 'アクセサリー',
    cat_vehicles: '乗り物',
    cat_community: 'コミュニティ',

    // Subcategories
    sub_laptops: 'ノートPC',
    sub_phones: 'スマートフォン',
    sub_tablets: 'タブレット',
    sub_shirts: 'シャツ',
    sub_shoes: '靴',
    sub_dresses: 'ドレス',
    sub_decor: '装飾',
    sub_furniture: '家具',
    sub_makeup: 'メイクアップ',
    sub_skincare: 'スキンケア',
    sub_watches: '時計',
    sub_cars: '車',
    sub_bikes: 'バイク'
  }
};

interface SettingsContextType {
  country: Country;
  language: Language;
  setCountry: (c: Country) => void;
  setLanguage: (l: Language) => void;
  t: (key: string) => string; // Translator function
  formatPrice: (price: number) => string;
  getRandomName: (seed: number) => string;
  localProducts: any[];
  addProduct: (product: any) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Default: India, English
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [language, setLanguage] = useState<Language>(COUNTRIES[0].languages[0]);
  const [localProducts, setLocalProducts] = useState<any[]>([]);

  const addProduct = (product: any) => {
      setLocalProducts(prev => [product, ...prev]);
  };

  // Translation helper
  const t = (key: string) => {
    const langCode = language.code;
    const dict = TRANSLATIONS[langCode] || TRANSLATIONS['en'];
    return dict[key] || key;
  };

  // Price helper
  const formatPrice = (priceInUSD: number) => {
    const converted = priceInUSD * country.currency.rate;
    // Format with commas, 0 decimals for INR/JPY, 2 for others usually
    const digits = ['INR', 'JPY'].includes(country.currency.code) ? 0 : 2;
    const locale = country.code === 'IN' ? 'en-IN' : undefined;
    return `${country.currency.symbol}${converted.toLocaleString(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits })}`;
  };

  // Name helper
  const getRandomName = (seed: number) => {
      const code = country.code;
      const namesIN = ["Rahul Sharma", "Priya Singh", "Amit Patel", "Sneha Gupta", "Vikram Malhotra", "Anjali Verma"];
      const namesJP = ["Kenji Tanaka", "Sakura Sato", "Hiroshi Suzuki", "Yuki Takahashi", "Takumi Watanabe", "Hana Ito"];
      const namesUS = ["John Doe", "Emily Smith", "Michael Brown", "Sarah Johnson", "David Wilson", "Jessica Davis"];
      
      let list = namesUS;
      if (code === 'IN') list = namesIN;
      if (code === 'JP') list = namesJP;
      if (code === 'UK') list = namesUS;

      return list[seed % list.length];
  };

  return (
    <SettingsContext.Provider value={{ country, language, setCountry, setLanguage, t, formatPrice, getRandomName, localProducts, addProduct }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
