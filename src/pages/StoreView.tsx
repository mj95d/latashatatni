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
    icon?: string | null;
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
          cities(name),
          categories(name)
        `)
        .eq("id", id)
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

      // Sign store images (logo/cover) if needed
      let signedLogo = data.logo_url;
      let signedCover = data.cover_url;

      const signImageUrl = async (url: string | null): Promise<string | null> => {
        if (!url) return null;
        
        // If it's already a full HTTP URL, return as is
        if (url.startsWith('http')) return url;
        
        // Otherwise, sign it from storage
        try {
          const { data: signedData } = await supabase.storage
            .from('store-documents')
            .createSignedUrl(url, 3600);
          
          return signedData?.signedUrl 
            ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1${signedData.signedUrl}`
            : url;
        } catch (err) {
          console.error('Error signing image:', err);
          return url;
        }
      };

      signedLogo = await signImageUrl(data.logo_url);
      signedCover = await signImageUrl(data.cover_url);

      setStore({ ...data, logo_url: signedLogo, cover_url: signedCover });
    } catch (error) {
      console.error("Error fetching store data:", error);
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

      // Process and sign product images
      const productsWithSignedImages = await Promise.all(
        (data || []).map(async (product) => {
          if (!product.images || !Array.isArray(product.images)) {
            return { ...product, images: [] };
          }

          const signedImages = await Promise.all(
            product.images.map(async (img: any) => {
              const imgUrl = typeof img === 'string' ? img : img?.url;
              if (!imgUrl) return null;

              // If it's already a full URL, return as is
              if (imgUrl.startsWith('http')) return imgUrl;

              // Sign the image from storage
              try {
                const { data: signedData } = await supabase.storage
                  .from('product-images')
                  .createSignedUrl(imgUrl, 3600);
                
                return signedData?.signedUrl 
                  ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1${signedData.signedUrl}`
                  : imgUrl;
              } catch (err) {
                console.error('Error signing product image:', err);
                return imgUrl;
              }
            })
          );

          return {
            ...product,
            images: signedImages.filter((url): url is string => url !== null)
          };
        })
      );

      setProducts(productsWithSignedImages);
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

      <main className="container mx-auto px-4 py-8 pt-28">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 animate-fade-in">
          <button onClick={() => navigate("/")} className="hover:text-primary transition-smooth">
            الرئيسية
          </button>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <button onClick={() => navigate("/stores")} className="hover:text-primary transition-smooth">
            المتاجر
          </button>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-foreground font-semibold">{store.name}</span>
        </div>

        {/* Store Header */}
        <Card className="p-8 mb-8 border-2 hover:border-primary/20 transition-smooth shadow-card animate-slide-up">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Store Logo */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden border-2 border-border shadow-soft group">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.name}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500"
                    onError={(e) => {
                      console.error('Failed to load store logo:', store.logo_url);
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${store.logo_url ? 'hidden' : ''}`}>
                  <Store className="w-16 h-16 text-muted-foreground/30" />
                </div>
              </div>
            </div>

            {/* Store Info */}
            <div className="flex-1 space-y-5">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-l from-foreground to-foreground/80 bg-clip-text">
                    {store.name}
                  </h1>
                  {store.categories && (
                    <Badge variant="outline" className="text-sm border-2 px-3 py-1">
                      {store.categories.name}
                    </Badge>
                  )}
                </div>
                {store.description && (
                  <p className="text-muted-foreground leading-relaxed text-lg">{store.description}</p>
                )}
              </div>

              {/* Store Details */}
              <div className="grid md:grid-cols-2 gap-4">
                {store.cities && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl group hover:bg-primary/10 transition-smooth">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-smooth">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">{store.cities.name}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl group hover:bg-primary/10 transition-smooth">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-smooth">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <a href={`tel:${store.phone}`} className="font-semibold hover:text-primary transition-smooth" dir="ltr">
                      {store.phone}
                    </a>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl group hover:bg-primary/10 transition-smooth">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-smooth">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <a href={`mailto:${store.email}`} className="font-semibold hover:text-primary transition-smooth">
                      {store.email}
                    </a>
                  </div>
                )}
                {store.website && (
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl group hover:bg-primary/10 transition-smooth">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-smooth">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <a href={store.website} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-primary hover:underline transition-smooth">
                      الموقع الإلكتروني
                    </a>
                  </div>
                )}
              </div>

              {/* Rating */}
              {store.rating && store.rating > 0 && (
                <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-xl border-2 border-secondary/20 w-fit">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 transition-smooth ${
                          star <= (store.rating || 0)
                            ? "fill-secondary text-secondary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold">
                    ({store.reviews_count || 0} تقييم)
                  </span>
                </div>
              )}

              {/* Contact Button */}
              <Button
                onClick={handleWhatsAppContact}
                className="w-full md:w-auto shadow-glow hover:shadow-soft transition-smooth"
                size="lg"
              >
                <MessageSquare className="w-5 h-5 ml-2" />
                تواصل عبر واتساب
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Section */}
        <div className="mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              منتجات المتجر
              {products.length > 0 && (
                <Badge className="text-base px-4 py-1.5 bg-primary/20 text-primary border-2 border-primary/30">
                  {products.length} منتج
                </Badge>
              )}
            </h2>
          </div>

          {products.length === 0 ? (
            <Card className="p-16 text-center border-2 border-dashed shadow-soft">
              <Package className="w-20 h-20 mx-auto mb-5 text-muted-foreground/30" />
              <h4 className="text-2xl font-bold mb-3">لا توجد منتجات حالياً</h4>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                المتجر لم يضف منتجات بعد. تحقق لاحقاً للحصول على آخر التحديثات!
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => {
                // Extract first valid image URL
                let mainImage = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop';
                let imageCount = 0;
                
                if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                  imageCount = product.images.length;
                  const firstImg = product.images[0];
                  mainImage = typeof firstImg === 'string' ? firstImg : 
                              (typeof firstImg === 'object' && firstImg?.url) ? firstImg.url : 
                              String(firstImg);
                }

                const discountPercent = product.old_price && product.old_price > (product.price || 0)
                  ? Math.round(((product.old_price - (product.price || 0)) / product.old_price) * 100)
                  : 0;
                
                return (
                  <Card
                    key={product.id}
                    className="overflow-hidden cursor-pointer group hover:shadow-glow transition-smooth border-2 hover:border-primary/30 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="relative h-56 bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                      <img
                        src={mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop';
                        }}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                      
                      {/* Image count indicator */}
                      {imageCount > 1 && (
                        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-lg">
                          <ImageIcon className="w-4 h-4" />
                          {imageCount}
                        </div>
                      )}
                      
                      {/* Discount badge */}
                      {discountPercent > 0 && (
                        <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground font-bold text-base px-4 py-2 shadow-xl hover:scale-110 transition-smooth">
                          <span className="text-lg">%{discountPercent}</span>
                        </Badge>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <h4 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-smooth">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 pt-2">
                        {product.price ? (
                          <>
                            <span className="text-xl font-bold text-primary" dir="ltr">
                              {product.price.toFixed(2)} ر.س
                            </span>
                            {product.old_price && product.old_price > product.price && (
                              <span className="text-sm line-through text-muted-foreground" dir="ltr">
                                {product.old_price.toFixed(2)} ر.س
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-lg font-semibold text-muted-foreground">
                            السعر عند الطلب
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Store Address Section */}
        {store.address && (
          <Card className="p-8 border-2 hover:border-primary/20 transition-smooth shadow-card animate-slide-up" style={{ animationDelay: '300ms' }}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              موقع المتجر
            </h3>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">{store.address}</p>
            {store.latitude && store.longitude && (
              <Button
                variant="outline"
                size="lg"
                className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-smooth"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps?q=${store.latitude},${store.longitude}`,
                    "_blank"
                  );
                }}
              >
                <MapPin className="w-5 h-5 ml-2" />
                عرض على خرائط جوجل
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
