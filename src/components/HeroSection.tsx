import { MapPin, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="أسواق محلية في السعودية"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary">
            <Store className="w-4 h-4" />
            <span className="font-medium">منصة محلية 100% سعودية</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              لا تشتتني
            </span>
            <br />
            <span className="text-foreground">كل ما تحتاجه قريب منك</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            اكتشف المتاجر المحلية والعروض الحصرية في منطقتك. منصة واحدة تجمع لك كل المتاجر والمنتجات القريبة منك بدون تشتت
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-2xl shadow-glow p-3 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث عن متجر أو منتج..."
                  className="pr-12 h-12 text-base bg-background"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="اختر موقعك أو مدينتك"
                  className="pr-12 h-12 text-base bg-background"
                />
              </div>
              <Button variant="hero" size="lg" className="h-12 px-8">
                ابحث الآن
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">متجر محلي</div>
            </div>
            <div className="text-center border-r border-l border-border">
              <div className="text-2xl md:text-3xl font-bold text-secondary">1000+</div>
              <div className="text-sm text-muted-foreground">منتج وعرض</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary-glow">15</div>
              <div className="text-sm text-muted-foreground">مدينة</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
