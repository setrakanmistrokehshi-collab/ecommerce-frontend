import React, { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/context/authStore';

// Layouts
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Storefront Pages
import HomePage from '@/pages/HomePage';
import ProductsPage from '@/pages/ProductsPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderSuccessPage from '@/pages/OrderSuccessPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ProfilePage from '@/pages/ProfilePage';
import OrdersPage from '@/pages/OrdersPage';
import WishlistPage from '@/pages/WishlistPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

// Admin Pages
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AddProduct from '@/pages/admin/AddProduct';
//import EditProduct from '@/pages/admin/EditProduct';
import Customers from '@/pages/admin/Customers';
import Orders from '@/pages/admin/Orders';
import Reports from '@/pages/admin/Reports';
import Reviews from '@/pages/admin/Reviews';
import Settings from '@/pages/admin/Settings';

// ─────────────────────────────────────────────────────────────
// ROUTE GUARDS
// ─────────────────────────────────────────────────────────────

/**
 * BUG 1 FIX — Hydration guard.
 *
 * createBrowserRouter is defined at module level, so guards run before
 * fetchMe() resolves. Without this, RequireAdmin sees user=null and
 * redirects to / before the session is restored.
 *
 * Solution: read `isHydrated` from the store. Guards render a blank
 * screen until fetchMe() has finished, then evaluate auth state.
 */
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'DM Sans, sans-serif',
      color: '#7b829a',
    }}>
      Loading…
    </div>
  );
}

function RequireAuth() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  if (!isHydrated) return <LoadingScreen />;          // ← wait for hydration first
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' replace />;
}

function RequireAdmin() {
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  if (!isHydrated) return <LoadingScreen />;          // ← wait for hydration first
  if (!isAuthenticated)       return <Navigate to='/login' replace />;
  if (user?.role !== 'admin') return <Navigate to='/'      replace />;
  return <Outlet />;
}

function RedirectIfAuth() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  if (!isHydrated) return <LoadingScreen />;          // ← wait for hydration first
  return isAuthenticated ? <Navigate to='/' replace /> : <Outlet />;
}

// ─────────────────────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  // ── PUBLIC STOREFRONT ───────────────────────────────────────
  {
    element: <StorefrontLayout />,
    children: [
      { index: true, path: '/', element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },

      {
        element: <RequireAuth />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'order-success', element: <OrderSuccessPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'wishlist', element: <WishlistPage /> },
        ],
      },
    ],
  },

  // ── AUTH PAGES ──────────────────────────────────────────────
  {
    element: <RedirectIfAuth />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // ── ADMIN ───────────────────────────────────────────────────
  {
    path: 'admin-login',
    element: <AdminLoginPage />,
  },
  {
    element: <RequireAdmin />,
    children: [
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to='dashboard' replace /> },         
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'analytics', element: <AdminAnalytics /> },
          { path: 'products', element: <AdminProducts /> },
          { path: 'products/add', element: <AddProduct /> },           // BUG 3 FIX
         // { path: 'products/edit/:id', element: <EditProduct /> },     // BUG 3 FIX
          { path: 'orders', element: <AdminOrders /> },
          { path: 'orders-list', element: <Orders /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'customers', element: <Customers /> },
          { path: 'reports', element: <Reports /> },
          { path: 'reviews', element: <Reviews /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
    ],
  },

  // ── 404 ─────────────────────────────────────────────────────
  { path: '*', element: <Navigate to='/' replace /> },
]);

// ─────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    // fetchMe sets user + isAuthenticated, then marks isHydrated=true
    // Guards wait for this before evaluating auth state
    fetchMe();
    const handler = () => {
      logout();
      window.location.href = '/login?expired=1';
    };
    window.addEventListener('vc:session-expired', handler);
    return () => window.removeEventListener('vc:session-expired', handler);
  }, [fetchMe, logout]);

  return (
    <>
      
      <Toaster
        position='top-right'
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '8px',
          },
          success: { style: { background: '#2d4a35', color: '#f8f4ee' } },
          error: { style: { background: '#b85c38', color: '#ffffff' } },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}