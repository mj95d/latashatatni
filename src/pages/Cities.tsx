import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { MapPin, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingSpinner from "@/components/LoadingSpinner";

// City images imports
import alzulfiImg from "@/assets/cities/alzulfi.jpg";
import riyadhImg from "@/assets/cities/riyadh.jpg";
import jeddahImg from "@/assets/cities/jeddah.jpg";
import dammamImg from "@/assets/cities/dammam.jpg";
import qassimImg from "@/assets/cities/qassim.jpg";
import albahahImg from "@/assets/cities/albahah.jpg";
import makkahImg from "@/assets/cities/makkah.jpg";
import madinahImg from "@/assets/cities/madinah.jpg";
import tabukImg from "@/assets/cities/tabuk.jpg";
import taifImg from "@/assets/cities/taif.jpg";
import abhaImg from "@/assets/cities/abha.jpg";
import najranImg from "@/assets/cities/najran.jpg";
import hailImg from "@/assets/cities/hail.jpg";
import khobarImg from "@/assets/cities/khobar.jpg";
import dhahranImg from "@/assets/cities/dhahran.jpg";
import buraidahImg from "@/assets/cities/buraidah.jpg";
import unaizahImg from "@/assets/cities/unaizah.jpg";
import khamisMushaitImg from "@/assets/cities/khamis-mushait.jpg";
import hafarAlbatinImg from "@/assets/cities/hafar-albatin.jpg";
import almajmaahImg from "@/assets/cities/almajmaah.jpg";
import alrassImg from "@/assets/cities/alrass.jpg";
import alqurayyatImg from "@/assets/cities/alqurayyat.jpg";
import albukayriyahImg from "@/assets/cities/albukayriyah.jpg";
import aldawadmiImg from "@/assets/cities/aldawadmi.jpg";
import wadiAldawasirImg from "@/assets/cities/wadi-aldawasir.jpg";
import bishaImg from "@/assets/cities/bisha.jpg";
import muhayilAsirImg from "@/assets/cities/muhayil-asir.jpg";
import alqunfudhahImg from "@/assets/cities/alqunfudhah.jpg";
import rabighImg from "@/assets/cities/rabigh.jpg";
import samtahImg from "@/assets/cities/samtah.jpg";

// City images mapping
const cityImages: Record<string, string> = {
  "الزلفي": alzulfiImg,
  "الرياض": riyadhImg,
  "جدة": jeddahImg,
  "الدمام": dammamImg,
  "القصيم": qassimImg,
  "الباحة": albahahImg,
  "مكة": makkahImg,
  "المدينة": madinahImg,
  "تبوك": tabukImg,
  "الطائف": taifImg,
  "أبها": abhaImg,
  "نجران": najranImg,
  "حائل": hailImg,
  "الخبر": khobarImg,
  "الظهران": dhahranImg,
  "بريدة": buraidahImg,
  "عنيزة": unaizahImg,
  "خميس مشيط": khamisMushaitImg,
  "حفر الباطن": hafarAlbatinImg,
  "المجمعة": almajmaahImg,
  "الرس": alrassImg,
  "القريات": alqurayyatImg,
  "البكيرية": albukayriyahImg,
  "الدوادمي": aldawadmiImg,
  "وادي الدواسر": wadiAldawasirImg,
  "بيشة": bishaImg,
  "محايل عسير": muhayilAsirImg,
  "القنفذة": alqunfudhahImg,
  "رابغ": rabighImg,
  "صامطة": samtahImg,
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

            // Use local image if available, otherwise fallback to default
            const imageUrl = cityImages[city.name] || riyadhImg;

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
      
      <main className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-12 md:mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 border-2 border-primary/30 px-4 py-2 rounded-full mb-4">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">المدن</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 px-2">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                اكتشف مدن المملكة
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              اختر مدينتك واستكشف أفضل المتاجر والعروض المحلية
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-20">
              <LoadingSpinner size="lg" message="جاري تحميل المدن..." />
            </div>
          )}

          {/* Cities Grid */}
          {!loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {cities.map((city, index) => (
                <Link key={city.id} to={`/stores?city=${city.id}`}>
                  <Card
                    className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 h-full animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* City Image */}
                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                      <img
                        src={city.image_url}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      {/* City Name Overlay */}
                      <div className="absolute bottom-0 right-0 left-0 p-4 sm:p-5 md:p-6">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{city.name}</h3>
                        <p className="text-white/90 text-xs sm:text-sm line-clamp-2">{city.description}</p>
                      </div>
                    </div>

                    {/* City Stats */}
                    <div className="p-4 sm:p-5 md:p-6 bg-card">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 bg-primary/10 px-2.5 sm:px-3 py-2 rounded-lg">
                          <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                          <div>
                            <div className="text-lg sm:text-xl font-bold text-foreground">{city.stores}</div>
                            <div className="text-xs text-muted-foreground">متجر</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-secondary/10 px-2.5 sm:px-3 py-2 rounded-lg">
                          <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
                          <div>
                            <div className="text-lg sm:text-xl font-bold text-foreground">{city.offers}</div>
                            <div className="text-xs text-muted-foreground">عرض</div>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full mt-3 sm:mt-4 group-hover:bg-primary/90 text-sm sm:text-base" variant="default">
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