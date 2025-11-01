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
    <section className="py-20 gradient-hero">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-l from-primary to-primary-glow bg-clip-text text-transparent">
              لماذا لا تشتتني؟
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            كل ما تحتاجه في مكان واحد - سهولة وسرعة ودقة في الوصول للمتاجر القريبة منك
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-8 text-center hover:shadow-glow transition-smooth border-2 hover:border-primary/20 bg-card"
            >
              <div className="mb-6 flex justify-center">
                <img
                  src={feature.icon}
                  alt={feature.title}
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {additionalFeatures.map((feature, index) => {
            const Icon = feature.Icon;
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/30 transition-smooth"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">
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
