import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Star, Clock, Store, Tag, Phone, Map, MessageSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StoresMap from "@/components/StoresMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Store {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  reviews_count: number | null;
  is_active: boolean | null;
  city_id: string | null;
  category_id: string | null;
  cities: { name: string } | null;
  categories: { name: string } | null;
}

interface City {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const Stores = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const { toast } = useToast();

  // Handle URL search parameters
  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    const cityFromUrl = searchParams.get("city");
    
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
    
    if (cityFromUrl && cityFromUrl !== "all") {
      // Will be set after cities are fetched
      const cityId = cityFromUrl;
      setTimeout(() => {
        const city = cities.find(c => c.id === cityId);
        if (city) {
          setSelectedCity(city.name);
        }
      }, 100);
    }
  }, [searchParams, cities]);

  useEffect(() => {
    fetchData();
    
    // Set up realtime subscription for stores
    const channel = supabase
      .channel('stores-page-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stores'
        },
        (payload) => {
          console.log('Store change detected in Stores page:', payload);
          fetchData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stores with cities and categories
      const { data: { user } } = await supabase.auth.getUser();

      let storesQuery = supabase
        .from('stores')
        .select(`
          *,
          cities(name),
          categories(name)
        `);

      if (user) {
        // Show active stores for everyone, plus the current user's stores (even if not approved yet)
        storesQuery = storesQuery.or(`is_active.eq.true,owner_id.eq.${user.id}`);
      } else {
        // Public visitors see all active stores (no approval requirement)
        storesQuery = storesQuery.eq('is_active', true);
      }

      const { data: storesData, error: storesError } = await storesQuery;

      if (storesError) throw storesError;

      // Fetch cities
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .order('name');

      if (citiesError) throw citiesError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (categoriesError) throw categoriesError;

      setStores(storesData || []);
      setCities(citiesData || []);
      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setSortByDistance(true);
          toast({
            title: "تم تحديد موقعك",
            description: "سيتم عرض المتاجر القريبة منك أولاً",
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "تعذر تحديد الموقع",
            description: "يرجى السماح بالوصول إلى موقعك لاستخدام هذه الميزة",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "الموقع غير مدعوم",
        description: "متصفحك لا يدعم خاصية تحديد الموقع",
        variant: "destructive",
      });
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const filteredStores = stores.filter(store => {
    const cityMatch = selectedCity === "الكل" || store.cities?.name === selectedCity;
    const categoryMatch = selectedCategory === "الكل" || store.categories?.name === selectedCategory;
    
    // Enhanced search to include store name, description, category, and city
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = searchQuery === "" || 
                       store.name.toLowerCase().includes(searchLower) ||
                       (store.description?.toLowerCase() || "").includes(searchLower) ||
                       (store.categories?.name.toLowerCase() || "").includes(searchLower) ||
                       (store.cities?.name.toLowerCase() || "").includes(searchLower);
    
    return cityMatch && categoryMatch && searchMatch;
  }).map(store => {
    if (userLocation && store.latitude && store.longitude && sortByDistance) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        store.latitude,
        store.longitude
      );
      return { ...store, distance };
    }
    return { ...store, distance: undefined };
  }).sort((a, b) => {
    if (sortByDistance && a.distance !== undefined && b.distance !== undefined) {
      return a.distance - b.distance;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Store className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">دليل المتاجر</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                اكتشف أفضل المتاجر
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ابحث عن المتاجر القريبة منك واستكشف أفضل العروض والخدمات
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-card p-6 rounded-2xl shadow-soft border-2 border-border/50 mb-12 space-y-4">
            <Input
              type="text"
              placeholder="ابحث عن متجر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 hover:border-primary/50 transition-smooth text-lg"
            />
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-2 text-foreground">المدينة</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-smooth">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">الكل</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
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
                    <SelectItem value="الكل">الكل</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={sortByDistance ? "default" : "outline"}
                  className="gap-2 border-2"
                  onClick={getUserLocation}
                >
                  <MapPin className="w-4 h-4" />
                  المتاجر القريبة
                </Button>
                {sortByDistance && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSortByDistance(false);
                      setUserLocation(null);
                    }}
                  >
                    إلغاء الفرز
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Results Count & View Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                عرض <span className="font-bold text-primary">{filteredStores.length}</span> متجر
              </p>
              {sortByDistance && userLocation && (
                <p className="text-xs text-primary mt-1">
                  مرتبة حسب القرب من موقعك
                </p>
              )}
            </div>
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "map")} className="w-auto">
              <TabsList>
                <TabsTrigger value="grid" className="gap-2">
                  <Store className="h-4 w-4" />
                  قائمة
                </TabsTrigger>
                <TabsTrigger value="map" className="gap-2">
                  <Map className="h-4 w-4" />
                  خريطة
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Map View */}
          {viewMode === "map" && (
            <div className="mb-8 animate-fade-in">
              <StoresMap stores={filteredStores.map(s => ({
                id: s.id,
                name: s.name,
                latitude: s.latitude,
                longitude: s.longitude,
                phone: s.phone,
                rating: s.rating,
                address: s.address,
                is_active: s.is_active
              }))} />
            </div>
          )}

          {/* Stores Grid */}
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">جاري تحميل المتاجر...</p>
                </div>
              ) : (
                filteredStores.map((store, index) => (
                  <Card
                    key={store.id}
                    className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate(`/store/${store.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden bg-muted">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center">
                        <Store className="w-16 h-16 text-white/30" />
                      </div>
                      
                      {/* Distance Badge */}
                      {(store as any).distance !== undefined && (
                        <Badge className="absolute top-4 right-4 bg-secondary/90 text-secondary-foreground font-semibold px-3 py-1.5">
                          <MapPin className="w-3 h-3 ml-1" />
                          {(store as any).distance.toFixed(1)} كم
                        </Badge>
                      )}
                      
                      {/* City Badge */}
                      {store.cities?.name && (
                        <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground font-semibold px-3 py-1.5">
                          <MapPin className="w-3 h-3 ml-1" />
                          {store.cities.name}
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-smooth">
                          {store.name}
                        </h3>
                        {store.categories?.name && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {store.categories.name}
                          </p>
                        )}
                        {store.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {store.description}
                          </p>
                        )}
                      </div>

                      {/* Rating & Reviews */}
                      {(store.rating || store.reviews_count) && (
                        <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-lg w-fit">
                          <Star className="w-4 h-4 fill-secondary text-secondary" />
                          {store.rating && <span className="font-semibold text-foreground">{store.rating.toFixed(1)}</span>}
                          {store.reviews_count && <span className="text-muted-foreground">({store.reviews_count})</span>}
                        </div>
                      )}

                      {/* Address */}
                      {store.address && (
                        <div className="flex items-start gap-2 text-sm pt-2 border-t border-border/50">
                          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{store.address}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button 
                          variant="default" 
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/store/${store.id}`);
                          }}
                        >
                          <Store className="w-4 h-4 ml-1" />
                          عرض المتجر
                        </Button>
                        {store.phone && (
                          <Button 
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { buildWhatsAppMessage, buildWhatsAppLink, PLATFORM_WHATSAPP } = await import("@/lib/whatsapp");
                              const { supabase } = await import("@/integrations/supabase/client");
                              
                              const message = buildWhatsAppMessage({
                                storeName: store.name
                              });
                              
                              // تسجيل الطلب
                              await supabase.from("whatsapp_orders").insert({
                                store_id: store.id,
                                customer_message: message,
                                source_page: "stores_list",
                                user_agent: navigator.userAgent
                              });
                              
                              window.open(buildWhatsAppLink(PLATFORM_WHATSAPP, message), '_blank');
                            }}
                            variant="outline" 
                            className="w-full border-2"
                          >
                            <MessageSquare className="w-4 h-4 ml-1" />
                            واتساب
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredStores.length === 0 && (
            <div className="text-center py-20">
              <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">لا توجد متاجر</h3>
              <p className="text-muted-foreground">جرب تغيير البحث أو الفلاتر للعثور على المزيد من المتاجر</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Stores;
