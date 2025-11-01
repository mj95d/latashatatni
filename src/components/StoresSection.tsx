import { MapPin, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stores = [
  {
    id: 1,
    name: "متجر النخبة للعطور",
    category: "عطور ومستحضرات",
    rating: 4.8,
    distance: "0.5 كم",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=300&fit=crop",
    status: "مفتوح الآن",
    offers: 3,
  },
  {
    id: 2,
    name: "مطعم الذواقة",
    category: "مطاعم",
    rating: 4.6,
    distance: "1.2 كم",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    status: "مفتوح الآن",
    offers: 2,
  },
  {
    id: 3,
    name: "بوتيك الأناقة",
    category: "ملابس",
    rating: 4.9,
    distance: "0.8 كم",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    status: "مفتوح الآن",
    offers: 5,
  },
  {
    id: 4,
    name: "مكتبة المعرفة",
    category: "كتب وقرطاسية",
    rating: 4.7,
    distance: "2.0 كم",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop",
    status: "يغلق الساعة 10 م",
    offers: 1,
  },
];

const StoresSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-l from-primary to-primary-glow bg-clip-text text-transparent">
                متاجر قريبة منك
              </span>
            </h2>
            <p className="text-muted-foreground">
              اكتشف أفضل المتاجر المحلية في منطقتك
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            عرض الكل
          </Button>
        </div>

        {/* Stores Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stores.map((store) => (
            <Card
              key={store.id}
              className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/30"
            >
              {/* Store Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
                />
                {store.offers > 0 && (
                  <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground font-bold">
                    {store.offers} عروض
                  </Badge>
                )}
              </div>

              {/* Store Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-smooth">
                    {store.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {store.category}
                  </p>
                </div>

                {/* Rating & Distance */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="font-medium">{store.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{store.distance}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-primary font-medium">{store.status}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" className="w-full max-w-sm">
            عرض جميع المتاجر
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StoresSection;
