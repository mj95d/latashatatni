import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Star, Clock, Tag, Percent } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OfferDetailsDialog } from "@/components/OfferDetailsDialog";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  discount_text: string | null;
  discount_percentage: number | null;
  image_url: string | null;
  images: Array<{ url: string; is_primary?: boolean }> | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  store_id: string | null;
  stores: {
    name: string;
    address: string | null;
    phone: string | null;
    whatsapp: string | null;
    city_id: string | null;
    rating: number | null;
    cities: {
      name: string;
    } | null;
    categories: {
      name: string;
    } | null;
  } | null;
}

const Offers = () => {
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [cities, setCities] = useState<string[]>(["الكل"]);
  const [categories, setCategories] = useState<string[]>(["الكل"]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
    fetchCities();
    fetchCategories();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select(`
          *,
          stores (
            name,
            address,
            phone,
            whatsapp,
            rating,
            city_id,
            category_id,
            cities (
              name
            ),
            categories (
              name
            )
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOffers((data || []) as unknown as Offer[]);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل العروض",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name")
        .order("name");

      if (error) throw error;
      
      // Remove duplicates using Set
      const uniqueNames = Array.from(new Set(data?.map(c => c.name) || []));
      setCities(["الكل", ...uniqueNames]);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      
      // Remove duplicates using Set
      const uniqueNames = Array.from(new Set(data?.map(c => c.name) || []));
      setCategories(["الكل", ...uniqueNames]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredOffers = offers.filter(offer => {
    const cityMatch = selectedCity === "الكل" || offer.stores?.cities?.name === selectedCity;
    const categoryMatch = selectedCategory === "الكل" || offer.stores?.categories?.name === selectedCategory;
    return cityMatch && categoryMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 lg:px-6">
            <LoadingSpinner size="lg" fullScreen message="جاري تحميل العروض..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-4">
              <Percent className="w-5 h-5 text-secondary" />
              <span className="text-sm font-semibold text-secondary">عروض حصرية</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                أفضل العروض والخصومات
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              اكتشف أحدث العروض والخصومات من المتاجر القريبة منك
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 bg-card p-6 rounded-2xl shadow-soft border-2 border-border/50">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-foreground">المدينة</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-smooth">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-foreground">القسم</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-smooth">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Offers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOffers.map((offer, index) => {
              const discount = offer.discount_text || 
                (offer.discount_percentage ? `${offer.discount_percentage}%` : 'عرض خاص');
              
              // استخدام أول صورة من مصفوفة الصور أو الصورة القديمة
              const primaryImage = offer.images && offer.images.length > 0
                ? offer.images.find(img => img.is_primary)?.url || offer.images[0].url
                : offer.image_url;
              const imageUrl = primaryImage || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop';
              const cityName = offer.stores?.cities?.name || 'غير محدد';
              const categoryName = offer.stores?.categories?.name || 'عام';
              const rating = offer.stores?.rating || 0;
              const storeName = offer.stores?.name || 'متجر';
              const endDate = offer.end_date ? new Date(offer.end_date) : null;
              const isExpired = endDate && endDate < new Date();

              if (isExpired) return null;

              return (
                <Card
                  key={offer.id}
                  className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Discount Badge */}
                    <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground font-bold text-lg px-4 py-2 shadow-lg">
                      <Tag className="w-4 h-4 ml-1" />
                      {discount}
                    </Badge>

                    {/* City Badge */}
                    <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground font-semibold px-3 py-1.5">
                      <MapPin className="w-3 h-3 ml-1" />
                      {cityName}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-smooth line-clamp-2">
                        {offer.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-semibold">
                        {storeName}
                      </p>
                      {offer.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {offer.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {categoryName}
                      </p>
                    </div>

                    {/* Rating */}
                    {rating > 0 && (
                      <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-lg w-fit">
                        <Star className="w-4 h-4 fill-secondary text-secondary" />
                        <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* End Date */}
                    {endDate && (
                      <div className="flex items-center gap-2 text-sm pt-2 border-t border-border/50">
                        <Clock className="w-4 h-4 text-secondary" />
                        <span className="text-secondary font-semibold">
                          ينتهي في: {endDate.toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      className="w-full mt-2" 
                      variant="default"
                      onClick={() => {
                        setSelectedOffer(offer);
                        setDetailsOpen(true);
                      }}
                    >
                      عرض التفاصيل
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* No Results */}
          {filteredOffers.length === 0 && (
            <div className="text-center py-20">
              <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">لا توجد عروض</h3>
              <p className="text-muted-foreground">جرب تغيير الفلاتر للعثور على المزيد من العروض</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
      
      <OfferDetailsDialog
        offer={selectedOffer}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
};

export default Offers;
