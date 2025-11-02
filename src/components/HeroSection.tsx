import { MapPin, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroBg from "@/assets/hero-bg-new.jpg";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState<Array<{ id: string; name: string }>>([]);
  const [stats, setStats] = useState({
    stores: 0,
    offers: 0,
    cities: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // عدد المتاجر النشطة
        const { count: storesCount } = await supabase
          .from("stores")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // عدد العروض النشطة
        const { count: offersCount } = await supabase
          .from("offers")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // عدد المدن
        const { count: citiesCount } = await supabase.from("cities").select("*", { count: "exact", head: true });

        // جلب المدن للقائمة المنسدلة
        const { data: citiesData } = await supabase
          .from("cities")
          .select("id, name")
          .order("name");

        setStats({
          stores: storesCount || 0,
          offers: offersCount || 0,
          cities: citiesCount || 0,
        });

        if (citiesData) {
          setCities(citiesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedCity) params.append("city", selectedCity);
    
    navigate(`/stores?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  return (
    <section className="relative min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="أسواق محلية في السعودية" className="w-full h-full object-cover" />
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
            <span className="text-white text-4xl md:text-6xl">كل ما تحتاجه قريب منك</span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed">
            سجّل مجانًا، وخلّ عروضك توصل للعملاء القريبين منك.
            <br />
            عمولتنا فقط <span className="text-white font-bold">1%</span> على الطلبات المكتملة — بدون التزامات أو
            اشتراك شهري.
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-3xl shadow-glow p-4 max-w-3xl mx-auto border-2 border-border/50 hover:border-primary/30 transition-smooth">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Input
                  type="text"
                  placeholder="ابحث عن متجر أو منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pr-14 h-14 text-base bg-background border-border/50 focus:border-primary/50 rounded-2xl"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10 pointer-events-none" />
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="pr-14 h-14 text-base bg-background border-border/50 focus:border-primary/50 rounded-2xl">
                    <SelectValue placeholder="اختر موقعك أو مدينتك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المدن</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="hero" 
                size="lg" 
                onClick={handleSearch}
                className="h-14 px-10 text-base rounded-2xl shadow-glow hover:shadow-xl"
              >
                ابحث الآن
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto pt-8">
            <div className="text-center p-6 rounded-2xl bg-card/80 backdrop-blur-md border-2 border-border/50 hover:border-primary/50 transition-smooth shadow-lg">
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-l from-primary to-primary-glow bg-clip-text text-transparent mb-2">
                {stats.stores > 0 ? `+${stats.stores}` : "0"}
              </div>
              <div className="text-base md:text-lg font-semibold text-foreground">متجر محلي</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card/80 backdrop-blur-md border-2 border-border/50 hover:border-secondary/50 transition-smooth shadow-lg">
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-l from-secondary to-accent bg-clip-text text-transparent mb-2">
                {stats.offers > 0 ? `+${stats.offers}` : "0"}
              </div>
              <div className="text-base md:text-lg font-semibold text-foreground">منتج وعرض</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card/80 backdrop-blur-md border-2 border-border/50 hover:border-blue-500/50 transition-smooth shadow-lg">
              <div className="text-3xl md:text-5xl font-bold bg-gradient-to-l from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
                +20
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
