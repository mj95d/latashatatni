import { useState, useEffect } from "react";
import { Search, Menu, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo-transparent.png";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import AdminNotifications from "./AdminNotifications";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, isMerchant } = useUserRole();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-soft">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl transition-smooth group-hover:scale-105">
              <img 
                src={logo} 
                alt="لا تشتتني" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent hidden sm:block">
              لا تشتتني
            </h1>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن متاجر أو منتجات..."
                className="pr-12 h-12 bg-background border-border/50 focus:border-primary/50 rounded-xl transition-smooth"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-base hover:text-primary hover:bg-primary/10">
                الرئيسية
              </Button>
            </Link>
            <Link to="/stores">
              <Button variant="ghost" size="sm" className="text-base hover:text-primary hover:bg-primary/10">
                المتاجر
              </Button>
            </Link>
            <Link to="/offers">
              <Button variant="ghost" size="sm" className="text-base hover:text-primary hover:bg-primary/10">
                العروض
              </Button>
            </Link>
            {(isMerchant || isAdmin) && (
              <Link to="/merchant">
                <Button variant="outline" size="sm" className="text-base border-2">
                  <Store className="ml-1 h-4 w-4" />
                  لوحة التاجر
                </Button>
              </Link>
            )}
            {isAdmin && <AdminNotifications />}
            {user ? (
              <Link to="/profile">
                <Button variant="hero" size="sm" className="mr-2">
                  <User className="ml-1 h-4 w-4" />
                  حسابي
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="sm" className="mr-2">
                  تسجيل الدخول
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden hover:bg-primary/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 bg-card">
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-base hover:text-primary hover:bg-primary/10">
                  الرئيسية
                </Button>
              </Link>
              <Link to="/stores" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-base hover:text-primary hover:bg-primary/10">
                  المتاجر
                </Button>
              </Link>
              <Link to="/offers" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-base hover:text-primary hover:bg-primary/10">
                  العروض
                </Button>
              </Link>
              <Link to="/cities" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-base hover:text-primary hover:bg-primary/10">
                  المدن
                </Button>
              </Link>
              {(isMerchant || isAdmin) && (
                <Link to="/merchant" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full justify-start text-base border-2">
                    <Store className="ml-1 h-4 w-4" />
                    لوحة التاجر
                  </Button>
                </Link>
              )}
              {user ? (
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" size="sm" className="w-full justify-start mt-2">
                    <User className="ml-1 h-4 w-4" />
                    حسابي
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" size="sm" className="w-full justify-start mt-2">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
