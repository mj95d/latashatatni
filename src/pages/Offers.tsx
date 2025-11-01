import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Star, Clock, Tag, Percent } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const offers = [
  {
    id: 1,
    title: "خصم 50% على جميع العطور الفرنسية",
    storeName: "متجر النخبة للعطور",
    category: "عطور ومستحضرات",
    discount: "50%",
    city: "الزلفي",
    endDate: "2025-11-15",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=600&fit=crop",
    rating: 4.8,
    distance: "0.5 كم"
  },
  {
    id: 2,
    title: "وجبة مجانية عند طلب وجبتين",
    storeName: "مطعم الذواقة",
    category: "مطاعم",
    discount: "1+1",
    city: "الرياض",
    endDate: "2025-11-20",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    rating: 4.6,
    distance: "1.2 كم"
  },
  {
    id: 3,
    title: "تخفيضات الموسم - حتى 70%",
    storeName: "بوتيك الأناقة",
    category: "ملابس",
    discount: "70%",
    city: "جدة",
    endDate: "2025-11-30",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    rating: 4.9,
    distance: "0.8 كم"
  },
  {
    id: 4,
    title: "اشتر 3 كتب واحصل على الرابع مجاناً",
    storeName: "مكتبة المعرفة",
    category: "كتب وقرطاسية",
    discount: "3+1",
    city: "الدمام",
    endDate: "2025-11-25",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop",
    rating: 4.7,
    distance: "2.0 كم"
  },
  {
    id: 5,
    title: "خصم 30% على الأجهزة الإلكترونية",
    storeName: "متجر التقنية الحديثة",
    category: "إلكترونيات",
    discount: "30%",
    city: "الزلفي",
    endDate: "2025-11-18",
    image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&h=600&fit=crop",
    rating: 4.5,
    distance: "1.5 كم"
  },
  {
    id: 6,
    title: "عرض خاص: قهوة + حلى بـ 25 ريال",
    storeName: "كافيه المذاق",
    category: "مطاعم ومقاهي",
    discount: "خاص",
    city: "القصيم",
    endDate: "2025-11-22",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
    rating: 4.4,
    distance: "3.0 كم"
  }
];

const cities = ["الكل", "الزلفي", "الرياض", "جدة", "الدمام", "القصيم", "الباحة"];
const categories = ["الكل", "عطور ومستحضرات", "مطاعم", "ملابس", "كتب وقرطاسية", "إلكترونيات", "مطاعم ومقاهي"];

const Offers = () => {
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const filteredOffers = offers.filter(offer => {
    const cityMatch = selectedCity === "الكل" || offer.city === selectedCity;
    const categoryMatch = selectedCategory === "الكل" || offer.category === selectedCategory;
    return cityMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-4">
              <Percent className="w-5 h-5 text-secondary" />
              <span className="text-sm font-semibold text-secondary">عروض حصرية</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                أفضل العروض والخصومات
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              اكتشف أحدث العروض والخصومات من المتاجر القريبة منك
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

          {/* Offers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOffers.map((offer, index) => (
              <Card
                key={offer.id}
                className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {/* Discount Badge */}
                  <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground font-bold text-lg px-4 py-2 shadow-lg">
                    <Tag className="w-4 h-4 ml-1" />
                    {offer.discount}
                  </Badge>

                  {/* City Badge */}
                  <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground font-semibold px-3 py-1.5">
                    <MapPin className="w-3 h-3 ml-1" />
                    {offer.city}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-smooth line-clamp-2">
                      {offer.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-semibold">
                      {offer.storeName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {offer.category}
                    </p>
                  </div>

                  {/* Rating & Distance */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-lg">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="font-semibold text-foreground">{offer.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{offer.distance}</span>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-border/50">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span className="text-secondary font-semibold">
                      ينتهي في: {new Date(offer.endDate).toLocaleDateString('ar-SA')}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Button className="w-full mt-2" variant="default">
                    عرض التفاصيل
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredOffers.length === 0 && (
            <div className="text-center py-20">
              <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">لا توجد عروض</h3>
              <p className="text-muted-foreground">جرب تغيير الفلاتر للعثور على المزيد من العروض</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Offers;
