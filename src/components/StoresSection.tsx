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
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                متاجر قريبة منك
              </span>
            </h2>
            <p className="text-muted-foreground text-lg">
              اكتشف أفضل المتاجر المحلية في منطقتك
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex border-2 hover:border-primary/50 hover:text-primary">
            عرض الكل
          </Button>
        </div>

        {/* Stores Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stores.map((store) => (
            <Card
              key={store.id}
              className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40"
            >
              {/* Store Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                {store.offers > 0 && (
                  <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground font-bold text-sm px-3 py-1.5 shadow-lg">
                    {store.offers} عروض
                  </Badge>
                )}
              </div>

              {/* Store Info */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-smooth">
                    {store.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {store.category}
                  </p>
                </div>

                {/* Rating & Distance */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1.5 bg-secondary/10 px-3 py-1.5 rounded-lg">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="font-semibold text-foreground">{store.rating}</span>
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
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-12 text-center md:hidden">
          <Button variant="outline" className="w-full max-w-sm border-2 hover:border-primary/50">
            عرض جميع المتاجر
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StoresSection;
