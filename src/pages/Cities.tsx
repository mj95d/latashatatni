import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { MapPin, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

// City images mapping
const cityImages: Record<string, string> = {
  "الزلفي": "/src/assets/cities/alzulfi.jpg",
  "الرياض": "/src/assets/cities/riyadh.jpg",
  "جدة": "/src/assets/cities/jeddah.jpg",
  "الدمام": "/src/assets/cities/dammam.jpg",
  "القصيم": "/src/assets/cities/qassim.jpg",
  "الباحة": "/src/assets/cities/albahah.jpg",
  "مكة": "/src/assets/cities/makkah.jpg",
  "المدينة": "/src/assets/cities/madinah.jpg",
  "تبوك": "/src/assets/cities/tabuk.jpg",
  "الطائف": "/src/assets/cities/taif.jpg",
  "أبها": "/src/assets/cities/abha.jpg",
  "نجران": "/src/assets/cities/najran.jpg",
  "حائل": "/src/assets/cities/hail.jpg",
  "الخبر": "/src/assets/cities/khobar.jpg",
  "الظهران": "/src/assets/cities/dhahran.jpg",
  "بريدة": "/src/assets/cities/buraidah.jpg",
  "عنيزة": "/src/assets/cities/unaizah.jpg",
  "خميس مشيط": "/src/assets/cities/khamis-mushait.jpg",
  "حفر الباطن": "/src/assets/cities/hafar-albatin.jpg",
  "المجمعة": "/src/assets/cities/almajmaah.jpg",
  "الرس": "/src/assets/cities/alrass.jpg",
  "القريات": "/src/assets/cities/alqurayyat.jpg",
  "البكيرية": "/src/assets/cities/albukayriyah.jpg",
  "الدوادمي": "/src/assets/cities/aldawadmi.jpg",
  "وادي الدواسر": "/src/assets/cities/wadi-aldawasir.jpg",
  "بيشة": "/src/assets/cities/bisha.jpg",
  "محايل عسير": "/src/assets/cities/muhayil-asir.jpg",
  "القنفذة": "/src/assets/cities/alqunfudhah.jpg",
  "رابغ": "/src/assets/cities/rabigh.jpg",
  "صامطة": "/src/assets/cities/samtah.jpg",
};

interface City {
  id: string;
  name: string;
  description: string;
  image_url: string;
  stores: number;
  offers: number;
}

const Cities = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      
      // Fetch cities from database
      const { data: citiesData, error: citiesError } = await supabase
        .from("cities")
        .select("*")
        .order("name");

      if (citiesError) throw citiesError;

      if (citiesData) {
        // For each city, count stores and offers
        const citiesWithStats = await Promise.all(
          citiesData.map(async (city) => {
            // Count active stores in this city
            const { count: storesCount } = await supabase
              .from("stores")
              .select("*", { count: "exact", head: true })
              .eq("city_id", city.id)
              .eq("is_active", true);

            // Count active offers in this city
            const { data: cityStores } = await supabase
              .from("stores")
              .select("id")
              .eq("city_id", city.id)
              .eq("is_active", true);

            let offersCount = 0;
            if (cityStores && cityStores.length > 0) {
              const storeIds = cityStores.map((s) => s.id);
              const { count } = await supabase
                .from("offers")
                .select("*", { count: "exact", head: true })
                .in("store_id", storeIds)
                .eq("is_active", true);
              offersCount = count || 0;
            }

            // Use local image if available, otherwise use image_url from database
            const imageUrl = cityImages[city.name] || city.image_url || "/src/assets/cities/riyadh.jpg";

            return {
              id: city.id,
              name: city.name,
              description: city.description || `اكتشف أفضل المتاجر والعروض في ${city.name}`,
              image_url: imageUrl,
              stores: storesCount || 0,
              offers: offersCount,
            };
          })
        );

        setCities(citiesWithStats);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">المدن</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                اكتشف مدن المملكة
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              اختر مدينتك واستكشف أفضل المتاجر والعروض المحلية
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-64 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16" />
                      <Skeleton className="h-16" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Cities Grid */}
          {!loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cities.map((city, index) => (
                <Link key={city.id} to={`/city/${city.name}`}>
                  <Card
                    className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 h-full animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* City Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={city.image_url}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      {/* City Name Overlay */}
                      <div className="absolute bottom-0 right-0 left-0 p-6">
                        <h3 className="text-3xl font-bold text-white mb-2">{city.name}</h3>
                        <p className="text-white/90 text-sm">{city.description}</p>
                      </div>
                    </div>

                    {/* City Stats */}
                    <div className="p-6 bg-card">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                          <Store className="w-4 h-4 text-primary" />
                          <div>
                            <div className="text-xl font-bold text-foreground">{city.stores}</div>
                            <div className="text-xs text-muted-foreground">متجر</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-secondary/10 px-3 py-2 rounded-lg">
                          <Tag className="w-4 h-4 text-secondary" />
                          <div>
                            <div className="text-xl font-bold text-foreground">{city.offers}</div>
                            <div className="text-xs text-muted-foreground">عرض</div>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full mt-4 group-hover:bg-primary/90" variant="default">
                        استكشف {city.name}
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cities;