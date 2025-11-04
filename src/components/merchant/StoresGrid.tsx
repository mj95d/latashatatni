import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  MapPin, 
  Phone, 
  Globe, 
  Edit, 
  Eye,
  Package,
  Tag,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface StoreGridProps {
  stores: any[];
  onStoreSelect?: (storeId: string) => void;
}

export const StoresGrid = ({ stores, onStoreSelect }: StoreGridProps) => {
  const navigate = useNavigate();

  // Get image URL from Supabase Storage
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from('store-documents').getPublicUrl(path);
    return data.publicUrl;
  };

  if (stores.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
          <Store className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-3">لا توجد متاجر حالياً</h3>
        <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
          ابدأ بإضافة متجرك الأول وعرض منتجاتك للعملاء
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store) => (
        <Card 
          key={store.id} 
          className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50"
        >
          {/* Store Cover/Logo */}
          <div className="relative h-48 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
            {(store.cover_url || store.logo_url) ? (
              <img
                src={getImageUrl(store.cover_url || store.logo_url) || ''}
                alt={store.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${(store.cover_url || store.logo_url) ? 'hidden' : ''}`}>
              <Store className="w-20 h-20 text-primary/30" />
            </div>
            
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <Badge 
                variant={store.approved ? "default" : "secondary"}
                className="gap-1.5 shadow-lg backdrop-blur-sm"
              >
                {store.approved ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    معتمد
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    قيد المراجعة
                  </>
                )}
              </Badge>
            </div>

            {/* Active Badge */}
            <div className="absolute top-3 left-3">
              <Badge 
                variant={store.is_active ? "default" : "outline"}
                className="gap-1.5 shadow-lg backdrop-blur-sm"
              >
                {store.is_active ? "نشط" : "غير نشط"}
              </Badge>
            </div>
          </div>

          {/* Store Info */}
          <div className="p-6 space-y-4">
            {/* Name & Category */}
            <div>
              <h3 className="font-bold text-xl mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {store.name}
              </h3>
              {store.categories && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  <span>{store.categories.name}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {store.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {store.description}
              </p>
            )}

            {/* Location */}
            {store.cities && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">{store.cities.name}</span>
              </div>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-3 text-xs">
              {store.phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span dir="ltr">{store.phone}</span>
                </div>
              )}
              {store.website && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Globe className="h-3.5 w-3.5" />
                  <span>موقع</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="font-semibold">0</span>
                  <span className="text-muted-foreground">منتج</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{store.rating || 0}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => navigate(`/store/${store.id}`)}
              >
                <Eye className="h-4 w-4 ml-1" />
                عرض
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  if (onStoreSelect) {
                    onStoreSelect(store.id);
                  }
                }}
              >
                <Edit className="h-4 w-4 ml-1" />
                إدارة
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
