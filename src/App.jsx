import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/context/authStore';
import { ROLES } from '@/constants/roles';

// Layouts
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Pages (storefront)
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

// Admin
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AddProduct from '@/pages/admin/AddProduct';
import Customers from '@/pages/admin/Customers';
import Orders from '@/pages/admin/Orders';
import Reports from '@/pages/admin/Reports';
import Reviews from '@/pages/admin/Reviews';
import EditUserRole from '@/pages/admin/EditUserRole';
import Settings from '@/pages/admin/Settings';

// ─────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────
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
      Loading...
    </div>
  );
}

// ─────────────────────────────────────────────
// GUARDS
// ─────────────────────────────────────────────
function RequireAuth() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) return <LoadingScreen />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdmin() {
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" replace />;
  }

  const allowedRoles = [
    ROLES.SUPER_ADMIN,
    ROLES.PRODUCT_MANAGER,
    ROLES.ORDER_MANAGER,
    ROLES.SUPPORT,
  ];

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function RedirectIfAuth() {
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  if (!isHydrated) return <LoadingScreen />;
  
  // If authenticated, redirect to appropriate dashboard based on role
  if (isAuthenticated) {
    const adminRoles = [
      ROLES.SUPER_ADMIN,
      ROLES.PRODUCT_MANAGER,
      ROLES.ORDER_MANAGER,
      ROLES.SUPPORT,
    ];
    
    // Redirect admin users to admin dashboard
    if (adminRoles.includes(user?.role)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Regular users go to home page
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
}

// ─────────────────────────────────────────────
// ROUTER
// ─────────────────────────────────────────────
const router = createBrowserRouter([
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

  {
    element: <RedirectIfAuth />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

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
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'analytics', element: <AdminAnalytics /> },
          { path: 'products', element: <AdminProducts /> },
          { path: 'products/add', element: <AddProduct /> },
          { path: 'orders', element: <AdminOrders /> },
          { path: 'orders-list', element: <Orders /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'users/:id/role', element: <EditUserRole /> },
          { path: 'customers', element: <Customers /> },
          { path: 'reports', element: <Reports /> },
          { path: 'reviews', element: <Reviews /> },
          { path: 'settings', element: <Settings /> },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/" replace /> },
]);

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
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
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}