import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Store, MapPin, Phone, Star, ArrowRight, MessageSquare, 
  Clock, Globe, Mail, Package, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  old_price: number | null;
  images: any;
  is_active: boolean;
}

interface StoreData {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  reviews_count: number | null;
  logo_url: string | null;
  cover_url: string | null;
  opening_hours: any;
  cities: {
    name: string;
  } | null;
  categories: {
    name: string;
    icon: string | null;
  } | null;
}

const StoreView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast: showToast } = useToast();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchStoreData();
      fetchProducts();
    }
  }, [id]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("stores")
        .select(`
          *,
          cities (name),
          categories (name, icon)
        `)
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        showToast({
          title: "خطأ",
          description: "المتجر غير موجود",
          variant: "destructive",
        });
        navigate("/stores");
        return;
      }

      setStore(data);
    } catch (error) {
      console.error("Error fetching store:", error);
      showToast({
        title: "خطأ",
        description: "حدث خطأ في تحميل بيانات المتجر",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleWhatsAppContact = async () => {
    if (!store) return;

    const PLATFORM_PHONE = "+966532402020"; // رقم المنصة الموحد
    
    const message = `مرحباً، أرغب في الاستفسار عن متجر ${store.name}`;
    
    try {
      // تسجيل في قاعدة البيانات
      await supabase.from("whatsapp_orders").insert({
        store_id: store.id,
        customer_message: message,
        source_page: "store_view",
        user_agent: navigator.userAgent,
        status: 'NEW'
      });

      const whatsappUrl = `https://wa.me/${PLATFORM_PHONE.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      
      showToast({
        title: "تم الإرسال",
        description: "سيتم فتح واتساب للتواصل مع المتجر",
      });
    } catch (error: any) {
      console.error("Error logging whatsapp contact:", error);
      // فتح واتساب حتى لو فشل التسجيل
      const whatsappUrl = `https://wa.me/${PLATFORM_PHONE.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
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

  if (!store) {
    return null;
  }

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
          <span className="text-foreground">{store.name}</span>
        </div>

        {/* Store Header */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Store Logo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-muted overflow-hidden border-2">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Store Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold">{store.name}</h1>
                  {store.categories && (
                    <Badge variant="outline" className="text-sm">
                      {store.categories.name}
                    </Badge>
                  )}
                </div>
                {store.description && (
                  <p className="text-muted-foreground">{store.description}</p>
                )}
              </div>

              {/* Store Details */}
              <div className="grid md:grid-cols-2 gap-3">
                {store.cities && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{store.cities.name}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    <span dir="ltr">{store.phone}</span>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{store.email}</span>
                  </div>
                )}
                {store.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-primary" />
                    <a href={store.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      الموقع الإلكتروني
                    </a>
                  </div>
                )}
              </div>

              {/* Rating */}
              {store.rating && store.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (store.rating || 0)
                            ? "fill-secondary text-secondary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({store.reviews_count || 0} تقييم)
                  </span>
                </div>
              )}

              {/* Contact Button */}
              <Button
                onClick={handleWhatsAppContact}
                className="w-full md:w-auto"
                size="lg"
              >
                <MessageSquare className="w-5 h-5 ml-2" />
                تواصل عبر واتساب
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              منتجات المتجر
              {products.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {products.length} منتج
                </Badge>
              )}
            </h2>
          </div>

          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h4 className="text-xl font-semibold mb-2">لا توجد منتجات حالياً</h4>
              <p className="text-muted-foreground">
                المتجر لم يضف منتجات بعد. تحقق لاحقاً!
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="relative h-48 bg-muted">
                    {product.images && Array.isArray(product.images) && product.images.length > 0 ? (
                      <img
                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    {product.old_price && product.old_price > (product.price || 0) && (
                      <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
                        خصم {Math.round(((product.old_price - (product.price || 0)) / product.old_price) * 100)}%
                      </Badge>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h4 className="font-bold line-clamp-1">{product.name}</h4>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold" dir="ltr">
                        {product.price ? `${product.price.toFixed(2)} ر.س` : "السعر عند الطلب"}
                      </span>
                      {product.old_price && product.old_price > (product.price || 0) && (
                        <span className="text-sm line-through text-muted-foreground" dir="ltr">
                          {product.old_price.toFixed(2)} ر.س
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Store Address Section */}
        {store.address && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              موقع المتجر
            </h3>
            <p className="text-muted-foreground mb-4">{store.address}</p>
            {store.latitude && store.longitude && (
              <Button
                variant="outline"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps?q=${store.latitude},${store.longitude}`,
                    "_blank"
                  );
                }}
              >
                <MapPin className="w-4 h-4 ml-2" />
                عرض على الخريطة
              </Button>
            )}
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default StoreView;
