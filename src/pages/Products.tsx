import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Star, Tag, Package, Eye, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  old_price: number | null;
  images: any;
  sku: string | null;
  category: string | null;
  stock_quantity: number;
  is_featured: boolean;
  stores: {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    whatsapp: string | null;
    rating: number | null;
    city_id: string | null;
    cities: {
      name: string;
    } | null;
    categories: {
      name: string;
    } | null;
  } | null;
}

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [selectedProductCategory, setSelectedProductCategory] = useState("الكل");
  const [products, setProducts] = useState<Product[]>([]);
  const [cities, setCities] = useState<string[]>(["الكل"]);
  const [storeCategories, setStoreCategories] = useState<string[]>(["الكل"]);
  const [productCategories, setProductCategories] = useState<string[]>(["الكل"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCities();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          stores (
            id,
            name,
            address,
            phone,
            whatsapp,
            rating,
            city_id,
            category_id,
            cities (name),
            categories (name)
          )
        `)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const typedData = (data || []) as unknown as Product[];
      setProducts(typedData);

      // استخراج فئات المنتجات
      const uniqueProductCategories = Array.from(
        new Set(
          typedData
            .map(p => p.category)
            .filter(Boolean)
        )
      ) as string[];
      setProductCategories(["الكل", ...uniqueProductCategories]);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل المنتجات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name")
        .order("name");

      if (error) throw error;
      
      const uniqueNames = Array.from(new Set(data?.map(c => c.name) || []));
      setCities(["الكل", ...uniqueNames]);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      
      const uniqueNames = Array.from(new Set(data?.map(c => c.name) || []));
      setStoreCategories(["الكل", ...uniqueNames]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredProducts = products.filter(product => {
    const cityMatch = selectedCity === "الكل" || product.stores?.cities?.name === selectedCity;
    const storeCategoryMatch = selectedCategory === "الكل" || product.stores?.categories?.name === selectedCategory;
    const productCategoryMatch = selectedProductCategory === "الكل" || product.category === selectedProductCategory;
    return cityMatch && storeCategoryMatch && productCategoryMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 lg:px-6 text-center">
            <div className="animate-pulse">جاري التحميل...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">جميع المنتجات</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                اكتشف منتجات متنوعة
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              تصفح آلاف المنتجات من المتاجر المعتمدة في جميع المدن
            </p>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4 mb-12 bg-card p-6 rounded-2xl shadow-soft border-2 border-border/50">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-foreground">المدينة</label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-smooth">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-foreground">قسم المتجر</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-smooth">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {storeCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2 text-foreground">فئة المنتج</label>
              <Select value={selectedProductCategory} onValueChange={setSelectedProductCategory}>
                <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-smooth">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const discount = product.old_price && product.price
                ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
                : null;
              
              const primaryImage = product.images && Array.isArray(product.images) && product.images.length > 0
                ? (typeof product.images[0] === 'string' ? product.images[0] : (product.images[0] as any)?.url || String(product.images[0]))
                : 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop';

              const cityName = product.stores?.cities?.name || 'غير محدد';
              const storeName = product.stores?.name || 'متجر';
              const rating = product.stores?.rating || 0;

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 animate-fade-in relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Featured Badge */}
                  {product.is_featured && (
                    <div className="absolute top-2 left-2 z-10">
                      <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white font-bold shadow-lg">
                        <Sparkles className="w-3 h-3 ml-1" />
                        مميز
                      </Badge>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=600&fit=crop';
                        console.error('Failed to load product image:', primaryImage);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Discount Badge */}
                    {discount && (
                      <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground font-bold text-base px-3 py-1.5 shadow-lg">
                        <Tag className="w-3 h-3 ml-1" />
                        {discount}%
                      </Badge>
                    )}

                    {/* City Badge */}
                    <Badge className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm text-foreground font-semibold px-2 py-1 text-xs">
                      <MapPin className="w-3 h-3 ml-1" />
                      {cityName}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-smooth line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {storeName}
                      </p>
                      {product.category && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {product.category}
                        </Badge>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {product.price ? `${product.price} ر.س` : "السعر عند الطلب"}
                      </span>
                      {product.old_price && product.old_price > (product.price || 0) && (
                        <span className="text-sm text-muted-foreground line-through">
                          {product.old_price} ر.س
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    {product.stock_quantity > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="w-3 h-3" />
                        <span>متوفر: {product.stock_quantity} قطعة</span>
                      </div>
                    )}

                    {/* Rating */}
                    {rating > 0 && (
                      <div className="flex items-center gap-1.5 bg-secondary/10 px-2 py-1 rounded-lg w-fit">
                        <Star className="w-3 h-3 fill-secondary text-secondary" />
                        <span className="font-semibold text-xs">{rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button 
                      className="w-full mt-2" 
                      variant="default"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      عرض التفاصيل
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">جرب تغيير الفلاتر للعثور على المزيد من المنتجات</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;