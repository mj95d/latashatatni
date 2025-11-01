import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { MapPin, Store, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const cities = [
  {
    id: 1,
    name: "الزلفي",
    stores: 45,
    offers: 12,
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
    description: "اكتشف أفضل المتاجر والعروض في الزلفي"
  },
  {
    id: 2,
    name: "الرياض",
    stores: 234,
    offers: 87,
    image: "https://images.unsplash.com/photo-1590868308951-9ecb0e1a0a6b?w=800&h=600&fit=crop",
    description: "عاصمة المملكة مع أكبر تنوع في المتاجر"
  },
  {
    id: 3,
    name: "جدة",
    stores: 198,
    offers: 65,
    image: "https://images.unsplash.com/photo-1591608971361-dfe85bda9738?w=800&h=600&fit=crop",
    description: "عروس البحر الأحمر ووجهة التسوق المميزة"
  },
  {
    id: 4,
    name: "الدمام",
    stores: 156,
    offers: 54,
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop",
    description: "بوابة الشرق للتجارة والعروض المميزة"
  },
  {
    id: 5,
    name: "القصيم",
    stores: 89,
    offers: 32,
    image: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&h=600&fit=crop",
    description: "سلة المملكة الغذائية ومركز تجاري مهم"
  },
  {
    id: 6,
    name: "الباحة",
    stores: 67,
    offers: 23,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    description: "جنة الجنوب مع متاجر محلية مميزة"
  }
];

const Cities = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary">المدن</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                اكتشف مدن المملكة
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              اختر مدينتك واستكشف أفضل المتاجر والعروض المحلية
            </p>
          </div>

          {/* Cities Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cities.map((city, index) => (
              <Link key={city.id} to={`/city/${city.name}`}>
                <Card
                  className="overflow-hidden group hover:shadow-glow transition-smooth cursor-pointer border-2 hover:border-primary/40 h-full animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* City Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* City Name Overlay */}
                    <div className="absolute bottom-0 right-0 left-0 p-6">
                      <h3 className="text-3xl font-bold text-white mb-2">{city.name}</h3>
                      <p className="text-white/90 text-sm">{city.description}</p>
                    </div>
                  </div>

                  {/* City Stats */}
                  <div className="p-6 bg-card">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
                        <Store className="w-4 h-4 text-primary" />
                        <div>
                          <div className="text-xl font-bold text-foreground">{city.stores}</div>
                          <div className="text-xs text-muted-foreground">متجر</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-secondary/10 px-3 py-2 rounded-lg">
                        <Tag className="w-4 h-4 text-secondary" />
                        <div>
                          <div className="text-xl font-bold text-foreground">{city.offers}</div>
                          <div className="text-xs text-muted-foreground">عرض</div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4 group-hover:bg-primary/90" variant="default">
                      استكشف {city.name}
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cities;