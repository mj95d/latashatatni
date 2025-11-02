import { MapPin, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroBg from "@/assets/hero-bg.jpg";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const [stats, setStats] = useState({
    stores: 0,
    offers: 0,
    cities: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // عدد المتاجر النشطة
        const { count: storesCount } = await supabase
          .from('stores')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // عدد العروض النشطة
        const { count: offersCount } = await supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // عدد المدن
        const { count: citiesCount } = await supabase
          .from('cities')
          .select('*', { count: 'exact', head: true });

        setStats({
          stores: storesCount || 0,
          offers: offersCount || 0,
          cities: citiesCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);
  return (
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="أسواق محلية في السعودية"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/98 via-background/85 to-background/98" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/30 rounded-full px-5 py-2.5 text-sm text-primary backdrop-blur-sm hover:bg-primary/15 transition-smooth cursor-pointer">
            <Store className="w-4 h-4" />
            <span className="font-semibold">منصة محلية 100% سعودية</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent drop-shadow-lg">
              لا تشتتني
            </span>
            <br />
            <span className="text-foreground text-4xl md:text-6xl">كل ما تحتاجه قريب منك</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            سجّل مجانًا، وخلّ عروضك توصل للعملاء القريبين منك.
            <br />
            عمولتنا فقط <span className="text-primary font-bold">1%</span> على الطلبات المكتملة — بدون التزامات أو اشتراك شهري.
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-3xl shadow-glow p-4 max-w-3xl mx-auto border-2 border-border/50 hover:border-primary/30 transition-smooth">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث عن متجر أو منتج..."
                  className="pr-14 h-14 text-base bg-background border-border/50 focus:border-primary/50 rounded-2xl"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="اختر موقعك أو مدينتك"
                  className="pr-14 h-14 text-base bg-background border-border/50 focus:border-primary/50 rounded-2xl"
                />
              </div>
              <Button variant="hero" size="lg" className="h-14 px-10 text-base rounded-2xl shadow-glow hover:shadow-xl">
                ابحث الآن
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8">
            <div className="text-center p-6 rounded-2xl bg-card/80 backdrop-blur-md border-2 border-border/50 hover:border-primary/50 transition-smooth shadow-lg">
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-l from-primary to-primary-glow bg-clip-text text-transparent mb-2">
                {stats.stores > 0 ? `+${stats.stores}` : '0'}
              </div>
              <div className="text-base md:text-lg font-semibold text-foreground">متجر محلي</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card/80 backdrop-blur-md border-2 border-border/50 hover:border-secondary/50 transition-smooth shadow-lg">
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-l from-secondary to-accent bg-clip-text text-transparent mb-2">
                {stats.offers > 0 ? `+${stats.offers}` : '0'}
              </div>
              <div className="text-base md:text-lg font-semibold text-foreground">منتج وعرض</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card/80 backdrop-blur-md border-2 border-border/50 hover:border-primary-glow/50 transition-smooth shadow-lg">
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-l from-primary-glow to-primary bg-clip-text text-transparent mb-2">
                {stats.cities > 0 ? `+${stats.cities}` : '0'}
              </div>
              <div className="text-base md:text-lg font-semibold text-foreground">مدينة</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
