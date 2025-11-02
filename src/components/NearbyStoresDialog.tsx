import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Star, Navigation, Store as StoreIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NearbyStore {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  rating: number | null;
  distance: number;
  categories: { name: string } | null;
}

interface NearbyStoresDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeLatitude: number;
  placeLongitude: number;
  placeName: string;
}

export default function NearbyStoresDialog({
  open,
  onOpenChange,
  placeLatitude,
  placeLongitude,
  placeName
}: NearbyStoresDialogProps) {
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && placeLatitude && placeLongitude) {
      fetchNearbyStores();
    }
  }, [open, placeLatitude, placeLongitude]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchNearbyStores = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('stores')
        .select(`
          id,
          name,
          address,
          phone,
          latitude,
          longitude,
          rating,
          categories(name)
        `)
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;

      // Calculate distances and sort
      const storesWithDistance = (data || [])
        .map(store => ({
          ...store,
          distance: calculateDistance(
            placeLatitude,
            placeLongitude,
            store.latitude!,
            store.longitude!
          )
        }))
        .filter(store => store.distance <= 10) // Within 10km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10); // Top 10 nearest

      setStores(storesWithDistance as NearbyStore[]);

      if (storesWithDistance.length === 0) {
        toast({
          title: "لا توجد متاجر قريبة",
          description: "لم نجد متاجر في نطاق 10 كم من هذا المعلم",
        });
      }
    } catch (error: any) {
      console.error('Error fetching nearby stores:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل المتاجر القريبة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl gradient-text flex items-center gap-2">
            <StoreIcon className="w-6 h-6" />
            المتاجر القريبة من {placeName}
          </DialogTitle>
          <DialogDescription>
            المتاجر ضمن نطاق 10 كم من الموقع، مرتبة حسب القرب
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">جاري البحث عن المتاجر القريبة...</p>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">لا توجد متاجر قريبة</h3>
              <p className="text-muted-foreground">لم نجد متاجر في نطاق 10 كم من هذا المعلم</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {stores.map((store, index) => (
                <Card
                  key={store.id}
                  className="p-5 hover:shadow-glow transition-smooth border-2 hover:border-primary/40 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{store.name}</h3>
                        {store.categories?.name && (
                          <p className="text-sm text-muted-foreground">
                            {store.categories.name}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-primary/10 text-primary flex-shrink-0">
                        <Navigation className="w-3 h-3 ml-1" />
                        {store.distance.toFixed(1)} كم
                      </Badge>
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
                        <span className="text-muted-foreground">{store.address}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(
                          `https://www.google.com/maps/dir/${placeLatitude},${placeLongitude}/${store.latitude},${store.longitude}`,
                          '_blank'
                        )}
                      >
                        <Navigation className="w-4 h-4 ml-1" />
                        المسار
                      </Button>
                      {store.phone && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full border-2"
                          onClick={() => window.open(`tel:${store.phone}`, '_self')}
                        >
                          <Phone className="w-4 h-4 ml-1" />
                          اتصال
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        {stores.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full border-2 hover:border-primary/50"
              onClick={() => {
                onOpenChange(false);
                window.location.href = `/stores?lat=${placeLatitude}&lng=${placeLongitude}`;
              }}
            >
              عرض جميع المتاجر على الخريطة
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
