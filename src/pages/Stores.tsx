import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Star, Clock, Store, Tag, Phone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const stores = [
  {
    id: 1,
    name: "متجر النخبة للعطور",
    category: "عطور ومستحضرات",
    rating: 4.8,
    reviewsCount: 245,
    distance: "0.5 كم",
    city: "الزلفي",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop",
    status: "مفتوح الآن",
    openUntil: "10:00 م",
    offers: 3,
    phone: "+966501234567",
    description: "أفضل العطور الفرنسية والعربية الفاخرة"
  },
  {
    id: 2,
    name: "مطعم الذواقة",
    category: "مطاعم",
    rating: 4.6,
    reviewsCount: 389,
    distance: "1.2 كم",
    city: "الرياض",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    status: "مفتوح الآن",
    openUntil: "12:00 ص",
    offers: 2,
    phone: "+966502345678",
    description: "مطعم عائلي متخصص في المأكولات العربية"
  },
  {
    id: 3,
    name: "بوتيك الأناقة",
    category: "ملابس",
    rating: 4.9,
    reviewsCount: 567,
    distance: "0.8 كم",
    city: "جدة",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    status: "مفتوح الآن",
    openUntil: "11:00 م",
    offers: 5,
    phone: "+966503456789",
    description: "أحدث صيحات الموضة العالمية والمحلية"
  },
  {
    id: 4,
    name: "مكتبة المعرفة",
    category: "كتب وقرطاسية",
    rating: 4.7,
    reviewsCount: 198,
    distance: "2.0 كم",
    city: "الدمام",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop",
    status: "يغلق الساعة 10 م",
    openUntil: "10:00 م",
    offers: 1,
    phone: "+966504567890",
    description: "كتب ثقافية وتعليمية وقرطاسية متنوعة"
  },
  {
    id: 5,
    name: "متجر التقنية الحديثة",
    category: "إلكترونيات",
    rating: 4.5,
    reviewsCount: 421,
    distance: "1.5 كم",
    city: "الزلفي",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop",
    status: "مفتوح الآن",
    openUntil: "11:00 م",
    offers: 4,
    phone: "+966505678901",
    description: "أحدث الأجهزة الإلكترونية والتقنية"
  },
  {
    id: 6,
    name: "كافيه المذاق",
    category: "مطاعم ومقاهي",
    rating: 4.4,
    reviewsCount: 312,
    distance: "3.0 كم",
    city: "القصيم",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
    status: "مفتوح الآن",
    openUntil: "1:00 ص",
    offers: 2,
    phone: "+966506789012",
    description: "قهوة مختصة وحلويات شرقية وغربية"
  },
  {
    id: 7,
    name: "صالون الجمال الملكي",
    category: "صالونات تجميل",
    rating: 4.8,
    reviewsCount: 289,
    distance: "1.8 كم",
    city: "الباحة",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
    status: "مفتوح الآن",
    openUntil: "9:00 م",
    offers: 3,
    phone: "+966507890123",
    description: "عناية كاملة بالشعر والبشرة والأظافر"
  },
  {
    id: 8,
    name: "معرض السيارات المتطورة",
    category: "سيارات",
    rating: 4.6,
    reviewsCount: 156,
    distance: "4.2 كم",
    city: "الرياض",
    image: "https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=800&h=600&fit=crop",
    status: "مفتوح الآن",
    openUntil: "8:00 م",
    offers: 1,
    phone: "+966508901234",
    description: "بيع وشراء السيارات الجديدة والمستعملة"
  },
  {
    id: 9,
    name: "محل الحلويات الشرقية",
    category: "حلويات",
    rating: 4.7,
    reviewsCount: 445,
    distance: "0.9 كم",
    city: "جدة",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=600&fit=crop",
    status: "مفتوح الآن",
    openUntil: "11:30 م",
    offers: 2,
    phone: "+966509012345",
    description: "حلويات شرقية طازجة يومياً"
  }
];

const cities = ["الكل", "الزلفي", "الرياض", "جدة", "الدمام", "القصيم", "الباحة"];
const categories = ["الكل", "عطور ومستحضرات", "مطاعم", "ملابس", "كتب وقرطاسية", "إلكترونيات", "مطاعم ومقاهي", "صالونات تجميل", "سيارات", "حلويات"];

const Stores = () => {
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = stores.filter(store => {
    const cityMatch = selectedCity === "الكل" || store.city === selectedCity;
    const categoryMatch = selectedCategory === "الكل" || store.category === selectedCategory;
    const searchMatch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       store.description.toLowerCase().includes(searchQuery.toLowerCase());
    return cityMatch && categoryMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Store className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">دليل المتاجر</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                اكتشف أفضل المتاجر
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ابحث عن المتاجر القريبة منك واستكشف أفضل العروض والخدمات
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-card p-6 rounded-2xl shadow-soft border-2 border-border/50 mb-12 space-y-4">
            <Input
              type="text"
              placeholder="ابحث عن متجر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 hover:border-primary/50 transition-smooth text-lg"
            />
            
            <div className="flex flex-col md:flex-row gap-4">
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
                <label className="block text-sm font-semibold mb-2 text-foreground">القسم</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full border-2 hover:border-primary/50 transition-smooth">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              عرض <span className="font-bold text-primary">{filteredStores.length}</span> متجر
            </p>
          </div>

          {/* Stores Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.map((store, index) => (
              <Card
                key={store.id}
                className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Offers Badge */}
                  {store.offers > 0 && (
                    <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground font-bold text-sm px-3 py-1.5 shadow-lg">
                      <Tag className="w-3 h-3 ml-1" />
                      {store.offers} عروض
                    </Badge>
                  )}

                  {/* City Badge */}
                  <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground font-semibold px-3 py-1.5">
                    <MapPin className="w-3 h-3 ml-1" />
                    {store.city}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-smooth">
                      {store.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {store.category}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {store.description}
                    </p>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-lg">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="font-semibold text-foreground">{store.rating}</span>
                      <span className="text-muted-foreground">({store.reviewsCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{store.distance}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-border/50">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-primary font-semibold">{store.status}</span>
                    {store.openUntil && (
                      <span className="text-muted-foreground">• حتى {store.openUntil}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="default" className="w-full">
                      عرض المتجر
                    </Button>
                    <Button variant="outline" className="w-full border-2">
                      <Phone className="w-4 h-4 ml-1" />
                      اتصال
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredStores.length === 0 && (
            <div className="text-center py-20">
              <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">لا توجد متاجر</h3>
              <p className="text-muted-foreground">جرب تغيير البحث أو الفلاتر للعثور على المزيد من المتاجر</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Stores;
