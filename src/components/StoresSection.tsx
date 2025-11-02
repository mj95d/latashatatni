import { useState, useEffect } from "react";
import { MapPin, Star, Clock, Map as MapIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import StoresMap from "./StoresMap";
import { Link } from "react-router-dom";

interface Store {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  is_active: boolean | null;
  categories: { name: string } | null;
}

const StoresSection = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          categories(name)
        `)
        .eq('is_active', true)
        .limit(4);

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                متاجر قريبة منك
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              اكتشف أفضل المتاجر المحلية في منطقتك
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "map")} className="w-auto">
              <TabsList>
                <TabsTrigger value="grid">قائمة</TabsTrigger>
                <TabsTrigger value="map" className="gap-2">
                  <MapIcon className="h-4 w-4" />
                  خريطة
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Link to="/stores">
              <Button variant="outline" className="border-2 hover:border-primary/50 hover:text-primary">
                عرض الكل
              </Button>
            </Link>
          </div>
        </div>

        {/* Map View */}
        {viewMode === "map" && (
          <div className="mb-8 animate-fade-in">
            <StoresMap stores={stores.map(s => ({
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              stores.map((store) => (
                <Card
                  key={store.id}
                  className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40"
                >
                  {/* Store Image */}
                  <div className="relative h-52 overflow-hidden bg-muted">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-white/30" />
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-smooth">
                        {store.name}
                      </h3>
                      {store.categories?.name && (
                        <p className="text-sm text-muted-foreground">
                          {store.categories.name}
                        </p>
                      )}
                    </div>

                    {/* Rating */}
                    {store.rating && (
                      <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-lg w-fit">
                        <Star className="w-4 h-4 fill-secondary text-secondary" />
                        <span className="font-semibold text-foreground">{store.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Address */}
                    {store.address && (
                      <div className="flex items-start gap-2 text-sm pt-2 border-t border-border/50">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-xs line-clamp-2">{store.address}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
          <Link to="/stores" className="block">
            <Button variant="outline" className="w-full max-w-sm border-2 hover:border-primary/50">
              عرض جميع المتاجر
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default StoresSection;
