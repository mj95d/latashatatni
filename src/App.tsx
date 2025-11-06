import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransitionLoader from "@/components/PageTransitionLoader";
import Index from "./pages/Index";
import Offers from "./pages/Offers";
import Products from "./pages/Products";
import Stores from "./pages/Stores";
import StoreView from "./pages/StoreView";
import Product from "./pages/Product";
import Cities from "./pages/Cities";
import Tourism from "./pages/Tourism";
import Plans from "./pages/Plans";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Merchant from "./pages/Merchant";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";
import SetupAdmin from "./pages/SetupAdmin";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import AdminLayout from "./pages/admin/AdminLayout";
import Subscribe from "./pages/merchant/Subscribe";
import * as AdminPages from "./pages/admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <PageTransitionLoader />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/store/:id" element={<StoreView />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/tourism" element={<Tourism />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/setup-admin" element={<SetupAdmin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/merchant" element={<Merchant />} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminPages.Dashboard />} />
            <Route path="users" element={<AdminPages.Users />} />
            <Route path="merchant-requests" element={<AdminPages.MerchantRequests />} />
            <Route path="orders" element={<AdminPages.Orders />} />
            <Route path="whatsapp-orders" element={<AdminPages.WhatsAppOrders />} />
            <Route path="stores" element={<AdminPages.Stores />} />
            <Route path="products" element={<AdminPages.Products />} />
            <Route path="offers" element={<AdminPages.Offers />} />
            <Route path="subscriptions" element={<AdminPages.Subscriptions />} />
            <Route path="cities" element={<AdminPages.Cities />} />
            <Route path="media" element={<AdminPages.Media />} />
            <Route path="tourism" element={<AdminPages.TourismPlaces />} />
            <Route path="payments" element={<AdminPages.Payments />} />
            <Route path="reports" element={<AdminPages.Reports />} />
            <Route path="logs" element={<AdminPages.Logs />} />
            <Route path="roles" element={<AdminPages.Roles />} />
            <Route path="create-admins" element={<AdminPages.CreateAdmins />} />
            <Route path="settings" element={<AdminPages.Settings />} />
          </Route>
          
          {/* Merchant Subscribe Route */}
          <Route path="/merchant/subscribe" element={<Subscribe />} />
          
          <Route path="/help" element={<Help />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/stats" element={<Stats />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
