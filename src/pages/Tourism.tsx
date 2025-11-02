import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Camera, Mountain, Coffee, Store, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TourismMap from "@/components/TourismMap";

// Import tourism images
import masmakFort from "@/assets/tourism/masmak-fort.jpg";
import jeddahCorniche from "@/assets/tourism/jeddah-corniche.jpg";
import jabalShada from "@/assets/tourism/jabal-shada.jpg";
import raghadanForest from "@/assets/tourism/raghadan-forest.jpg";
import alBalad from "@/assets/tourism/al-balad.jpg";
import kingFahdFountain from "@/assets/tourism/king-fahd-fountain.jpg";

interface TourismPlace {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  city_id: string | null;
  cities: { name: string } | null;
}

interface City {
  id: string;
  name: string;
}

// Image mapping for tourism places
const imageMap: Record<string, string> = {
  "قصر المصمك": masmakFort,
  "كورنيش جدة": jeddahCorniche,
  "جبل شدا الأعلى": jabalShada,
  "غابة رغدان": raghadanForest,
  "البلد التاريخي": alBalad,
  "نافورة الملك فهد": kingFahdFountain,
};

const categories = ["الكل", "معالم تاريخية", "معالم طبيعية", "جبال وطبيعة", "متاحف", "حدائق", "أسواق تراثية"];

const Tourism = () => {
  const [tourismPlaces, setTourismPlaces] = useState<TourismPlace[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch tourism places with cities
      const { data: placesData, error: placesError } = await supabase
        .from('tourism_places')
        .select(`
          *,
          cities(name)
        `);

      if (placesError) throw placesError;

      // Fetch cities
      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .order('name');

      if (citiesError) throw citiesError;

      setTourismPlaces(placesData || []);
      setCities(citiesData || []);
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

  const filteredPlaces = tourismPlaces.filter(place => {
    const cityMatch = selectedCity === "الكل" || place.cities?.name === selectedCity;
    const categoryMatch = selectedCategory === "الكل" || place.category === selectedCategory;
    return cityMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">السياحة</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                اكتشف المعالم السياحية
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              استكشف أجمل الأماكن السياحية والمتاجر القريبة منها
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 bg-card p-6 rounded-2xl shadow-soft border-2 border-border/50">
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
              <label className="block text-sm font-semibold mb-2 text-foreground">النوع</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-smooth">
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              عرض <span className="font-bold text-primary">{filteredPlaces.length}</span> مكان سياحي
            </p>
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "map")} className="w-auto">
              <TabsList>
                <TabsTrigger value="grid" className="gap-2">
                  <Mountain className="h-4 w-4" />
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
              <TourismMap places={filteredPlaces.map(p => ({
                id: p.id,
                name: p.name,
                latitude: p.latitude,
                longitude: p.longitude,
                description: p.description,
                category: p.category,
                city_name: p.cities?.name
              }))} />
            </div>
          )}

          {/* Tourism Places Grid */}
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">جاري تحميل الأماكن السياحية...</p>
                </div>
              ) : (
                filteredPlaces.map((place, index) => (
                  <Card
                    key={place.id}
                    className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      {imageMap[place.name] ? (
                        <img
                          src={imageMap[place.name]}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Mountain className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      
                      {/* Category Badge */}
                      {place.category && (
                        <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground font-semibold px-3 py-1.5">
                          {place.category}
                        </Badge>
                      )}

                      {/* City Badge */}
                      {place.cities?.name && (
                        <Badge className="absolute top-4 left-4 bg-secondary/90 text-secondary-foreground font-semibold px-3 py-1.5">
                          <MapPin className="w-3 h-3 ml-1" />
                          {place.cities.name}
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-smooth">
                          {place.name}
                        </h3>
                        {place.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {place.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {place.latitude && place.longitude && (
                          <Button 
                            variant="default" 
                            className="w-full"
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`, '_blank')}
                          >
                            عرض المكان
                          </Button>
                        )}
                        <Button variant="outline" className="w-full border-2">
                          المتاجر القريبة
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredPlaces.length === 0 && (
            <div className="text-center py-20">
              <Mountain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">لا توجد أماكن سياحية</h3>
              <p className="text-muted-foreground">جرب تغيير الفلاتر للعثور على المزيد من الأماكن</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tourism;