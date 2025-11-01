import { MapPin, Store, Percent, Search, Clock, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import storeIcon from "@/assets/store-icon.png";
import locationIcon from "@/assets/location-icon.png";
import offersIcon from "@/assets/offers-icon.png";

const features = [
  {
    icon: locationIcon,
    title: "اكتشف القريب منك",
    description: "خريطة تفاعلية تعرض لك جميع المتاجر والعروض في منطقتك بدقة عالية",
    color: "from-primary to-primary-glow",
  },
  {
    icon: storeIcon,
    title: "آلاف المتاجر المحلية",
    description: "تصفح مئات المتاجر المحلية والمنتجات من موقع واحد بدون تشتت",
    color: "from-secondary to-accent",
  },
  {
    icon: offersIcon,
    title: "عروض حصرية يومياً",
    description: "احصل على أفضل العروض والخصومات من المتاجر القريبة منك",
    color: "from-primary-glow to-primary",
  },
];

const additionalFeatures = [
  {
    Icon: Search,
    title: "بحث ذكي",
    description: "ابحث بسهولة عن أي منتج أو متجر في ثوانٍ",
  },
  {
    Icon: Clock,
    title: "توفير الوقت",
    description: "لا داعي للبحث في أماكن متعددة",
  },
  {
    Icon: Shield,
    title: "متاجر موثوقة",
    description: "جميع المتاجر معتمدة ومراجعة",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 gradient-hero">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-l from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              لماذا لا تشتتني؟
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            كل ما تحتاجه في مكان واحد - سهولة وسرعة ودقة في الوصول للمتاجر القريبة منك
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 text-center hover:shadow-glow transition-smooth border-2 hover:border-primary/30 bg-card group cursor-pointer"
            >
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="w-28 h-28 object-contain transition-smooth group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-smooth" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-smooth">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {additionalFeatures.map((feature, index) => {
            const Icon = feature.Icon;
            return (
              <div
                key={index}
                className="flex items-start gap-5 p-7 rounded-2xl bg-card/60 backdrop-blur-sm border-2 border-border/50 hover:border-primary/40 transition-smooth group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-smooth shadow-soft">
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-smooth">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
