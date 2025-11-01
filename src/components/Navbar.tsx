import { MapPin, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-soft">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
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
          </div>

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
            <Button variant="ghost" size="sm" className="text-base hover:text-primary hover:bg-primary/10">
              الرئيسية
            </Button>
            <Button variant="ghost" size="sm" className="text-base hover:text-primary hover:bg-primary/10">
              المتاجر
            </Button>
            <Button variant="ghost" size="sm" className="text-base hover:text-primary hover:bg-primary/10">
              العروض
            </Button>
            <Button variant="hero" size="sm" className="mr-2">
              للتجار
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
