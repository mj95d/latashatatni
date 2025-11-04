import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Store, MapPin, Tag, ArrowRight, MessageSquare, Phone, Star,
  Truck, ShoppingBag
} from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { toast } from "sonner";
import { buildWhatsAppMessage, buildWhatsAppLink, PLATFORM_WHATSAPP } from "@/lib/whatsapp";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  old_price: number | null;
  images: any; // Using any for Json type compatibility
  is_active: boolean;
  store_id: string;
  stores: {
    id: string;
    name: string;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    rating: number | null;
    reviews_count: number | null;
    cities: {
      name: string;
    } | null;
    categories: {
      name: string;
    } | null;
  } | null;
}

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          stores (
            id,
            name,
            phone,
            whatsapp,
            address,
            rating,
            reviews_count,
            cities (name),
            categories (name)
          )
        `)
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("المنتج غير موجود");
        navigate("/");
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("حدث خطأ في تحميل المنتج");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppOrder = async () => {
    if (!product) return;

    const message = buildWhatsAppMessage({
      storeName: product.stores?.name || "متجر",
      productName: product.name
    });

    try {
      // تسجيل الطلب في قاعدة البيانات
      await supabase.from("whatsapp_orders").insert({
        store_id: product.store_id,
        offer_id: null,
        customer_message: message,
        source_page: "product_page",
        user_agent: navigator.userAgent
      });

      // فتح واتساب
      window.open(buildWhatsAppLink(PLATFORM_WHATSAPP, message), '_blank');
      
      toast.success("تم تسجيل طلبك! سيتم التواصل معك قريباً");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("حدث خطأ في إرسال الطلب");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const productImages = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop'];

  const discount = product.old_price && product.price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate("/")} className="hover:text-primary">
            الرئيسية
          </button>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <button onClick={() => navigate("/stores")} className="hover:text-primary">
            المتاجر
          </button>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            {productImages.length > 1 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {productImages.map((imgUrl, index) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                        <img
                          src={typeof imgUrl === 'string' ? imgUrl : imgUrl?.url || imgUrl}
                          alt={`${product.name} - صورة ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop';
                          }}
                        />
                        {discount && index === 0 && (
                          <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground font-bold text-xl px-6 py-3 shadow-xl">
                            <Tag className="w-5 h-5 ml-2" />
                            خصم {discount}%
                          </Badge>
                        )}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            ) : (
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={typeof productImages[0] === 'string' ? productImages[0] : productImages[0]?.url || productImages[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop';
                  }}
                />
                {discount && (
                  <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground font-bold text-xl px-6 py-3 shadow-xl">
                    <Tag className="w-5 h-5 ml-2" />
                    خصم {discount}%
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              
              {/* Store Info */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-card/50 rounded-xl border">
                <Store className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold">{product.stores?.name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    {product.stores?.cities?.name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {product.stores.cities.name}
                      </div>
                    )}
                    {product.stores?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-secondary text-secondary" />
                        {product.stores.rating.toFixed(1)}
                      </div>
                    )}
                    {product.stores?.categories?.name && (
                      <Badge variant="outline" className="text-xs">
                        {product.stores.categories.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-primary">
                  {product.price ? `${product.price} ريال` : "السعر عند الطلب"}
                </span>
                {product.old_price && product.old_price > (product.price || 0) && (
                  <span className="text-2xl text-muted-foreground line-through">
                    {product.old_price} ريال
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="p-6 bg-card/50 rounded-xl border">
                <h3 className="font-bold text-lg mb-3">وصف المنتج</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            )}

            {/* Delivery Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
                <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">توصيل متاح</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-center">
                <ShoppingBag className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold">استلام من المحل</p>
              </div>
            </div>

            {/* Order Button */}
            <Button
              onClick={handleWhatsAppOrder}
              className="w-full py-6 text-lg font-bold"
              size="lg"
            >
              <MessageSquare className="w-5 h-5 ml-2" />
              اطلب عبر واتساب
            </Button>

            {/* Contact Store */}
            {product.stores?.phone && (
              <Button
                onClick={() => window.open(`tel:${product.stores?.phone}`, '_self')}
                variant="outline"
                className="w-full py-6"
                size="lg"
              >
                <Phone className="w-5 h-5 ml-2" />
                اتصل بالمتجر مباشرة
              </Button>
            )}

            {/* Store Address */}
            {product.stores?.address && (
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">عنوان المتجر</p>
                    <p className="text-sm text-muted-foreground">
                      {product.stores.address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Section */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">كيف يعمل الطلب؟</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">1. اضغط "اطلب عبر واتساب"</h3>
              <p className="text-sm text-muted-foreground">
                ستفتح لك رسالة جاهزة على واتساب المنصة
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">2. أكمل بياناتك</h3>
              <p className="text-sm text-muted-foreground">
                املأ اسمك ورقمك والموقع وطريقة الاستلام
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold mb-2">3. سنتواصل معك</h3>
              <p className="text-sm text-muted-foreground">
                سنتواصل معك ومع المتجر لتأكيد الطلب
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Product;
