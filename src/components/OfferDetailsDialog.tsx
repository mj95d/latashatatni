import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Tag, Store, Calendar } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface OfferDetailsDialogProps {
  offer: {
    id: string;
    title: string;
    description: string | null;
    discount_text: string | null;
    discount_percentage: number | null;
    image_url: string | null;
    images: Array<{ url: string; is_primary?: boolean }> | null;
    start_date: string;
    end_date: string | null;
    stores: {
      name: string;
      address: string | null;
      phone: string | null;
      whatsapp: string | null;
      rating: number | null;
      cities: {
        name: string;
      } | null;
      categories: {
        name: string;
      } | null;
    } | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OfferDetailsDialog = ({ offer, open, onOpenChange }: OfferDetailsDialogProps) => {
  if (!offer) return null;

  const discount = offer.discount_text || 
    (offer.discount_percentage ? `${offer.discount_percentage}%` : 'عرض خاص');
  
  const offerImages = offer.images && offer.images.length > 0 
    ? offer.images 
    : [{ url: offer.image_url || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop' }];

  const cityName = offer.stores?.cities?.name || 'غير محدد';
  const categoryName = offer.stores?.categories?.name || 'عام';
  const rating = offer.stores?.rating || 0;
  const storeName = offer.stores?.name || 'متجر';
  const startDate = new Date(offer.start_date);
  const endDate = offer.end_date ? new Date(offer.end_date) : null;

  const handleWhatsAppClick = async () => {
    const { buildWhatsAppMessage, buildWhatsAppLink } = await import("@/lib/whatsapp");
    const { supabase } = await import("@/integrations/supabase/client");
    
    const PLATFORM_PHONE = "+966532402020"; // رقم المنصة الموحد
    
    const message = buildWhatsAppMessage({
      storeName: offer.stores?.name || "متجر",
      offerName: offer.title
    });
    
    // تسجيل الطلب في قاعدة البيانات
    try {
      await supabase.from("whatsapp_orders").insert({
        store_id: offer.stores ? offer.id : null,
        offer_id: offer.id,
        customer_message: message,
        source_page: "offer_details_dialog",
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error("Error logging whatsapp order:", error);
    }
    
    // فتح واتساب
    window.open(buildWhatsAppLink(PLATFORM_PHONE, message), '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{offer.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Carousel */}
          <div className="relative">
            {offerImages.length > 1 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {offerImages.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="relative h-96 rounded-xl overflow-hidden">
                        <img
                          src={img.url}
                          alt={`${offer.title} - صورة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            ) : (
              <div className="relative h-96 rounded-xl overflow-hidden">
                <img
                  src={offerImages[0].url}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            {/* Discount Badge */}
            <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground font-bold text-xl px-6 py-3 shadow-xl">
              <Tag className="w-5 h-5 ml-2" />
              {discount}
            </Badge>
          </div>

          {/* Store Info */}
          <div className="flex items-start gap-4 p-6 bg-card/50 rounded-xl border-2 border-border/50">
            <Store className="w-6 h-6 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">{storeName}</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{cityName}</span>
                </div>
                {rating > 0 && (
                  <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
                  </div>
                )}
                <Badge variant="outline">{categoryName}</Badge>
              </div>
              {offer.stores?.address && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {offer.stores.address}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {offer.description && (
            <div className="space-y-2">
              <h4 className="font-bold text-lg">تفاصيل العرض</h4>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {offer.description}
              </p>
            </div>
          )}

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">يبدأ في</p>
                <p className="font-semibold">{startDate.toLocaleDateString('ar-SA')}</p>
              </div>
            </div>
            {endDate && (
              <div className="flex items-center gap-3 p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                <Clock className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">ينتهي في</p>
                  <p className="font-semibold text-secondary">{endDate.toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={handleWhatsAppClick}
            >
              تواصل عبر واتساب
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.open(`tel:+966532402020`, '_self')}
            >
              اتصل الآن
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};