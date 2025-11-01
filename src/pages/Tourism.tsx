import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Camera, Mountain, Coffee, Store } from "lucide-react";

const tourismPlaces = [
  {
    id: 1,
    name: "قصر المصمك التاريخي",
    city: "الرياض",
    category: "معالم تاريخية",
    description: "قلعة تاريخية بنيت عام 1865م، رمز تأسيس المملكة",
    image: "https://images.unsplash.com/photo-1519659528534-7fd733a832a0?w=800&h=600&fit=crop",
    nearbyStores: 12
  },
  {
    id: 2,
    name: "كورنيش جدة",
    city: "جدة",
    category: "معالم طبيعية",
    description: "أطول كورنيش على البحر الأحمر مع إطلالات خلابة",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&h=600&fit=crop",
    nearbyStores: 45
  },
  {
    id: 3,
    name: "جبل شدا الأعلى",
    city: "الباحة",
    category: "جبال وطبيعة",
    description: "قمة جبلية شاهقة مع غابات كثيفة ومناظر طبيعية",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    nearbyStores: 8
  },
  {
    id: 4,
    name: "متحف صقر الجزيرة للطيران",
    city: "الرياض",
    category: "متاحف",
    description: "أكبر متحف للطيران في الشرق الأوسط",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop",
    nearbyStores: 15
  },
  {
    id: 5,
    name: "حديقة الأمير ماجد",
    city: "جدة",
    category: "حدائق",
    description: "حديقة ترفيهية مطلة على البحر الأحمر",
    image: "https://images.unsplash.com/photo-1584738766473-61c083514bf4?w=800&h=600&fit=crop",
    nearbyStores: 23
  },
  {
    id: 6,
    name: "سوق الزل التراثي",
    city: "الزلفي",
    category: "أسواق تراثية",
    description: "سوق تقليدي يعرض المنتجات المحلية والحرف اليدوية",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    nearbyStores: 34
  }
];

const cities = ["الكل", "الرياض", "جدة", "الدمام", "الزلفي", "القصيم", "الباحة"];
const categories = ["الكل", "معالم تاريخية", "معالم طبيعية", "جبال وطبيعة", "متاحف", "حدائق", "أسواق تراثية"];

const Tourism = () => {
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const filteredPlaces = tourismPlaces.filter(place => {
    const cityMatch = selectedCity === "الكل" || place.city === selectedCity;
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
          <div className="flex flex-col md:flex-row gap-4 mb-12 bg-card p-6 rounded-2xl shadow-soft border-2 border-border/50">
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

          {/* Tourism Places Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place, index) => (
              <Card
                key={place.id}
                className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Category Badge */}
                  <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground font-semibold px-3 py-1.5">
                    {place.category}
                  </Badge>

                  {/* City Badge */}
                  <Badge className="absolute top-4 left-4 bg-secondary/90 text-secondary-foreground font-semibold px-3 py-1.5">
                    <MapPin className="w-3 h-3 ml-1" />
                    {place.city}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-smooth">
                      {place.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {place.description}
                    </p>
                  </div>

                  {/* Nearby Stores */}
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-border/50">
                    <Store className="w-4 h-4 text-primary" />
                    <span className="text-primary font-semibold">
                      {place.nearbyStores} متجر قريب
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="default" className="w-full">
                      عرض المكان
                    </Button>
                    <Button variant="outline" className="w-full border-2">
                      المتاجر القريبة
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredPlaces.length === 0 && (
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