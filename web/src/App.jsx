import React, { useState } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { CartProvider } from '@/hooks/useCart';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionAuthProvider } from '@/contexts/SubscriptionAuthContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/admin/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShoppingCart from '@/components/ShoppingCart';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import { Toaster } from '@/components/ui/toaster';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SuccessPage from './pages/SuccessPage';
import ShippingRatesPage from './pages/ShippingRatesPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ReturnRefundPolicyPage from './pages/ReturnRefundPolicyPage';
import PlansPage from './pages/PlansPage';
import ProjectsPage from './pages/ProjectsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import RewardsPage from './pages/RewardsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => window.removeEventListener('open-cart', handleOpenCart);
  }, []);

  return (
    <CartProvider>
      <AuthProvider>
        <SubscriptionAuthProvider>
          <Router>
            <ScrollToTop />
            <div className="flex min-h-screen flex-col">
              <Header onCartOpen={() => setIsCartOpen(true)} />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/store" element={<StorePage />} />
                  <Route path="/product/:id" element={<div className="mx-auto max-w-[80rem] px-4 sm:px-6 py-14"><ProductDetailPage /></div>} />
                  <Route path="/success" element={<SuccessPage />} />
                  <Route path="/shipping" element={<ShippingRatesPage />} />
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/return-refund-policy" element={<ReturnRefundPolicyPage />} />
                  <Route path="/plans" element={<PlansPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route
                    path="/subscriptions"
                    element={
                      <ProtectedRoute>
                        <SubscriptionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rewards"
                    element={
                      <ProtectedRoute>
                        <RewardsPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route index element={<div className="p-8"><h1 className="text-3xl font-bold">Admin Dashboard Overview</h1></div>} />
                      <Route path="products" element={<div className="p-8"><h1 className="text-3xl font-bold">Products</h1></div>} />
                      <Route path="orders" element={<div className="p-8"><h1 className="text-3xl font-bold">Orders</h1></div>} />
                      <Route path="blogs" element={<div className="p-8"><h1 className="text-3xl font-bold">Blogs</h1></div>} />
                    </Route>
                  </Route>
                </Routes>
              </main>
              <Footer />
            </div>
            <ShoppingCart isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
            <WhatsAppWidget />
            <Toaster />
          </Router>
        </SubscriptionAuthProvider>
      </AuthProvider>
    </CartProvider>
  );
}

export default App;
