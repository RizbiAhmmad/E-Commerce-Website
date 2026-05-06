# 🍃 Leafo - Premium Organic E-Commerce Platform

A state-of-the-art organic grocery e-commerce solution featuring role-based dashboards, an integrated Point of Sale (POS) system, and real-time inventory management. Built for speed, scalability, and a premium user experience.

---

## 🚀 Live Demo & Credentials

**Live Link:** [organic.bangladeshiit.com](https://organic.bangladeshiit.com/)

| Role         | Email                  | Password      |
| :----------- | :--------------------- | :------------ |
| **Admin**    | `admin@organic.com`    | `Admin123`    |
| **Customer** | `customer@organic.com` | `Customer123` |

---

## ❗ Problem Statement

Traditional organic shopping often lacks a unified platform that bridges the gap between online convenience and in-store management. Customers need a reliable source for organic produce, while administrators struggle to manage inventory, sales (both online and physical), and delivery logistics without switching between multiple platforms.

## ✅ Solution Overview

**Leafo** provides a comprehensive, responsive web application that serves as a one-stop shop for organic goods. It offers:

- A high-conversion landing page with immersive animations.
- A robust **Point of Sale (POS)** system for physical store transactions.
- Role-based dashboards (Admin & Customer) for tailored experiences.
- Automated reporting, inventory tracking, and seamless order management.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 7
- **Styling:** Tailwind CSS 4, Framer Motion (Animations), Lucide React (Icons)
- **State Management:** TanStack React Query (v5), Axios
- **Database & Auth:** Firebase
- **UI Components:** Shadcn/UI (Radix UI)
- **Utilities:** XLSX (Reporting), JSBarcode (POS), SweetAlert2 (Notifications), Swiper/Slick (Carousels)

## ✨ Key Features

- **🛒 Dynamic Cart System:** Seamlessly add, remove, and update products with persistent state management.
- **📊 Advanced Admin Dashboard:** Complete control over products, categories, orders, and user management with visual analytics.
- **🏧 Integrated POS System:** Handle in-person sales with barcode support and instant receipt printing capabilities.
- **🚚 Real-time Order Tracking:** Monitor order status from placement to "Pending", "Courier", and "Delivered".
- **📥 Data Export (XLSX):** Generate and download detailed sales and inventory reports with a single click.
- **🔐 Secure Authentication:** Firebase-powered auth with JWT integration and protected route logic.
- **📱 Ultra-Responsive UI:** Optimized for mobile, tablet, and desktop using a modern "mobile-first" approach.
- **🎭 Premium Aesthetics:** Smooth transitions, glassmorphism effects, and Lottie animations for a "wow" factor.

## ⚙️ Setup Instructions

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/E-Commerce-Client.git
   cd E-Commerce-Client
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Firebase and API keys:
   ```env
   VITE_apiKey=your_firebase_api_key
   VITE_authDomain=your_firebase_auth_domain
   VITE_projectId=your_firebase_project_id
   VITE_storageBucket=your_firebase_storage_bucket
   VITE_messagingSenderId=your_firebase_sender_id
   VITE_appId=your_firebase_app_id
   VITE_API_URL=https://your-backend-domain.com
   ```
4. **Run the app:**
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

- **`/src/Pages`:** Modular page components (POS, Dashboard, Cart, LandingPage).
- **`/src/components`:** Reusable UI components built with Shadcn/UI and Radix primitives.
- **`/src/routes`:** Centralized routing system with private and role-based access control.
- **`/src/Hooks`:** Custom hooks for efficient data fetching and global state interaction.

---

_Developed with excellence to redefine the organic shopping experience._
