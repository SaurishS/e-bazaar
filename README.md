# ValueKart 🛒

**ValueKart** is a modern, modular, and full-stack e-commerce platform designed to deliver a fluid, "out-of-the-box" shopping experience. Built with the latest web technologies, it features separate portals for buyers and sellers, real-time data synchronization, and an intelligent AI assistant.

![ValueKart Banner](/public/window.svg) 
*(Note: Replace with a real screenshot if available in your repo)*

## 🚀 Features

### 🛍️ Core Shopping Experience
*   **Netflix-Style Navigation:** Horizontal scrollable rows for categories provide a modern browsing feel.
*   **Smart Hero Section:** Interactive category filters (e.g., clicking "Electronics" filters the entire page instantly).
*   **Community Products:** Real-time listing of products added by verified sellers.
*   **Dynamic Product Grid:** Infinite scroll with multi-category fetching and real-time search.

### 💼 Seller Dashboard
*   **Dedicated Portal:** Separate login for sellers (`/login/seller`).
*   **Inventory Management:** Add new products with descriptions, prices, and images that appear instantly on the storefront.
*   **Analytics:** Visual graphs for sales performance and revenue tracking.

### 🔐 Authentication & Security
*   **Dual Auth System:** Distinct roles for Customers and Sellers powered by **Supabase Auth**.
*   **Secure:** Row Level Security (RLS) ensures users can only access their own data.

### 🤖 AI Assistant
*   **Context-Aware Bot:** A floating chat assistant that helps with navigation ("Show my cart"), order tracking, and support.
*   **Smart Suggestions:** Provides helpful pills for common queries based on the user's current context (Orders, Payment, Contact).

### 💳 Checkout & Global Logic
*   **Smart Checkout:** 3-step process (Shipping -> Payment -> Review).
*   **Localization:** Automatically adapts currency symbols (₹, $, £, ¥) and translations for India, USA, UK, and Japan.
*   **PDF Receipts:** Auto-generates downloadable PDF invoices for every order.

## 🛠️ Tech Stack

*   **Frontend:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Database & Auth:** [Supabase](https://supabase.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF)

## 📂 Project Structure

```bash
├── app/
│   ├── components/   # Reusable UI components (Navbar, Hero, ProductGrid)
│   ├── context/      # Global state (Cart, Settings/Localization)
│   ├── (routes)/     # Pages: /cart, /checkout, /login, /dashboard, etc.
│   └── api/          # Server-side API routes (Email service)
├── lib/              # Supabase client configuration
└── supabase/         # SQL schema and database types
```

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ValueKart.git
cd ValueKart
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).